import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { Hero } from "@/lib/types";
import { heroPlaysPosition, ROLE_TO_POSITION } from "@/lib/positionMap";

type EnemyInput = {
  opendota_id: number;
  position: number | null;
};

type OpenDotaMatchup = {
  hero_id: number;
  games_played: number;
  wins: number;
};

type OpenDotaHero = {
  id: number;
  localized_name: string;
  primary_attr: string;
  roles: string[];
  name: string;
};

type CombinedScore = {
  opendota_id: number;
  total_disadvantage: number;
  matchup_count: number;
  avg_disadvantage: number;
  counters_positions: number[];
};

export async function POST(req: NextRequest) {
  try {
    const { enemies, roleId, mode = "lane" }: {
      enemies: EnemyInput[];
      roleId: string | null;
      mode: "lane" | "team";
    } = await req.json();

    if (!Array.isArray(enemies) || enemies.length === 0 || enemies.length > 5) {
      return NextResponse.json(
        { error: "Provide 1–5 enemies" },
        { status: 400 }
      );
    }

    const myPosition = roleId ? ROLE_TO_POSITION[roleId] ?? null : null;
    const enemyIds = enemies.map((e) => e.opendota_id);

    // 1. Fetch matchups + hero list in parallel
    const [allMatchups, allHeroesRes] = await Promise.all([
      Promise.all(
        enemies.map((e) =>
          fetch(
            `https://api.opendota.com/api/heroes/${e.opendota_id}/matchups`,
            { next: { revalidate: 3600 } }
          )
            .then((r) => r.json() as Promise<OpenDotaMatchup[]>)
            .catch(() => [] as OpenDotaMatchup[])
        )
      ),
      fetch(`https://api.opendota.com/api/heroes`, {
        next: { revalidate: 86400 },
      }),
    ]);

    const openDotaHeroes: OpenDotaHero[] = allHeroesRes.ok
      ? await allHeroesRes.json()
      : [];

    // 2. Aggregate scores across all enemy matchups
    const scoreMap = new Map<number, CombinedScore>();

    allMatchups.forEach((matchups, idx) => {
      const enemyPosition = enemies[idx].position;

      // Adaptive threshold — try lower if hero has few games
      const thresholds = [100, 50, 10, 1];
      let validMatchups = matchups;

      for (const threshold of thresholds) {
        const filtered = matchups.filter((m) => m.games_played >= threshold);
        if (filtered.length >= 10) {
          validMatchups = filtered;
          break;
        }
      }

      validMatchups.forEach((m) => {
        const pct = parseFloat(
          (((m.wins / m.games_played) - 0.5) * 100).toFixed(2)
        );
        if (pct <= 0) return;

        const existing = scoreMap.get(m.hero_id);
        if (existing) {
          existing.total_disadvantage += pct;
          existing.matchup_count += 1;
          existing.avg_disadvantage = parseFloat(
            (existing.total_disadvantage / existing.matchup_count).toFixed(2)
          );
          if (
            enemyPosition &&
            !existing.counters_positions.includes(enemyPosition)
          ) {
            existing.counters_positions.push(enemyPosition);
          }
        } else {
          scoreMap.set(m.hero_id, {
            opendota_id: m.hero_id,
            total_disadvantage: pct,
            matchup_count: 1,
            avg_disadvantage: pct,
            counters_positions: enemyPosition ? [enemyPosition] : [],
          });
        }
      });
    });

    // 3. Remove enemies from results + score by mode
    const baseList = Array.from(scoreMap.values())
      .filter((s) => !enemyIds.includes(s.opendota_id))
      .map((s) => ({
        ...s,
        // Lane mode: weight by avg disadvantage (win your specific lane)
        // Team mode: weight by how many enemies you counter × avg
        diversity_score:
          mode === "lane"
            ? s.avg_disadvantage
            : s.avg_disadvantage * Math.sqrt(s.matchup_count),
      }))
      .sort((a, b) => b.diversity_score - a.diversity_score);

    // 4. Apply position filter using our reliable position map
    let filtered = baseList;
    let roleFiltered = false;

    if (myPosition && mode === "lane") {
      const posFiltered = baseList.filter((s) =>
        heroPlaysPosition(s.opendota_id, myPosition)
      );

      if (posFiltered.length >= 3) {
        filtered = posFiltered;
        roleFiltered = true;
      } else {
        // Not enough heroes for this position → show all with warning
        filtered = baseList;
        roleFiltered = false;
      }
    }

    const top10 = filtered.slice(0, 10);

    // 5. Look up in Supabase
    const topIds = top10.map((s) => s.opendota_id);
    const { data: supabaseHeroes } = await supabase
      .from("heroes")
      .select("*")
      .in("opendota_id", topIds);

    // 6. Build results with Supabase-first, OpenDota fallback
    const results = top10
      .map((score) => {
        const supabaseHero = (supabaseHeroes as Hero[] ?? []).find(
          (h) => h.opendota_id === score.opendota_id
        );

        if (supabaseHero) {
          return {
            ...supabaseHero,
            total_disadvantage: score.total_disadvantage,
            matchup_count: score.matchup_count,
            avg_disadvantage: score.avg_disadvantage,
            counters_positions: score.counters_positions,
          };
        }

        // Fallback to OpenDota hero data
        const odHero = openDotaHeroes.find(
          (h) => h.id === score.opendota_id
        );
        if (!odHero) return null;

        const slug = odHero.name.replace("npc_dota_hero_", "");
        return {
          id: score.opendota_id,
          name: odHero.localized_name,
          slug,
          primary_attr: odHero.primary_attr as Hero["primary_attr"],
          roles: odHero.roles,
          opendota_id: score.opendota_id,
          total_disadvantage: score.total_disadvantage,
          matchup_count: score.matchup_count,
          avg_disadvantage: score.avg_disadvantage,
          counters_positions: score.counters_positions,
        };
      })
      .filter(Boolean);

    return NextResponse.json({ results, role_filtered: roleFiltered });

  } catch (err) {
    console.error("Multi-counter API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { Hero } from "@/lib/types";

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
};

export async function POST(req: NextRequest) {
  try {
    const { enemyOpenDotaIds } = await req.json();

    if (
      !Array.isArray(enemyOpenDotaIds) ||
      enemyOpenDotaIds.length === 0 ||
      enemyOpenDotaIds.length > 5
    ) {
      return NextResponse.json(
        { error: "Provide 1–5 enemy hero OpenDota IDs" },
        { status: 400 }
      );
    }

    // 1. Fetch matchups for ALL enemy heroes + OpenDota hero list in parallel
    const [allMatchupsResults, allHeroesRes] = await Promise.all([
      Promise.all(
        enemyOpenDotaIds.map((id: number) =>
          fetch(`https://api.opendota.com/api/heroes/${id}/matchups`, {
            next: { revalidate: 3600 },
          }).then((r) => r.json() as Promise<OpenDotaMatchup[]>)
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
    // scoreMap[hero_id] = { total disadvantage, how many enemies they counter }
    const scoreMap = new Map<number, CombinedScore>();

    allMatchupsResults.forEach((matchups) => {
      matchups
        .filter((m) => m.games_played > 100)
        .forEach((m) => {
          const pct = parseFloat(
            (((m.wins / m.games_played) - 0.5) * 100).toFixed(2)
          );
          if (pct <= 0) return; // skip if not a real counter

          const existing = scoreMap.get(m.hero_id);
          if (existing) {
            existing.total_disadvantage += pct;
            existing.matchup_count += 1;
            existing.avg_disadvantage = parseFloat(
              (existing.total_disadvantage / existing.matchup_count).toFixed(2)
            );
          } else {
            scoreMap.set(m.hero_id, {
              opendota_id: m.hero_id,
              total_disadvantage: pct,
              matchup_count: 1,
              avg_disadvantage: pct,
            });
          }
        });
    });

    // 3. Sort by total disadvantage score (counters most enemies hardest)
    const sorted = Array.from(scoreMap.values())
      .filter((s) => !enemyOpenDotaIds.includes(s.opendota_id)) // exclude picked enemies
      .sort((a, b) => b.total_disadvantage - a.total_disadvantage)
      .slice(0, 20); // get top 20 then we filter by role on frontend

    // 4. Look up heroes in Supabase first
    const topIds = sorted.map((s) => s.opendota_id);

    const { data: supabaseHeroes } = await supabase
      .from("heroes")
      .select("*")
      .in("opendota_id", topIds);

    // 5. Build result with fallback to OpenDota data
    const results = sorted
      .map((score) => {
        const supabaseHero = (supabaseHeroes as Hero[] ?? []).find(
          (h) => h.opendota_id === score.opendota_id
        );

        if (supabaseHero) {
          return { ...supabaseHero, ...score };
        }

        // Fallback to OpenDota data
        const odHero = openDotaHeroes.find((h) => h.id === score.opendota_id);
        if (!odHero) return null;

        const slug = odHero.name.replace("npc_dota_hero_", "");
        return {
        id: score.opendota_id,
        name: odHero.localized_name,
        slug,
        primary_attr: odHero.primary_attr as Hero["primary_attr"],
        roles: odHero.roles,
        total_disadvantage: score.total_disadvantage,
        matchup_count: score.matchup_count,
        avg_disadvantage: score.avg_disadvantage,
        opendota_id: score.opendota_id,
        };
      })
      .filter(Boolean);

    return NextResponse.json({ results });
  } catch (err) {
    console.error("Multi-counter API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
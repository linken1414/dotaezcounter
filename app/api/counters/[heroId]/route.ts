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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ heroId: string }> }
) {
  const { heroId } = await params;

  try {
    // 1. Get hero from Supabase
    const { data: hero, error: heroError } = await supabase
      .from("heroes")
      .select("*")
      .eq("id", heroId)
      .single();

    if (heroError || !hero) {
      return NextResponse.json({ error: "Hero not found" }, { status: 404 });
    }

    if (!hero.opendota_id) {
      return NextResponse.json({
        ...hero,
        counters: [],
        error_reason: "no_opendota_id",
      });
    }

    // 2. Fetch matchups + full hero list in parallel
    const [matchupsRes, allHeroesRes] = await Promise.all([
      fetch(
        `https://api.opendota.com/api/heroes/${hero.opendota_id}/matchups`,
        { next: { revalidate: 3600 } }
      ),
      fetch(`https://api.opendota.com/api/heroes`, {
        next: { revalidate: 86400 },
      }),
    ]);

    if (!matchupsRes.ok) {
      return NextResponse.json(
        { error: "Failed to fetch matchups from OpenDota" },
        { status: 502 }
      );
    }

    const matchups: OpenDotaMatchup[] = await matchupsRes.json();
    const openDotaHeroes: OpenDotaHero[] = allHeroesRes.ok
      ? await allHeroesRes.json()
      : [];

    // 3. Calculate disadvantage % with adaptive threshold
    // Start at 100 games, lower to 10 for niche heroes so we always get data
    const thresholds = [100, 50, 10, 1];
    let top3: {
      opendota_id: number;
      games_played: number;
      disadvantage_pct: number;
    }[] = [];

    for (const threshold of thresholds) {
      const candidates = matchups
        .filter((m) => m.games_played >= threshold)
        .map((m) => ({
          opendota_id: m.hero_id,
          games_played: m.games_played,
          disadvantage_pct: parseFloat(
            (((m.wins / m.games_played) - 0.5) * 100).toFixed(2)
          ),
        }))
        .sort((a, b) => b.disadvantage_pct - a.disadvantage_pct)
        .slice(0, 3);

      if (candidates.length >= 3) {
        top3 = candidates;
        break;
      }
    }

    if (top3.length === 0) {
      return NextResponse.json({
        ...hero,
        counters: [],
        error_reason: "insufficient_matchup_data",
      });
    }

    // 4. Look up counter heroes in Supabase first
    const counterIds = top3.map((m) => m.opendota_id);
    const { data: supabaseCounters } = await supabase
      .from("heroes")
      .select("*")
      .in("opendota_id", counterIds);

    // 5. Build counters with Supabase-first, OpenDota fallback
    const counters = top3
      .map((matchup) => {
        const supabaseHero = (supabaseCounters as Hero[] ?? []).find(
          (h) => h.opendota_id === matchup.opendota_id
        );

        if (supabaseHero) {
          return {
            counter_hero_id: supabaseHero.id,
            disadvantage_pct: matchup.disadvantage_pct,
            games_played: matchup.games_played,
            counter_hero: supabaseHero,
          };
        }

        // Fallback to OpenDota hero list
        const odHero = openDotaHeroes.find(
          (h) => h.id === matchup.opendota_id
        );
        if (!odHero) return null;

        const slug = odHero.name.replace("npc_dota_hero_", "");
        return {
          counter_hero_id: matchup.opendota_id,
          disadvantage_pct: matchup.disadvantage_pct,
          games_played: matchup.games_played,
          counter_hero: {
            id: matchup.opendota_id,
            name: odHero.localized_name,
            slug,
            primary_attr: odHero.primary_attr as Hero["primary_attr"],
            roles: odHero.roles,
            opendota_id: matchup.opendota_id,
          } as Hero,
        };
      })
      .filter(Boolean);

    return NextResponse.json({ ...hero, counters });
  } catch (err) {
    console.error("API route error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
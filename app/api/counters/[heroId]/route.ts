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
  name: string; // e.g. "npc_dota_hero_antimage"
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ heroId: string }> }
) {
  const { heroId } = await params;

  try {
    // 1. Get the clicked hero from Supabase
    const { data: hero, error: heroError } = await supabase
      .from("heroes")
      .select("*")
      .eq("id", heroId)
      .single();

    if (heroError || !hero) {
      return NextResponse.json({ error: "Hero not found" }, { status: 404 });
    }

    if (!hero.opendota_id) {
      return NextResponse.json(
        { error: "Hero has no OpenDota ID mapped" },
        { status: 400 }
      );
    }

    // 2. Fetch matchups + full hero list from OpenDota in parallel
    const [matchupsRes, allHeroesRes] = await Promise.all([
      fetch(
        `https://api.opendota.com/api/heroes/${hero.opendota_id}/matchups`,
        { next: { revalidate: 3600 } }        // cache 1 hour
      ),
      fetch(
        `https://api.opendota.com/api/heroes`,
        { next: { revalidate: 86400 } }        // cache 24 hours
      ),
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

    // 3. Calculate disadvantage % → keep only positive (real counters) → top 3
    const top3 = matchups
      .filter((m) => m.games_played > 100)
      .map((m) => ({
        opendota_id: m.hero_id,
        games_played: m.games_played,
        disadvantage_pct: parseFloat(
          (((m.wins / m.games_played) - 0.5) * 100).toFixed(2)
        ),
      }))
      .filter((m) => m.disadvantage_pct > 0)  // only genuine counters
      .sort((a, b) => b.disadvantage_pct - a.disadvantage_pct)
      .slice(0, 3);

    // 4. Try Supabase first for counter hero details
    const counterOpenDotaIds = top3.map((m) => m.opendota_id);

    const { data: supabaseCounterHeroes } = await supabase
      .from("heroes")
      .select("*")
      .in("opendota_id", counterOpenDotaIds);

    // 5. Build counters — Supabase data first, OpenDota as fallback
    const counters = top3
      .map((matchup) => {
        // Try Supabase hero first
        const supabaseHero = (supabaseCounterHeroes as Hero[] ?? []).find(
          (h) => h.opendota_id === matchup.opendota_id
        );

        if (supabaseHero) {
          return {
            counter_hero_id: supabaseHero.id,
            disadvantage_pct: matchup.disadvantage_pct,
            counter_hero: supabaseHero,
          };
        }

        // Fallback: build hero from OpenDota data
        const odHero = openDotaHeroes.find(
          (h) => h.id === matchup.opendota_id
        );

        if (!odHero) return null;

        // "npc_dota_hero_antimage" → "antimage"
        const slug = odHero.name.replace("npc_dota_hero_", "");

        return {
          counter_hero_id: matchup.opendota_id,
          disadvantage_pct: matchup.disadvantage_pct,
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
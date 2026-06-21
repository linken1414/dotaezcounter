import { supabase } from "@/lib/supabase";
import { Hero, HeroCounter, HeroWithCounters } from "@/lib/types";

// ── Fetch all heroes for the grid ──
export async function getAllHeroes(): Promise<Hero[]> {
  const { data, error } = await supabase
    .from("heroes")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching heroes:", error.message);
    return [];
  }

  return (data ?? []) as Hero[];
}

// ── Fetch a single hero + their top 3 counters ──
export async function getHeroWithCounters(
  heroId: number
): Promise<HeroWithCounters | null> {

  // 1. Fetch the hero itself
  const { data: heroData, error: heroError } = await supabase
    .from("heroes")
    .select("*")
    .eq("id", heroId)
    .single();

  if (heroError || !heroData) {
    console.error("Error fetching hero:", heroError?.message);
    return null;
  }

  // 2. Fetch top 3 counters with counter hero details
  const { data: countersData, error: countersError } = await supabase
    .from("hero_counters")
    .select(`
      counter_hero_id,
      disadvantage_pct,
      counter_hero:heroes!hero_counters_counter_hero_id_fkey (
        id,
        name,
        slug,
        primary_attr,
        roles
      )
    `)
    .eq("hero_id", heroId)
    .order("disadvantage_pct", { ascending: false })
    .limit(3);

  if (countersError) {
    console.error("Error fetching counters:", countersError.message);
    return null;
  }

  // 3. Map each row into our HeroCounter type
  const counters: HeroCounter[] = (countersData ?? []).map((row) => ({
    counter_hero_id: row.counter_hero_id as number,
    disadvantage_pct: row.disadvantage_pct as number,
    counter_hero: row.counter_hero as unknown as Hero,
  }));

  // 4. Combine hero + counters into final shape
  const hero = heroData as Hero;

  const result: HeroWithCounters = {
    id: hero.id,
    name: hero.name,
    slug: hero.slug,
    primary_attr: hero.primary_attr,
    roles: hero.roles,
    counters,
  };

  return result;
}
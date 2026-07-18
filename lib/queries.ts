import { supabase } from "@/lib/supabase";
import { Hero, HeroWithCounters } from "@/lib/types";

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

export async function getHeroWithCounters(
  heroId: number
): Promise<HeroWithCounters | null> {
  try {
    const baseUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:3000";

    const res = await fetch(`${baseUrl}/api/counters/${heroId}`);

    if (!res.ok) {
      console.error("Counter API error:", res.statusText);
      return null;
    }

    const data = await res.json();
    return data as HeroWithCounters;
  } catch (err) {
    console.error("Failed to fetch counters:", err);
    return null;
  }
}
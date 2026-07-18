"use client";

import Image from "next/image";
import { TrendingUp, Users, Star } from "lucide-react";
import { Hero } from "@/lib/types";
import { heroMatchesRole } from "@/lib/roles";

const getDotaImageUrl = (slug: string) =>
  `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${slug}.png`;

const attrColors: Record<string, string> = {
  str: "text-red-400",
  agi: "text-emerald-400",
  int: "text-blue-400",
  uni: "text-purple-400",
};

type ResultHero = Hero & {
  total_disadvantage: number;
  avg_disadvantage: number;
  matchup_count: number;
};

type CounterResultsProps = {
  results: ResultHero[];
  selectedRole: string | null;
  enemyCount: number;
};

export default function CounterResults({
  results,
  selectedRole,
  enemyCount,
}: CounterResultsProps) {
  // Filter by role if one is selected
  const filtered = selectedRole
    ? results.filter((h) => heroMatchesRole(h.roles, selectedRole))
    : results;

  const top5 = filtered.slice(0, 5);

  if (top5.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        <p className="text-3xl mb-2">🤔</p>
        <p>No heroes found for this role combination.</p>
        <p className="text-sm mt-1 text-gray-600">
          Try a different role or remove some enemy picks.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Star size={16} className="text-yellow-400" />
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
          Best Counter Picks
        </h3>
        {selectedRole && (
          <span className="ml-auto text-xs text-gray-500">
            filtered by role
          </span>
        )}
      </div>

      <div className="space-y-2">
        {top5.map((hero, index) => (
          <div
            key={hero.id}
            className="flex items-center gap-3 p-3 bg-gray-800/60 
                       border border-gray-700/50 rounded-xl hover:border-gray-600 
                       transition-all"
          >
            {/* Rank */}
            <span className="text-lg font-black text-gray-600 w-5 text-center flex-shrink-0">
              {index + 1}
            </span>

            {/* Hero image */}
            <div className="relative w-14 h-9 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={getDotaImageUrl(hero.slug)}
                alt={hero.name}
                fill
                className="object-cover object-top"
                unoptimized
              />
            </div>

            {/* Hero info */}
            <div className="flex-1 min-w-0">
              <p className={`font-bold text-sm ${attrColors[hero.primary_attr]}`}>
                {hero.name}
              </p>
              <p className="text-[10px] text-gray-500 truncate">
                {hero.roles.slice(0, 3).join(" · ")}
              </p>
            </div>

            {/* Stats */}
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <div className="flex items-center gap-1">
                <TrendingUp size={11} className="text-red-400" />
                <span className="text-red-400 font-bold text-xs">
                  +{hero.avg_disadvantage.toFixed(2)}% avg
                </span>
              </div>
              {enemyCount > 1 && (
                <div className="flex items-center gap-1">
                  <Users size={11} className="text-gray-500" />
                  <span className="text-gray-500 text-[10px]">
                    counters {hero.matchup_count}/{enemyCount} enemies
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-[11px] text-gray-600 mt-4">
        Ranked by total disadvantage dealt across all enemy heroes
      </p>
    </div>
  );
}
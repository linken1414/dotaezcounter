"use client";

import Image from "next/image";
import { TrendingUp, Star, Shield } from "lucide-react";
import { Hero } from "@/lib/types";

const getDotaImageUrl = (slug: string) =>
  `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${slug}.png`;

const attrColors: Record<string, string> = {
  str: "text-red-400",
  agi: "text-emerald-400",
  int: "text-blue-400",
  uni: "text-purple-400",
};

const rankStyles = [
  "border-yellow-500/40 bg-yellow-500/10",
  "border-gray-500/40  bg-gray-500/10",
  "border-orange-700/40 bg-orange-700/10",
  "border-gray-700/40  bg-gray-800/40",
  "border-gray-700/40  bg-gray-800/40",
];

type ResultHero = Hero & {
  avg_disadvantage: number;
  matchup_count: number;
  counters_positions?: number[];
};

type LaneResultsProps = {
  results: ResultHero[];
  isLoading: boolean;
  hasEnemies: boolean;
  selectedRole: string | null;
  enemyCount: number;
  roleFiltered: boolean;
};

export default function LaneResults({
  results,
  isLoading,
  hasEnemies,
  selectedRole,
  enemyCount,
  roleFiltered,
}: LaneResultsProps) {

  if (!hasEnemies) {
    return (
      <div className="flex flex-col items-center justify-center
                      min-h-[300px] text-center">
        <p className="text-4xl mb-3">🛡️</p>
        <p className="font-medium text-gray-500">Pick your lane enemies</p>
        <p className="text-sm text-gray-600 mt-1">
          Add up to 2 heroes you'll face in lane
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center
                      min-h-[300px] gap-3">
        <div className="w-8 h-8 border-2 border-emerald-400
                        border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Finding best lane picks...</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center
                      min-h-[300px] text-center">
        <p className="text-4xl mb-3">😅</p>
        <p className="text-gray-400 font-medium">No data available</p>
        <p className="text-sm text-gray-600 mt-1">
          Try different enemies or check their opendota IDs
        </p>
      </div>
    );
  }

  const top5 = results.slice(0, 5);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <Star size={15} className="text-yellow-400" />
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
          Best Lane Picks
        </h3>
      </div>

      {/* Filter status */}
      <p className="text-[11px] mb-4">
        {selectedRole && roleFiltered ? (
          <span className="text-emerald-500/70">
            ✓ Filtered to{" "}
            <span className="capitalize font-medium text-emerald-400">
              {selectedRole.replace("_", " ")}
            </span>{" "}
            heroes
          </span>
        ) : selectedRole ? (
          <span className="text-yellow-500/60">
            ⚠️ Showing all roles — not enough role-specific data
          </span>
        ) : (
          <span className="text-gray-600">
            Select your role above to filter results
          </span>
        )}
      </p>

      <div className="space-y-2">
        {top5.map((hero, index) => (
          <div
            key={hero.id}
            className={`flex items-center gap-3 p-3 rounded-xl border
                        transition-all ${rankStyles[index]}`}
          >
            {/* Rank */}
            <span className="text-base font-black text-gray-500 w-4
                             text-center flex-shrink-0">
              {index + 1}
            </span>

            {/* Portrait */}
            <div className="relative w-14 h-9 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={getDotaImageUrl(hero.slug)}
                alt={hero.name}
                fill
                className="object-cover object-top"
                unoptimized
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className={`font-bold text-sm ${attrColors[hero.primary_attr]}`}>
                {hero.name}
              </p>
              <p className="text-[10px] text-gray-500 truncate">
                {hero.roles?.slice(0, 2).join(" · ")}
              </p>
            </div>

            {/* Disadvantage */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <TrendingUp size={11} className="text-red-400" />
              <span className="text-red-400 font-bold text-xs">
                +{hero.avg_disadvantage.toFixed(2)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-[11px] text-gray-600 mt-4">
        Best picks to win your lane against{" "}
        {enemyCount === 1 ? "this enemy" : "these enemies"}
      </p>
    </div>
  );
}
"use client";

import Image from "next/image";
import { TrendingUp, Users, Star } from "lucide-react";
import { Hero } from "@/lib/types";

const getDotaImageUrl = (slug: string) =>
  `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${slug}.png`;

const attrColors: Record<string, string> = {
  str: "text-red-400",
  agi: "text-emerald-400",
  int: "text-blue-400",
  uni: "text-purple-400",
};

const positionLabels: Record<number, { label: string; color: string }> = {
  1: { label: "P1", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  2: { label: "P2", color: "bg-yellow-500/20  text-yellow-400  border-yellow-500/30"  },
  3: { label: "P3", color: "bg-orange-500/20  text-orange-400  border-orange-500/30"  },
  4: { label: "P4", color: "bg-blue-500/20    text-blue-400    border-blue-500/30"    },
  5: { label: "P5", color: "bg-purple-500/20  text-purple-400  border-purple-500/30"  },
};

type ResultHero = Hero & {
  total_disadvantage: number;
  avg_disadvantage: number;
  matchup_count: number;
  counters_positions?: number[];
};

type TeamResultsProps = {
  results: ResultHero[];
  isLoading: boolean;
  hasEnemies: boolean;
  enemyCount: number;
};

export default function TeamResults({
  results,
  isLoading,
  hasEnemies,
  enemyCount,
}: TeamResultsProps) {

  if (!hasEnemies) {
    return (
      <div className="flex flex-col items-center justify-center
                      min-h-[300px] text-center">
        <p className="text-4xl mb-3">⚔️</p>
        <p className="font-medium text-gray-500">Add the enemy team</p>
        <p className="text-sm text-gray-600 mt-1">
          Pick up to 5 heroes to find the best team counter
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center
                      min-h-[300px] gap-3">
        <div className="w-8 h-8 border-2 border-blue-400
                        border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">
          Analyzing {enemyCount} enem{enemyCount === 1 ? "y" : "ies"}...
        </p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center
                      min-h-[300px] text-center">
        <p className="text-4xl mb-3">😅</p>
        <p className="text-gray-400 font-medium">No counter data found</p>
        <p className="text-sm text-gray-600 mt-1">
          Try adding more enemy heroes
        </p>
      </div>
    );
  }

  const top5 = results.slice(0, 5);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Star size={15} className="text-yellow-400" />
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
          Best Team Counters
        </h3>
        <span className="ml-auto text-[10px] text-blue-400/70
                         bg-blue-500/10 border border-blue-500/20
                         px-2 py-0.5 rounded-full">
          vs {enemyCount} enem{enemyCount === 1 ? "y" : "ies"}
        </span>
      </div>

      <div className="space-y-2">
        {top5.map((hero, index) => (
          <div
            key={hero.id}
            className="flex items-center gap-3 p-3 bg-gray-800/60
                       border border-gray-700/50 rounded-xl
                       hover:border-gray-600 transition-all"
          >
            {/* Rank */}
            <span className="text-base font-black text-gray-600 w-4
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

              {/* Which enemy positions this hero counters */}
              {hero.counters_positions && hero.counters_positions.length > 0 && (
                <div className="flex gap-1 mt-0.5 flex-wrap items-center">
                  <span className="text-[9px] text-gray-600">counters</span>
                  {hero.counters_positions.sort((a, b) => a - b).map((pos) => {
                    const p = positionLabels[pos];
                    if (!p) return null;
                    return (
                      <span
                        key={pos}
                        className={`text-[9px] font-bold px-1 py-0.5
                                    rounded border ${p.color}`}
                      >
                        {p.label}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <div className="flex items-center gap-1">
                <TrendingUp size={11} className="text-red-400" />
                <span className="text-red-400 font-bold text-xs">
                  +{hero.avg_disadvantage.toFixed(2)}%
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Users size={11} className="text-gray-500" />
                <span className="text-gray-500 text-[10px]">
                  {hero.matchup_count}/{enemyCount}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-[11px] text-gray-600 mt-4">
        Ranked by combined disadvantage across the full enemy team
      </p>
    </div>
  );
}
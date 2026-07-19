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
  1: { label: "Pos 1", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  2: { label: "Pos 2", color: "bg-yellow-500/20  text-yellow-400  border-yellow-500/30"  },
  3: { label: "Pos 3", color: "bg-orange-500/20  text-orange-400  border-orange-500/30"  },
  4: { label: "Pos 4", color: "bg-blue-500/20    text-blue-400    border-blue-500/30"    },
  5: { label: "Pos 5", color: "bg-purple-500/20  text-purple-400  border-purple-500/30"  },
};

type ResultHero = Hero & {
  total_disadvantage: number;
  avg_disadvantage: number;
  matchup_count: number;
  counters_positions?: number[];
};

type CounterResultsProps = {
  results: ResultHero[];
  selectedRole: string | null;
  enemyCount: number;
  roleFiltered?: boolean;
};

export default function CounterResults({
  results,
  selectedRole,
  enemyCount,
  roleFiltered = false,
}: CounterResultsProps) {
  const top5 = results.slice(0, 5);

  if (top5.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
        <p className="text-4xl mb-3">🤔</p>
        <p className="text-gray-400 font-medium">No heroes found</p>
        <p className="text-sm text-gray-600 mt-1 max-w-xs">
          Try selecting a different role or removing some enemy picks.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Star size={16} className="text-yellow-400" />
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
          Best Counter Picks
        </h3>
        
        {selectedRole && roleFiltered && (
          <span className="ml-auto text-[10px] text-emerald-500/70 
                           bg-emerald-500/10 border border-emerald-500/20 
                           px-2 py-0.5 rounded-full">
            {selectedRole.replace("_", " ")} only
          </span>
        )}
        
        {selectedRole && !roleFiltered && (
          <span className="ml-auto text-[10px] text-yellow-500/70 
                           bg-yellow-500/10 border border-yellow-500/20 
                           px-2 py-0.5 rounded-full">
            ⚠️ showing all roles
          </span>
        )}
      </div>

      {/* Results list */}
      <div className="space-y-2">
        {top5.map((hero, index) => (
          <div
            key={hero.id}
            className="flex items-center gap-3 p-3 bg-gray-800/60
                       border border-gray-700/50 rounded-xl
                       hover:border-gray-600 transition-all"
          >
            <span className="text-lg font-black text-gray-600 w-4 text-center flex-shrink-0">
              {index + 1}
            </span>

            <div className="relative w-14 h-9 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={getDotaImageUrl(hero.slug)}
                alt={hero.name}
                fill
                className="object-cover object-top"
                unoptimized
              />
            </div>

            <div className="flex-1 min-w-0">
              <p className={`font-bold text-sm ${attrColors[hero.primary_attr]}`}>
                {hero.name}
              </p>

              {hero.counters_positions && hero.counters_positions.length > 0 && (
                <div className="flex gap-1 mt-1 flex-wrap">
                  {hero.counters_positions
                    .sort((a, b) => a - b)
                    .map((pos) => {
                      const p = positionLabels[pos];
                      return (
                        <span
                          key={pos}
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${p.color}`}
                        >
                          {p.label}
                        </span>
                      );
                    })}
                  <span className="text-[9px] text-gray-600 self-center">
                    countered
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <div className="flex items-center gap-1">
                <TrendingUp size={11} className="text-red-400" />
                <span className="text-red-400 font-bold text-xs">
                  +{hero.avg_disadvantage.toFixed(2)}%
                </span>
              </div>
              {enemyCount > 1 && (
                <div className="flex items-center gap-1">
                  <Users size={11} className="text-gray-500" />
                  <span className="text-gray-500 text-[10px]">
                    {hero.matchup_count}/{enemyCount} enemies
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-[11px] text-gray-600 mt-4">
        Ranked by diversity-weighted disadvantage
      </p>
    </div>
  );
}
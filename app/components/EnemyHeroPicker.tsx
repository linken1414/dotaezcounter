"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { X, Search } from "lucide-react";
import { Hero } from "@/lib/types";

const getDotaImageUrl = (slug: string) =>
  `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${slug}.png`;

const MAX_ENEMIES = 5;

export type EnemyEntry = {
  hero: Hero;
  position: number | null;
};

const POSITIONS = [
  { value: 1, label: "Pos 1", sublabel: "Safe",  color: "emerald" },
  { value: 2, label: "Pos 2", sublabel: "Mid",   color: "yellow"  },
  { value: 3, label: "Pos 3", sublabel: "Off",   color: "orange"  },
  { value: 4, label: "Pos 4", sublabel: "Sup",   color: "blue"    },
  { value: 5, label: "Pos 5", sublabel: "Hard",  color: "purple"  },
];

const posColorMap: Record<string, string> = {
  emerald: "border-emerald-500 bg-emerald-500/20 text-emerald-300",
  yellow:  "border-yellow-500  bg-yellow-500/20  text-yellow-300",
  orange:  "border-orange-500  bg-orange-500/20  text-orange-300",
  blue:    "border-blue-500    bg-blue-500/20    text-blue-300",
  purple:  "border-purple-500  bg-purple-500/20  text-purple-300",
};

const posDisabledClass =
  "border-gray-800 bg-gray-900/20 text-gray-700 cursor-not-allowed opacity-40";

const posInactiveClass =
  "border-gray-700 bg-gray-800/40 text-gray-500 hover:border-gray-500 hover:text-gray-300";

type EnemyHeroPickerProps = {
  heroes: Hero[];
  enemies: EnemyEntry[];
  onAdd: (hero: Hero) => void;
  onRemove: (heroId: number) => void;
  onSetPosition: (heroId: number, position: number | null) => void;
  maxEnemies?: number;   // ← new, defaults to 5
  label?: string;        // ← new, custom label
};

export default function EnemyHeroPicker({
  heroes,
  enemies,
  onAdd,
  onRemove,
  onSetPosition,
  maxEnemies = 5,        // ← use this instead of MAX_ENEMIES constant
  label,
}: EnemyHeroPickerProps) {
  const [search, setSearch] = useState("");

  // Track which positions are already taken by other enemies
  const takenPositions = useMemo(() => {
    const taken = new Set<number>();
    enemies.forEach((e) => {
      if (e.position !== null) taken.add(e.position);
    });
    return taken;
  }, [enemies]);

  const filteredHeroes = useMemo(() => {
    const query = search.toLowerCase().trim();
    return heroes.filter(
      (h) =>
        h.name.toLowerCase().includes(query) &&
        !enemies.find((e) => e.hero.id === h.id)
    );
  }, [search, heroes, enemies]);

  return (
    <div className="w-full">
      <p className="text-xs text-gray-500 uppercase tracking-widest mb-3 text-center">
      {label ?? "Pick Enemy Heroes"}{" "}
      <span className="text-gray-600">({enemies.length}/{maxEnemies})</span>
    </p>

      {/* Selected enemies with position picker */}
      <div className="space-y-2 mb-4">
        {enemies.length === 0 ? (
          <div className="flex items-center justify-center border border-dashed
                          border-gray-700 rounded-xl text-gray-600 text-sm py-4">
            Click heroes below to add enemies
          </div>
        ) : (
          enemies.map((entry) => {
            return (
              <div
                key={entry.hero.id}
                className="flex items-center gap-2 p-2 bg-gray-800/40
                           border border-gray-700/50 rounded-xl"
              >
                {/* Portrait */}
                <div className="relative w-14 h-9 rounded-lg overflow-hidden
                                border border-red-500/40 flex-shrink-0">
                  <Image
                    src={getDotaImageUrl(entry.hero.slug)}
                    alt={entry.hero.name}
                    fill
                    className="object-cover object-top"
                    unoptimized
                  />
                </div>

                {/* Name */}
                <p className="text-xs font-semibold text-white w-20
                               truncate flex-shrink-0">
                  {entry.hero.name}
                </p>

                {/* Position buttons — disable already-taken positions */}
                <div className="flex gap-1 flex-1">
                  {POSITIONS.map((pos) => {
                    const isActive = entry.position === pos.value;
                    // A position is taken if another enemy already has it
                    const isTaken =
                      !isActive && takenPositions.has(pos.value);

                    return (
                      <button
                        key={pos.value}
                        disabled={isTaken}
                        onClick={() =>
                          onSetPosition(
                            entry.hero.id,
                            isActive ? null : pos.value
                          )
                        }
                        title={
                          isTaken
                            ? `Position ${pos.value} already assigned`
                            : `Set as ${pos.label}`
                        }
                        className={`flex-1 flex flex-col items-center py-1
                                    rounded-lg border text-[9px] font-bold
                                    transition-all
                                    ${
                                      isTaken
                                        ? posDisabledClass
                                        : isActive
                                        ? posColorMap[pos.color]
                                        : posInactiveClass
                                    }`}
                      >
                        <span>{pos.label}</span>
                        <span className="opacity-70">{pos.sublabel}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Remove */}
                <button
                  onClick={() => onRemove(entry.hero.id)}
                  className="text-gray-600 hover:text-red-400
                             transition-colors flex-shrink-0 p-1"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Search + hero grid */}
      {enemies.length < maxEnemies && (
        <>
          <div className="relative mb-2">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search enemy hero..."
              className="w-full bg-gray-800/80 border border-gray-700
                         focus:border-red-500/60 focus:ring-1 focus:ring-red-500/30
                         text-white placeholder-gray-600 rounded-lg
                         pl-8 pr-3 py-2 text-sm outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10
                          gap-1.5 max-h-44 overflow-y-auto pr-1">
            {filteredHeroes.map((hero) => (
              <button
                key={hero.id}
                onClick={() => onAdd(hero)}
                title={hero.name}
                className="relative aspect-video rounded-md overflow-hidden
                           border border-gray-700 hover:border-red-400/60
                           transition-all hover:scale-110 flex-shrink-0"
              >
                <Image
                  src={getDotaImageUrl(hero.slug)}
                  alt={hero.name}
                  fill
                  className="object-cover object-top"
                  unoptimized
                />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
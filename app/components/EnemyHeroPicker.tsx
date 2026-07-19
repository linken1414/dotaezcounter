"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { X, Search } from "lucide-react";
import { Hero } from "@/lib/types";

const getDotaImageUrl = (slug: string) =>
  `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${slug}.png`;

export type EnemyEntry = {
  hero: Hero;
  position: number | null;
};

const POSITIONS = [
  { value: 1, label: "P1", sublabel: "Safe",  color: "emerald" },
  { value: 2, label: "P2", sublabel: "Mid",   color: "yellow"  },
  { value: 3, label: "P3", sublabel: "Off",   color: "orange"  },
  { value: 4, label: "P4", sublabel: "Sup",   color: "blue"    },
  { value: 5, label: "P5", sublabel: "Hard",  color: "purple"  },
];

const posColorMap: Record<string, string> = {
  emerald: "border-emerald-500 bg-emerald-500/20 text-emerald-300",
  yellow:  "border-yellow-500  bg-yellow-500/20  text-yellow-300",
  orange:  "border-orange-500  bg-orange-500/20  text-orange-300",
  blue:    "border-blue-500    bg-blue-500/20    text-blue-300",
  purple:  "border-purple-500  bg-purple-500/20  text-purple-300",
};

const posDisabledClass =
  "border-gray-800 bg-gray-900/20 text-gray-700 cursor-not-allowed opacity-30";
const posInactiveClass =
  "border-gray-700 bg-gray-800/40 text-gray-500 hover:border-gray-500 hover:text-gray-300";

type EnemyHeroPickerProps = {
  heroes: Hero[];
  enemies: EnemyEntry[];
  onAdd: (hero: Hero) => void;
  onRemove: (heroId: number) => void;
  onSetPosition: (heroId: number, position: number | null) => void;
  maxEnemies?: number;
  label?: string;
};

export default function EnemyHeroPicker({
  heroes,
  enemies,
  onAdd,
  onRemove,
  onSetPosition,
  maxEnemies = 5,
  label,
}: EnemyHeroPickerProps) {
  const [search, setSearch] = useState("");

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
      {/* Label */}
      <p className="text-xs text-gray-500 uppercase tracking-widest mb-3 text-center">
        {label ?? "Pick Enemy Heroes"}{" "}
        <span className="text-gray-600 normal-case">
          ({enemies.length}/{maxEnemies})
        </span>
      </p>

      {/* Selected enemies */}
      <div className="space-y-3 mb-4">
        {enemies.length === 0 ? (
          <div className="flex items-center justify-center border border-dashed
                          border-gray-700 rounded-xl text-gray-600 text-sm py-4">
            Click heroes below to add enemies
          </div>
        ) : (
          enemies.map((entry) => (
            <div
              key={entry.hero.id}
              className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-2"
            >
              {/* Row 1: portrait + name + remove */}
              <div className="flex items-center gap-2 mb-2">
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
                <p className="text-sm font-semibold text-white flex-1 truncate">
                  {entry.hero.name}
                </p>
                <button
                  onClick={() => onRemove(entry.hero.id)}
                  className="flex-shrink-0 p-1.5 rounded-lg bg-gray-700/50
                             text-gray-500 hover:text-red-400 hover:bg-red-500/10
                             transition-colors"
                >
                  <X size={13} />
                </button>
              </div>

              {/* Row 2: position buttons on their own row */}
              <div className="flex gap-1.5">
                {POSITIONS.map((pos) => {
                  const isActive = entry.position === pos.value;
                  const isTaken = !isActive && takenPositions.has(pos.value);
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
                      className={`flex-1 flex flex-col items-center py-1.5
                                  rounded-lg border text-[10px] font-bold
                                  transition-all leading-tight
                                  ${isTaken
                                    ? posDisabledClass
                                    : isActive
                                    ? posColorMap[pos.color]
                                    : posInactiveClass
                                  }`}
                    >
                      <span>{pos.label}</span>
                      <span className="opacity-60 text-[8px]">
                        {pos.sublabel}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))
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
              placeholder="Search hero..."
              className="w-full bg-gray-800/80 border border-gray-700
                         focus:border-red-500/60 focus:ring-1 focus:ring-red-500/30
                         text-white placeholder-gray-600 rounded-lg
                         pl-8 pr-3 py-2 text-sm outline-none transition-all"
            />
          </div>

          {/* Hero grid — more columns on mobile for smaller cards */}
          <div className="grid grid-cols-7 sm:grid-cols-9 md:grid-cols-10
                          gap-1 max-h-44 overflow-y-auto pr-0.5">
            {filteredHeroes.map((hero) => (
              <button
                key={hero.id}
                onClick={() => onAdd(hero)}
                title={hero.name}
                className="relative w-full rounded-md overflow-hidden
                          border border-gray-700/80 hover:border-red-400/60
                          active:scale-95 transition-all"
                style={{ aspectRatio: "16/9" }}
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
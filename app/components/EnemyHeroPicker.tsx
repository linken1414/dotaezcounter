"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { X, Search } from "lucide-react";
import { Hero } from "@/lib/types";

const getDotaImageUrl = (slug: string) =>
  `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${slug}.png`;

const MAX_ENEMIES = 5;

type EnemyHeroPickerProps = {
  heroes: Hero[];
  selectedEnemies: Hero[];
  onAdd: (hero: Hero) => void;
  onRemove: (heroId: number) => void;
};

export default function EnemyHeroPicker({
  heroes,
  selectedEnemies,
  onAdd,
  onRemove,
}: EnemyHeroPickerProps) {
  const [search, setSearch] = useState("");

  const filteredHeroes = useMemo(() => {
    const query = search.toLowerCase().trim();
    return heroes.filter(
      (h) =>
        h.name.toLowerCase().includes(query) &&
        !selectedEnemies.find((e) => e.id === h.id)
    );
  }, [search, heroes, selectedEnemies]);

  return (
    <div className="w-full">
      <p className="text-xs text-gray-500 uppercase tracking-widest mb-3 text-center">
        Step 2 — Pick Enemy Heroes{" "}
        <span className="text-gray-600">
          ({selectedEnemies.length}/{MAX_ENEMIES})
        </span>
      </p>

      {/* Selected enemies row */}
      <div className="flex gap-2 mb-3 min-h-[64px] flex-wrap">
        {selectedEnemies.length === 0 ? (
          <div className="w-full flex items-center justify-center border border-dashed border-gray-700 rounded-xl text-gray-600 text-sm py-3">
            Click heroes below to add enemies
          </div>
        ) : (
          selectedEnemies.map((hero) => (
            <div
              key={hero.id}
              className="relative group flex-shrink-0"
            >
              <div className="relative w-16 h-10 rounded-lg overflow-hidden border-2 border-red-500/60">
                <Image
                  src={getDotaImageUrl(hero.slug)}
                  alt={hero.name}
                  fill
                  className="object-cover object-top"
                  unoptimized
                />
              </div>
              <button
                onClick={() => onRemove(hero.id)}
                className="absolute -top-1.5 -right-1.5 bg-red-500 rounded-full p-0.5
                           opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={10} className="text-white" />
              </button>
              <p className="text-[9px] text-gray-400 text-center mt-0.5 truncate w-16">
                {hero.name.split(" ")[0]}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Search */}
      {selectedEnemies.length < MAX_ENEMIES && (
        <>
          <div className="relative mb-3">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search enemy hero..."
              className="w-full bg-gray-800/80 border border-gray-700 focus:border-red-500/60
                         focus:ring-1 focus:ring-red-500/30 text-white placeholder-gray-600
                         rounded-lg pl-8 pr-3 py-2 text-sm outline-none transition-all"
            />
          </div>

          {/* Hero grid */}
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-1.5 
                          max-h-48 overflow-y-auto pr-1 scrollbar-thin">
            {filteredHeroes.map((hero) => (
              <button
                key={hero.id}
                onClick={() => onAdd(hero)}
                title={hero.name}
                className="relative aspect-video rounded-md overflow-hidden border 
                           border-gray-700 hover:border-red-400/60 transition-all 
                           hover:scale-110 flex-shrink-0"
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
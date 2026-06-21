"use client";

import { useState, useMemo } from "react";
import { Hero, HeroWithCounters } from "@/lib/types";
import { getHeroWithCounters } from "@/lib/queries";
import HeroCard from "@/app/components/HeroCard";
import SearchBar from "@/app/components/SearchBar";
import CounterModal from "@/app/components/CounterModal";

type HeroGridProps = {
  heroes: Hero[];
};

export default function HeroGrid({ heroes }: HeroGridProps) {
  const [search, setSearch] = useState("");
  const [selectedHero, setSelectedHero] = useState<HeroWithCounters | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter heroes by search query
  const filteredHeroes = useMemo(() => {
    if (!search.trim()) return heroes;
    return heroes.filter((h) =>
      h.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, heroes]);

  // Handle hero click — fetch real counter data from Supabase
  const handleHeroClick = async (hero: Hero) => {
    setIsLoading(true);
    setError(null);

    try {
      const heroWithCounters = await getHeroWithCounters(hero.id);

      if (!heroWithCounters) {
        setError("Could not load counter data. Please try again.");
        return;
      }

      setSelectedHero(heroWithCounters);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Search Bar */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">
          Pick a Hero to Counter
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          Click any hero to instantly see their top 3 counter picks
        </p>
        <SearchBar value={search} onChange={setSearch} />
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 
                        rounded-xl text-red-400 text-sm text-center">
          ⚠️ {error}
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-40 flex items-center justify-center
                        bg-black/40 backdrop-blur-sm">
          <div className="bg-gray-800 rounded-2xl p-6 flex items-center gap-3 
                          shadow-xl border border-gray-700">
            <div className="w-5 h-5 border-2 border-emerald-400 
                            border-t-transparent rounded-full animate-spin" />
            <span className="text-white text-sm font-medium">
              Fetching counters...
            </span>
          </div>
        </div>
      )}

      {/* Hero Count */}
      <p className="text-xs text-gray-600 mb-3">
        Showing{" "}
        <span className="text-gray-400 font-medium">{filteredHeroes.length}</span>{" "}
        hero{filteredHeroes.length !== 1 ? "s" : ""}
        {search && (
          <span className="text-gray-500"> for "{search}"</span>
        )}
      </p>

      {/* Hero Grid or Empty State */}
      {filteredHeroes.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-lg">No heroes found for</p>
          <p className="text-emerald-400 font-semibold mt-1">"{search}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 
                        lg:grid-cols-8 xl:grid-cols-10 gap-3">
          {filteredHeroes.map((hero) => (
            <HeroCard
              key={hero.id}
              hero={hero}
              onClick={handleHeroClick}
            />
          ))}
        </div>
      )}

      {/* Counter Modal */}
      <CounterModal
        hero={selectedHero}
        onClose={() => setSelectedHero(null)}
      />
    </>
  );
}
"use client";

import { useState, useEffect, useCallback } from "react";
import { Swords, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Hero } from "@/lib/types";
import { getAllHeroes } from "@/lib/queries";
import RoleSelector from "@/app/components/RoleSelector";
import EnemyHeroPicker from "@/app/components/EnemyHeroPicker";
import CounterResults from "@/app/components/CounterResults";

type ResultHero = Hero & {
  total_disadvantage: number;
  avg_disadvantage: number;
  matchup_count: number;
};

export default function DraftPage() {
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [enemyHeroes, setEnemyHeroes] = useState<Hero[]>([]);
  const [results, setResults] = useState<ResultHero[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [heroesLoading, setHeroesLoading] = useState(true);

  // Load all heroes on mount
  useEffect(() => {
    getAllHeroes().then((data) => {
      setHeroes(data);
      setHeroesLoading(false);
    });
  }, []);

  const addEnemy = (hero: Hero) => {
    if (enemyHeroes.length >= 5) return;
    setEnemyHeroes((prev) => [...prev, hero]);
  };

  const removeEnemy = (heroId: number) => {
    setEnemyHeroes((prev) => prev.filter((h) => h.id !== heroId));
    setResults([]);
  };

  const reset = () => {
    setEnemyHeroes([]);
    setSelectedRole(null);
    setResults([]);
  };

  // Auto-fetch when enemies change
  const fetchCounters = useCallback(async () => {
    if (enemyHeroes.length === 0) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const baseUrl = window.location.origin;
      const res = await fetch(`${baseUrl}/api/multi-counters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enemyOpenDotaIds: enemyHeroes.map((h) => h.opendota_id),
        }),
      });

      if (!res.ok) throw new Error("Failed to fetch counters");

      const data = await res.json();
      setResults(data.results ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [enemyHeroes]);

  useEffect(() => {
    fetchCounters();
  }, [fetchCounters]);

  return (
    <main className="min-h-screen bg-gray-950 text-white">

      {/* Header */}
      <header className="border-b border-gray-800/60 bg-gray-950/80 
                         backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2">
            <Swords size={22} className="text-emerald-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white leading-none">
              dotaezcounter
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">Draft Helper</p>
          </div>
          <nav className="ml-auto flex items-center gap-3">
            <Link
              href="/"
              className="text-xs text-gray-400 hover:text-white transition-colors"
            >
              Hero Pool
            </Link>
            <span className="text-xs font-semibold text-emerald-400 
                             border border-emerald-500/30 bg-emerald-500/10 
                             px-3 py-1 rounded-full">
              Draft Picker
            </span>
          </nav>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            Multi-Hero Counter Picker
          </h2>
          <p className="text-gray-400 text-sm">
            Select your role and pick up to 5 enemy heroes — we'll find your best counter pick
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* LEFT PANEL — inputs */}
          <div className="space-y-6">

            {/* Role selector */}
            <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5">
              <RoleSelector
                selectedRole={selectedRole}
                onChange={setSelectedRole}
              />
            </div>

            {/* Enemy picker */}
            <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5">
              {heroesLoading ? (
                <div className="flex items-center justify-center py-8 gap-2">
                  <div className="w-4 h-4 border-2 border-emerald-400 
                                  border-t-transparent rounded-full animate-spin" />
                  <span className="text-gray-500 text-sm">Loading heroes...</span>
                </div>
              ) : (
                <EnemyHeroPicker
                  heroes={heroes}
                  selectedEnemies={enemyHeroes}
                  onAdd={addEnemy}
                  onRemove={removeEnemy}
                />
              )}
            </div>

            {/* Reset button */}
            {(enemyHeroes.length > 0 || selectedRole) && (
              <button
                onClick={reset}
                className="w-full flex items-center justify-center gap-2 py-2.5 
                           rounded-xl border border-gray-700 text-gray-400 
                           hover:text-white hover:border-gray-500 
                           transition-all text-sm"
              >
                <RefreshCw size={14} />
                Reset All
              </button>
            )}
          </div>

          {/* RIGHT PANEL — results */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5">
            {enemyHeroes.length === 0 ? (
              <div className="flex flex-col items-center justify-center 
                              h-full min-h-[300px] text-gray-600 text-center">
                <p className="text-4xl mb-3">🎯</p>
                <p className="font-medium text-gray-500">
                  Pick enemy heroes to get suggestions
                </p>
                <p className="text-sm mt-1">
                  Select your role first for filtered results
                </p>
              </div>
            ) : isLoading ? (
              <div className="flex flex-col items-center justify-center 
                              h-full min-h-[300px] gap-3">
                <div className="w-8 h-8 border-2 border-emerald-400 
                                border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400 text-sm">
                  Analyzing {enemyHeroes.length} enem
                  {enemyHeroes.length === 1 ? "y" : "ies"}...
                </p>
              </div>
            ) : (
              <CounterResults
                results={results}
                selectedRole={selectedRole}
                enemyCount={enemyHeroes.length}
              />
            )}
          </div>

        </div>
      </div>
    </main>
  );
}
"use client";

import { useState, useEffect, useCallback } from "react";
import { Swords, RefreshCw, Shield, Users } from "lucide-react";
import Link from "next/link";
import { Hero } from "@/lib/types";
import { getAllHeroes } from "@/lib/queries";
import RoleSelector from "@/app/components/RoleSelector";
import EnemyHeroPicker, { EnemyEntry } from "@/app/components/EnemyHeroPicker";
import LaneResults from "@/app/components/LaneResults";
import TeamResults from "@/app/components/TeamResults";

type ResultHero = Hero & {
  total_disadvantage: number;
  avg_disadvantage: number;
  matchup_count: number;
  counters_positions?: number[];
};

type Mode = "lane" | "team";

export default function DraftPage() {
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [heroesLoading, setHeroesLoading] = useState(true);
  const [mode, setMode] = useState<Mode>("lane");

  // Lane mode state
  const [myRole, setMyRole] = useState<string | null>(null);
  const [laneEnemies, setLaneEnemies] = useState<EnemyEntry[]>([]);
  const [laneResults, setLaneResults] = useState<ResultHero[]>([]);
  const [laneLoading, setLaneLoading] = useState(false);
  const [laneRoleFiltered, setLaneRoleFiltered] = useState(false);

  // Team mode state
  const [teamEnemies, setTeamEnemies] = useState<EnemyEntry[]>([]);
  const [teamResults, setTeamResults] = useState<ResultHero[]>([]);
  const [teamLoading, setTeamLoading] = useState(false);

  useEffect(() => {
    getAllHeroes().then((data) => {
      setHeroes(data);
      setHeroesLoading(false);
    });
  }, []);

  // ── Lane mode handlers ──
  const addLaneEnemy = (hero: Hero) => {
    // Max 2 enemies in lane (realistic — you face at most 2 in your lane)
    if (laneEnemies.length >= 2) return;
    setLaneEnemies((prev) => [...prev, { hero, position: null }]);
  };

  const removeLaneEnemy = (heroId: number) => {
    setLaneEnemies((prev) => prev.filter((e) => e.hero.id !== heroId));
  };

  const setLaneEnemyPosition = (heroId: number, position: number | null) => {
    setLaneEnemies((prev) =>
      prev.map((e) => (e.hero.id === heroId ? { ...e, position } : e))
    );
  };

  // ── Team mode handlers ──
  const addTeamEnemy = (hero: Hero) => {
    if (teamEnemies.length >= 5) return;
    setTeamEnemies((prev) => [...prev, { hero, position: null }]);
  };

  const removeTeamEnemy = (heroId: number) => {
    setTeamEnemies((prev) => prev.filter((e) => e.hero.id !== heroId));
  };

  const setTeamEnemyPosition = (heroId: number, position: number | null) => {
    setTeamEnemies((prev) =>
      prev.map((e) => (e.hero.id === heroId ? { ...e, position } : e))
    );
  };

  const reset = () => {
    setMyRole(null);
    setLaneEnemies([]);
    setLaneResults([]);
    setLaneRoleFiltered(false);
    setTeamEnemies([]);
    setTeamResults([]);
  };

  // ── Lane counter fetch ──
  const fetchLaneCounters = useCallback(async () => {
    if (laneEnemies.length === 0) {
      setLaneResults([]);
      return;
    }
    setLaneLoading(true);
    try {
      const res = await fetch(`${window.location.origin}/api/multi-counters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enemies: laneEnemies.map((e) => ({
            opendota_id: e.hero.opendota_id,
            position: e.position,
          })),
          roleId: myRole,
          mode: "lane",
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setLaneResults(data.results ?? []);
      setLaneRoleFiltered(data.role_filtered ?? false);
    } catch (err) {
      console.error(err);
    } finally {
      setLaneLoading(false);
    }
  }, [laneEnemies, myRole]);

  // ── Team counter fetch ──
  const fetchTeamCounters = useCallback(async () => {
    if (teamEnemies.length === 0) {
      setTeamResults([]);
      return;
    }
    setTeamLoading(true);
    try {
      const res = await fetch(`${window.location.origin}/api/multi-counters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enemies: teamEnemies.map((e) => ({
            opendota_id: e.hero.opendota_id,
            position: e.position,
          })),
          roleId: null, // no role filter for team mode
          mode: "team",
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setTeamResults(data.results ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setTeamLoading(false);
    }
  }, [teamEnemies]);

  useEffect(() => { fetchLaneCounters(); }, [fetchLaneCounters]);
  useEffect(() => { fetchTeamCounters(); }, [fetchTeamCounters]);

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

        {/* Mode Toggle */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <button
            onClick={() => setMode("lane")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border
                        font-semibold text-sm transition-all
                        ${mode === "lane"
                          ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                          : "bg-gray-800/40 border-gray-700 text-gray-400 hover:border-gray-500"
                        }`}
          >
            <Shield size={15} />
            Lane Matchup
          </button>
          <button
            onClick={() => setMode("team")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border
                        font-semibold text-sm transition-all
                        ${mode === "team"
                          ? "bg-blue-500/20 border-blue-500/50 text-blue-300"
                          : "bg-gray-800/40 border-gray-700 text-gray-400 hover:border-gray-500"
                        }`}
          >
            <Users size={15} />
            Full Team Counter
          </button>
        </div>

        {/* ── LANE MODE ── */}
        {mode === "lane" && (
          <div>
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-white mb-1">
                Lane Matchup Counter
              </h2>
              <p className="text-gray-400 text-sm">
                Pick your role and up to 2 lane enemies — get the best hero to win your lane
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left — inputs */}
              <div className="space-y-4">

                {/* My role */}
                <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5">
                  <RoleSelector
                    selectedRole={myRole}
                    onChange={(r) => { setMyRole(r); setLaneResults([]); }}
                  />
                  {myRole && (
                    <p className="text-center text-xs mt-3">
                      {laneRoleFiltered ? (
                        <span className="text-emerald-500/70">
                          ✓ Showing heroes that play{" "}
                          <span className="font-semibold text-emerald-400 capitalize">
                            {myRole.replace("_", " ")}
                          </span>
                        </span>
                      ) : laneResults.length > 0 ? (
                        <span className="text-yellow-500/70">
                          ⚠️ Not enough role-specific data — showing all roles
                        </span>
                      ) : null}
                    </p>
                  )}
                </div>

                {/* Lane enemies (max 2) */}
                <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5">
                  {heroesLoading ? (
                    <div className="flex items-center justify-center py-6 gap-2">
                      <div className="w-4 h-4 border-2 border-emerald-400
                                      border-t-transparent rounded-full animate-spin" />
                      <span className="text-gray-500 text-sm">Loading heroes...</span>
                    </div>
                  ) : (
                    <EnemyHeroPicker
                      heroes={heroes}
                      enemies={laneEnemies}
                      onAdd={addLaneEnemy}
                      onRemove={removeLaneEnemy}
                      onSetPosition={setLaneEnemyPosition}
                      maxEnemies={2}
                      label="Step 2 — Your Lane Enemies (max 2)"
                    />
                  )}
                </div>

                {(laneEnemies.length > 0 || myRole) && (
                  <button
                    onClick={() => {
                      setLaneEnemies([]);
                      setMyRole(null);
                      setLaneResults([]);
                    }}
                    className="w-full flex items-center justify-center gap-2
                               py-2 rounded-xl border border-gray-700 text-gray-500
                               hover:text-white hover:border-gray-500 transition-all text-sm"
                  >
                    <RefreshCw size={13} />
                    Reset Lane
                  </button>
                )}
              </div>

              {/* Right — results */}
              <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5">
                <LaneResults
                  results={laneResults}
                  isLoading={laneLoading}
                  hasEnemies={laneEnemies.length > 0}
                  selectedRole={myRole}
                  enemyCount={laneEnemies.length}
                  roleFiltered={laneRoleFiltered}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── TEAM MODE ── */}
        {mode === "team" && (
          <div>
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-white mb-1">
                Full Team Counter
              </h2>
              <p className="text-gray-400 text-sm">
                Add the full enemy team (up to 5) — find the hero that counters the most of them
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left — inputs */}
              <div className="space-y-4">
                <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5">
                  {heroesLoading ? (
                    <div className="flex items-center justify-center py-6 gap-2">
                      <div className="w-4 h-4 border-2 border-blue-400
                                      border-t-transparent rounded-full animate-spin" />
                      <span className="text-gray-500 text-sm">Loading heroes...</span>
                    </div>
                  ) : (
                    <EnemyHeroPicker
                      heroes={heroes}
                      enemies={teamEnemies}
                      onAdd={addTeamEnemy}
                      onRemove={removeTeamEnemy}
                      onSetPosition={setTeamEnemyPosition}
                      maxEnemies={5}
                      label="Enemy Team (up to 5 heroes)"
                    />
                  )}
                </div>

                {teamEnemies.length > 0 && (
                  <button
                    onClick={() => {
                      setTeamEnemies([]);
                      setTeamResults([]);
                    }}
                    className="w-full flex items-center justify-center gap-2
                               py-2 rounded-xl border border-gray-700 text-gray-500
                               hover:text-white hover:border-gray-500 transition-all text-sm"
                  >
                    <RefreshCw size={13} />
                    Reset Team
                  </button>
                )}
              </div>

              {/* Right — results */}
              <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5">
                <TeamResults
                  results={teamResults}
                  isLoading={teamLoading}
                  hasEnemies={teamEnemies.length > 0}
                  enemyCount={teamEnemies.length}
                />
              </div>
            </div>
          </div>
        )}

        {/* Global reset */}
        {(laneEnemies.length > 0 || teamEnemies.length > 0 || myRole) && (
          <div className="text-center mt-6">
            <button
              onClick={reset}
              className="text-xs text-gray-600 hover:text-gray-400
                         transition-colors underline underline-offset-2"
            >
              Reset everything
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
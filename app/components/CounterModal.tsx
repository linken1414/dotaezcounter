"use client";

import { useEffect } from "react";
import Image from "next/image";
import { X, TrendingUp, Shield } from "lucide-react";
import { HeroWithCounters } from "@/lib/types";

const getDotaImageUrl = (slug: string) =>
  `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${slug}.png`;

const attrColors: Record<string, string> = {
  str: "text-red-400",
  agi: "text-emerald-400",
  int: "text-blue-400",
  uni: "text-purple-400",
};

// Rank badge colors for Top 1, 2, 3
const rankStyles = [
  "bg-yellow-500/20 border-yellow-500/40 text-yellow-400",   // #1
  "bg-gray-400/20 border-gray-400/40 text-gray-300",         // #2
  "bg-orange-700/20 border-orange-700/40 text-orange-500",   // #3
];

const rankLabels = ["#1 Best Counter", "#2 Counter", "#3 Counter"];

type CounterModalProps = {
  hero: HeroWithCounters | null;
  onClose: () => void;
};

export default function CounterModal({ hero, onClose }: CounterModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (hero) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [hero]);

  if (!hero) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal Panel */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-lg bg-gray-900 border border-gray-700/80 
                     rounded-2xl shadow-2xl shadow-black/50 overflow-hidden 
                     animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          {/* ── Modal Header: Selected Hero ── */}
          <div className="relative h-36 bg-gray-950 overflow-hidden">
            {/* Background hero image (blurred) */}
            <Image
              src={getDotaImageUrl(hero.slug)}
              alt={hero.name}
              fill
              className="object-cover object-top opacity-30 blur-sm scale-110"
              unoptimized
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 bg-gray-800/80 hover:bg-gray-700 
                         text-gray-400 hover:text-white rounded-full p-1.5 
                         transition-colors z-10"
            >
              <X size={16} />
            </button>

            {/* Hero Info */}
            <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end gap-4">
              {/* Hero portrait */}
              <div className="relative w-20 h-14 rounded-lg overflow-hidden border-2 border-gray-600 flex-shrink-0">
                <Image
                  src={getDotaImageUrl(hero.slug)}
                  alt={hero.name}
                  fill
                  className="object-cover object-top"
                  unoptimized
                />
              </div>

              <div>
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-0.5">
                  Selected Hero
                </p>
                <h2 className="text-xl font-bold text-white">{hero.name}</h2>
                <div className="flex flex-wrap gap-1 mt-1">
                  {hero.roles.map((role) => (
                    <span
                      key={role}
                      className="text-[10px] bg-gray-700/80 text-gray-300 px-2 py-0.5 rounded-full"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Counter Heroes Section ── */}
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={16} className="text-emerald-400" />
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                Top Counter Heroes
              </h3>
            </div>

            {/* No counters fallback */}
            {hero.counters.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-6">
                No counter data available for this hero yet.
              </p>
            ) : (
              <div className="space-y-3">
                {hero.counters.map((counter, index) => (
                  <div
                    key={counter.counter_hero_id}
                    className={`flex items-center gap-3 p-3 rounded-xl border 
                                bg-gray-800/60 ${rankStyles[index]} transition-all`}
                  >
                    {/* Rank Badge */}
                    <span className={`text-[10px] font-bold border px-2 py-1 rounded-lg 
                                      flex-shrink-0 ${rankStyles[index]}`}>
                      {rankLabels[index]}
                    </span>

                    {/* Counter Hero Portrait */}
                    <div className="relative w-12 h-8 rounded-md overflow-hidden flex-shrink-0">
                      <Image
                        src={getDotaImageUrl(counter.counter_hero.slug)}
                        alt={counter.counter_hero.name}
                        fill
                        className="object-cover object-top"
                        unoptimized
                      />
                    </div>

                    {/* Counter Hero Name */}
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm truncate ${attrColors[counter.counter_hero.primary_attr]}`}>
                        {counter.counter_hero.name}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        {counter.counter_hero.roles.slice(0, 2).join(" · ")}
                      </p>
                    </div>

                    {/* Disadvantage % */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <TrendingUp size={12} className="text-red-400" />
                      <span className="text-red-400 font-bold text-sm">
                        +{Number(counter.disadvantage_pct).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Footer note */}
            <p className="text-center text-[11px] text-gray-600 mt-4">
              Disadvantage % = how much harder this hero makes the matchup
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
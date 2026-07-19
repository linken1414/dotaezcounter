import { Swords } from "lucide-react";
import Link from "next/link";
import { getAllHeroes } from "@/lib/queries";
import HeroGrid from "@/app/components/HeroGrid";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  const heroes = await getAllHeroes();

  return (
    <main className="min-h-screen bg-gray-950 text-white">

      {/* ── Header ── */}
      <header className="border-b border-gray-800/60 bg-gray-950/80 
                         backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2">
            <Swords size={22} className="text-emerald-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white leading-none">
              dotaezcounter
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Dota 2 Hero Counter Picker
            </p>
          </div>

          {/* Hero count pill */}
          <div className="ml-auto bg-gray-800/60 border border-gray-700/50 
                          rounded-full px-3 py-1">
            <span className="text-xs text-gray-400">
              <span className="text-emerald-400 font-bold">{heroes.length}</span> Heroes
            </span>
          </div>

          {/* Draft Picker Link */}
          <Link
            href="/draft"
            className="ml-3 text-xs font-semibold bg-emerald-500/10 border 
                       border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 
                       px-3 py-1 rounded-full transition-colors"
          >
            Draft Picker →
          </Link>
        </div>
      </header>

      {/* ── Hero Grid Container ── */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {heroes.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">⚠️</p>
            <p className="text-red-400 font-semibold text-lg">
              No heroes loaded from database
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Check your .env.local file and Supabase connection
            </p>
          </div>
        ) : (
          <HeroGrid heroes={heroes} />
        )}
      </div>

    </main>
  );
}
import Image from "next/image";
import { Hero } from "@/lib/types";

// Dota 2 official CDN for hero images
const getDotaImageUrl = (slug: string) =>
  `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${slug}.png`;

// Attribute badge colors
const attrColors: Record<string, string> = {
  str: "bg-red-500/20 text-red-400 border border-red-500/30",
  agi: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  int: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  uni: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
};

const attrLabels: Record<string, string> = {
  str: "STR",
  agi: "AGI",
  int: "INT",
  uni: "UNI",
};

type HeroCardProps = {
  hero: Hero;
  onClick: (hero: Hero) => void;
};

export default function HeroCard({ hero, onClick }: HeroCardProps) {
  return (
    <button
      onClick={() => onClick(hero)}
      className="group relative flex flex-col items-center bg-gray-800/60 hover:bg-gray-700/80 
                 border border-gray-700/50 hover:border-emerald-500/50 rounded-xl p-3 
                 transition-all duration-200 hover:scale-105 hover:shadow-lg 
                 hover:shadow-emerald-500/10 cursor-pointer w-full"
    >
      {/* Hero Image */}
      <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-2 bg-gray-900">
        <Image
          src={getDotaImageUrl(hero.slug)}
          alt={hero.name}
          fill
          className="object-cover object-top group-hover:scale-110 transition-transform duration-300"
          unoptimized
        />
      </div>

      {/* Hero Name */}
      <p className="text-white text-xs font-semibold text-center leading-tight mb-1.5 line-clamp-2">
        {hero.name}
      </p>

      {/* Attribute Badge */}
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${attrColors[hero.primary_attr]}`}>
        {attrLabels[hero.primary_attr]}
      </span>
    </button>
  );
}
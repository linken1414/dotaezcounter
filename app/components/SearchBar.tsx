"use client";

import { Search, X } from "lucide-react";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative w-full max-w-xl mx-auto">
      {/* Search Icon */}
      <Search
        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        size={18}
      />

      {/* Input */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search heroes... (e.g. Anti-Mage, Axe, Lina)"
        className="w-full bg-gray-800/80 border border-gray-700 hover:border-gray-600 
                   focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 
                   text-white placeholder-gray-500 rounded-xl pl-11 pr-10 py-3 
                   text-sm outline-none transition-all duration-200"
      />

      {/* Clear Button */}
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 
                     hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
"use client";

import { ROLES, Role } from "@/lib/roles";

const colorMap: Record<string, string> = {
  emerald: "border-emerald-500 bg-emerald-500/20 text-emerald-300",
  yellow:  "border-yellow-500  bg-yellow-500/20  text-yellow-300",
  orange:  "border-orange-500  bg-orange-500/20  text-orange-300",
  blue:    "border-blue-500    bg-blue-500/20    text-blue-300",
  purple:  "border-purple-500  bg-purple-500/20  text-purple-300",
};

const inactiveClass =
  "border-gray-700 bg-gray-800/60 text-gray-400 hover:border-gray-500 hover:text-gray-200";

type RoleSelectorProps = {
  selectedRole: string | null;
  onChange: (roleId: string | null) => void;
};

export default function RoleSelector({
  selectedRole,
  onChange,
}: RoleSelectorProps) {
  return (
    <div className="w-full">
      <p className="text-xs text-gray-500 uppercase tracking-widest mb-3 text-center">
        Step 1 — Select Your Role
      </p>

      {/* Grid: 3 cols on mobile, 5 on sm+ */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {ROLES.map((role: Role) => {
          const isActive = selectedRole === role.id;
          return (
            <button
              key={role.id}
              onClick={() => onChange(isActive ? null : role.id)}
              className={`flex flex-col items-center gap-1 p-2 sm:p-3
                          rounded-xl border transition-all duration-200
                          hover:scale-105 active:scale-95
                          ${isActive ? colorMap[role.color] : inactiveClass}`}
            >
              <span className="text-xl sm:text-2xl">{role.icon}</span>
              <span className="text-[10px] sm:text-xs font-bold text-center leading-tight">
                {role.label}
              </span>
              <span className={`text-[9px] sm:text-[10px] text-center leading-tight
                ${isActive ? "opacity-80" : "text-gray-600"}`}>
                {role.position}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
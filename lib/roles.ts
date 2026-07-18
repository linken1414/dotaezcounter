export type Role = {
  id: string;
  label: string;
  position: string;
  description: string;
  color: string;
  icon: string;
  // Hero roles from Supabase that qualify for this lane
  heroRoles: string[];
};

export const ROLES: Role[] = [
  {
    id: "carry",
    label: "Safe Lane",
    position: "Position 1",
    description: "Farm-dependent carry hero",
    color: "emerald",
    icon: "⚔️",
    heroRoles: ["Carry"],
  },
  {
    id: "mid",
    label: "Mid Lane",
    position: "Position 2",
    description: "Solo mid hero",
    color: "yellow",
    icon: "🔥",
    heroRoles: ["Carry", "Nuker", "Escape"],
  },
  {
    id: "offlane",
    label: "Off Lane",
    position: "Position 3",
    description: "Durable frontliner",
    color: "orange",
    icon: "🛡️",
    heroRoles: ["Durable", "Initiator", "Disabler"],
  },
  {
    id: "support",
    label: "Support",
    position: "Position 4",
    description: "Roaming soft support",
    color: "blue",
    icon: "💫",
    heroRoles: ["Support", "Disabler", "Nuker"],
  },
  {
    id: "hard_support",
    label: "Hard Support",
    position: "Position 5",
    description: "Dedicated hard support",
    color: "purple",
    icon: "💚",
    heroRoles: ["Support"],
  },
];

// Check if a hero qualifies for a given role
// A hero qualifies if ANY of their roles overlap with the lane's heroRoles
export function heroMatchesRole(
  heroRoles: string[],
  roleId: string
): boolean {
  const role = ROLES.find((r) => r.id === roleId);
  if (!role) return true;
  return heroRoles.some((r) => role.heroRoles.includes(r));
}
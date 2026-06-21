export type Hero = {
  id: number;
  name: string;
  slug: string;
  primary_attr: "str" | "agi" | "int" | "uni";
  roles: string[];
};

export type HeroCounter = {
  counter_hero_id: number;
  disadvantage_pct: number;
  counter_hero: Hero;
};

export type HeroWithCounters = {
  id: number;
  name: string;
  slug: string;
  primary_attr: "str" | "agi" | "int" | "uni";
  roles: string[];
  counters: HeroCounter[];
};
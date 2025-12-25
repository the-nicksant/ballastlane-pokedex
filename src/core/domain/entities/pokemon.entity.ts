import type { PokemonType } from "@/core/config/constants";

export interface Pokemon {
  id: number;
  name: string;
  types: PokemonType[];
  spriteUrl: string;
  artworkUrl: string;
}

export interface PokemonDetail extends Pokemon {
  height: number;
  weight: number;
  abilities: Ability[];
  moves: Move[];
  forms: PokemonForm[];
  stats: Stat[];
}

export interface Ability {
  name: string;
  isHidden: boolean;
  slot: number;
}

export interface Move {
  name: string;
  learnMethod: string;
  levelLearnedAt: number | null;
}

export interface PokemonForm {
  name: string;
  formName: string;
  isMega: boolean;
}

export interface Stat {
  name: string;
  baseStat: number;
  effort: number;
}

export interface PokemonListResult {
  pokemon: Pokemon[];
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
}

export type PokemonSortBy = "number" | "name";
export type SortOrder = "asc" | "desc";

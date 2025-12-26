/**
 * Application-wide constants
 */

// Authentication
export const AUTH_COOKIE_NAME = "session";
export const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// API Routes
export const API_ROUTES = {
  AUTH: {
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout",
    VERIFY: "/api/auth/verify",
  },
  POKEMON: {
    LIST: "/api/pokemon",
    DETAIL: (id: string | number) => `/api/pokemon/${id}`,
  },
} as const;

// App Routes
export const APP_ROUTES = {
  LOGIN: "/login",
  HOME: "/",
  POKEMON_DETAIL: (id: string | number) => `/pokemon?id=${id}`,
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

// Pokemon Types (for styling)
export const POKEMON_TYPES = [
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
] as const;

export type PokemonType = (typeof POKEMON_TYPES)[number];

// Type color mapping (for badges) - colors from Figma design
export const TYPE_COLORS: Record<PokemonType, string> = {
  bug: "#A7B723",
  dark: "#75574C",
  dragon: "#7037FF",
  electric: "#F9CF30",
  fairy: "#E69EAC",
  fighting: "#C12239",
  fire: "#F57D31",
  flying: "#A891EC",
  ghost: "#70559B",
  ground: "#DEC16B",
  grass: "#74CB48",
  ice: "#9AD6DF",
  normal: "#AAA67F",
  poison: "#A43E9E",
  psychic: "#FB5584",
  rock: "#B69E31",
  steel: "#B7B9D0",
  water: "#6493EB",
};

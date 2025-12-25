import { TYPE_COLORS, type PokemonType } from "@/core/config/constants";

/**
 * Get the background color for a Pokemon type
 * @param type Pokemon type
 * @returns Hex color string
 */
export function getTypeColor(type: PokemonType): string {
  return TYPE_COLORS[type] || TYPE_COLORS.normal;
}

/**
 * Get contrasting text color for a Pokemon type badge
 * Dark types get white text, light types get dark text
 * @param type Pokemon type
 * @returns "white" or "black"
 */
export function getTypeTextColor(type: PokemonType): "white" | "black" {
  const darkTypes: PokemonType[] = [
    "dark",
    "dragon",
    "fighting",
    "ghost",
    "poison",
    "psychic",
    "rock",
  ];

  return darkTypes.includes(type) ? "white" : "black";
}

/**
 * Get inline styles for a Pokemon type badge
 * @param type Pokemon type
 * @returns CSS style object
 */
export function getTypeBadgeStyles(type: PokemonType): React.CSSProperties {
  return {
    backgroundColor: getTypeColor(type),
    color: getTypeTextColor(type),
  };
}

/**
 * Capitalize first letter of a string
 * @param str String to capitalize
 * @returns Capitalized string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Format Pokemon ID/number with leading zeros
 * @param id Pokemon ID
 * @returns Formatted ID (e.g., #001, #025, #150)
 */
export function formatPokemonId(id: number): string {
  return `#${id.toString().padStart(3, "0")}`;
}

/**
 * Get Pokemon sprite URL from PokeAPI
 * @param id Pokemon ID
 * @param variant Sprite variant (default, shiny, etc.)
 * @returns Sprite URL
 */
export function getPokemonSpriteUrl(
  id: number,
  variant: "default" | "shiny" = "default"
): string {
  const baseUrl = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

  if (variant === "shiny") {
    return `${baseUrl}/shiny/${id}.png`;
  }

  return `${baseUrl}/${id}.png`;
}

/**
 * Get Pokemon official artwork URL
 * Higher quality than sprites
 * @param id Pokemon ID
 * @returns Artwork URL
 */
export function getPokemonArtworkUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

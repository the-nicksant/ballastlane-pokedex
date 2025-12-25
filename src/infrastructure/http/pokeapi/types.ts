export interface PokeAPIListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokeAPINamedResource[];
}

export interface PokeAPINamedResource {
  name: string;
  url: string;
}

export interface PokeAPIPokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: PokeAPIPokemonType[];
  abilities: PokeAPIPokemonAbility[];
  moves: PokeAPIPokemonMove[];
  forms: PokeAPINamedResource[];
  stats: PokeAPIPokemonStat[];
  sprites: PokeAPISprites;
}

export interface PokeAPIPokemonType {
  slot: number;
  type: PokeAPINamedResource;
}

export interface PokeAPIPokemonAbility {
  ability: PokeAPINamedResource;
  is_hidden: boolean;
  slot: number;
}

export interface PokeAPIPokemonMove {
  move: PokeAPINamedResource;
  version_group_details: {
    level_learned_at: number;
    move_learn_method: PokeAPINamedResource;
  }[];
}

export interface PokeAPIPokemonStat {
  base_stat: number;
  effort: number;
  stat: PokeAPINamedResource;
}

export interface PokeAPISprites {
  front_default: string;
  other: {
    "official-artwork": {
      front_default: string;
    };
  };
}

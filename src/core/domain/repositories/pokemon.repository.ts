import type {
  Pokemon,
  PokemonDetail,
  PokemonListResult,
  PokemonSortBy,
  SortOrder,
} from "../entities/pokemon.entity";

export interface PokemonRepository {
  getList(params: {
    offset?: number;
    limit?: number;
    search?: string;
    sortBy?: PokemonSortBy;
    order?: SortOrder;
  }): Promise<PokemonListResult>;

  getById(id: number): Promise<PokemonDetail | null>;
}

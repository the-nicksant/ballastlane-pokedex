import type { PokemonRepository } from "@/core/domain/repositories/pokemon.repository";
import type {
  Pokemon,
  PokemonDetail,
  PokemonListResult,
  PokemonSortBy,
  SortOrder,
} from "@/core/domain/entities/pokemon.entity";
import { fetchFromPokeAPI } from "./client";
import { PokemonMapper } from "./mappers/pokemon.mapper";
import type { PokeAPIListResponse, PokeAPIPokemon } from "./types";
import { PAGINATION } from "@/core/config/constants";

export class PokemonRepositoryImpl implements PokemonRepository {
  async getList(params: {
    offset?: number;
    limit?: number;
    search?: string;
    sortBy?: PokemonSortBy;
    order?: SortOrder;
  }): Promise<PokemonListResult> {
    const offset = params.offset ?? 0;
    const limit = Math.min(
      params.limit ?? PAGINATION.DEFAULT_PAGE_SIZE,
      PAGINATION.MAX_PAGE_SIZE
    );

    const listResponse = await fetchFromPokeAPI<PokeAPIListResponse>(
      `pokemon?limit=${limit}&offset=${offset}`
    );

    let pokemon = listResponse.results.map((result) => {
      const id = PokemonMapper.extractIdFromUrl(result.url);
      return PokemonMapper.toBasicPokemon(result.name, id);
    });

    if (params.search) {
      const searchLower = params.search.toLowerCase().trim();
      pokemon = pokemon.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.id.toString().includes(searchLower)
      );
    }

    if (params.sortBy) {
      pokemon = this.sortPokemon(pokemon, params.sortBy, params.order ?? "asc");
    }

    const total = listResponse.count;
    const hasMore = offset + limit < total;

    return {
      pokemon,
      total,
      offset,
      limit,
      hasMore,
    };
  }

  async getById(id: number): Promise<PokemonDetail | null> {
    try {
      const pokemon = await fetchFromPokeAPI<PokeAPIPokemon>(`pokemon/${id}`);
      return PokemonMapper.toDetailedDomain(pokemon);
    } catch (error) {
      console.error(`Failed to fetch Pokemon ${id}:`, error);
      return null;
    }
  }

  private sortPokemon(
    pokemon: Pokemon[],
    sortBy: PokemonSortBy,
    order: SortOrder
  ): Pokemon[] {
    const sorted = [...pokemon].sort((a, b) => {
      if (sortBy === "number") {
        return a.id - b.id;
      } else {
        return a.name.localeCompare(b.name);
      }
    });

    return order === "desc" ? sorted.reverse() : sorted;
  }
}

export const pokemonRepository = new PokemonRepositoryImpl();

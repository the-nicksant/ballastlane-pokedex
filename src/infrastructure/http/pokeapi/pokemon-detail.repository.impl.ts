import type { PokemonRepository } from "@/core/domain/repositories/pokemon.repository";
import type {
  Pokemon,
  PokemonDetail,
  PokemonListResult,
} from "@/core/domain/entities/pokemon.entity";
import { fetchFromPokeAPI } from "./client";
import { PokemonMapper } from "./mappers/pokemon.mapper";
import type { PokeAPIListResponse, PokeAPIPokemon } from "./types";

export class PokemonPokeAPIRepository implements Partial<PokemonRepository> {
  async getById(id: number): Promise<PokemonDetail | null> {
    try {
      const pokemon = await fetchFromPokeAPI<PokeAPIPokemon>(`pokemon/${id}`);
      return PokemonMapper.toDetailedDomain(pokemon);
    } catch (error) {
      console.error(`Failed to fetch Pokemon ${id}:`, error);
      return null;
    }
  }

  async getList(): Promise<PokemonListResult> {
    throw new Error("getList should use SQLite repository, not PokeAPI");
  }

  async fetchAllBasicInfo(offset: number, limit: number): Promise<{
    pokemon: Pokemon[];
    total: number;
  }> {
    const listResponse = await fetchFromPokeAPI<PokeAPIListResponse>(
      `pokemon?limit=${limit}&offset=${offset}`
    );

    const pokemon = listResponse.results.map((result) => {
      const id = PokemonMapper.extractIdFromUrl(result.url);
      return PokemonMapper.toBasicPokemon(result.name, id);
    });

    return {
      pokemon,
      total: listResponse.count,
    };
  }
}

export const pokemonPokeAPIRepository = new PokemonPokeAPIRepository();

import type { PokemonListResult } from "@/core/domain/entities/pokemon.entity";
import type { PokemonSearchResult } from "../types/search.types";

interface GetPokemonListParams {
  offset?: number;
  limit?: number;
  sortBy?: "number" | "name";
  order?: "asc" | "desc";
}

export const pokemonApiService = {
  async getList(params: GetPokemonListParams): Promise<PokemonListResult> {
    const searchParams = new URLSearchParams();

    if (params.offset !== undefined) {
      searchParams.set("offset", params.offset.toString());
    }
    if (params.limit !== undefined) {
      searchParams.set("limit", params.limit.toString());
    }
    if (params.sortBy) {
      searchParams.set("sortBy", params.sortBy);
    }
    if (params.order) {
      searchParams.set("order", params.order);
    }

    const response = await fetch(`/api/pokemon?${searchParams.toString()}`);

    if (!response.ok) {
      throw new Error("Failed to fetch Pokemon list");
    }

    const data = await response.json();
    return data.data as PokemonListResult;
  },

  async search(query: string): Promise<PokemonSearchResult[]> {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const response = await fetch(`/api/pokemon/search?name=${encodeURIComponent(query)}`);

    if (!response.ok) {
      throw new Error("Failed to search Pokemon");
    }

    const data = await response.json();
    return data.data as PokemonSearchResult[];
  },

  async getById(id: number): Promise<any> {
    const response = await fetch(`/api/pokemon/${id}`);

    if (!response.ok) {
      throw new Error("Failed to fetch Pokemon details");
    }

    const data = await response.json();
    return data.data;
  },
};

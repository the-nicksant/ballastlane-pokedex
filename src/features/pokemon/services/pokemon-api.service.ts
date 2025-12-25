import type { PokemonListResult } from "@/core/domain/entities/pokemon.entity";

interface GetPokemonListParams {
  offset?: number;
  limit?: number;
  search?: string;
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
    if (params.search) {
      searchParams.set("search", params.search);
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

  async getById(id: number): Promise<any> {
    const response = await fetch(`/api/pokemon/${id}`);

    if (!response.ok) {
      throw new Error("Failed to fetch Pokemon details");
    }

    const data = await response.json();
    return data.data;
  },
};

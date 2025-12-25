import type { PokemonRepository } from "@/core/domain/repositories/pokemon.repository";
import type {
  PokemonListResult,
  PokemonSortBy,
  SortOrder,
} from "@/core/domain/entities/pokemon.entity";
import { PAGINATION } from "@/core/config/constants";
import { Errors } from "@/lib/error-handler";

export interface GetPokemonListParams {
  offset?: number;
  limit?: number;
  search?: string;
  sortBy?: PokemonSortBy;
  order?: SortOrder;
}

export class GetPokemonListUseCase {
  constructor(private pokemonRepository: PokemonRepository) {}

  async execute(
    params: GetPokemonListParams = {}
  ): Promise<PokemonListResult> {
    const offset = this.validateOffset(params.offset);
    const limit = this.validateLimit(params.limit);
    const search = params.search?.trim() ?? undefined;
    const sortBy = params.sortBy ?? "number";
    const order = params.order ?? "asc";

    try {
      return await this.pokemonRepository.getList({
        offset,
        limit,
        search,
        sortBy,
        order,
      });
    } catch (error) {
      console.error("Failed to fetch Pokemon list:", error);
      throw Errors.Internal("Failed to fetch Pokemon list");
    }
  }

  private validateOffset(offset?: number): number {
    if (offset === undefined) return 0;
    const parsed = Number(offset);
    if (isNaN(parsed) || parsed < 0) {
      throw Errors.BadRequest("Invalid offset");
    }
    return parsed;
  }

  private validateLimit(limit?: number): number {
    if (limit === undefined) return PAGINATION.DEFAULT_PAGE_SIZE;
    const parsed = Number(limit);
    if (isNaN(parsed) || parsed < 1) {
      throw Errors.BadRequest("Invalid limit");
    }
    return Math.min(parsed, PAGINATION.MAX_PAGE_SIZE);
  }
}

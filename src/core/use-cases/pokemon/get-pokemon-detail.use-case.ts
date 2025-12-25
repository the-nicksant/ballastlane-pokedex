import type { PokemonRepository } from "@/core/domain/repositories/pokemon.repository";
import type { PokemonDetail } from "@/core/domain/entities/pokemon.entity";
import { Errors } from "@/lib/error-handler";

export class GetPokemonDetailUseCase {
  constructor(private pokemonRepository: PokemonRepository) {}

  async execute(id: number): Promise<PokemonDetail> {
    if (!id || id < 1) {
      throw Errors.BadRequest("Invalid Pokemon ID");
    }

    const pokemon = await this.pokemonRepository.getById(id);

    if (!pokemon) {
      throw Errors.NotFound("Pokemon");
    }

    return pokemon;
  }
}

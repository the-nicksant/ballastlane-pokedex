import { NextRequest } from "next/server";
import { z } from "zod";
import { GetPokemonDetailUseCase } from "@/core/use-cases/pokemon/get-pokemon-detail.use-case";
import { pokemonRepository } from "@/infrastructure/http/pokeapi/pokemon.repository.impl";
import { successResponse, HTTP_STATUS } from "@/lib/api-response";
import { handleError } from "@/lib/error-handler";

const paramsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = paramsSchema.parse(await params);

    const useCase = new GetPokemonDetailUseCase(pokemonRepository);
    const pokemon = await useCase.execute(id);

    return successResponse(pokemon, HTTP_STATUS.OK);
  } catch (error) {
    return handleError(error);
  }
}

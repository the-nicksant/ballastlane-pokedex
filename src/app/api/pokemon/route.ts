import { NextRequest } from "next/server";
import { z } from "zod";
import { GetPokemonListUseCase } from "@/core/use-cases/pokemon/get-pokemon-list.use-case";
import { pokemonSQLiteRepository } from "@/infrastructure/database/sqlite/repositories/pokemon.repository.impl";
import { successResponse, errorResponse, HTTP_STATUS } from "@/lib/api-response";
import { handleError } from "@/lib/error-handler";
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from "@/lib/rate-limit";

const querySchema = z.object({
  offset: z.coerce.number().int().min(0).optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().trim().optional(),
  sortBy: z.enum(["number", "name"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const identifier = getClientIdentifier(request);
    const rateLimit = checkRateLimit(identifier, RATE_LIMITS.API);

    if (!rateLimit.success) {
      return errorResponse(
        "Too many requests. Please try again later.",
        429,
        {
          retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000),
        }
      );
    }

    const { searchParams } = new URL(request.url);
    const params = {
      offset: searchParams.get("offset") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      search: searchParams.get("search") ?? undefined,
      sortBy: searchParams.get("sortBy") ?? undefined,
      order: searchParams.get("order") ?? undefined,
    };

    const validatedParams = querySchema.parse(params);

    const useCase = new GetPokemonListUseCase(pokemonSQLiteRepository);
    const result = await useCase.execute(validatedParams);

    return successResponse(result, HTTP_STATUS.OK);
  } catch (error) {
    return handleError(error);
  }
}

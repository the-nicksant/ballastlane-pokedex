import { NextRequest } from "next/server";
import { z } from "zod";
import { successResponse, errorResponse, HTTP_STATUS } from "@/lib/api-response";
import { handleError } from "@/lib/error-handler";
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from "@/lib/rate-limit";

const SEARCH_API_URL = "https://pokemon-service-ucql.onrender.com/api/v1/pokemon/search";

const querySchema = z.object({
  name: z.string().trim().min(1, "Search query is required"),
});

interface PokemonSearchResponse {
  name: string;
  url: string;
}

interface PokemonSearchResult {
  id: number;
  name: string;
  spriteUrl: string;
}

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
      name: searchParams.get("name") ?? undefined,
    };

    const validatedParams = querySchema.parse(params);

    const response = await fetch(
      `${SEARCH_API_URL}?name=${encodeURIComponent(validatedParams.name.toLowerCase())}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        next: {
          revalidate: 3600,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Search API failed: ${response.statusText}`);
    }

    const data: PokemonSearchResponse[] = await response.json();

    const results: PokemonSearchResult[] = data.map((item) => {
      const urlParts = item.url.split("/");
      const id = parseInt(urlParts[urlParts.length - 2]);

      return {
        id,
        name: item.name,
        spriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
      };
    });

    return successResponse(results, HTTP_STATUS.OK);
  } catch (error) {
    return handleError(error);
  }
}

import { env } from "@/core/config/env";

export async function fetchFromPokeAPI<T>(
  endpoint: string,
  options?: {
    cache?: RequestCache;
    revalidate?: number;
  }
): Promise<T> {
  const url = `${env.POKEAPI_BASE_URL}/${endpoint}`;

  const response = await fetch(url, {
    cache: options?.cache ?? "force-cache",
    next: {
      revalidate: options?.revalidate ?? env.POKEAPI_CACHE_DURATION,
    },
  });

  if (!response.ok) {
    throw new Error(`PokeAPI request failed: ${response.statusText}`);
  }

  return response.json();
}

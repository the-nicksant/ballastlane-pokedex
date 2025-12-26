"use client";

import { useQuery } from "@tanstack/react-query";
import type { PokemonDetail } from "@/core/domain/entities/pokemon.entity";
import type { ApiResponse } from "@/lib/api-response";

/**
 * Fetches a single Pokemon by ID from the API
 */
async function fetchPokemon(id: number): Promise<PokemonDetail> {
  const response = await fetch(`/api/pokemon/${id}`);
  if (!response.ok) throw new Error("Pokemon not found");
  const data: ApiResponse<PokemonDetail> = await response.json();
  if (!data.success) throw new Error("Failed to fetch Pokemon");
  return data.data;
}

/**
 * Main hook for fetching a single Pokemon by ID
 * Uses React Query for caching and automatic refetching
 */
export function usePokemonDetail(id: number | null) {
  return useQuery({
    queryKey: ["pokemon", id],
    queryFn: () => fetchPokemon(id!),
    enabled: !!id && id > 0,
    staleTime: Infinity, // Cache forever
    gcTime: 1000 * 60 * 60, // Keep in cache for 1 hour
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function useAdjacentPokemon(currentId: number) {
  const { data: previousPokemon } = usePokemonDetail(currentId > 1 ? currentId - 1 : null);
  const { data: nextPokemon } = usePokemonDetail(currentId + 1);

  return { previousPokemon, nextPokemon };
}

"use client";

import { useEffect, useRef } from "react";
import { PokemonGrid } from "./pokemon-grid";
import { PokemonListError } from "./pokemon-list-error";
import { pokemonApiService } from "../../services/pokemon-api.service";

import { useInfiniteQuery } from '@tanstack/react-query'
import { useQueryState } from 'nuqs'
import { Pokemon } from "@/core/domain/entities/pokemon.entity";

type InfiniteQueryPage = {
  data: Pokemon[],
  total: number,
  nextCursor: number | undefined,
  prevCursor: number | undefined,
}

export function InfiniteScrollPokemonList() {
  const pageLimit = 50;
  const containerRef = useRef<HTMLDivElement>(null);

  const [sortBy] = useQueryState('sortBy')
  const [sortOrder] = useQueryState('order')

  const {
    data: pokemonData,
    fetchNextPage,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    error,
    refetch
  } = useInfiniteQuery({
    initialPageParam: 0,
    getNextPageParam: (page: InfiniteQueryPage) => page.nextCursor,
    queryKey: ['pokemon-list', sortBy, sortOrder],
    queryFn: async ({ pageParam = 0 }) => {
      const result = await pokemonApiService.getList({
        offset: pageParam,
        limit: pageLimit,
        sortBy: (sortBy as 'name' | 'number') || 'number',
        order: (sortOrder as 'asc' | 'desc') || 'asc'
      });

      const nextOffset = result.offset + result.limit;

      return {
        data: result.pokemon,
        total: result.total,
        nextCursor: result.hasMore ? nextOffset : undefined,
        prevCursor: pageParam > 0 ? pageParam - pageLimit : undefined,
      }
    }
  });

  const pokemons = pokemonData?.pages.map(page => page.data).flat() || [];

  const handleScrollEnd = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  useEffect(() => {
    const checkAndFillContainer = () => {
      if (!containerRef.current || isFetchingNextPage || !hasNextPage) return;

      const gridElement = containerRef.current.querySelector('[style*="overflow"]') as HTMLElement;
      if (!gridElement) return;

      const hasScroll = gridElement.scrollHeight > gridElement.clientHeight;

      if (!hasScroll && hasNextPage) {
        fetchNextPage();
      }
    };

    const timeoutId = setTimeout(checkAndFillContainer, 100);

    return () => clearTimeout(timeoutId);
  }, [pokemons.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#DC0A2D] border-t-transparent" />
          <span className="text-lg text-muted-foreground">
            Loading Pokemon...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef}>
      <PokemonGrid
        pokemon={pokemons}
        onScrollEnd={handleScrollEnd}
        loadingNext={isFetchingNextPage}
      />

      {error && <PokemonListError message={error.message} onRetry={refetch} />}
    </div>
  );
}

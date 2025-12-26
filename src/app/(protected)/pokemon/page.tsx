"use client";

import { Suspense } from "react";
import { useQueryState, parseAsInteger } from "nuqs";
import { notFound } from "next/navigation";
import {
  usePokemonDetail,
  useAdjacentPokemon,
} from "@/features/pokemon/hooks/use-pokemon-detail";
import { PokemonDetailView } from "@/features/pokemon/components/pokemon-detail/pokemon-detail-view";

function PokemonDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-200 animate-pulse flex flex-col justify-end items-center">
      <div className="relative h-full flex-1 px-5 pt-5 pb-24 w-full max-w-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="w-8 h-8 bg-gray-300 rounded-full" />
          <div className="w-16 h-4 bg-gray-300 rounded" />
        </div>
        <div className="w-32 h-8 bg-gray-300 rounded mb-4" />
      </div>

      <div className="absolute top-20 left-0 right-0 flex justify-center items-center px-8">
        <div className="w-60 h-60 bg-gray-300 rounded-full" />
      </div>

      <div className="bg-white rounded-t-[32px] px-6 pt-16 pb-6 max-w-xl w-full">
        <div className="flex gap-4 mb-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex-1 bg-gray-100 rounded-2xl px-5 py-2">
              <div className="h-4 bg-gray-300 rounded w-16 mb-2" />
              <div className="h-6 bg-gray-300 rounded w-12" />
            </div>
          ))}
        </div>

        <div className="mb-4">
          <div className="h-5 bg-gray-300 rounded w-24 mb-3" />
          <div className="flex flex-wrap gap-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-8 w-20 bg-gray-300 rounded" />
            ))}
          </div>
        </div>

        <div className="mb-4">
          <div className="h-5 bg-gray-300 rounded w-24 mb-3" />
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex items-center justify-between mb-3">
              <div className="h-4 bg-gray-300 rounded w-24" />
              <div className="h-4 bg-gray-300 rounded w-12" />
              <div className="h-2 bg-gray-300 rounded flex-1 ml-4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PokemonDetailContent() {
  const [id] = useQueryState("id", parseAsInteger.withDefault(1));

  const { data: pokemon, isLoading, error } = usePokemonDetail(id);
  const { previousPokemon, nextPokemon } = useAdjacentPokemon(id);

  if (error) {
    notFound();
  }

  if (isLoading) {
    return <PokemonDetailSkeleton />;
  }

  if (!pokemon) {
    notFound();
  }

  return (
    <PokemonDetailView
      pokemon={pokemon}
      previousPokemon={previousPokemon ?? null}
      nextPokemon={nextPokemon ?? null}
    />
  );
}

export default function PokemonDetailPage() {
  return (
    <Suspense fallback={<PokemonDetailSkeleton />}>
      <PokemonDetailContent />
    </Suspense>
  );
}

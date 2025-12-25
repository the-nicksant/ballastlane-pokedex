import { Suspense } from "react";
import type { Metadata } from "next";
import { PokemonListHeader } from "@/features/pokemon/components/pokemon-list/pokemon-list-header";
import { InfiniteScrollPokemonList } from "@/features/pokemon/components/pokemon-list/infinite-scroll-pokemon-list";
import { PokemonListSkeleton } from "@/features/pokemon/components/pokemon-list/pokemon-list-skeleton";

export const metadata: Metadata = {
  title: "Pokédex | Pokemon List",
  description: "Browse and search through all Pokemon",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <PokemonListHeader />

      <main className="container mx-auto max-w-[1600px]">
        <Suspense fallback={<PokemonListSkeleton />}>
          <InfiniteScrollPokemonList />
        </Suspense>
      </main>
    </div>
  );
}

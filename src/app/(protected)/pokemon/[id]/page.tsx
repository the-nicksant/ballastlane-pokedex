import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { GetPokemonDetailUseCase } from "@/core/use-cases/pokemon/get-pokemon-detail.use-case";
import { pokemonPokeAPIRepository } from "@/infrastructure/http/pokeapi/pokemon-detail.repository.impl";
import { PokemonDetailView } from "@/features/pokemon/components/pokemon-detail/pokemon-detail-view";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getPokemon(id: number) {
  const useCase = new GetPokemonDetailUseCase(pokemonPokeAPIRepository);
  return useCase.execute(id);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const pokemonId = parseInt(id, 10);

  try {
    const pokemon = await getPokemon(pokemonId);
    return {
      title: `${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)} | Pokédex`,
      description: `View detailed information about ${pokemon.name}`,
    };
  } catch {
    return {
      title: "Pokemon Not Found | Pokédex",
    };
  }
}

export default async function PokemonDetailPage({ params }: PageProps) {
  const { id } = await params;
  const pokemonId = parseInt(id, 10);

  if (isNaN(pokemonId) || pokemonId < 1) {
    notFound();
  }

  let pokemon;
  try {
    pokemon = await getPokemon(pokemonId);
  } catch {
    notFound();
  }

  return (
    <Suspense>
      <PokemonDetailView pokemon={pokemon} />
    </Suspense>
  );
}

export const revalidate = 3600;

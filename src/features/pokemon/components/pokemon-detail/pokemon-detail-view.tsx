"use client";

import { useQueryState, parseAsInteger } from "nuqs";
import type { PokemonDetail } from "@/core/domain/entities/pokemon.entity";
import { PokemonDetailHeader } from "./pokemon-detail-header";
import { PokemonImageCarousel } from "./pokemon-image-carousel";
import { PokemonInfo } from "./pokemon-info";
import { PokemonStats } from "./pokemon-stats";
import { TYPE_COLORS } from "@/core/config/constants";

interface PokemonDetailViewProps {
  pokemon: PokemonDetail;
  previousPokemon: PokemonDetail | null;
  nextPokemon: PokemonDetail | null;
}

export function PokemonDetailView({
  pokemon,
  previousPokemon,
  nextPokemon,
}: PokemonDetailViewProps) {
  const [, setId] = useQueryState("id", parseAsInteger);
  const primaryType = pokemon.types[0];
  const backgroundColor = TYPE_COLORS[primaryType] || "#A8A878";

  const handleNavigate = (targetId: number) => {
    setId(targetId);
  };


  return (
    <div
      className="min-h-screen transition-colors duration-500 flex flex-col justify-end items-center"
      style={{
        backgroundColor,
      }}
    >
      <PokemonDetailHeader pokemon={pokemon} backgroundColor={backgroundColor} />
      <PokemonImageCarousel
        currentPokemon={pokemon}
        previousPokemon={previousPokemon}
        nextPokemon={nextPokemon}
        onNavigate={handleNavigate}
      />

      <div className="bg-white rounded-t-[32px] px-6 pt-16 pb-6 max-w-xl w-full">
        <PokemonInfo pokemon={pokemon} />
        <PokemonStats stats={pokemon.stats} primaryType={primaryType} />
      </div>
    </div>
  );
}

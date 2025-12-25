"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PokemonDetail } from "@/core/domain/entities/pokemon.entity";
import { PokemonDetailHeader } from "./pokemon-detail-header";
import { PokemonImage } from "./pokemon-image";
import { PokemonInfo } from "./pokemon-info";
import { PokemonStats } from "./pokemon-stats";
import { TYPE_COLORS } from "@/core/config/constants";

interface PokemonDetailViewProps {
  pokemon: PokemonDetail;
}

export function PokemonDetailView({ pokemon }: PokemonDetailViewProps) {
  const router = useRouter();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);

  const primaryType = pokemon.types[0];
  const backgroundColor = TYPE_COLORS[primaryType] || "#A8A878";

  const handlePrevious = () => {
    if (pokemon.id > 1 && !isTransitioning) {
      setDirection("right");
      setIsTransitioning(true);
      setTimeout(() => {
        router.push(`/pokemon/${pokemon.id - 1}`);
      }, 300);
    }
  };

  const handleNext = () => {
    if (!isTransitioning) {
      setDirection("left");
      setIsTransitioning(true);
      setTimeout(() => {
        router.push(`/pokemon/${pokemon.id + 1}`);
      }, 300);
    }
  };

  return (
    <div
      className="min-h-screen transition-colors duration-500 flex flex-col justify-end items-center"
      style={{
        backgroundColor,
      }}
    >
      <PokemonDetailHeader pokemon={pokemon} backgroundColor={backgroundColor} />
      <PokemonImage
        pokemon={pokemon}
        onPrevious={handlePrevious}
        onNext={handleNext}
        isTransitioning={isTransitioning}
        direction={direction}
      />
     
      <div className="bg-white rounded-t-[32px] px-6 pt-16 pb-6 max-w-xl">
        <PokemonInfo pokemon={pokemon} />
        <PokemonStats stats={pokemon.stats} primaryType={primaryType} />
      </div>
    </div>
  );
}

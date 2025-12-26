"use client";

import { memo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatPokemonId } from "@/lib/pokemon-utils";
import { APP_ROUTES } from "@/core/config/constants";
import type { Pokemon } from "@/core/domain/entities/pokemon.entity";
import { useHapticFeedback } from "../../hooks/use-haptic-feedback";

interface PokemonCardProps {
  pokemon: Pokemon;
}

export const PokemonCard = memo(function PokemonCard({
  pokemon,
}: PokemonCardProps) {
  const { triggerLight } = useHapticFeedback();
  const [imageError, setImageError] = useState(false);

  const handleClick = () => {
    triggerLight();
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <Link
      href={APP_ROUTES.POKEMON_DETAIL(pokemon.id)}
      onClick={handleClick}
      className="block group"
    >
      <div className="relative flex flex-col justify-between h-[120px] w-full overflow-hidden bg-white rounded-lg shadow-[0px_1px_3px_1px_rgba(0,0,0,0.2)] transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95">
        <div className="absolute top-1 right-2 z-10">
          <span className="text-[8px] font-normal text-pokemon-text-secondary leading-12 font-poppins">
            {formatPokemonId(pokemon.id)}
          </span>
        </div>

        <div className="flex items-center justify-center pt-4">
          <div className="relative h-[85px] w-[85px] z-20">
            {imageError ? (
              <div className="flex items-center justify-center w-full h-full">
                <div className="text-4xl opacity-30">❓</div>
              </div>
            ) : (
              <Image
                src={pokemon.spriteUrl}
                alt={pokemon.name}
                fill
                className="object-contain pixelated"
                loading="lazy"
                sizes="85px"
                onError={handleImageError}
              />
            )}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-pokemon-card-bg py-1 px-2 rounded-t-lg h-[50%] flex flex-col justify-end">
          <p className="text-center text-[10px] font-normal capitalize text-pokemon-text leading-16 font-poppins truncate">
            {pokemon.name}
          </p>
        </div>
      </div>
    </Link>
  );
});

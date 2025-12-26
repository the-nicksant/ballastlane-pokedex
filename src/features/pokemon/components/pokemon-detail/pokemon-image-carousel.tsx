"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PokemonDetail } from "@/core/domain/entities/pokemon.entity";
import { CAROUSEL_TRANSITION_MS } from "../../constants/ui-constants";

interface PokemonImageCarouselProps {
  currentPokemon: PokemonDetail;
  previousPokemon: PokemonDetail | null;
  nextPokemon: PokemonDetail | null;
  onNavigate: (pokemonId: number) => void;
}

interface PokemonSpriteProps {
  pokemon: PokemonDetail;
  className?: string;
}

function PokemonSprite({ pokemon, className = "" }: PokemonSpriteProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className={`relative size-60 md:size-80 pointer-events-none ${className}`}>
      {imageError ? (
        <div className="flex items-center justify-center w-full h-full">
          <div className="text-8xl opacity-30">❓</div>
        </div>
      ) : (
        <Image
          src={pokemon.artworkUrl}
          alt={pokemon.name}
          fill
          className="object-contain"
          priority
          sizes="250px"
          onError={() => setImageError(true)}
        />
      )}
    </div>
  );
}

export function PokemonImageCarousel({
  currentPokemon,
  previousPokemon,
  nextPokemon,
  onNavigate,
}: PokemonImageCarouselProps) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [slideOffset, setSlideOffset] = useState(0);

  const handlePrevious = () => {
    if (!previousPokemon || isTransitioning) return;

    setIsTransitioning(true);
    setSlideOffset(1);

    setTimeout(() => {
      onNavigate(previousPokemon.id);
      setSlideOffset(0);
      setIsTransitioning(false);
    }, CAROUSEL_TRANSITION_MS);
  };

  const handleNext = () => {
    if (!nextPokemon || isTransitioning) return;

    setIsTransitioning(true);
    setSlideOffset(-1);

    setTimeout(() => {
      onNavigate(nextPokemon.id);
      setSlideOffset(0);
      setIsTransitioning(false);
    }, CAROUSEL_TRANSITION_MS);
  };

  return (
    <>
      {/* Hidden preload images for adjacent Pokemon */}
      <div className="hidden">
        {previousPokemon && (
          <Image
            src={previousPokemon.artworkUrl}
            alt=""
            width={1}
            height={1}
            priority
          />
        )}
        {nextPokemon && (
          <Image
            src={nextPokemon.artworkUrl}
            alt=""
            width={1}
            height={1}
            priority
          />
        )}
      </div>

      <div className="absolute top-20 left-0 right-0 flex justify-center items-center px-8">
      {previousPokemon && (
        <button
          onClick={handlePrevious}
          disabled={isTransitioning}
          className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/20 transition-colors disabled:opacity-50 z-10"
          aria-label="Previous Pokemon"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
      )}

      <div className="relative w-full max-w-lg h-60 md:h-80 mx-8 flex items-center justify-center md:overflow-hidden">
        <div
          className="flex transition-transform duration-400 ease-out"
          style={{
            transform: `translateX(${slideOffset * 200}%)`,
          }}
        >
          <div className={`shrink-0 w-60 ${!previousPokemon ? "ml-0" : ""}`}>
            <PokemonSprite pokemon={currentPokemon} />
          </div>
        </div>
      </div>

      {nextPokemon && (
        <button
          onClick={handleNext}
          disabled={isTransitioning}
          className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/20 transition-colors disabled:opacity-50 z-10"
          aria-label="Next Pokemon"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      )}
      </div>
    </>
  );
}

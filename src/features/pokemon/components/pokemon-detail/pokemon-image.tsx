"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PokemonDetail } from "@/core/domain/entities/pokemon.entity";
import { useRouter } from "next/navigation";

interface PokemonImageProps {
  pokemon: PokemonDetail;
  onPrevious: () => void;
  onNext: () => void;
  isTransitioning: boolean;
  direction: "left" | "right" | null;
}

export function PokemonImage({
  pokemon,
  onPrevious,
  onNext,
  isTransitioning,
  direction,
}: PokemonImageProps) {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (pokemon.id > 1) {
      router.prefetch(`/pokemon/${pokemon.id - 1}`);
    }
    router.prefetch(`/pokemon/${pokemon.id + 1}`);
  }, [pokemon.id, router]);

  const getAnimationClass = () => {
    if (!isTransitioning) return "";
    if (direction === "left") return "animate-slide-out-left";
    if (direction === "right") return "animate-slide-out-right";
    return "";
  };

  return (
    <div className="absolute top-20 left-0 right-0 flex justify-center items-center px-8">
      {pokemon.id > 1 && (
        <button
          onClick={onPrevious}
          disabled={isTransitioning}
          className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/20 transition-colors disabled:opacity-50"
          aria-label="Previous Pokemon"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
      )}

      <div className={`relative w-60 h-60 mx-8 ${getAnimationClass()}`}>
        {imageError ? (
          <div className="flex items-center justify-center w-full h-full">
            <div className="text-8xl opacity-30">❓</div>
          </div>
        ) : (
          <Image
            src={pokemon.artworkUrl}
            alt={pokemon.name}
            fill
            className="object-contain drop-shadow-2xl"
            priority
            sizes="250px"
            onError={() => setImageError(true)}
          />
        )}
      </div>

      <button
        onClick={onNext}
        disabled={isTransitioning}
        className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/20 transition-colors disabled:opacity-50"
        aria-label="Next Pokemon"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>
    </div>
  );
}

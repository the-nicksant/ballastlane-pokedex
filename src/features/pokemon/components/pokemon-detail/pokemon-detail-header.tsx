"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import type { PokemonDetail } from "@/core/domain/entities/pokemon.entity";
import { formatPokemonId } from "@/lib/pokemon-utils";

interface PokemonDetailHeaderProps {
  pokemon: PokemonDetail;
  backgroundColor: string;
}

export function PokemonDetailHeader({
  pokemon,
  backgroundColor,
}: PokemonDetailHeaderProps) {
  const router = useRouter();

  return (
    <header
      className="relative h-full flex-1 px-5 pt-5 pb-24 transition-colors duration-500 w-full max-w-xl"
      style={{ backgroundColor }}
    >
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => router.push('/')}
          className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Go back"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <span className="text-white font-bold text-xs font-[Poppins,sans-serif]">
          {formatPokemonId(pokemon.id)}
        </span>
      </div>
      <h1 className="text-white font-bold text-[32px] leading-[38px] font-[Poppins,sans-serif] capitalize">
        {pokemon.name}
      </h1>
    </header>
  );
}

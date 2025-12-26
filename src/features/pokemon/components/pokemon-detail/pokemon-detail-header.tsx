"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, RefreshCw } from "lucide-react";
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
      className="relative h-full flex-1 px-5 pt-5 pb-24 transition-colors duration-500 w-full max-w-xl overflow-hidden"
      style={{ backgroundColor }}
    >
      <div className="absolute top-0 left-[25%] w-full h-full flex justify-center items-center pointer-events-none z-0">
       <PokeballSvg />
      </div>

      <div className="flex items-center justify-between mb-4 z-10">
        <button
          onClick={() => router.push('/')}
          className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Go back"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-white font-bold text-xs font-poppins">
            {formatPokemonId(pokemon.id)}
          </span>
        </div>
      </div>


      <h1 className="text-white font-bold text-[32px] leading-9-5 font-poppins capitalize">
        {pokemon.name}
      </h1>
    </header>
  );
}

const PokeballSvg = () => (
  <svg width="300" height="300" viewBox="0 0 208 208" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g opacity="0.1">
    <path d="M128.762 104C128.762 117.676 117.676 128.762 104 128.762C90.3244 128.762 79.2381 117.676 79.2381 104C79.2381 90.3244 90.3244 79.2381 104 79.2381C117.676 79.2381 128.762 90.3244 128.762 104Z" fill="white"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M104 208C156.393 208 199.738 169.257 206.947 118.857H146.035C139.917 136.169 123.407 148.571 104 148.571C84.5933 148.571 68.0835 136.169 61.9648 118.857H1.05322C8.26235 169.257 51.6067 208 104 208ZM61.9648 89.1429H1.05322C8.26235 38.7431 51.6067 0 104 0C156.393 0 199.738 38.7431 206.947 89.1429H146.035C139.917 71.8314 123.407 59.4286 104 59.4286C84.5933 59.4286 68.0835 71.8314 61.9648 89.1429ZM128.762 104C128.762 117.676 117.676 128.762 104 128.762C90.3244 128.762 79.2381 117.676 79.2381 104C79.2381 90.3244 90.3244 79.2381 104 79.2381C117.676 79.2381 128.762 90.3244 128.762 104Z" fill="white"/>
    </g>
</svg>

)

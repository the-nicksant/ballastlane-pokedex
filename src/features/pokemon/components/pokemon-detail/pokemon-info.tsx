import type { PokemonDetail } from "@/core/domain/entities/pokemon.entity";
import { TYPE_COLORS } from "@/core/config/constants";

interface PokemonInfoProps {
  pokemon: PokemonDetail;
}

export function PokemonInfo({ pokemon }: PokemonInfoProps) {
  const weight = (pokemon.weight / 10).toFixed(1);
  const height = (pokemon.height / 10).toFixed(1);
  const mainMoves = pokemon.abilities.slice(0, 2).map((a) => a.name).join(", ");

  return (
    <div className="mb-8">
      <div className="flex justify-center gap-2 mb-6">
        {pokemon.types.map((type) => (
          <span
            key={type}
            className="px-4 py-1 rounded-full text-white text-xs font-bold font-[Poppins,sans-serif] capitalize"
            style={{ backgroundColor: TYPE_COLORS[type] }}
          >
            {type}
          </span>
        ))}
      </div>

      <h2
        className="text-center font-bold text-sm mb-4 font-[Poppins,sans-serif]"
        style={{ color: pokemon.types[0] ? TYPE_COLORS[pokemon.types[0]] : "#74CB48" }}
      >
        About
      </h2>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <svg
              className="w-4 h-4"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 6L14 8L12 10M4 6L2 8L4 10M8 2V14"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-sm font-normal text-[#1D1D1D] font-[Poppins,sans-serif]">
              {weight} kg
            </span>
          </div>
          <span className="text-xs text-[#666] font-[Poppins,sans-serif]">Weight</span>
        </div>

        <div className="text-center border-l border-r border-gray-200">
          <div className="flex items-center justify-center gap-1 mb-1">
            <svg
              className="w-4 h-4"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 2V14M12 6V14M4 8V14"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-sm font-normal text-[#1D1D1D] font-[Poppins,sans-serif]">
              {height} m
            </span>
          </div>
          <span className="text-xs text-[#666] font-[Poppins,sans-serif]">Height</span>
        </div>

        <div className="text-center">
          <div className="mb-1">
            <span className="text-sm font-normal text-[#1D1D1D] font-[Poppins,sans-serif] capitalize">
              {mainMoves || "None"}
            </span>
          </div>
          <span className="text-xs text-[#666] font-[Poppins,sans-serif]">Moves</span>
        </div>
      </div>

      <p className="text-[10px] leading-4 text-[#1D1D1D] text-center font-[Poppins,sans-serif]">
        There is a plant seed on its back right from the day this Pokémon is
        born. The seed slowly grows larger.
      </p>
    </div>
  );
}

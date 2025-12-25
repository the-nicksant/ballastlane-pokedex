import { PokemonSearch } from "./pokemon-search";
import { PokemonSortButton } from "./pokemon-sort-button";

export function PokemonListHeader() {
  return (
    <header className="bg-[#DC0A2D] p-3 pb-4">
      <div className="container mx-auto max-w-[1600px]">
        <div className="mb-3 flex items-center gap-4">
          <div className="flex items-center justify-center h-6 w-6 rounded-full bg-white">
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="12" cy="12" r="10" fill="#DC0A2D" />
              <circle cx="12" cy="12" r="6" fill="white" />
              <circle cx="12" cy="12" r="2" fill="#1D1D1D" />
              <path
                d="M2 12h20"
                stroke="#1D1D1D"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <h1 className="text-[24px] font-bold text-white leading-[32px] font-[Poppins,sans-serif]">
            Pokédex
          </h1>
        </div>

        <div className="flex gap-4">
          <PokemonSearch />
          <PokemonSortButton />
        </div>
      </div>
    </header>
  );
}

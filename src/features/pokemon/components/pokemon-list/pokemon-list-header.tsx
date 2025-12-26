import Image from "next/image";
import { PokemonSearch } from "./pokemon-search";
import { PokemonSortButton } from "./pokemon-sort-button";

export function PokemonListHeader() {
  return (
    <header className="bg-pokemon-red p-3 pb-4">
      <div className="container mx-auto max-w-[1600px]">
        <div className="mb-3 flex items-center gap-4">
          <Image src={'/pokeball.svg'} alt="pokeball" width={30} height={30} />
          <h1 className="text-[24px] font-bold text-white leading-[32px] font-poppins">
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

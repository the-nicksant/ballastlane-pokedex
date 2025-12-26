"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { useDebounce } from "../../hooks/use-debounce";
import { pokemonApiService } from "../../services/pokemon-api.service";
import type { Pokemon } from "@/core/domain/entities/pokemon.entity";
import { formatPokemonId } from "@/lib/pokemon-utils";
import { SEARCH_DEBOUNCE_MS, SEARCH_RESULTS_LIMIT, SEARCH_CACHE_TIME_MS } from "../../constants/ui-constants";

interface SearchResultItemProps {
  pokemon: Pokemon;
  index: number;
  selectedIndex: number;
  onClick: () => void;
}

function SearchResultItem({ pokemon, index, selectedIndex, onClick }: SearchResultItemProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <Link
      key={pokemon.id}
      href={`/pokemon?id=${pokemon.id}`}
      onClick={onClick}
      role="option"
      aria-selected={index === selectedIndex}
      className={`flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
        index === selectedIndex ? "bg-gray-50" : ""
      }`}
    >
      <div className="relative w-12 h-12 shrink-0">
        {imageError ? (
          <div className="flex items-center justify-center w-full h-full">
            <div className="text-2xl opacity-30">❓</div>
          </div>
        ) : (
          <Image
            src={pokemon.spriteUrl}
            alt={pokemon.name}
            fill
            className="object-contain pixelated"
            sizes="48px"
            onError={() => setImageError(true)}
          />
        )}
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-medium capitalize text-gray-900">
          {pokemon.name}
        </span>
        <span className="text-xs text-gray-500">
          {formatPokemonId(pokemon.id)}
        </span>
      </div>
    </Link>
  );
}

export function PokemonSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, SEARCH_DEBOUNCE_MS);

  const { data, isLoading } = useQuery({
    queryKey: ["pokemon-search", debouncedQuery],
    queryFn: () => pokemonApiService.getList({ search: debouncedQuery, limit: SEARCH_RESULTS_LIMIT }),
    enabled: debouncedQuery.trim().length > 0,
    staleTime: SEARCH_CACHE_TIME_MS,
  });

  const results: Pokemon[] = data?.pokemon ?? [];

  useEffect(() => {
    if (debouncedQuery.trim() && results.length > 0) {
      setIsOpen(true);
      setSelectedIndex(-1);
    } else if (debouncedQuery.trim() && !isLoading) {
      setIsOpen(true);
    }
  }, [debouncedQuery, results, isLoading]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          router.push(`/pokemon?id=${results[selectedIndex].id}`);
          setIsOpen(false);
          setQuery("");
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim()) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleResultClick = () => {
    setIsOpen(false);
    setQuery("");
  };

  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-pokemon-red z-10" />
      <Input
        ref={inputRef}
        type="search"
        placeholder="Search Pokemon..."
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className="pl-10 bg-white h-8 text-[10px] font-poppins rounded-md border-0 shadow-[inset_0px_1px_3px_1px_rgba(0,0,0,0.25)]"
        aria-label="Search Pokemon"
        aria-autocomplete="list"
        aria-controls="pokemon-search-results"
        aria-expanded={isOpen}
        role="combobox"
      />

      {isLoading && (
        <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-pokemon-red animate-spin" />
      )}

      {isOpen && results.length > 0 && (
        <div
          ref={dropdownRef}
          id="pokemon-search-results"
          role="listbox"
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-[400px] overflow-y-auto z-50"
        >
          {results.map((pokemon, index) => (
            <SearchResultItem
              key={pokemon.id}
              pokemon={pokemon}
              index={index}
              selectedIndex={selectedIndex}
              onClick={handleResultClick}
            />
          ))}
        </div>
      )}

      {isOpen && !isLoading && query.trim() && results.length === 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 text-center z-50"
        >
          <p className="text-sm text-gray-500">No Pokemon found for &quot;{query}&quot;</p>
        </div>
      )}
    </div>
  );
}

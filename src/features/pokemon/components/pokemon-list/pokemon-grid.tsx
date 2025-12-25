"use client";

import { useEffect, useState } from "react";
import { CellComponentProps, Grid } from "react-window";
import type { Pokemon } from "@/core/domain/entities/pokemon.entity";
import { PokemonCard } from "./pokemon-card";

const CARD_WIDTH = 120;
const CARD_HEIGHT = 128;
const HEADER_SIZE = 104;
const MAX_CONTAINER_WIDTH = 1600;

interface PokemonGridProps {
  pokemon: Pokemon[];
  onScrollEnd?: () => void;
  loadingNext?: boolean;
}

export function PokemonGrid({ pokemon, onScrollEnd, loadingNext = false }: PokemonGridProps) {
  const [dimensions, setDimensions] = useState({
    width: typeof window !== "undefined" ? Math.min(screen.availWidth, MAX_CONTAINER_WIDTH) : 1280,
    height: typeof window !== "undefined" ? screen.availHeight - HEADER_SIZE : 800,
  });

  const getColumnsCount = (width: number) => Math.floor(width / CARD_WIDTH);

  const columnCount = getColumnsCount(dimensions.width);
  const rowCount = Math.ceil(pokemon.length / columnCount);
  const columnWidth = (dimensions.width - 32) / columnCount;

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: Math.min(screen.availWidth, MAX_CONTAINER_WIDTH),
        height: screen.availHeight - HEADER_SIZE,
      });
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleScroll = ({ scrollTop, scrollHeight, clientHeight }: any) => {
    if (!onScrollEnd || loadingNext) return;
    
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
    if (scrollPercentage > 0.8) {
      onScrollEnd();
    }
  };

  if (pokemon.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-6xl mb-4">🔍</div>
        <p className="text-lg text-muted-foreground">No Pokemon found.</p>
        <p className="text-sm text-muted-foreground mt-2">
          Try adjusting your search or filters.
        </p>
      </div>
    );
  }

  const Cell = ({ pokemon, columnIndex, rowIndex, style }: CellComponentProps<{ pokemon: Pokemon[]}>) => {
    const index = rowIndex * columnCount + columnIndex;
    if (index >= pokemon.length) return <div></div>;

    const p = pokemon[index];
    return (
      <div style={style} className="p-1">
        <PokemonCard pokemon={p} />
      </div>
    );
  };

  return (
    <div className="px-4">
      <Grid
        style={{ 
          height: dimensions.height, 
          paddingTop: 12,
          paddingBottom: 12,
          scrollbarWidth: 'none'
        }}
        cellProps={{ pokemon }}
        cellComponent={Cell}
        columnCount={columnCount}
        columnWidth={columnWidth}
        rowCount={rowCount}
        rowHeight={CARD_HEIGHT}
        onScroll={({ currentTarget }) => handleScroll(currentTarget)}
        className="mx-auto"
      />

      {loadingNext && (
        <div className="py-8 flex justify-center">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-[#DC0A2D] border-t-transparent" />
            <span className="text-sm text-muted-foreground">
              Loading more Pokemon...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

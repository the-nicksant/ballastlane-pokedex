"use client";

import { useEffect, useState } from "react";
import type { Stat } from "@/core/domain/entities/pokemon.entity";
import type { PokemonType } from "@/core/config/constants";
import { TYPE_COLORS } from "@/core/config/constants";

interface PokemonStatsProps {
  stats: Stat[];
  primaryType: PokemonType;
}

const STAT_NAMES: Record<string, string> = {
  hp: "HP",
  attack: "ATK",
  defense: "DEF",
  "special-attack": "SATK",
  "special-defense": "SDEF",
  speed: "SPD",
};

export function PokemonStats({ stats, primaryType }: PokemonStatsProps) {
  const [animated, setAnimated] = useState(false);
  const statColor = TYPE_COLORS[primaryType] || "#74CB48";

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const maxStat = Math.max(...stats.map((s) => s.baseStat), 100);

  return (
    <div>
      <h2
        className="text-center font-bold text-sm mb-4 font-[Poppins,sans-serif]"
        style={{ color: statColor }}
      >
        Base Stats
      </h2>

      <div className="space-y-3">
        {stats.map((stat) => {
          const percentage = (stat.baseStat / maxStat) * 100;
          const statName = STAT_NAMES[stat.name] || stat.name.toUpperCase();

          return (
            <div key={stat.name} className="flex items-center gap-3">
              <div
                className="w-12 text-right font-bold text-xs font-[Poppins,sans-serif]"
                style={{ color: statColor }}
              >
                {statName}
              </div>
              <div className="w-1 h-4 bg-gray-200" />
              <div className="w-10 text-right text-xs font-[Poppins,sans-serif] text-[#1D1D1D]">
                {String(stat.baseStat).padStart(3, "0")}
              </div>
              <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: animated ? `${percentage}%` : "0%",
                    backgroundColor: statColor,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

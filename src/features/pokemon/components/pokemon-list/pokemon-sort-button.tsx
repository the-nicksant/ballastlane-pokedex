"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function PokemonSortButton() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sortBy") ?? "number";
  const currentOrder = searchParams.get("order") ?? "asc";

  const handleSort = (sortBy: "number" | "name") => {
    const params = new URLSearchParams(searchParams);
    params.set("sortBy", sortBy);

    if (sortBy !== currentSort) {
      params.set("order", "asc");
    } else {
      params.set("order", currentOrder === "asc" ? "desc" : "asc");
    }

    router.push(`?${params.toString()}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="bg-white h-8 w-8 rounded-[16px] border-0 shadow-[inset_0px_1px_3px_1px_rgba(0,0,0,0.25)] hover:bg-white hover:scale-105 active:scale-95 transition-all"
          title="Sort Pokemon"
        >
          <ArrowUpDown className="h-4 w-4 text-pokemon-red" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="font-poppins">
        <DropdownMenuItem
          onClick={() => handleSort("number")}
          className="cursor-pointer"
        >
          Sort by Number {currentSort === "number" && `(${currentOrder})`}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleSort("name")}
          className="cursor-pointer"
        >
          Sort by Name {currentSort === "name" && `(${currentOrder})`}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

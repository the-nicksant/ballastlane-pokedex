"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface PokemonListErrorProps {
  message?: string;
  onRetry?: () => void;
}

export function PokemonListError({
  message = "Failed to load Pokemon. Please try again.",
  onRetry,
}: PokemonListErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <AlertCircle className="h-12 w-12 text-destructive mb-4" />
      <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
      <p className="text-muted-foreground mb-4">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          Try Again
        </Button>
      )}
    </div>
  );
}

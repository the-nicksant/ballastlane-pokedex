import { useCallback, useRef } from "react";

const DEBOUNCE_DELAY = 300;

export function usePokemonSearch() {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const debouncedSearch = useCallback(
    (value: string, callback: (value: string) => void) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(value);
      }, DEBOUNCE_DELAY);
    },
    []
  );

  return { debouncedSearch };
}

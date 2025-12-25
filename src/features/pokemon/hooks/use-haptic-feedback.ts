import { useCallback } from "react";

type HapticStyle = "light" | "medium" | "heavy";

export function useHapticFeedback() {
  const trigger = useCallback((style: HapticStyle = "light") => {
    if (typeof window === "undefined" || !("vibrate" in navigator)) {
      return;
    }

    const patterns: Record<HapticStyle, number | number[]> = {
      light: 10,
      medium: 20,
      heavy: [30, 10, 30],
    };

    navigator.vibrate(patterns[style]);
  }, []);

  return {
    triggerLight: () => trigger("light"),
    triggerMedium: () => trigger("medium"),
    triggerHeavy: () => trigger("heavy"),
  };
}

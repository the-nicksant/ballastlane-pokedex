import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

import {loadEnvConfig} from '@next/env'

loadEnvConfig(process.cwd())

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    env: {
      NODE_ENV: "test",
      DATABASE_PATH: ":memory:",
      JWT_SECRET: "bk138921b5gu1289182bjk1293182kbj",
      SESSION_DURATION: "7d",
      POKEAPI_BASE_URL: "https://pokeapi.co/api/v2",
      POKEAPI_CACHE_DURATION: "3600",
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "tests/",
        "**/*.config.*",
        "**/*.d.ts",
        "**/types/",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/core": path.resolve(__dirname, "./src/core"),
      "@/infrastructure": path.resolve(__dirname, "./src/infrastructure"),
      "@/features": path.resolve(__dirname, "./src/features"),
      "@/components": path.resolve(__dirname, "./src/components"),
      "@/lib": path.resolve(__dirname, "./src/lib"),
    },
  },
});

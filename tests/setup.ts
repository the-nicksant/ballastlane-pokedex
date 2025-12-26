import { expect, afterEach, beforeAll, afterAll } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// Set up test environment variables before importing any modules
process.env.NODE_ENV = "test";
process.env.DATABASE_PATH = ":memory:";
process.env.JWT_SECRET = "test-secret-key-with-at-least-32-characters-for-testing";
process.env.SESSION_DURATION = "7d";
process.env.POKEAPI_BASE_URL = "https://pokeapi.co/api/v2";
process.env.POKEAPI_CACHE_DURATION = "3600";

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Next.js modules
beforeAll(() => {
  // Mock next/navigation
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

afterAll(() => {
  // Cleanup
});

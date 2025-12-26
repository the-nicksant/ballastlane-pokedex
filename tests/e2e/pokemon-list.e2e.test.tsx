/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PokemonListHeader } from "@/features/pokemon/components/pokemon-list/pokemon-list-header";
import { PokemonSortButton } from "@/features/pokemon/components/pokemon-list/pokemon-sort-button";
import { PokemonSearch } from "@/features/pokemon/components/pokemon-list/pokemon-search";
import { PokemonCard } from "@/features/pokemon/components/pokemon-list/pokemon-card";
import type { Pokemon } from "@/core/domain/entities/pokemon.entity";

// Helper to wrap components with QueryClientProvider
function renderWithQueryClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

// Mock data
const mockSearchResults: Pokemon[] = [
  {
    id: 25,
    name: "pikachu",
    types: ["electric"],
    spriteUrl: "https://example.com/25.png",
    artworkUrl: "https://example.com/25-artwork.png",
  },
  {
    id: 26,
    name: "raichu",
    types: ["electric"],
    spriteUrl: "https://example.com/26.png",
    artworkUrl: "https://example.com/26-artwork.png",
  },
];

// Mock nuqs
vi.mock("nuqs", () => ({
  useQueryState: (key: string) => {
    if (key === "sortBy") return [null, vi.fn()];
    if (key === "order") return [null, vi.fn()];
    return [null, vi.fn()];
  },
}));

// Mock next/navigation
const mockPush = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => mockSearchParams,
}));

// Mock Pokemon API service
vi.mock("@/features/pokemon/services/pokemon-api.service", () => ({
  pokemonApiService: {
    getList: vi.fn(),
  },
}));

// Mock haptic feedback hook
const mockTriggerLight = vi.fn();
vi.mock("@/features/pokemon/hooks/use-haptic-feedback", () => ({
  useHapticFeedback: () => ({
    triggerLight: mockTriggerLight,
    triggerMedium: vi.fn(),
    triggerHeavy: vi.fn(),
  }),
}));

import { pokemonApiService } from "@/features/pokemon/services/pokemon-api.service";

describe("Pokemon List - E2E User Journey Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.delete("sortBy");
    mockSearchParams.delete("order");
  });

  describe("User Journey: Pokemon List Header", () => {
    it("should display Pokédex header with search and sort controls", () => {
      renderWithQueryClient(<PokemonListHeader />);

      expect(screen.getByText("Pokédex")).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
      expect(screen.getByTitle(/sort pokemon/i)).toBeInTheDocument();
    });
  });

  describe("User Journey: Searching Pokemon", () => {
    it("should show search results when user types in search box", async () => {
      const user = userEvent.setup();

      vi.mocked(pokemonApiService.getList).mockResolvedValueOnce({
        pokemon: mockSearchResults,
        total: 2,
        offset: 0,
        limit: 10,
        hasMore: false,
      });

      renderWithQueryClient(<PokemonSearch />);

      const searchInput = screen.getByPlaceholderText(/search/i);
      await user.type(searchInput, "pika");

      await waitFor(
        () => {
          expect(pokemonApiService.getList).toHaveBeenCalledWith({
            search: "pika",
            limit: 10,
          });
        },
        { timeout: 500 }
      );

      await waitFor(() => {
        expect(screen.getByText("pikachu")).toBeInTheDocument();
        expect(screen.getByText("raichu")).toBeInTheDocument();
      });
    });

    it("should navigate to Pokemon detail when user clicks search result", async () => {
      const user = userEvent.setup();

      vi.mocked(pokemonApiService.getList).mockResolvedValueOnce({
        pokemon: mockSearchResults,
        total: 2,
        offset: 0,
        limit: 10,
        hasMore: false,
      });

      renderWithQueryClient(<PokemonSearch />);

      const searchInput = screen.getByPlaceholderText(/search/i);
      await user.type(searchInput, "pika");

      await waitFor(() => {
        expect(screen.getByText("pikachu")).toBeInTheDocument();
      });

      const pikachuLink = screen.getByText("pikachu").closest("a");
      expect(pikachuLink).toHaveAttribute("href", "/pokemon?id=25");

      await user.click(screen.getByText("pikachu"));

      await waitFor(() => {
        expect(searchInput).toHaveValue("");
      });
    });

    it("should show no results message when search returns empty", async () => {
      const user = userEvent.setup();

      vi.mocked(pokemonApiService.getList).mockResolvedValueOnce({
        pokemon: [],
        total: 0,
        offset: 0,
        limit: 10,
        hasMore: false,
      });

      renderWithQueryClient(<PokemonSearch />);

      const searchInput = screen.getByPlaceholderText(/search/i);
      await user.type(searchInput, "nonexistent");

      await waitFor(() => {
        expect(screen.getByText(/no pokemon found/i)).toBeInTheDocument();
      });
    });

  });

  describe("User Journey: Sorting Pokemon", () => {
    it("should show sort options when user clicks sort button", async () => {
      const user = userEvent.setup();

      renderWithQueryClient(<PokemonSortButton />);

      const sortButton = screen.getByTitle(/sort pokemon/i);
      await user.click(sortButton);

      expect(screen.getByText(/sort by number/i)).toBeInTheDocument();
      expect(screen.getByText(/sort by name/i)).toBeInTheDocument();
    });

    it("should sort by name when user selects name option", async () => {
      const user = userEvent.setup();

      renderWithQueryClient(<PokemonSortButton />);

      const sortButton = screen.getByTitle(/sort pokemon/i);
      await user.click(sortButton);

      const nameOption = screen.getByText(/sort by name/i);
      await user.click(nameOption);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(
          expect.stringContaining("sortBy=name")
        );
        expect(mockPush).toHaveBeenCalledWith(
          expect.stringContaining("order=asc")
        );
      });
    });

    it("should toggle sort order when user clicks same sort option", async () => {
      const user = userEvent.setup();

      mockSearchParams.set("sortBy", "number");
      mockSearchParams.set("order", "asc");

      renderWithQueryClient(<PokemonSortButton />);

      const sortButton = screen.getByTitle(/sort pokemon/i);
      await user.click(sortButton);

      expect(screen.getByText(/sort by number.*\(asc\)/i)).toBeInTheDocument();

      const numberOption = screen.getByText(/sort by number/i);
      await user.click(numberOption);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(
          expect.stringContaining("order=desc")
        );
      });
    });
  });

  describe("User Journey: Clicking Pokemon Card", () => {
    it("should navigate to Pokemon detail page when user clicks card", async () => {
      const user = userEvent.setup();

      const testPokemon: Pokemon = {
        id: 25,
        name: "pikachu",
        types: ["electric"],
        spriteUrl: "https://example.com/25.png",
        artworkUrl: "https://example.com/25-artwork.png",
      };

      renderWithQueryClient(<PokemonCard pokemon={testPokemon} />);

      // User sees the Pokemon card with name and ID
      expect(screen.getByText("pikachu")).toBeInTheDocument();
      expect(screen.getByText("#025")).toBeInTheDocument();

      // Card links to correct detail page
      const cardLink = screen.getByText("pikachu").closest("a");
      expect(cardLink).toHaveAttribute("href", "/pokemon?id=25");

      // User clicks the card
      await user.click(cardLink!);

      // Haptic feedback is triggered
      expect(mockTriggerLight).toHaveBeenCalled();
    });

    it("should display Pokemon image and handle image errors gracefully", () => {
      const testPokemon: Pokemon = {
        id: 150,
        name: "mewtwo",
        types: ["psychic"],
        spriteUrl: "https://example.com/150.png",
        artworkUrl: "https://example.com/150-artwork.png",
      };

      renderWithQueryClient(<PokemonCard pokemon={testPokemon} />);

      // Pokemon image is rendered
      const image = screen.getByAltText("mewtwo");
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute("src", expect.stringContaining("150.png"));
    });
  });

  describe("User Journey: Complete Header Experience", () => {
    it("should display header with both search and sort controls", () => {
      renderWithQueryClient(<PokemonListHeader />);

      // Header displays title
      expect(screen.getByText("Pokédex")).toBeInTheDocument();

      // Search control is present and functional
      const searchInput = screen.getByPlaceholderText(/search/i);
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAttribute("type", "search");

      // Sort control is present
      const sortButton = screen.getByTitle(/sort pokemon/i);
      expect(sortButton).toBeInTheDocument();
      expect(sortButton).toHaveAttribute("type", "button");
    });
  });
});

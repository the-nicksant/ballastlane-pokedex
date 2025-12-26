/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PokemonDetailView } from "@/features/pokemon/components/pokemon-detail/pokemon-detail-view";
import { PokemonDetailHeader } from "@/features/pokemon/components/pokemon-detail/pokemon-detail-header";
import { PokemonImageCarousel } from "@/features/pokemon/components/pokemon-detail/pokemon-image-carousel";
import { PokemonInfo } from "@/features/pokemon/components/pokemon-detail/pokemon-info";
import { PokemonStats } from "@/features/pokemon/components/pokemon-detail/pokemon-stats";
import type { PokemonDetail } from "@/core/domain/entities/pokemon.entity";

// Mock nuqs
const mockSetId = vi.fn();
vi.mock("nuqs", () => ({
  useQueryState: () => [25, mockSetId],
  parseAsInteger: {},
}));

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock data
const mockPikachu: PokemonDetail = {
  id: 25,
  name: "pikachu",
  types: ["electric"],
  spriteUrl: "https://example.com/25.png",
  artworkUrl: "https://example.com/25-artwork.png",
  height: 40,
  weight: 60,
  abilities: [
    { name: "static", isHidden: false },
    { name: "lightning-rod", isHidden: true },
  ],
  stats: [
    { name: "hp", baseStat: 35 },
    { name: "attack", baseStat: 55 },
    { name: "defense", baseStat: 40 },
    { name: "special-attack", baseStat: 50 },
    { name: "special-defense", baseStat: 50 },
    { name: "speed", baseStat: 90 },
  ],
};

const mockRaichu: PokemonDetail = {
  id: 26,
  name: "raichu",
  types: ["electric"],
  spriteUrl: "https://example.com/26.png",
  artworkUrl: "https://example.com/26-artwork.png",
  height: 80,
  weight: 300,
  abilities: [
    { name: "static", isHidden: false },
    { name: "lightning-rod", isHidden: true },
  ],
  stats: [
    { name: "hp", baseStat: 60 },
    { name: "attack", baseStat: 90 },
    { name: "defense", baseStat: 55 },
    { name: "special-attack", baseStat: 90 },
    { name: "special-defense", baseStat: 80 },
    { name: "speed", baseStat: 110 },
  ],
};

const mockPikachuPrevious: PokemonDetail = {
  id: 24,
  name: "arbok",
  types: ["poison"],
  spriteUrl: "https://example.com/24.png",
  artworkUrl: "https://example.com/24-artwork.png",
  height: 350,
  weight: 650,
  abilities: [
    { name: "intimidate", isHidden: false },
    { name: "shed-skin", isHidden: false },
  ],
  stats: [
    { name: "hp", baseStat: 60 },
    { name: "attack", baseStat: 95 },
    { name: "defense", baseStat: 69 },
    { name: "special-attack", baseStat: 65 },
    { name: "special-defense", baseStat: 79 },
    { name: "speed", baseStat: 80 },
  ],
};

describe("Pokemon Detail - E2E User Journey Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("User Journey: Viewing Pokemon Details", () => {
    it("should display Pokemon name and ID", () => {
      render(
        <PokemonDetailView
          pokemon={mockPikachu}
          previousPokemon={mockPikachuPrevious}
          nextPokemon={mockRaichu}
        />
      );

      // User sees Pokemon name
      expect(screen.getByText("pikachu")).toBeInTheDocument();

      // User sees formatted Pokemon ID
      expect(screen.getByText("#025")).toBeInTheDocument();
    });

    it("should display Pokemon types as badges", () => {
      render(
        <PokemonDetailView
          pokemon={mockPikachu}
          previousPokemon={null}
          nextPokemon={null}
        />
      );

      // User sees type badge
      expect(screen.getByText("electric")).toBeInTheDocument();
    });

    it("should display Pokemon physical attributes", () => {
      render(<PokemonInfo pokemon={mockPikachu} />);

      // User sees weight in kg (60 / 10 = 6.0)
      expect(screen.getByText("6.0 kg")).toBeInTheDocument();
      expect(screen.getByText("Weight")).toBeInTheDocument();

      // User sees height in meters (40 / 10 = 4.0)
      expect(screen.getByText("4.0 m")).toBeInTheDocument();
      expect(screen.getByText("Height")).toBeInTheDocument();

      // User sees moves/abilities (first 2)
      expect(screen.getByText("static, lightning-rod")).toBeInTheDocument();
      expect(screen.getByText("Moves")).toBeInTheDocument();
    });

    it("should display base stats with labels", () => {
      render(<PokemonStats stats={mockPikachu.stats} primaryType="electric" />);

      // User sees "Base Stats" header
      expect(screen.getByText("Base Stats")).toBeInTheDocument();

      // User sees all stat names
      expect(screen.getByText("HP")).toBeInTheDocument();
      expect(screen.getByText("ATK")).toBeInTheDocument();
      expect(screen.getByText("DEF")).toBeInTheDocument();
      expect(screen.getByText("SATK")).toBeInTheDocument();
      expect(screen.getByText("SDEF")).toBeInTheDocument();
      expect(screen.getByText("SPD")).toBeInTheDocument();

      // User sees stat values (padded to 3 digits)
      expect(screen.getByText("035")).toBeInTheDocument(); // HP
      expect(screen.getByText("055")).toBeInTheDocument(); // Attack
      expect(screen.getByText("040")).toBeInTheDocument(); // Defense
      expect(screen.getByText("090")).toBeInTheDocument(); // Speed
    });

    it("should display Pokemon image with proper alt text", () => {
      render(
        <PokemonDetailView
          pokemon={mockPikachu}
          previousPokemon={null}
          nextPokemon={null}
        />
      );

      // User sees Pokemon artwork
      const artwork = screen.getByAltText("pikachu");
      expect(artwork).toBeInTheDocument();
      expect(artwork).toHaveAttribute("src", expect.stringContaining("25-artwork.png"));
    });
  });

  describe("User Journey: Navigating Between Pokemon", () => {
    it("should show previous and next navigation buttons when available", () => {
      render(
        <PokemonImageCarousel
          currentPokemon={mockPikachu}
          previousPokemon={mockPikachuPrevious}
          nextPokemon={mockRaichu}
          onNavigate={vi.fn()}
        />
      );

      // User sees navigation buttons
      expect(screen.getByLabelText("Previous Pokemon")).toBeInTheDocument();
      expect(screen.getByLabelText("Next Pokemon")).toBeInTheDocument();
    });

    it("should navigate to next Pokemon when user clicks next button", async () => {
      const user = userEvent.setup();
      const mockOnNavigate = vi.fn();

      render(
        <PokemonImageCarousel
          currentPokemon={mockPikachu}
          previousPokemon={mockPikachuPrevious}
          nextPokemon={mockRaichu}
          onNavigate={mockOnNavigate}
        />
      );

      // User clicks next button
      const nextButton = screen.getByLabelText("Next Pokemon");
      await user.click(nextButton);

      // Navigation is triggered after animation
      await waitFor(
        () => {
          expect(mockOnNavigate).toHaveBeenCalledWith(26);
        },
        { timeout: 500 }
      );
    });

    it("should navigate to previous Pokemon when user clicks previous button", async () => {
      const user = userEvent.setup();
      const mockOnNavigate = vi.fn();

      render(
        <PokemonImageCarousel
          currentPokemon={mockPikachu}
          previousPokemon={mockPikachuPrevious}
          nextPokemon={mockRaichu}
          onNavigate={mockOnNavigate}
        />
      );

      // User clicks previous button
      const previousButton = screen.getByLabelText("Previous Pokemon");
      await user.click(previousButton);

      // Navigation is triggered after animation
      await waitFor(
        () => {
          expect(mockOnNavigate).toHaveBeenCalledWith(24);
        },
        { timeout: 500 }
      );
    });

    it("should not show previous button when viewing first Pokemon", () => {
      render(
        <PokemonImageCarousel
          currentPokemon={mockPikachu}
          previousPokemon={null}
          nextPokemon={mockRaichu}
          onNavigate={vi.fn()}
        />
      );

      // No previous button when at first Pokemon
      expect(screen.queryByLabelText("Previous Pokemon")).not.toBeInTheDocument();

      // Next button still available
      expect(screen.getByLabelText("Next Pokemon")).toBeInTheDocument();
    });

    it("should not show next button when viewing last Pokemon", () => {
      render(
        <PokemonImageCarousel
          currentPokemon={mockPikachu}
          previousPokemon={mockPikachuPrevious}
          nextPokemon={null}
          onNavigate={vi.fn()}
        />
      );

      // No next button when at last Pokemon
      expect(screen.queryByLabelText("Next Pokemon")).not.toBeInTheDocument();

      // Previous button still available
      expect(screen.getByLabelText("Previous Pokemon")).toBeInTheDocument();
    });

    it("should disable navigation buttons during transition", async () => {
      const user = userEvent.setup();

      render(
        <PokemonImageCarousel
          currentPokemon={mockPikachu}
          previousPokemon={mockPikachuPrevious}
          nextPokemon={mockRaichu}
          onNavigate={vi.fn()}
        />
      );

      const nextButton = screen.getByLabelText("Next Pokemon");

      // User clicks next button
      await user.click(nextButton);

      // Button is disabled during transition
      expect(nextButton).toBeDisabled();
    });
  });

  describe("User Journey: Navigating Back to List", () => {
    it("should show back button to return to Pokemon list", () => {
      render(
        <PokemonDetailHeader pokemon={mockPikachu} backgroundColor="#F9CF30" />
      );

      // User sees back button
      const backButton = screen.getByLabelText("Go back");
      expect(backButton).toBeInTheDocument();
    });

    it("should navigate to home when user clicks back button", async () => {
      const user = userEvent.setup();

      render(
        <PokemonDetailHeader pokemon={mockPikachu} backgroundColor="#F9CF30" />
      );

      // User clicks back button
      const backButton = screen.getByLabelText("Go back");
      await user.click(backButton);

      // Router navigates to home
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  describe("User Journey: Visual Feedback", () => {
    it("should apply background color based on Pokemon primary type", () => {
      const { container } = render(
        <PokemonDetailView
          pokemon={mockPikachu}
          previousPokemon={null}
          nextPokemon={null}
        />
      );

      // Electric type should have yellow background (#F9CF30)
      const mainDiv = container.querySelector(".min-h-screen");
      expect(mainDiv).toHaveStyle({ backgroundColor: "#F9CF30" });
    });

    it("should display type badge with correct color", () => {
      render(<PokemonInfo pokemon={mockPikachu} />);

      const typeBadge = screen.getByText("electric");

      // Electric type badge should have yellow background
      expect(typeBadge).toHaveStyle({ backgroundColor: "#F9CF30" });
    });

    it("should display About section with type-specific color", () => {
      render(<PokemonInfo pokemon={mockPikachu} />);

      const aboutHeader = screen.getByText("About");

      // About header should use type color
      expect(aboutHeader).toHaveStyle({ color: "#F9CF30" });
    });

    it("should display stats with type-specific color", () => {
      render(<PokemonStats stats={mockPikachu.stats} primaryType="electric" />);

      const statsHeader = screen.getByText("Base Stats");

      // Stats header should use type color
      expect(statsHeader).toHaveStyle({ color: "#F9CF30" });
    });
  });

  describe("User Journey: Multi-Type Pokemon", () => {
    it("should display all types for Pokemon with multiple types", () => {
      const charizard: PokemonDetail = {
        ...mockPikachu,
        id: 6,
        name: "charizard",
        types: ["fire", "flying"],
      };

      render(<PokemonInfo pokemon={charizard} />);

      // User sees both type badges
      expect(screen.getByText("fire")).toBeInTheDocument();
      expect(screen.getByText("flying")).toBeInTheDocument();
    });

    it("should use primary type for background color", () => {
      const charizard: PokemonDetail = {
        ...mockPikachu,
        id: 6,
        name: "charizard",
        types: ["fire", "flying"],
      };

      const { container } = render(
        <PokemonDetailView
          pokemon={charizard}
          previousPokemon={null}
          nextPokemon={null}
        />
      );

      // Primary type (fire) determines background color
      const mainDiv = container.querySelector(".min-h-screen");
      expect(mainDiv).toHaveStyle({ backgroundColor: "#F57D31" }); // Fire color
    });
  });

  describe("User Journey: Complete Detail Page Experience", () => {
    it("should display all Pokemon information in one view", () => {
      render(
        <PokemonDetailView
          pokemon={mockPikachu}
          previousPokemon={mockPikachuPrevious}
          nextPokemon={mockRaichu}
        />
      );

      // Header section
      expect(screen.getByText("pikachu")).toBeInTheDocument();
      expect(screen.getByText("#025")).toBeInTheDocument();
      expect(screen.getByLabelText("Go back")).toBeInTheDocument();

      // Type badges
      expect(screen.getByText("electric")).toBeInTheDocument();

      // Physical attributes
      expect(screen.getByText("6.0 kg")).toBeInTheDocument();
      expect(screen.getByText("4.0 m")).toBeInTheDocument();

      // Stats
      expect(screen.getByText("Base Stats")).toBeInTheDocument();
      expect(screen.getByText("HP")).toBeInTheDocument();
      expect(screen.getByText("090")).toBeInTheDocument(); // Speed stat

      // Navigation
      expect(screen.getByLabelText("Previous Pokemon")).toBeInTheDocument();
      expect(screen.getByLabelText("Next Pokemon")).toBeInTheDocument();
    });
  });
});

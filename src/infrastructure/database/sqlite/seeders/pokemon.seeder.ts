import { pokemonSQLiteRepository } from "../repositories/pokemon.repository.impl";
import { pokemonPokeAPIRepository } from "@/infrastructure/http/pokeapi/pokemon-detail.repository.impl";

export class PokemonSeeder {
  private static readonly BATCH_SIZE = 400;
  private static readonly MAX_RETRIES = 3;

  static needsSeeding(): boolean {
    return pokemonSQLiteRepository.isEmpty();
  }

  static async seed(): Promise<void> {
    console.log("🌱 Starting Pokemon database seed...");

    try {
      const { total } = await this.fetchBatchWithRetry(0, 1);
      console.log(`📊 Total Pokemon to seed: ${total}`);

      let offset = 0;
      let seededCount = 0;

      while (offset < total) {
        const { pokemon } = await this.fetchBatchWithRetry(
          offset,
          this.BATCH_SIZE
        );

        pokemonSQLiteRepository.insertBatch(pokemon);

        seededCount += pokemon.length;
        offset += this.BATCH_SIZE;

        console.log(
          `✅ Seeded ${seededCount}/${total} Pokemon (${Math.round(
            (seededCount / total) * 100
          )}%)`
        );

        await this.delay(100);
      }

      console.log(`🎉 Pokemon seed completed: ${seededCount} Pokemon cached`);
    } catch (error) {
      console.error("❌ Pokemon seed failed:", error);
      throw error;
    }
  }

  private static async fetchBatchWithRetry(
    offset: number,
    limit: number,
    retries = 0
  ): Promise<{ pokemon: any[]; total: number }> {
    try {
      return await pokemonPokeAPIRepository.fetchAllBasicInfo(offset, limit);
    } catch (error) {
      if (retries < this.MAX_RETRIES) {
        console.warn(
          `⚠️  Batch fetch failed, retrying (${retries + 1}/${this.MAX_RETRIES})...`
        );
        await this.delay(1000 * (retries + 1));
        return this.fetchBatchWithRetry(offset, limit, retries + 1);
      }
      throw error;
    }
  }

  static async reseed(): Promise<void> {
    console.log("🗑️  Clearing existing Pokemon cache...");
    pokemonSQLiteRepository.truncate();
    await this.seed();
  }

  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

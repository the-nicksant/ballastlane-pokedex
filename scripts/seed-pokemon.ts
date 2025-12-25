import { PokemonSeeder } from "../src/infrastructure/database/sqlite/seeders/pokemon.seeder";

async function main() {
  const command = process.argv[2];

  try {
    if (command === "reseed") {
      await PokemonSeeder.reseed();
    } else {
      if (PokemonSeeder.needsSeeding()) {
        await PokemonSeeder.seed();
      } else {
        console.log("Pokemon cache already populated. Use 'reseed' to force.");
      }
    }
    process.exit(0);
  } catch (error) {
    console.error("Seed script failed:", error);
    process.exit(1);
  }
}

main();

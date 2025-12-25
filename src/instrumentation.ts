export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { PokemonSeeder } = await import(
      "./infrastructure/database/sqlite/seeders/pokemon.seeder"
    );

    if (PokemonSeeder.needsSeeding()) {
      console.log("Pokemon cache is empty, starting background seed...");
      PokemonSeeder.seed().catch((error) => {
        console.error("Pokemon seed failed:", error);
      });
    } else {
      console.log("Pokemon cache already populated");
    }
  }
}

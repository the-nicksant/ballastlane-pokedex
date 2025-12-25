import { z } from "zod";

const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // Database configuration
  DATABASE_PATH: z.string().default("./data/database.sqlite"),

  // Authentication configuration
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must be at least 32 characters")
    .refine(
      (val) =>
        process.env.NODE_ENV !== "production" ||
        !val.includes("change-in-production"),
      "JWT_SECRET must be changed in production! Generate with: openssl rand -base64 32"
    ),
  SESSION_DURATION: z.string().default("7d"),

  // External API configuration
  POKEAPI_BASE_URL: z.url().default("https://pokeapi.co/api/v2"),
  POKEAPI_CACHE_DURATION: z.coerce.number().int().positive().default(3600),
});

function parseEnv() {
  try {
    
    return envSchema.parse({
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_PATH: process.env.DATABASE_PATH,
      JWT_SECRET: process.env.JWT_SECRET,
      SESSION_DURATION: process.env.SESSION_DURATION,
      POKEAPI_BASE_URL: process.env.POKEAPI_BASE_URL,
      POKEAPI_CACHE_DURATION: process.env.POKEAPI_CACHE_DURATION,
    });
  } catch (error) {
    console.error("❌ Invalid environment variables:");
    console.error("Error type:", error?.constructor?.name);
    console.error("Full error:", error);
    if (error instanceof z.ZodError) {
      console.error("Zod errors:", error.issues);
      error.issues.forEach((err) => {
        console.error(`  - ${err.path.join(".")}: ${err.message}`);
      });
    }
    throw new Error("Environment validation failed");
  }
}

export const env = parseEnv();

export type Env = z.infer<typeof envSchema>;

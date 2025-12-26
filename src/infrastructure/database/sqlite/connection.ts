import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { runMigrations } from "./migrations";
import { startSessionCleanup } from "./cleanup";

/**
 * SQLite database singleton
 * Initializes the database and runs migrations on first import
 */
class DatabaseConnection {
  private static instance: Database.Database | null = null;

  /**
   * Get the database instance (singleton pattern)
   */
  static getInstance(): Database.Database {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = DatabaseConnection.initialize();
    }
    return DatabaseConnection.instance;
  }

  /**
   * Initialize the database connection
   */
  private static initialize(): Database.Database {
    try {
      // Get database path from environment variable or use default
      const dbPath = process.env.DATABASE_PATH || "./data/database.sqlite";
      const absolutePath = path.resolve(process.cwd(), dbPath);
      const isProduction = process.env.NODE_ENV === "production";
      const isTest = process.env.NODE_ENV === "test";
      const isInMemory = dbPath === ":memory:";

      // Detect Next.js build phase (happens before actual runtime)
      const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";

      // Check if database already exists
      const dbExists = !isInMemory && fs.existsSync(absolutePath);

      // Ensure the data directory exists (skip for in-memory databases and production)
      if (!isInMemory && !isProduction) {
        const dataDir = path.dirname(absolutePath);
        if (!fs.existsSync(dataDir)) {
          fs.mkdirSync(dataDir, { recursive: true });
          console.log(`Created data directory: ${dataDir}`);
        }
      }

      console.log(`Connecting to SQLite database: ${absolutePath}`);
      if (isProduction && dbExists) {
        console.log("📦 Using pre-built database (production mode)");
      }

      // Create database connection
      // In production runtime or build phase, use readonly mode to prevent write attempts
      const useReadonly = (isProduction || isBuildPhase) && dbExists;

      const db = new Database(absolutePath, {
        verbose: process.env.NODE_ENV === "development" ? console.log : undefined,
        readonly: useReadonly,
      });

      // Enable foreign keys (readonly safe)
      db.pragma("foreign_keys = ON");

      // Only run migrations if:
      // 1. In development mode, OR
      // 2. Database doesn't exist yet, OR
      // 3. In test mode with in-memory database
      // Never run during Next.js build phase
      const shouldRunMigrations = !isBuildPhase && (!isProduction || !dbExists || (isTest && isInMemory));

      if (shouldRunMigrations) {
        console.log("🔄 Running migrations...");

        // Enable WAL mode for better concurrency (skip for in-memory and test mode)
        if (!isInMemory && !isTest) {
          db.pragma("journal_mode = WAL");
        }

        runMigrations(db);
      } else {
        console.log("⏭️  Skipping migrations (using pre-built database)");
      }

      // Start automatic session cleanup ONLY if:
      // 1. Not in test mode
      // 2. Not in build phase
      // 3. Database is NOT readonly (requires write access)
      if (!isTest && !isBuildPhase && !useReadonly) {
        console.log("🧹 Starting session cleanup...");
        startSessionCleanup(db);
      } else if (useReadonly) {
        console.log("⏭️  Skipping session cleanup (readonly database)");
      }

      console.log("✅ Database initialized successfully");

      return db;
    } catch (error) {
      console.error("❌ Failed to initialize database:", error);
      throw error;
    }
  }

  /**
   * Close the database connection
   * Should be called on application shutdown
   */
  static close(): void {
    if (DatabaseConnection.instance) {
      DatabaseConnection.instance.close();
      DatabaseConnection.instance = null;
      console.log("Database connection closed");
    }
  }

  /**
   * Override the database instance (for testing purposes only)
   * @param db Database instance to use
   */
  static setInstance(db: Database.Database): void {
    if (process.env.NODE_ENV !== "test") {
      throw new Error("setInstance() can only be called in test environment");
    }
    DatabaseConnection.instance = db;
  }

  /**
   * Reset the database instance (for testing purposes only)
   */
  static resetInstance(): void {
    if (process.env.NODE_ENV !== "test") {
      throw new Error("resetInstance() can only be called in test environment");
    }
    DatabaseConnection.instance = null;
  }
}

// Export the database instance
export const db = DatabaseConnection.getInstance();

// Export the class for testing purposes
export { DatabaseConnection };

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

      // Ensure the data directory exists (skip for in-memory databases)
      if (dbPath !== ":memory:") {
        const dataDir = path.dirname(absolutePath);
        if (!fs.existsSync(dataDir)) {
          fs.mkdirSync(dataDir, { recursive: true });
          console.log(`Created data directory: ${dataDir}`);
        }
      }

      console.log(`Connecting to SQLite database: ${absolutePath}`);

      // Create database connection
      const db = new Database(absolutePath, {
        verbose: process.env.NODE_ENV === "development" ? console.log : undefined,
      });

      // Enable WAL mode for better concurrency (skip for in-memory and test mode)
      if (dbPath !== ":memory:" && process.env.NODE_ENV !== "test") {
        db.pragma("journal_mode = WAL");
      }

      // Enable foreign keys (must be done before migrations)
      db.pragma("foreign_keys = ON");

      // Run migrations
      runMigrations(db);

      // Start automatic session cleanup (runs every hour) - skip in test mode
      if (process.env.NODE_ENV !== "test") {
        startSessionCleanup(db);
      }

      console.log("Database initialized successfully");

      return db;
    } catch (error) {
      console.error("Failed to initialize database:", error);
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
}

// Export the database instance
export const db = DatabaseConnection.getInstance();

// Export the class for testing purposes
export { DatabaseConnection };

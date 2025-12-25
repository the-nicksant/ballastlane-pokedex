import Database from "better-sqlite3";
import { runMigrations } from "@/infrastructure/database/sqlite/migrations";
import path from "path";
import fs from "fs";

/**
 * Create an in-memory test database
 * Each test gets a fresh database instance
 */
export function createTestDatabase(): Database.Database {
  // Create in-memory database
  const db = new Database(":memory:");

  // Enable foreign keys
  db.pragma("foreign_keys = ON");

  // Run migrations
  runMigrations(db);

  return db;
}

/**
 * Clean up test database
 */
export function cleanupTestDatabase(db: Database.Database): void {
  db.close();
}

/**
 * Create a test database file (for integration tests)
 */
export function createTestDatabaseFile(): {
  db: Database.Database;
  dbPath: string;
} {
  const dbPath = path.join(
    process.cwd(),
    "tests",
    `test-${Date.now()}.sqlite`
  );

  const db = new Database(dbPath);
  db.pragma("foreign_keys = ON");
  runMigrations(db);

  return { db, dbPath };
}

/**
 * Clean up test database file
 */
export function cleanupTestDatabaseFile(dbPath: string): void {
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }
  // Clean up WAL and SHM files
  if (fs.existsSync(`${dbPath}-wal`)) {
    fs.unlinkSync(`${dbPath}-wal`);
  }
  if (fs.existsSync(`${dbPath}-shm`)) {
    fs.unlinkSync(`${dbPath}-shm`);
  }
}

/**
 * Seed test user
 */
export function seedTestUser(
  db: Database.Database,
  username: string = "testuser",
  passwordHash: string = "$2a$10$test.hash.here" // Mock hash
): { id: number; username: string } {
  const result = db
    .prepare(
      "INSERT INTO users (username, password_hash) VALUES (?, ?)"
    )
    .run(username, passwordHash);

  return {
    id: Number(result.lastInsertRowid),
    username,
  };
}

/**
 * Clear all data from database (keep schema)
 */
export function clearDatabase(db: Database.Database): void {
  db.prepare("DELETE FROM sessions").run();
  db.prepare("DELETE FROM users").run();
}

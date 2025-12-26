/**
 * Build-time database initialization
 * Creates and seeds the database before deployment
 */
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { runMigrations } from "../src/infrastructure/database/sqlite/migrations";

async function buildDatabase() {
  console.log("🚀 Building production database...");

  const dbPath = path.resolve(process.cwd(), "./data/database.sqlite");
  const dataDir = path.dirname(dbPath);

  // Ensure data directory exists
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log(`✅ Created data directory: ${dataDir}`);
  }

  // Remove existing database
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log("🗑️  Removed existing database");
  }

  console.log(`📂 Creating database at: ${dbPath}`);

  // Create database
  const db = new Database(dbPath);

  // Enable WAL mode for better concurrency
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  // Run migrations (includes seeding)
  runMigrations(db);

  // Close database
  db.close();

  console.log("✅ Production database built successfully!");
  console.log(`📍 Database location: ${dbPath}`);

  // Get file size
  const stats = fs.statSync(dbPath);
  const fileSizeInKB = (stats.size / 1024).toFixed(2);
  console.log(`📊 Database size: ${fileSizeInKB} KB`);
}

buildDatabase().catch((error) => {
  console.error("❌ Failed to build database:", error);
  process.exit(1);
});

import Database from "better-sqlite3";
import { hashSync } from "bcryptjs";
import fs from "fs";
import path from "path";

/**
 * Run all pending migrations
 * @param db SQLite database instance
 */
export function runMigrations(db: Database.Database): void {
  // Create migrations table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    )
  `);

  // Get migrations directory (relative to this file)
  const migrationsDir = __dirname;

  // Get all migration files
  const migrationFiles = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  // Get applied migrations
  const appliedMigrations = db
    .prepare("SELECT name FROM migrations")
    .all() as { name: string }[];
  const appliedSet = new Set(appliedMigrations.map((m) => m.name));

  // Run pending migrations
  for (const file of migrationFiles) {
    if (!appliedSet.has(file)) {
      console.log(`Running migration: ${file}`);

      const migrationPath = path.join(migrationsDir, file);
      const migrationSQL = fs.readFileSync(migrationPath, "utf-8");

      // Run migration in a transaction
      const runMigration = db.transaction(() => {
        db.exec(migrationSQL);
        db.prepare("INSERT INTO migrations (name) VALUES (?)").run(file);
      });

      runMigration();

      // Seed admin user after initial migration
      if (file === "001_initial.sql") {
        seedAdminUser(db);
      }

      console.log(`Migration ${file} completed successfully`);
    }
  }

  console.log("All migrations completed");
}

/**
 * Seed admin user (username: admin, password: admin)
 * @param db SQLite database instance
 */
function seedAdminUser(db: Database.Database): void {
  const existingAdmin = db
    .prepare("SELECT id FROM users WHERE username = ?")
    .get("admin");

  if (!existingAdmin) {
    // Hash the password "admin" with bcrypt (salt rounds: 10)
    const passwordHash = hashSync("admin", 10);

    db.prepare(
      "INSERT INTO users (username, password_hash) VALUES (?, ?)"
    ).run("admin", passwordHash);

    console.log("Admin user created (username: admin, password: admin)");
  } else {
    console.log("Admin user already exists, skipping seed");
  }
}

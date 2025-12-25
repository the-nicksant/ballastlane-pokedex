#!/usr/bin/env tsx
/**
 * Database initialization script
 * Run with: pnpm tsx scripts/init-db.ts
 */

import { db } from "../src/infrastructure/database/sqlite/connection";

console.log("=== Database Initialization ===");
console.log("");

// Test database connection
try {
  const result = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
  console.log("✅ Database connected successfully");
  console.log(`✅ Found ${result.count} user(s) in database`);

  // Test admin user
  const adminUser = db.prepare("SELECT username FROM users WHERE username = ?").get("admin") as { username: string } | undefined;
  if (adminUser) {
    console.log("✅ Admin user exists");
  } else {
    console.log("⚠️  Admin user not found");
  }

  console.log("");
  console.log("Database initialization complete!");

  process.exit(0);
} catch (error) {
  console.error("❌ Database initialization failed:", error);
  process.exit(1);
}

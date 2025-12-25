import type Database from "better-sqlite3";

/**
 * Clean up expired sessions from the database
 * @param db SQLite database instance
 * @returns Number of sessions deleted
 */
export function cleanupExpiredSessions(db: Database.Database): number {
  const now = Math.floor(Date.now() / 1000); // Current timestamp in seconds

  const result = db
    .prepare("DELETE FROM sessions WHERE expires_at < ?")
    .run(now);

  const deletedCount = result.changes;

  if (deletedCount > 0) {
    console.log(`Cleaned up ${deletedCount} expired session(s)`);
  }

  return deletedCount;
}

/**
 * Start periodic session cleanup
 * Runs every hour by default
 * @param db SQLite database instance
 * @param intervalMs Cleanup interval in milliseconds (default: 1 hour)
 * @returns Interval ID for stopping the cleanup
 */
export function startSessionCleanup(
  db: Database.Database,
  intervalMs: number = 60 * 60 * 1000
): NodeJS.Timeout {
  // Run cleanup immediately
  cleanupExpiredSessions(db);

  // Schedule periodic cleanup
  const intervalId = setInterval(() => {
    cleanupExpiredSessions(db);
  }, intervalMs);

  console.log(
    `Session cleanup scheduled every ${intervalMs / 1000 / 60} minutes`
  );

  return intervalId;
}

/**
 * Delete all sessions for a specific user
 * Useful for "logout from all devices" functionality
 * @param db SQLite database instance
 * @param userId User ID
 * @returns Number of sessions deleted
 */
export function deleteUserSessions(
  db: Database.Database,
  userId: number
): number {
  const result = db.prepare("DELETE FROM sessions WHERE user_id = ?").run(userId);

  return result.changes;
}

/**
 * Delete a specific session
 * @param db SQLite database instance
 * @param sessionId Session ID
 * @returns true if session was deleted, false otherwise
 */
export function deleteSession(
  db: Database.Database,
  sessionId: string
): boolean {
  const result = db.prepare("DELETE FROM sessions WHERE id = ?").run(sessionId);

  return result.changes > 0;
}

import type Database from "better-sqlite3";
import type { UserRepository } from "@/core/domain/repositories/user.repository";
import type { User, Session } from "@/core/domain/entities/user.entity";
import { DatabaseConnection } from "../connection";

/**
 * SQLite implementation of UserRepository
 */
export class UserRepositoryImpl implements UserRepository {
  constructor(private database?: Database.Database) {}

  /**
   * Get the database instance (use provided or get from singleton)
   */
  private getDb(): Database.Database {
    return this.database || DatabaseConnection.getInstance();
  }

  /**
   * Find a user by username
   */
  findByUsername(username: string): User | null {
    const row = this.getDb()
      .prepare(
        `SELECT id, username, password_hash as passwordHash, created_at as createdAt, updated_at as updatedAt
         FROM users
         WHERE username = ?`
      )
      .get(username) as any;

    if (!row) {
      return null;
    }

    return this.mapRowToUser(row);
  }

  /**
   * Find a user by ID
   */
  findById(id: number): User | null {
    const row = this.getDb()
      .prepare(
        `SELECT id, username, password_hash as passwordHash, created_at as createdAt, updated_at as updatedAt
         FROM users
         WHERE id = ?`
      )
      .get(id) as any;

    if (!row) {
      return null;
    }

    return this.mapRowToUser(row);
  }

  /**
   * Create a new session
   */
  createSession(userId: number, sessionId: string, expiresAt: Date): Session {
    const expiresAtSeconds = Math.floor(expiresAt.getTime() / 1000);

    const result = this.getDb()
      .prepare(
        `INSERT INTO sessions (id, user_id, expires_at)
         VALUES (?, ?, ?)`
      )
      .run(sessionId, userId, expiresAtSeconds);

    if (result.changes === 0) {
      throw new Error("Failed to create session");
    }

    // Fetch the created session
    const session = this.findSessionById(sessionId);
    if (!session) {
      throw new Error("Session was created but could not be retrieved");
    }

    return session;
  }

  /**
   * Find a session by ID (and check if not expired)
   */
  findSessionById(sessionId: string): Session | null {
    const now = Math.floor(Date.now() / 1000);

    const row = this.getDb()
      .prepare(
        `SELECT id, user_id as userId, expires_at as expiresAt, created_at as createdAt
         FROM sessions
         WHERE id = ? AND expires_at > ?`
      )
      .get(sessionId, now) as any;

    if (!row) {
      return null;
    }

    return this.mapRowToSession(row);
  }

  /**
   * Delete a session by ID
   */
  deleteSession(sessionId: string): boolean {
    const result = this.getDb()
      .prepare(`DELETE FROM sessions WHERE id = ?`)
      .run(sessionId);

    return result.changes > 0;
  }

  /**
   * Delete all sessions for a user
   */
  deleteUserSessions(userId: number): number {
    const result = this.getDb()
      .prepare(`DELETE FROM sessions WHERE user_id = ?`)
      .run(userId);

    return result.changes;
  }

  /**
   * Map database row to User entity
   */
  private mapRowToUser(row: any): User {
    return {
      id: row.id,
      username: row.username,
      passwordHash: row.passwordHash,
      createdAt: new Date(row.createdAt * 1000),
      updatedAt: new Date(row.updatedAt * 1000),
    };
  }

  /**
   * Map database row to Session entity
   */
  private mapRowToSession(row: any): Session {
    return {
      id: row.id,
      userId: row.userId,
      expiresAt: new Date(row.expiresAt * 1000),
      createdAt: new Date(row.createdAt * 1000),
    };
  }
}

// Export singleton instance
export const userRepository = new UserRepositoryImpl();

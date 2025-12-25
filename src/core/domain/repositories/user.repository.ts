import type { User, Session } from "../entities/user.entity";

/**
 * User repository interface (port)
 * Defines contracts for user data access
 */
export interface UserRepository {
  /**
   * Find a user by username
   * @param username Username to search for
   * @returns User if found, null otherwise
   */
  findByUsername(username: string): User | null;

  /**
   * Find a user by ID
   * @param id User ID
   * @returns User if found, null otherwise
   */
  findById(id: number): User | null;

  /**
   * Create a new session
   * @param userId User ID
   * @param sessionId Session ID (JWT token ID)
   * @param expiresAt Session expiration timestamp
   * @returns Created session
   */
  createSession(userId: number, sessionId: string, expiresAt: Date): Session;

  /**
   * Find a session by ID
   * @param sessionId Session ID
   * @returns Session if found and not expired, null otherwise
   */
  findSessionById(sessionId: string): Session | null;

  /**
   * Delete a session by ID
   * @param sessionId Session ID
   * @returns true if deleted, false if not found
   */
  deleteSession(sessionId: string): boolean;

  /**
   * Delete all sessions for a user
   * @param userId User ID
   * @returns Number of sessions deleted
   */
  deleteUserSessions(userId: number): number;
}

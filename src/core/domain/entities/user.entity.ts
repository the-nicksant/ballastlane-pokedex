/**
 * User domain entity
 * Represents a user in the system
 */
export interface User {
  id: number;
  username: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User without sensitive data (for API responses)
 */
export type SafeUser = Omit<User, "passwordHash">;

/**
 * Session domain entity
 * Represents an active user session
 */
export interface Session {
  id: string;
  userId: number;
  expiresAt: Date;
  createdAt: Date;
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  username: string;
  password: string;
}

/**
 * Login result
 */
export interface LoginResult {
  user: SafeUser;
  sessionToken: string;
}

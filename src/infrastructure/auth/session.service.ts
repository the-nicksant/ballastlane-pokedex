import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { env } from "@/core/config/env";
import { AUTH_COOKIE_NAME } from "@/core/config/constants";

/**
 * JWT payload structure
 */
interface JWTPayload {
  userId: number;
  username: string;
  sessionId: string;
}

/**
 * Session service for JWT token management
 */
export class SessionService {
  /**
   * Get the JWT secret as Uint8Array (lazy initialization)
   */
  private static getSecret(): Uint8Array {
    return new TextEncoder().encode(env.JWT_SECRET);
  }

  /**
   * Create a new JWT session token
   * @param userId User ID
   * @param username Username
   * @param sessionId Unique session ID
   * @param expiresIn Duration (e.g., "7d", "1h")
   * @returns JWT token string
   */
  static async createToken(
    userId: number,
    username: string,
    sessionId: string,
    expiresIn: string = env.SESSION_DURATION
  ): Promise<string> {
    const token = await new SignJWT({
      userId,
      username,
      sessionId,
    } as Record<string, unknown>)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(expiresIn)
      .sign(this.getSecret());

    return token;
  }

  /**
   * Verify and decode a JWT token
   * @param token JWT token string
   * @returns Decoded payload if valid, null otherwise
   */
  static async verifyToken(token: string): Promise<JWTPayload | null> {
    try {
      const { payload } = await jwtVerify(token, this.getSecret());
      return payload as unknown as JWTPayload;
    } catch (error) {
      // Token is invalid or expired
      return null;
    }
  }

  /**
   * Set session cookie (HTTP-only, secure)
   * @param token JWT token
   * @param maxAge Cookie max age in seconds
   */
  static async setSessionCookie(
    token: string,
    maxAge: number = 7 * 24 * 60 * 60 // 7 days
  ): Promise<void> {
    const cookieStore = await cookies();

    cookieStore.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge,
      path: "/",
    });
  }

  /**
   * Get session cookie value
   * @returns Session token if exists, null otherwise
   */
  static async getSessionCookie(): Promise<string | null> {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(AUTH_COOKIE_NAME);
    return sessionCookie?.value || null;
  }

  /**
   * Delete session cookie
   */
  static async deleteSessionCookie(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(AUTH_COOKIE_NAME);
  }

  /**
   * Generate a unique session ID
   * @returns Random session ID
   */
  static generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Parse duration string to seconds
   * @param duration Duration string (e.g., "7d", "1h", "30m")
   * @returns Duration in seconds
   */
  static parseDuration(duration: string): number {
    const match = duration.match(/^(\d+)([dhms])$/);
    if (!match) {
      throw new Error(`Invalid duration format: ${duration}`);
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    const multipliers: Record<string, number> = {
      d: 24 * 60 * 60,
      h: 60 * 60,
      m: 60,
      s: 1,
    };

    return value * multipliers[unit];
  }
}

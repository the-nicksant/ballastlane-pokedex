import type { UserRepository } from "@/core/domain/repositories/user.repository";
import type { LoginCredentials, LoginResult } from "@/core/domain/entities/user.entity";
import { PasswordService } from "@/infrastructure/auth/password.service";
import { SessionService } from "@/infrastructure/auth/session.service";
import { Errors } from "@/lib/error-handler";
import { env } from "@/core/config/env";

/**
 * Login use case
 * Handles user authentication and session creation
 */
export class LoginUseCase {
  constructor(private userRepository: UserRepository) {}

  /**
   * Execute login
   * @param credentials Login credentials
   * @returns Login result with user and session token
   * @throws AppError if credentials are invalid
   */
  async execute(credentials: LoginCredentials): Promise<LoginResult> {
    // Find user by username
    const user = this.userRepository.findByUsername(credentials.username);

    if (!user) {
      throw Errors.Unauthorized("Invalid username or password");
    }

    // Verify password
    const isPasswordValid = PasswordService.verify(
      credentials.password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      throw Errors.Unauthorized("Invalid username or password");
    }

    // Generate session ID
    const sessionId = SessionService.generateSessionId();

    // Calculate expiration
    const expiresInSeconds = SessionService.parseDuration(env.SESSION_DURATION);
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

    // Create session in database
    this.userRepository.createSession(user.id, sessionId, expiresAt);

    // Create JWT token
    const sessionToken = await SessionService.createToken(
      user.id,
      user.username,
      sessionId,
      env.SESSION_DURATION
    );

    // Return safe user (without password hash) and token
    return {
      user: {
        id: user.id,
        username: user.username,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      sessionToken,
    };
  }
}

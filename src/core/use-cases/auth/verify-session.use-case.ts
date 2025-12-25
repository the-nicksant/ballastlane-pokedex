import type { UserRepository } from "@/core/domain/repositories/user.repository";
import type { SafeUser } from "@/core/domain/entities/user.entity";
import { SessionService } from "@/infrastructure/auth/session.service";

/**
 * Verify session use case
 * Validates session token and returns user data
 */
export class VerifySessionUseCase {
  constructor(private userRepository: UserRepository) {}

  /**
   * Execute session verification
   * @param sessionToken JWT session token
   * @returns User data if session is valid, null otherwise
   */
  async execute(sessionToken: string): Promise<SafeUser | null> {
    // Verify and decode token
    const payload = await SessionService.verifyToken(sessionToken);

    if (!payload) {
      return null;
    }

    // Check if session exists in database (for revocation support)
    const session = this.userRepository.findSessionById(payload.sessionId);

    if (!session) {
      // Session was deleted/revoked or expired
      return null;
    }

    // Get user from database
    const user = this.userRepository.findById(payload.userId);

    if (!user) {
      // User no longer exists
      return null;
    }

    // Return safe user (without password hash)
    return {
      id: user.id,
      username: user.username,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

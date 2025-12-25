import type { UserRepository } from "@/core/domain/repositories/user.repository";
import { SessionService } from "@/infrastructure/auth/session.service";

/**
 * Logout use case
 * Handles user logout and session cleanup
 */
export class LogoutUseCase {
  constructor(private userRepository: UserRepository) {}

  /**
   * Execute logout
   * @param sessionToken JWT session token
   * @returns true if logout successful
   */
  async execute(sessionToken: string): Promise<boolean> {
    // Verify and decode token
    const payload = await SessionService.verifyToken(sessionToken);

    if (!payload) {
      // Token is invalid, but we can still consider logout successful
      return true;
    }

    // Delete session from database
    this.userRepository.deleteSession(payload.sessionId);

    return true;
  }
}

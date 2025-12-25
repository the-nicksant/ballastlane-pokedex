import { NextRequest } from "next/server";
import { LogoutUseCase } from "@/core/use-cases/auth/logout.use-case";
import { userRepository } from "@/infrastructure/database/sqlite/repositories/user.repository.impl";
import { SessionService } from "@/infrastructure/auth/session.service";
import { successResponse, HTTP_STATUS } from "@/lib/api-response";
import { handleError } from "@/lib/error-handler";

/**
 * POST /api/auth/logout
 * Logout user and destroy session
 */
export async function POST(request: NextRequest) {
  try {
    // Get session token from cookie
    const sessionToken = await SessionService.getSessionCookie();

    if (sessionToken) {
      // Execute logout use case
      const logoutUseCase = new LogoutUseCase(userRepository);
      await logoutUseCase.execute(sessionToken);
    }

    // Delete session cookie
    await SessionService.deleteSessionCookie();

    // Return success response
    return successResponse(
      {
        message: "Logout successful",
      },
      HTTP_STATUS.OK
    );
  } catch (error) {
    return handleError(error);
  }
}

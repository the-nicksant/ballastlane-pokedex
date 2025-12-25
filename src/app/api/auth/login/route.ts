import { NextRequest } from "next/server";
import { z } from "zod";
import { LoginUseCase } from "@/core/use-cases/auth/login.use-case";
import { userRepository } from "@/infrastructure/database/sqlite/repositories/user.repository.impl";
import { SessionService } from "@/infrastructure/auth/session.service";
import {
  successResponse,
  errorResponse,
  HTTP_STATUS,
} from "@/lib/api-response";
import { handleError } from "@/lib/error-handler";
import {
  checkRateLimit,
  getClientIdentifier,
  RATE_LIMITS,
} from "@/lib/rate-limit";

/**
 * Login request schema
 */
const loginSchema = z.object({
  username: z.string().min(1, "Username is required").trim(),
  password: z.string().min(1, "Password is required"),
});

/**
 * POST /api/auth/login
 * Authenticate user and create session
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = getClientIdentifier(request);
    const rateLimit = checkRateLimit(identifier, RATE_LIMITS.LOGIN);

    if (!rateLimit.success) {
      return errorResponse(
        "Too many login attempts. Please try again later.",
        429,
        {
          retryAfter: Math.ceil(
            (rateLimit.resetAt - Date.now()) / 1000
          ),
        }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = loginSchema.parse(body);

    // Execute login use case
    const loginUseCase = new LoginUseCase(userRepository);
    const result = await loginUseCase.execute(validatedData);

    // Set session cookie
    const maxAge = SessionService.parseDuration(
      process.env.SESSION_DURATION || "7d"
    );
    await SessionService.setSessionCookie(result.sessionToken, maxAge);

    // Return success response
    return successResponse(
      {
        user: result.user,
        message: "Login successful",
      },
      HTTP_STATUS.OK
    );
  } catch (error) {
    return handleError(error);
  }
}

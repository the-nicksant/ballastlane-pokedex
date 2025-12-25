import { ZodError } from "zod";
import { errorResponse, HTTP_STATUS } from "./api-response";
import type { NextResponse } from "next/server";

/**
 * Custom application error class
 */
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    public details?: unknown
  ) {
    super(message);
    this.name = "AppError";
  }
}

/**
 * Handle errors and return appropriate API response
 * @param error The error object
 * @returns NextResponse with error details
 */
export function handleError(error: unknown): NextResponse {
  // Log error in development
  if (process.env.NODE_ENV === "development") {
    console.error("API Error:", error);
  }

  // Zod validation error
  if (error instanceof ZodError) {
    return errorResponse(
      "Validation failed",
      HTTP_STATUS.UNPROCESSABLE_ENTITY,
      error.issues.map((err) => ({
        path: err.path.join("."),
        message: err.message,
      }))
    );
  }

  // Custom application error
  if (error instanceof AppError) {
    return errorResponse(error.message, error.statusCode, error.details);
  }

  // Standard Error object
  if (error instanceof Error) {
    // Don't expose internal error messages in production
    const message =
      process.env.NODE_ENV === "development"
        ? error.message
        : "An unexpected error occurred";

    return errorResponse(message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }

  // Unknown error type
  return errorResponse(
    "An unexpected error occurred",
    HTTP_STATUS.INTERNAL_SERVER_ERROR
  );
}

/**
 * Create error instances for common scenarios
 */
export const Errors = {
  NotFound: (resource: string = "Resource") =>
    new AppError(`${resource} not found`, HTTP_STATUS.NOT_FOUND),

  Unauthorized: (message: string = "Unauthorized") =>
    new AppError(message, HTTP_STATUS.UNAUTHORIZED),

  Forbidden: (message: string = "Forbidden") =>
    new AppError(message, HTTP_STATUS.FORBIDDEN),

  BadRequest: (message: string = "Bad request") =>
    new AppError(message, HTTP_STATUS.BAD_REQUEST),

  Conflict: (message: string = "Conflict") =>
    new AppError(message, HTTP_STATUS.CONFLICT),

  Internal: (message: string = "Internal server error") =>
    new AppError(message, HTTP_STATUS.INTERNAL_SERVER_ERROR),
};

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { AUTH_COOKIE_NAME, APP_ROUTES } from "@/core/config/constants";

/**
 * Next.js Proxy for authentication (Next.js 16+)
 * Protects routes and handles redirects based on session state
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionCookie = request.cookies.get(AUTH_COOKIE_NAME);
  const sessionToken = sessionCookie?.value;

  const isAuthenticated = await verifySession(sessionToken);

  const isLoginPage = pathname === APP_ROUTES.LOGIN;
  const isProtectedRoute = pathname.startsWith("/(protected)") ||
                          (pathname !== APP_ROUTES.LOGIN && pathname !== "/api/auth/login");

  if (isLoginPage && isAuthenticated) {
    return NextResponse.redirect(new URL(APP_ROUTES.HOME, request.url));
  }

  if (isProtectedRoute && !isAuthenticated && !pathname.startsWith("/api")) {
    return NextResponse.redirect(new URL(APP_ROUTES.LOGIN, request.url));
  }

  return NextResponse.next();
}

/**
 * Verify JWT session token
 * @param token Session token from cookie
 * @returns true if valid, false otherwise
 */
async function verifySession(token: string | undefined): Promise<boolean> {
  if (!token) {
    return false;
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);

    await jwtVerify(token, secret);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Middleware matcher configuration
 * Specifies which routes the middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

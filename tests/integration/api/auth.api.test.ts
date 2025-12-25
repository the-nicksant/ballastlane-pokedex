import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { POST as loginRoute } from "@/app/api/auth/login/route";
import { POST as logoutRoute } from "@/app/api/auth/logout/route";
import { createTestDatabase, cleanupTestDatabase } from "../../helpers/database.helper";
import { getResponseBody } from "../../helpers/mock.helper";
import type Database from "better-sqlite3";

// Mock rate limiting to avoid test flakiness
vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn(() => ({ success: true })),
  getClientIdentifier: vi.fn(() => "test-client"),
  RATE_LIMITS: {
    LOGIN: { maxAttempts: 5, windowMs: 15 * 60 * 1000 },
  },
}));

describe("Authentication API Routes - Integration Tests", () => {
  let db: Database.Database;
  let cookieStore: Record<string, string>;

  beforeEach(() => {
    // Create fresh database for each test
    db = createTestDatabase();
    cookieStore = {};

    // Mock Next.js cookies
    vi.mock("next/headers", () => ({
      cookies: async () => ({
        get: (name: string) => {
          const value = cookieStore[name];
          return value ? { name, value } : undefined;
        },
        set: vi.fn((name: string, value: string, options?: any) => {
          cookieStore[name] = value;
        }),
        delete: vi.fn((name: string) => {
          delete cookieStore[name];
        }),
      }),
    }));
  });

  afterEach(() => {
    cleanupTestDatabase(db);
    vi.clearAllMocks();
  });

  describe("POST /api/auth/login", () => {
    describe("User Journey: Successful Login", () => {
      it("should authenticate user with valid credentials", async () => {
        // Given: Valid login credentials
        const requestBody = {
          username: "admin",
          password: "admin",
        };

        const request = new Request("http://localhost:3000/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        // When: User submits login form
        const response = await loginRoute(request as any);
        const body = await getResponseBody(response);

        // Then: Should return success response
        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.data.user).toBeDefined();
        expect(body.data.user.username).toBe("admin");
        expect(body.data.user.id).toBe(1);
        expect(body.data.message).toBe("Login successful");

        // And: User data should not contain sensitive information
        expect(body.data.user.passwordHash).toBeUndefined();

        // And: Session cookie should be set
        expect(cookieStore["session"]).toBeDefined();
        expect(cookieStore["session"].split(".")).toHaveLength(3); // JWT format
      });

      it("should create session in database on successful login", async () => {
        // Given: Valid credentials
        const requestBody = {
          username: "admin",
          password: "admin",
        };

        const request = new Request("http://localhost:3000/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        // When: User logs in
        await loginRoute(request as any);

        // Then: Session should exist in database
        const sessions = db.prepare("SELECT * FROM sessions WHERE user_id = 1").all();
        expect(sessions).toHaveLength(1);
        expect(sessions[0]).toHaveProperty("id");
        expect(sessions[0]).toHaveProperty("user_id", 1);
        expect(sessions[0]).toHaveProperty("expires_at");
      });
    });

    describe("User Journey: Failed Login Attempts", () => {
      it("should reject login with invalid username", async () => {
        // Given: Invalid username
        const requestBody = {
          username: "nonexistent",
          password: "admin",
        };

        const request = new Request("http://localhost:3000/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        // When: User submits login
        const response = await loginRoute(request as any);
        const body = await getResponseBody(response);

        // Then: Should return error response
        expect(response.status).toBe(401);
        expect(body.success).toBe(false);
        expect(body.error).toBeDefined();
        expect(body.error).toContain("Invalid username or password");

        // And: No session cookie should be set
        expect(cookieStore["session"]).toBeUndefined();

        // And: No session should be created in database
        const sessions = db.prepare("SELECT * FROM sessions").all();
        expect(sessions).toHaveLength(0);
      });

      it("should reject login with invalid password", async () => {
        // Given: Valid username but wrong password
        const requestBody = {
          username: "admin",
          password: "wrongpassword",
        };

        const request = new Request("http://localhost:3000/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        // When: User submits login
        const response = await loginRoute(request as any);
        const body = await getResponseBody(response);

        // Then: Should return error response
        expect(response.status).toBe(401);
        expect(body.success).toBe(false);
        expect(body.error).toContain("Invalid username or password");

        // And: No session should be created
        expect(cookieStore["session"]).toBeUndefined();
      });

      it("should validate empty username", async () => {
        // Given: Empty username
        const requestBody = {
          username: "",
          password: "admin",
        };

        const request = new Request("http://localhost:3000/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        // When: User submits login
        const response = await loginRoute(request as any);
        const body = await getResponseBody(response);

        // Then: Should return validation error
        expect(response.status).toBe(400);
        expect(body.success).toBe(false);
      });

      it("should validate empty password", async () => {
        // Given: Empty password
        const requestBody = {
          username: "admin",
          password: "",
        };

        const request = new Request("http://localhost:3000/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        // When: User submits login
        const response = await loginRoute(request as any);
        const body = await getResponseBody(response);

        // Then: Should return validation error
        expect(response.status).toBe(400);
        expect(body.success).toBe(false);
      });

      it("should reject malformed JSON", async () => {
        // Given: Malformed JSON body
        const request = new Request("http://localhost:3000/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: "invalid-json{",
        });

        // When: Request is sent
        const response = await loginRoute(request as any);
        const body = await getResponseBody(response);

        // Then: Should return error response
        expect(response.status).toBeGreaterThanOrEqual(400);
        expect(body.success).toBe(false);
      });
    });

    describe("User Journey: Multiple Sessions", () => {
      it("should allow multiple concurrent sessions for same user", async () => {
        // Given: Valid credentials
        const requestBody = {
          username: "admin",
          password: "admin",
        };

        // When: User logs in twice
        const request1 = new Request("http://localhost:3000/api/auth/login", {
          method: "POST",
          body: JSON.stringify(requestBody),
        });

        const request2 = new Request("http://localhost:3000/api/auth/login", {
          method: "POST",
          body: JSON.stringify(requestBody),
        });

        await loginRoute(request1 as any);
        await loginRoute(request2 as any);

        // Then: Both sessions should exist in database
        const sessions = db.prepare("SELECT * FROM sessions WHERE user_id = 1").all();
        expect(sessions).toHaveLength(2);
      });
    });
  });

  describe("POST /api/auth/logout", () => {
    describe("User Journey: Successful Logout", () => {
      it("should logout user and delete session", async () => {
        // Given: User is logged in
        const loginRequest = new Request("http://localhost:3000/api/auth/login", {
          method: "POST",
          body: JSON.stringify({
            username: "admin",
            password: "admin",
          }),
        });

        await loginRoute(loginRequest as any);

        // Verify session exists
        const sessionsBefore = db.prepare("SELECT * FROM sessions WHERE user_id = 1").all();
        expect(sessionsBefore).toHaveLength(1);
        expect(cookieStore["session"]).toBeDefined();

        // When: User logs out
        const logoutRequest = new Request("http://localhost:3000/api/auth/logout", {
          method: "POST",
        });

        const response = await logoutRoute(logoutRequest as any);
        const body = await getResponseBody(response);

        // Then: Should return success response
        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.data.message).toBe("Logout successful");

        // And: Session should be deleted from database
        const sessionsAfter = db.prepare("SELECT * FROM sessions WHERE user_id = 1").all();
        expect(sessionsAfter).toHaveLength(0);

        // And: Session cookie should be deleted
        expect(cookieStore["session"]).toBeUndefined();
      });
    });

    describe("User Journey: Logout without Session", () => {
      it("should handle logout when no session exists", async () => {
        // Given: No active session
        expect(cookieStore["session"]).toBeUndefined();

        // When: User attempts to logout
        const request = new Request("http://localhost:3000/api/auth/logout", {
          method: "POST",
        });

        const response = await logoutRoute(request as any);
        const body = await getResponseBody(response);

        // Then: Should still return success (idempotent)
        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.data.message).toBe("Logout successful");
      });
    });

    describe("User Journey: Multiple Session Management", () => {
      it("should only delete current session, not all user sessions", async () => {
        // Given: User has two sessions from different devices/browsers
        // First login
        const request1 = new Request("http://localhost:3000/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ username: "admin", password: "admin" }),
        });
        await loginRoute(request1 as any);
        const session1Token = cookieStore["session"];

        // Second login (simulating different device)
        const request2 = new Request("http://localhost:3000/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ username: "admin", password: "admin" }),
        });
        await loginRoute(request2 as any);

        // Verify two sessions exist
        const sessionsBefore = db.prepare("SELECT * FROM sessions WHERE user_id = 1").all();
        expect(sessionsBefore).toHaveLength(2);

        // When: User logs out from second device (current cookie)
        const logoutRequest = new Request("http://localhost:3000/api/auth/logout", {
          method: "POST",
        });
        await logoutRoute(logoutRequest as any);

        // Then: Only one session should remain
        const sessionsAfter = db.prepare("SELECT * FROM sessions WHERE user_id = 1").all();
        expect(sessionsAfter).toHaveLength(1);
      });
    });
  });

  describe("User Journey: Complete Authentication Flow", () => {
    it("should support login → verify session → logout flow", async () => {
      // Step 1: Login
      const loginRequest = new Request("http://localhost:3000/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          username: "admin",
          password: "admin",
        }),
      });

      const loginResponse = await loginRoute(loginRequest as any);
      const loginBody = await getResponseBody(loginResponse);

      expect(loginResponse.status).toBe(200);
      expect(loginBody.success).toBe(true);
      expect(cookieStore["session"]).toBeDefined();

      // Step 2: Verify session exists in database
      const sessions = db.prepare("SELECT * FROM sessions WHERE user_id = 1").all();
      expect(sessions).toHaveLength(1);

      // Step 3: Logout
      const logoutRequest = new Request("http://localhost:3000/api/auth/logout", {
        method: "POST",
      });

      const logoutResponse = await logoutRoute(logoutRequest as any);
      const logoutBody = await getResponseBody(logoutResponse);

      expect(logoutResponse.status).toBe(200);
      expect(logoutBody.success).toBe(true);

      // Step 4: Verify session is deleted
      const sessionsAfter = db.prepare("SELECT * FROM sessions WHERE user_id = 1").all();
      expect(sessionsAfter).toHaveLength(0);
      expect(cookieStore["session"]).toBeUndefined();
    });
  });
});

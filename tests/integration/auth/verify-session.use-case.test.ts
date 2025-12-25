import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { VerifySessionUseCase } from "@/core/use-cases/auth/verify-session.use-case";
import { LoginUseCase } from "@/core/use-cases/auth/login.use-case";
import { LogoutUseCase } from "@/core/use-cases/auth/logout.use-case";
import { UserRepositoryImpl } from "@/infrastructure/database/sqlite/repositories/user.repository.impl";
import { createTestDatabase, cleanupTestDatabase } from "../../helpers/database.helper";
import type Database from "better-sqlite3";

describe("VerifySessionUseCase - Integration Tests", () => {
  let db: Database.Database;
  let userRepository: UserRepositoryImpl;
  let verifySessionUseCase: VerifySessionUseCase;
  let loginUseCase: LoginUseCase;
  let logoutUseCase: LogoutUseCase;

  beforeEach(() => {
    // Create fresh database for each test
    db = createTestDatabase();
    userRepository = new UserRepositoryImpl(db);
    verifySessionUseCase = new VerifySessionUseCase(userRepository);
    loginUseCase = new LoginUseCase(userRepository);
    logoutUseCase = new LogoutUseCase(userRepository);
  });

  afterEach(() => {
    cleanupTestDatabase(db);
  });

  describe("User Journey: Valid Session Verification", () => {
    it("should return user data for valid session token", async () => {
      // Given: User is logged in with active session
      const credentials = {
        username: "admin",
        password: "admin",
      };
      const loginResult = await loginUseCase.execute(credentials);
      const sessionToken = loginResult.sessionToken;

      // When: Session is verified
      const result = await verifySessionUseCase.execute(sessionToken);

      // Then: Should return user data
      expect(result).toBeDefined();
      expect(result?.id).toBe(loginResult.user.id);
      expect(result?.username).toBe("admin");
      expect(result?.createdAt).toBeDefined();
      expect(result?.updatedAt).toBeDefined();

      // And: Should not include password hash
      expect(result).not.toHaveProperty("passwordHash");
    });

    it("should verify same user across multiple sessions", async () => {
      // Given: User has multiple active sessions
      const credentials = {
        username: "admin",
        password: "admin",
      };
      const session1 = await loginUseCase.execute(credentials);
      const session2 = await loginUseCase.execute(credentials);

      // When: Both sessions are verified
      const user1 = await verifySessionUseCase.execute(session1.sessionToken);
      const user2 = await verifySessionUseCase.execute(session2.sessionToken);

      // Then: Both should return same user data
      expect(user1?.id).toBe(user2?.id);
      expect(user1?.username).toBe(user2?.username);
      expect(user1?.username).toBe("admin");
    });
  });

  describe("User Journey: Invalid Session Verification", () => {
    it("should return null for invalid token", async () => {
      // Given: Invalid session token
      const invalidToken = "invalid.jwt.token";

      // When: Token is verified
      const result = await verifySessionUseCase.execute(invalidToken);

      // Then: Should return null
      expect(result).toBeNull();
    });

    it("should return null for malformed token", async () => {
      // Given: Malformed token (not enough parts)
      const malformedToken = "malformed.token";

      // When: Token is verified
      const result = await verifySessionUseCase.execute(malformedToken);

      // Then: Should return null
      expect(result).toBeNull();
    });

    it("should return null for empty token", async () => {
      // Given: Empty token
      const emptyToken = "";

      // When: Token is verified
      const result = await verifySessionUseCase.execute(emptyToken);

      // Then: Should return null
      expect(result).toBeNull();
    });
  });

  describe("User Journey: Revoked Session Verification", () => {
    it("should return null for logged out session", async () => {
      // Given: User logs in and then logs out
      const credentials = {
        username: "admin",
        password: "admin",
      };
      const loginResult = await loginUseCase.execute(credentials);
      const sessionToken = loginResult.sessionToken;

      // And: User logs out
      await logoutUseCase.execute(sessionToken);

      // When: Attempting to verify logged out session
      const result = await verifySessionUseCase.execute(sessionToken);

      // Then: Should return null (session revoked)
      expect(result).toBeNull();
    });

    it("should return null when session is manually deleted", async () => {
      // Given: User is logged in
      const credentials = {
        username: "admin",
        password: "admin",
      };
      const loginResult = await loginUseCase.execute(credentials);
      const sessionToken = loginResult.sessionToken;

      // And: Session is manually deleted from database
      db.prepare("DELETE FROM sessions WHERE user_id = ?").run(
        loginResult.user.id
      );

      // When: Attempting to verify deleted session
      const result = await verifySessionUseCase.execute(sessionToken);

      // Then: Should return null
      expect(result).toBeNull();
    });
  });

  describe("User Journey: Deleted User Verification", () => {
    it("should return null when user is deleted", async () => {
      // Given: User is logged in
      const credentials = {
        username: "admin",
        password: "admin",
      };
      const loginResult = await loginUseCase.execute(credentials);
      const sessionToken = loginResult.sessionToken;

      // And: User is deleted from database (cascade should delete sessions)
      db.prepare("DELETE FROM users WHERE id = ?").run(loginResult.user.id);

      // When: Attempting to verify session after user deletion
      const result = await verifySessionUseCase.execute(sessionToken);

      // Then: Should return null
      expect(result).toBeNull();
    });
  });

  describe("User Journey: Session Persistence", () => {
    it("should verify session immediately after login", async () => {
      // Given: User just logged in
      const credentials = {
        username: "admin",
        password: "admin",
      };
      const loginResult = await loginUseCase.execute(credentials);

      // When: Session is verified immediately
      const result = await verifySessionUseCase.execute(
        loginResult.sessionToken
      );

      // Then: Should return valid user data
      expect(result).toBeDefined();
      expect(result?.username).toBe("admin");
    });

    it("should continue to verify session across multiple checks", async () => {
      // Given: User is logged in
      const credentials = {
        username: "admin",
        password: "admin",
      };
      const loginResult = await loginUseCase.execute(credentials);
      const sessionToken = loginResult.sessionToken;

      // When: Session is verified multiple times
      const check1 = await verifySessionUseCase.execute(sessionToken);
      const check2 = await verifySessionUseCase.execute(sessionToken);
      const check3 = await verifySessionUseCase.execute(sessionToken);

      // Then: All checks should return same user data
      expect(check1?.id).toBe(check2?.id);
      expect(check2?.id).toBe(check3?.id);
      expect(check1?.username).toBe("admin");
    });
  });
});

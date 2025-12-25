import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { LogoutUseCase } from "@/core/use-cases/auth/logout.use-case";
import { LoginUseCase } from "@/core/use-cases/auth/login.use-case";
import { UserRepositoryImpl } from "@/infrastructure/database/sqlite/repositories/user.repository.impl";
import { createTestDatabase, cleanupTestDatabase } from "../../helpers/database.helper";
import type Database from "better-sqlite3";

describe("LogoutUseCase - Integration Tests", () => {
  let db: Database.Database;
  let userRepository: UserRepositoryImpl;
  let logoutUseCase: LogoutUseCase;
  let loginUseCase: LoginUseCase;

  beforeEach(() => {
    // Create fresh database for each test
    db = createTestDatabase();
    userRepository = new UserRepositoryImpl(db);
    logoutUseCase = new LogoutUseCase(userRepository);
    loginUseCase = new LoginUseCase(userRepository);
  });

  afterEach(() => {
    cleanupTestDatabase(db);
  });

  describe("User Journey: Successful Logout", () => {
    it("should delete session from database when user logs out", async () => {
      // Given: User is logged in with active session
      const credentials = {
        username: "admin",
        password: "admin",
      };
      const loginResult = await loginUseCase.execute(credentials);
      const sessionToken = loginResult.sessionToken;

      // Verify session exists before logout
      const sessionsBefore = db
        .prepare("SELECT * FROM sessions WHERE user_id = ?")
        .all(loginResult.user.id);
      expect(sessionsBefore).toHaveLength(1);

      // When: User logs out
      const result = await logoutUseCase.execute(sessionToken);

      // Then: Logout should succeed
      expect(result).toBe(true);

      // And: Session should be deleted from database
      const sessionsAfter = db
        .prepare("SELECT * FROM sessions WHERE user_id = ?")
        .all(loginResult.user.id);
      expect(sessionsAfter).toHaveLength(0);
    });

    it("should handle logout with multiple sessions correctly", async () => {
      // Given: User has two active sessions
      const credentials = {
        username: "admin",
        password: "admin",
      };
      const session1 = await loginUseCase.execute(credentials);
      const session2 = await loginUseCase.execute(credentials);

      // Verify both sessions exist
      const sessionsBefore = db
        .prepare("SELECT * FROM sessions WHERE user_id = ?")
        .all(session1.user.id);
      expect(sessionsBefore).toHaveLength(2);

      // When: User logs out from first session
      await logoutUseCase.execute(session1.sessionToken);

      // Then: Only first session should be deleted
      const sessionsAfter = db
        .prepare("SELECT * FROM sessions WHERE user_id = ?")
        .all(session1.user.id);
      expect(sessionsAfter).toHaveLength(1);

      // And: Second session should still be active
      const remainingSession = sessionsAfter[0];
      expect(remainingSession).toBeDefined();
    });
  });

  describe("User Journey: Logout with Invalid Token", () => {
    it("should handle logout with invalid token gracefully", async () => {
      // Given: Invalid session token
      const invalidToken = "invalid.jwt.token";

      // When: User attempts to logout with invalid token
      const result = await logoutUseCase.execute(invalidToken);

      // Then: Should still return success (idempotent operation)
      expect(result).toBe(true);

      // And: No sessions should exist in database
      const sessions = db.prepare("SELECT * FROM sessions").all();
      expect(sessions).toHaveLength(0);
    });

    it("should handle logout with expired token gracefully", async () => {
      // Given: User creates a session
      const credentials = {
        username: "admin",
        password: "admin",
      };
      const loginResult = await loginUseCase.execute(credentials);

      // And: Session is manually deleted (simulating expiration)
      db.prepare("DELETE FROM sessions WHERE user_id = ?").run(
        loginResult.user.id
      );

      // When: User attempts to logout with token from deleted session
      const result = await logoutUseCase.execute(loginResult.sessionToken);

      // Then: Should still return success
      expect(result).toBe(true);

      // And: No sessions should exist
      const sessions = db
        .prepare("SELECT * FROM sessions WHERE user_id = ?")
        .all(loginResult.user.id);
      expect(sessions).toHaveLength(0);
    });
  });

  describe("User Journey: Logout Idempotency", () => {
    it("should allow multiple logout calls with same token", async () => {
      // Given: User is logged in
      const credentials = {
        username: "admin",
        password: "admin",
      };
      const loginResult = await loginUseCase.execute(credentials);
      const sessionToken = loginResult.sessionToken;

      // When: User logs out twice with same token
      const result1 = await logoutUseCase.execute(sessionToken);
      const result2 = await logoutUseCase.execute(sessionToken);

      // Then: Both logout attempts should succeed
      expect(result1).toBe(true);
      expect(result2).toBe(true);

      // And: No sessions should exist
      const sessions = db
        .prepare("SELECT * FROM sessions WHERE user_id = ?")
        .all(loginResult.user.id);
      expect(sessions).toHaveLength(0);
    });
  });
});

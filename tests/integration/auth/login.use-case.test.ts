import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { LoginUseCase } from "@/core/use-cases/auth/login.use-case";
import { UserRepositoryImpl } from "@/infrastructure/database/sqlite/repositories/user.repository.impl";
import { PasswordService } from "@/infrastructure/auth/password.service";
import { createTestDatabase, cleanupTestDatabase } from "../../helpers/database.helper";
import type Database from "better-sqlite3";
import { Errors } from "@/lib/error-handler";

describe("LoginUseCase - Integration Tests", () => {
  let db: Database.Database;
  let userRepository: UserRepositoryImpl;
  let loginUseCase: LoginUseCase;

  beforeEach(() => {
    // Create fresh database for each test
    db = createTestDatabase();
    userRepository = new UserRepositoryImpl(db);
    loginUseCase = new LoginUseCase(userRepository);
  });

  afterEach(() => {
    cleanupTestDatabase(db);
  });

  describe("User Journey: Successful Login", () => {
    it("should authenticate user with correct credentials and create session", async () => {
      // Given: Admin user exists (seeded by migration)
      const credentials = {
        username: "admin",
        password: "admin",
      };

      // When: User attempts to login
      const result = await loginUseCase.execute(credentials);

      // Then: Login should succeed
      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.username).toBe("admin");
      expect(result.user.id).toBe(1);
      expect(result.sessionToken).toBeDefined();
      expect(typeof result.sessionToken).toBe("string");

      // And: User object should not contain password hash
      expect(result.user).not.toHaveProperty("passwordHash");

      // And: Session should be created in database
      const sessions = db
        .prepare("SELECT * FROM sessions WHERE user_id = ?")
        .all(result.user.id);
      expect(sessions).toHaveLength(1);
    });

    it("should create valid JWT token with user information", async () => {
      // Given: Valid credentials
      const credentials = {
        username: "admin",
        password: "admin",
      };

      // When: User logs in
      const result = await loginUseCase.execute(credentials);

      // Then: Token should be a JWT (3 parts separated by dots)
      const tokenParts = result.sessionToken.split(".");
      expect(tokenParts).toHaveLength(3);

      // And: Token should be non-empty
      expect(result.sessionToken.length).toBeGreaterThan(50);
    });
  });

  describe("User Journey: Failed Login Attempts", () => {
    it("should reject login with invalid username", async () => {
      // Given: Invalid username
      const credentials = {
        username: "nonexistent",
        password: "admin",
      };

      // When: User attempts to login
      // Then: Should throw Unauthorized error
      await expect(loginUseCase.execute(credentials)).rejects.toThrow(
        "Invalid username or password"
      );

      // And: No session should be created
      const sessions = db.prepare("SELECT * FROM sessions").all();
      expect(sessions).toHaveLength(0);
    });

    it("should reject login with invalid password", async () => {
      // Given: Correct username but wrong password
      const credentials = {
        username: "admin",
        password: "wrongpassword",
      };

      // When: User attempts to login
      // Then: Should throw Unauthorized error
      await expect(loginUseCase.execute(credentials)).rejects.toThrow(
        "Invalid username or password"
      );

      // And: No session should be created
      const sessions = db.prepare("SELECT * FROM sessions").all();
      expect(sessions).toHaveLength(0);
    });

    it("should reject login with empty username", async () => {
      // Given: Empty username
      const credentials = {
        username: "",
        password: "admin",
      };

      // When: User attempts to login
      // Then: Should throw error
      await expect(loginUseCase.execute(credentials)).rejects.toThrow();
    });

    it("should reject login with empty password", async () => {
      // Given: Empty password
      const credentials = {
        username: "admin",
        password: "",
      };

      // When: User attempts to login
      // Then: Should throw error
      await expect(loginUseCase.execute(credentials)).rejects.toThrow();
    });
  });

  describe("User Journey: Multiple Login Sessions", () => {
    it("should allow same user to have multiple active sessions", async () => {
      // Given: Valid credentials
      const credentials = {
        username: "admin",
        password: "admin",
      };

      // When: User logs in twice
      const result1 = await loginUseCase.execute(credentials);
      const result2 = await loginUseCase.execute(credentials);

      // Then: Both sessions should be created
      expect(result1.sessionToken).toBeDefined();
      expect(result2.sessionToken).toBeDefined();
      expect(result1.sessionToken).not.toBe(result2.sessionToken);

      // And: Database should have 2 sessions for this user
      const sessions = db
        .prepare("SELECT * FROM sessions WHERE user_id = ?")
        .all(result1.user.id);
      expect(sessions).toHaveLength(2);
    });
  });

  describe("User Journey: Case Sensitivity", () => {
    it("should handle username case correctly", async () => {
      // Given: Username in different case
      const credentials = {
        username: "ADMIN", // Uppercase
        password: "admin",
      };

      // When: User attempts to login
      // Then: Should fail (case sensitive)
      await expect(loginUseCase.execute(credentials)).rejects.toThrow();
    });
  });
});

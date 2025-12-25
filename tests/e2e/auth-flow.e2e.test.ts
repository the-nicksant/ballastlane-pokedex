import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { LoginUseCase } from "@/core/use-cases/auth/login.use-case";
import { LogoutUseCase } from "@/core/use-cases/auth/logout.use-case";
import { VerifySessionUseCase } from "@/core/use-cases/auth/verify-session.use-case";
import { UserRepositoryImpl } from "@/infrastructure/database/sqlite/repositories/user.repository.impl";
import { createTestDatabase, cleanupTestDatabase } from "../helpers/database.helper";
import type Database from "better-sqlite3";

describe("Authentication Flow - End-to-End Tests", () => {
  let db: Database.Database;
  let userRepository: UserRepositoryImpl;
  let loginUseCase: LoginUseCase;
  let logoutUseCase: LogoutUseCase;
  let verifySessionUseCase: VerifySessionUseCase;

  beforeEach(() => {
    // Create fresh database for each test
    db = createTestDatabase();
    userRepository = new UserRepositoryImpl(db);
    loginUseCase = new LoginUseCase(userRepository);
    logoutUseCase = new LogoutUseCase(userRepository);
    verifySessionUseCase = new VerifySessionUseCase(userRepository);
  });

  afterEach(() => {
    cleanupTestDatabase(db);
  });

  describe("Complete User Journey: Guest → Authenticated → Logout", () => {
    it("should complete full authentication lifecycle", async () => {
      // ===== SCENARIO: New user visits the application =====

      // Step 1: User is not authenticated
      // When: User tries to access protected content without session
      const noSessionResult = await verifySessionUseCase.execute("invalid-token");

      // Then: Access should be denied
      expect(noSessionResult).toBeNull();

      // ===== SCENARIO: User attempts to login =====

      // Step 2: User submits login form
      // Given: User has valid credentials
      const credentials = {
        username: "admin",
        password: "admin",
      };

      // When: User submits login form
      const loginResult = await loginUseCase.execute(credentials);

      // Then: Login should succeed
      expect(loginResult).toBeDefined();
      expect(loginResult.user.username).toBe("admin");
      expect(loginResult.sessionToken).toBeDefined();

      // And: Session should be created in database
      const sessionsAfterLogin = db
        .prepare("SELECT * FROM sessions WHERE user_id = ?")
        .all(loginResult.user.id);
      expect(sessionsAfterLogin).toHaveLength(1);

      // ===== SCENARIO: Authenticated user accesses protected resources =====

      // Step 3: User navigates to protected page
      // When: Application verifies user's session token
      const verifyResult = await verifySessionUseCase.execute(
        loginResult.sessionToken
      );

      // Then: Session should be valid
      expect(verifyResult).toBeDefined();
      expect(verifyResult?.username).toBe("admin");
      expect(verifyResult?.id).toBe(loginResult.user.id);

      // And: User can access protected content (session is still in database)
      const sessionsBeforeLogout = db
        .prepare("SELECT * FROM sessions WHERE user_id = ?")
        .all(loginResult.user.id);
      expect(sessionsBeforeLogout).toHaveLength(1);

      // ===== SCENARIO: User decides to logout =====

      // Step 4: User clicks logout button
      // When: Logout is triggered
      const logoutResult = await logoutUseCase.execute(loginResult.sessionToken);

      // Then: Logout should succeed
      expect(logoutResult).toBe(true);

      // And: Session should be deleted from database
      const sessionsAfterLogout = db
        .prepare("SELECT * FROM sessions WHERE user_id = ?")
        .all(loginResult.user.id);
      expect(sessionsAfterLogout).toHaveLength(0);

      // ===== SCENARIO: User tries to access protected content after logout =====

      // Step 5: User tries to access protected page with old token
      // When: Application attempts to verify old session
      const verifyAfterLogout = await verifySessionUseCase.execute(
        loginResult.sessionToken
      );

      // Then: Session should be invalid (revoked)
      expect(verifyAfterLogout).toBeNull();

      // And: User should be redirected to login page (in real app)
      // This demonstrates the session is completely invalidated
    });
  });

  describe("User Journey: Failed Login Attempts → Success", () => {
    it("should handle failed attempts before successful login", async () => {
      // Scenario: User makes mistakes before logging in successfully

      // Attempt 1: Wrong password
      const wrongPasswordAttempt = loginUseCase.execute({
        username: "admin",
        password: "wrongpassword",
      });

      await expect(wrongPasswordAttempt).rejects.toThrow(
        "Invalid username or password"
      );

      // Verify no session was created
      let sessions = db.prepare("SELECT * FROM sessions").all();
      expect(sessions).toHaveLength(0);

      // Attempt 2: Wrong username
      const wrongUsernameAttempt = loginUseCase.execute({
        username: "wronguser",
        password: "admin",
      });

      await expect(wrongUsernameAttempt).rejects.toThrow(
        "Invalid username or password"
      );

      // Verify still no session
      sessions = db.prepare("SELECT * FROM sessions").all();
      expect(sessions).toHaveLength(0);

      // Attempt 3: Correct credentials
      const successfulLogin = await loginUseCase.execute({
        username: "admin",
        password: "admin",
      });

      expect(successfulLogin.user.username).toBe("admin");
      expect(successfulLogin.sessionToken).toBeDefined();

      // Verify session was created
      sessions = db.prepare("SELECT * FROM sessions WHERE user_id = 1").all();
      expect(sessions).toHaveLength(1);
    });
  });

  describe("User Journey: Multi-Device Sessions", () => {
    it("should support logging in from multiple devices", async () => {
      // Scenario: User logs in from laptop and phone simultaneously

      const credentials = {
        username: "admin",
        password: "admin",
      };

      // Step 1: User logs in from laptop
      const laptopSession = await loginUseCase.execute(credentials);

      // Step 2: User logs in from phone
      const phoneSession = await loginUseCase.execute(credentials);

      // Then: Both sessions should be valid and independent
      expect(laptopSession.sessionToken).not.toBe(phoneSession.sessionToken);

      // And: Both sessions exist in database
      const sessions = db
        .prepare("SELECT * FROM sessions WHERE user_id = ?")
        .all(laptopSession.user.id);
      expect(sessions).toHaveLength(2);

      // Step 3: Verify both sessions work
      const laptopVerify = await verifySessionUseCase.execute(
        laptopSession.sessionToken
      );
      const phoneVerify = await verifySessionUseCase.execute(
        phoneSession.sessionToken
      );

      expect(laptopVerify?.username).toBe("admin");
      expect(phoneVerify?.username).toBe("admin");

      // Step 4: User logs out from phone
      await logoutUseCase.execute(phoneSession.sessionToken);

      // Then: Laptop session should still work
      const laptopVerifyAfter = await verifySessionUseCase.execute(
        laptopSession.sessionToken
      );
      expect(laptopVerifyAfter?.username).toBe("admin");

      // But phone session should be invalid
      const phoneVerifyAfter = await verifySessionUseCase.execute(
        phoneSession.sessionToken
      );
      expect(phoneVerifyAfter).toBeNull();

      // And: Only one session remains in database
      const remainingSessions = db
        .prepare("SELECT * FROM sessions WHERE user_id = ?")
        .all(laptopSession.user.id);
      expect(remainingSessions).toHaveLength(1);
    });
  });

  describe("User Journey: Session Persistence", () => {
    it("should maintain session across multiple page navigations", async () => {
      // Scenario: User logs in and navigates through multiple protected pages

      // Step 1: User logs in
      const loginResult = await loginUseCase.execute({
        username: "admin",
        password: "admin",
      });

      const sessionToken = loginResult.sessionToken;

      // Step 2: User navigates to Pokemon list page
      const pokemonListVerify = await verifySessionUseCase.execute(sessionToken);
      expect(pokemonListVerify?.username).toBe("admin");

      // Step 3: User navigates to Pokemon detail page
      const pokemonDetailVerify = await verifySessionUseCase.execute(sessionToken);
      expect(pokemonDetailVerify?.username).toBe("admin");

      // Step 4: User navigates to search page
      const searchPageVerify = await verifySessionUseCase.execute(sessionToken);
      expect(searchPageVerify?.username).toBe("admin");

      // Then: Session should remain valid throughout navigation
      // And: Session should still exist in database
      const sessions = db
        .prepare("SELECT * FROM sessions WHERE user_id = ?")
        .all(loginResult.user.id);
      expect(sessions).toHaveLength(1);
    });
  });

  describe("User Journey: Security - Session Revocation", () => {
    it("should immediately invalidate session on logout", async () => {
      // Scenario: Ensure logged out sessions cannot be reused

      // Step 1: User logs in
      const loginResult = await loginUseCase.execute({
        username: "admin",
        password: "admin",
      });

      const sessionToken = loginResult.sessionToken;

      // Step 2: Verify session works
      const verifyBefore = await verifySessionUseCase.execute(sessionToken);
      expect(verifyBefore).toBeDefined();

      // Step 3: User logs out
      await logoutUseCase.execute(sessionToken);

      // Step 4: Attacker tries to reuse old session token
      const verifyAfter = await verifySessionUseCase.execute(sessionToken);

      // Then: Old session token should be completely invalid
      expect(verifyAfter).toBeNull();

      // And: Session should not exist in database
      const sessions = db
        .prepare("SELECT * FROM sessions WHERE user_id = ?")
        .all(loginResult.user.id);
      expect(sessions).toHaveLength(0);
    });

    it("should not expose sensitive user data", async () => {
      // Scenario: Ensure password hash is never exposed to client

      // When: User logs in
      const loginResult = await loginUseCase.execute({
        username: "admin",
        password: "admin",
      });

      // Then: User object should not contain password hash
      expect(loginResult.user).not.toHaveProperty("passwordHash");
      expect(loginResult.user).not.toHaveProperty("password");

      // When: Session is verified
      const verifyResult = await verifySessionUseCase.execute(
        loginResult.sessionToken
      );

      // Then: Verified user should not contain password hash
      expect(verifyResult).not.toHaveProperty("passwordHash");
      expect(verifyResult).not.toHaveProperty("password");
    });
  });
});

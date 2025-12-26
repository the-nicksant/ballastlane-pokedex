/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "@/features/auth/components/login-form";

// Mock next/navigation
const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

// Mock the auth API service
vi.mock("@/features/auth/services/auth-api.service", () => ({
  authApiService: {
    login: vi.fn(),
  },
}));

import { authApiService } from "@/features/auth/services/auth-api.service";

describe("Authentication Flow - E2E User Journey Tests", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  describe("User Journey: Successful Login", () => {
    it("should allow user to login with valid credentials", async () => {
      const user = userEvent.setup();

      // Mock successful login response
      vi.mocked(authApiService.login).mockResolvedValueOnce({
        success: true,
        data: {
          user: {
            id: 1,
            username: "admin",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      });

      // Render the login form
      render(<LoginForm />);

      // User sees the login form
      expect(screen.getByText("Pokédex Login")).toBeInTheDocument();
      expect(screen.getByText("Gotta catch 'em all!")).toBeInTheDocument();

      // User types their username
      const usernameInput = screen.getByLabelText(/username/i);
      await user.type(usernameInput, "admin");

      // User types their password
      const passwordInput = screen.getByLabelText(/password/i);
      await user.type(passwordInput, "admin");

      // User clicks the login button
      const submitButton = screen.getByRole("button", { name: /start adventure/i });
      await user.click(submitButton);

      // Wait for the API call to complete
      await waitFor(() => {
        expect(authApiService.login).toHaveBeenCalledWith({
          username: "admin",
          password: "admin",
        });
      });

      // User is redirected to home page
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/");
        expect(mockRefresh).toHaveBeenCalled();
      });
    });

    it("should show loading state while logging in", async () => {
      const user = userEvent.setup();

      // Mock slow login response
      vi.mocked(authApiService.login).mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  success: true,
                  data: {
                    user: {
                      id: 1,
                      username: "admin",
                      createdAt: new Date(),
                      updatedAt: new Date(),
                    },
                  },
                }),
              100
            )
          )
      );

      render(<LoginForm />);

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /start adventure/i });

      await user.type(usernameInput, "admin");
      await user.type(passwordInput, "admin");
      await user.click(submitButton);

      // Button should show loading state
      expect(screen.getByRole("button", { name: /logging in/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /logging in/i })).toBeDisabled();

      // Wait for login to complete
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled();
      });
    });
  });

  describe("User Journey: Failed Login Attempts", () => {
    it("should show error message when username is invalid", async () => {
      const user = userEvent.setup();

      // Mock failed login response
      vi.mocked(authApiService.login).mockResolvedValueOnce({
        success: false,
        error: "Invalid username or password",
      });

      render(<LoginForm />);

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /start adventure/i });

      // User enters wrong username
      await user.type(usernameInput, "wronguser");
      await user.type(passwordInput, "admin");
      await user.click(submitButton);

      // User sees error message
      await waitFor(() => {
        expect(screen.getByText("Invalid username or password")).toBeInTheDocument();
      });

      // User is NOT redirected
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("should show error message when password is invalid", async () => {
      const user = userEvent.setup();

      // Mock failed login response
      vi.mocked(authApiService.login).mockResolvedValueOnce({
        success: false,
        error: "Invalid username or password",
      });

      render(<LoginForm />);

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /start adventure/i });

      // User enters wrong password
      await user.type(usernameInput, "admin");
      await user.type(passwordInput, "wrongpassword");
      await user.click(submitButton);

      // User sees error message
      await waitFor(() => {
        expect(screen.getByText("Invalid username or password")).toBeInTheDocument();
      });

      // User is NOT redirected
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("should show validation error when username is empty", async () => {
      const user = userEvent.setup();

      render(<LoginForm />);

      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /start adventure/i });

      // User only enters password (no username)
      await user.type(passwordInput, "admin");
      await user.click(submitButton);

      // User sees validation error
      await waitFor(() => {
        expect(screen.getByText(/username.*required/i)).toBeInTheDocument();
      });

      // API is not called
      expect(authApiService.login).not.toHaveBeenCalled();
    });

    it("should show validation error when password is empty", async () => {
      const user = userEvent.setup();

      render(<LoginForm />);

      const usernameInput = screen.getByLabelText(/username/i);
      const submitButton = screen.getByRole("button", { name: /start adventure/i });

      // User only enters username (no password)
      await user.type(usernameInput, "admin");
      await user.click(submitButton);

      // User sees validation error
      await waitFor(() => {
        expect(screen.getByText(/password.*required/i)).toBeInTheDocument();
      });

      // API is not called
      expect(authApiService.login).not.toHaveBeenCalled();
    });
  });

  describe("User Journey: Network Errors", () => {
    it("should show error message when network request fails", async () => {
      const user = userEvent.setup();

      // Mock network error
      vi.mocked(authApiService.login).mockRejectedValueOnce(new Error("Network error"));

      render(<LoginForm />);

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /start adventure/i });

      await user.type(usernameInput, "admin");
      await user.type(passwordInput, "admin");
      await user.click(submitButton);

      // User sees generic error message
      await waitFor(() => {
        expect(screen.getByText(/unexpected error occurred/i)).toBeInTheDocument();
      });

      // User is NOT redirected
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe("User Journey: Retry After Failed Login", () => {
    it("should allow user to retry login after failure", async () => {
      const user = userEvent.setup();

      // First attempt fails
      vi.mocked(authApiService.login).mockResolvedValueOnce({
        success: false,
        error: "Invalid username or password",
      });

      render(<LoginForm />);

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /start adventure/i });

      // First attempt with wrong password
      await user.type(usernameInput, "admin");
      await user.type(passwordInput, "wrongpassword");
      await user.click(submitButton);

      // User sees error
      await waitFor(() => {
        expect(screen.getByText("Invalid username or password")).toBeInTheDocument();
      });

      // Second attempt succeeds
      vi.mocked(authApiService.login).mockResolvedValueOnce({
        success: true,
        data: {
          user: {
            id: 1,
            username: "admin",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      });

      // User clears password and tries again
      await user.clear(passwordInput);
      await user.type(passwordInput, "admin");
      await user.click(submitButton);

      // User successfully logs in
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/");
      });
    });
  });

  describe("User Journey: Form Accessibility", () => {
    it("should have accessible form labels and inputs", () => {
      render(<LoginForm />);

      // Username field is accessible
      const usernameInput = screen.getByLabelText(/username/i);
      expect(usernameInput).toHaveAttribute("type", "text");
      expect(usernameInput).toHaveAttribute("autocomplete", "username");

      // Password field is accessible
      const passwordInput = screen.getByLabelText(/password/i);
      expect(passwordInput).toHaveAttribute("type", "password");
      expect(passwordInput).toHaveAttribute("autocomplete", "current-password");

      // Submit button is accessible
      const submitButton = screen.getByRole("button", { name: /start adventure/i });
      expect(submitButton).toHaveAttribute("type", "submit");
    });

    it("should mark invalid fields with aria-invalid", async () => {
      const user = userEvent.setup();

      render(<LoginForm />);

      const submitButton = screen.getByRole("button", { name: /start adventure/i });

      // Submit empty form
      await user.click(submitButton);

      // Wait for validation
      await waitFor(() => {
        const usernameInput = screen.getByLabelText(/username/i);
        const passwordInput = screen.getByLabelText(/password/i);

        expect(usernameInput).toHaveAttribute("aria-invalid", "true");
        expect(passwordInput).toHaveAttribute("aria-invalid", "true");
      });
    });
  });
});

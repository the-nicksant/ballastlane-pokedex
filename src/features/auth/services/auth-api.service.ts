import { API_ROUTES } from "@/core/config/constants";
import type { LoginFormData } from "../schemas/login.schema";

interface AuthResponse {
  success: boolean;
  error?: string;
  data?: any;
}

export const authApiService = {
  async login(credentials: LoginFormData): Promise<AuthResponse> {
    const response = await fetch(API_ROUTES.AUTH.LOGIN, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || "Login failed. Please try again.",
      };
    }

    return {
      success: true,
      data: result.data,
    };
  },

  async logout(): Promise<void> {
    await fetch(API_ROUTES.AUTH.LOGOUT, {
      method: "POST",
    });
  },

  async verifySession(): Promise<boolean> {
    try {
      const response = await fetch(API_ROUTES.AUTH.VERIFY, {
        method: "GET",
      });

      return response.ok;
    } catch {
      return false;
    }
  },
};

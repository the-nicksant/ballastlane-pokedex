import { z } from "zod";

/**
 * Login form validation schema
 */
export const loginSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(1, "Password is required"),
});

/**
 * Inferred TypeScript type from schema
 */
export type LoginFormData = z.infer<typeof loginSchema>;

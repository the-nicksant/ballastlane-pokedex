import { compareSync, hashSync } from "bcryptjs";

/**
 * Password service for hashing and verification
 */
export class PasswordService {
  private static readonly SALT_ROUNDS = 10;

  /**
   * Hash a plain text password
   * @param password Plain text password
   * @returns Hashed password
   */
  static hash(password: string): string {
    return hashSync(password, this.SALT_ROUNDS);
  }

  /**
   * Verify a password against a hash
   * @param password Plain text password
   * @param hash Password hash
   * @returns true if password matches hash, false otherwise
   */
  static verify(password: string, hash: string): boolean {
    try {
      return compareSync(password, hash);
    } catch (error) {
      // Invalid hash format
      return false;
    }
  }
}

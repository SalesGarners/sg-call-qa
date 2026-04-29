import bcrypt from 'bcryptjs';

/**
 * Hashes a plain text password.
 * @param password - The password to hash.
 * @returns A promise that resolves to the hashed password.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compares a plain text password with a hashed password.
 * @param password - The plain text password.
 * @param hashed - The hashed password.
 * @returns A promise that resolves to true if they match, false otherwise.
 */
export async function verifyPassword(password: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(password, hashed);
}

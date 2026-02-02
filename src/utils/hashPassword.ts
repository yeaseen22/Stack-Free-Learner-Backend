import bcrypt from "bcrypt";

/**
 * Hashes a password using bcrypt
 * @param password The plain text password to hash
 * @param saltRounds The number of salt rounds to use (default: 10)
 * @returns Promise containing the hashed password
 */


export const hashPassword = async (
  password: string,
  saltRounds = 10
): Promise<string> => {
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    throw new Error("Error hashing password");
  }
};

/**
 * Compares a plain text password with a hashed password
 * @param password The plain text password to compare
 * @param hashedPassword The hashed password to compare against
 * @returns Promise containing boolean indicating if passwords match
 */


export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    throw new Error("Error comparing passwords");
  }
};

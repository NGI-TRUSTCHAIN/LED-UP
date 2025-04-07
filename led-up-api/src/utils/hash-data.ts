import { BinaryLike, createHash } from 'crypto';

/**
 * Hashes a given string using the SHA-256 algorithm and returns the result in binary format.
 *
 * This function takes a string, computes its SHA-256 hash, and returns the resulting hash in binary format.
 * The SHA-256 algorithm is commonly used for data integrity and cryptographic purposes.
 *
 * @param {string} data - The data to be hashed, provided as a string.
 *
 * @returns {Promise<BinaryLike>} A promise that resolves with the hashed data in binary format.
 *
 * @throws Will throw an error if hashing fails.
 *
 * @example
 * const data = "Sensitive information";
 * hashData(data)
 *   .then(hash => console.log(hash))
 *   .catch(error => console.error('Failed to hash data:', error));
 */
export const hashData = async (data: string): Promise<BinaryLike> => {
  try {
    return createHash('sha256').update(data).digest('binary');
  } catch (error: any) {
    throw new Error(`Failed to hash data: ${error.message}`);
  }
};

/**
 * Hashes a given string using the SHA-256 algorithm and returns the result in hexadecimal format.
 *
 * This function computes the SHA-256 hash of the input string and returns the result as a hexadecimal string,
 * which is useful for displaying or storing hashes in a human-readable format.
 *
 * @param {string} data - The data to be hashed, provided as a string.
 *
 * @returns {Promise<string>} A promise that resolves with the hashed data in hexadecimal format.
 *
 * @throws Will throw an error if hashing fails.
 *
 * @example
 * const data = "Sensitive information";
 * hashHex(data)
 *   .then(hash => console.log(hash)) // Output: "hexadecimalHashString"
 *   .catch(error => console.error('Failed to hash data:', error));
 */
export const hashHex = async (data: string): Promise<string> => {
  try {
    return createHash('sha256').update(data).digest('hex');
  } catch (error: any) {
    throw new Error(`Failed to hash data: ${error.message}`);
  }
};

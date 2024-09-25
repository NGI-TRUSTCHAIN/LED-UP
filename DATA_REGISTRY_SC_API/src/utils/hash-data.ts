import { BinaryLike, createHash, Hash } from 'crypto';
/**
 * Hashes the given data using the SHA256 algorithm.
 * @param data - The data to be hashed.
 * @returns A promise that resolves to the hashed data as a string.
 * @throws If there is an error while hashing the data.
 */
export const hashData = async (data: string): Promise<BinaryLike> => {
  try {
    return createHash('sha256').update(data).digest('binary');
  } catch (error: any) {
    throw new Error(`Failed to hash data: ${error.message}`);
  }
};

export const hashHex = async (data: string): Promise<string> => {
  try {
    return createHash('sha256').update(data).digest('hex');
  } catch (error: any) {
    throw new Error(`Failed to hash data: ${error.message}`);
  }
};

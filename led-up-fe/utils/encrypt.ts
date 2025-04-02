// @ts-nocheck
import { CipherKey, randomBytes, createDecipheriv, createCipheriv } from 'crypto';

/**
 * Represents the output of an encryption process.
 */
type EncryptOutput = {
  /**
   * The initialization vector (IV) used during encryption.
   * This is typically a random string that ensures the same input produces different encrypted outputs.
   *
   * @example "a1b2c3d4e5f6g7h8"
   */
  iv: string;

  /**
   * The encrypted data as a string, typically represented in base64 or hex encoding.
   *
   * @example "5d41402abc4b2a76b9719d911017c592"
   */
  encrypted: string;

  /**
   * The authentication tag generated during encryption, used to verify the integrity of the encrypted data.
   *
   * @example "e4787d3e29a12db46ff1a1edc8fdd4b2"
   */
  tag: string;
};

/**
 * Encrypts a given string using AES-256-CCM encryption algorithm.
 *
 * This function generates a random initialization vector (IV), uses the provided key
 * to encrypt the data, and returns the encrypted data along with the IV and
 * authentication tag. AES-256-CCM (Counter with CBC-MAC) is a cipher mode that
 * provides both encryption and integrity/authentication.
 *
 * @param {string} data - The data to be encrypted, provided as a string.
 * @param {CipherKey} key - The encryption key, which must be 32 bytes long for AES-256.
 *
 * @returns {EncryptOutput} An object containing the initialization vector (IV),
 * the authentication tag, and the encrypted data.
 *
 * @throws Will throw an error if the encryption process fails.
 *
 * @example
 * const data = "Sensitive information";
 * const key = crypto.randomBytes(32); // Generate a secure key
 * const result = encrypt(data, key);
 * console.log(result);
 * // Output: { iv: "hexString", tag: "hexString", encrypted: "hexString" }
 */
export const encrypt = (data: string, key: CipherKey): EncryptOutput => {
  // Generate a random initialization vector (IV)
  const iv = randomBytes(12);

  // Create a cipher object for AES-256-CCM
  const cipher = createCipheriv('aes-256-ccm', key, iv, {
    authTagLength: 16,
  });

  // Update the cipher with the data to be encrypted
  let encrypted = cipher.update(data, 'utf8', 'hex');

  // Finalize the encryption process
  encrypted += cipher.final('hex');

  // Get the authentication tag used for data integrity verification
  const tag = cipher.getAuthTag().toString('hex');

  // Return the IV, authentication tag, and the encrypted data
  return {
    iv: iv.toString('hex'),
    tag,
    encrypted,
  };
};

/**
 * Decrypts data encrypted with AES-256-CCM using the provided key.
 *
 * This function takes the encrypted data, initialization vector (IV), and authentication tag
 * from an `EncryptOutput` object and decrypts the data using AES-256-CCM (Counter with CBC-MAC).
 * The authentication tag is used to verify the integrity of the data.
 *
 * @param {EncryptOutput} data - An object containing the IV, authentication tag, and encrypted data.
 * @param {CipherKey} key - The decryption key, which must be 32 bytes long for AES-256.
 *
 * @returns {string} The decrypted plaintext data as a string.
 *
 * @throws Will throw an error if decryption fails or if the authentication tag is invalid,
 * indicating that the data has been tampered with.
 *
 * @example
 * const encryptedData = { iv: "hexString", tag: "hexString", encrypted: "hexString" };
 * const key = crypto.randomBytes(32); // Use the same key that was used for encryption
 * const decrypted = decrypt(encryptedData, key);
 * console.log(decrypted); // Output: "Sensitive information"
 */
export const decrypt = (data: EncryptOutput, key: CipherKey): string => {
  const { iv, tag, encrypted } = data;

  // Create a decipher object
  const decipher = createDecipheriv('aes-256-ccm', key, Buffer.from(iv, 'hex'), {
    authTagLength: 16,
  });

  decipher.setAuthTag(Buffer.from(tag, 'hex'));

  // Update the decipher with the data to be decrypted
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');

  // Finalize the decryption
  decrypted += decipher.final('utf8');

  return decrypted;
};

/**
 * Converts a hexadecimal string into a CipherKey.
 *
 * This function takes a key in hexadecimal string format and converts it into
 * a `CipherKey` (Buffer) suitable for use in encryption and decryption algorithms
 * like AES-256.
 *
 * @param {string} key - The encryption key in hexadecimal string format.
 *
 * @returns {CipherKey} The converted key as a Buffer, ready for use in cryptographic functions.
 *
 * @example
 * const hexKey = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
 * const cipherKey = toCipherKey(hexKey);
 * console.log(cipherKey); // Output: <Buffer 01 23 45 67 89 ab cd ef ... >
 */
export const toCipherKey = (key: string): CipherKey => {
  return Buffer.from(key, 'hex');
};

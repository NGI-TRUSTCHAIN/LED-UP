import { CipherKey, randomBytes } from 'crypto';
import { createDecipheriv, createCipheriv } from 'crypto';
type EncryptOutput = {
  iv: string;
  encrypted: string;
  tag: string;
};

/**
 * Encrypts the given data using AES-256-CBC encryption algorithm.
 *
 * @param data - The data to be encrypted; it could be stringified data.
 * @param key - The encryption key.
 * @returns A promise that resolves to the encrypted data concatenated with the IV and authentication tag.
  ```javascript
     { iv: string, encrypted: string, tag: string }
  ```
 */
export const encrypt = (data: string, key: CipherKey): EncryptOutput => {
  // Generate a random initialization vector (IV)
  const iv = randomBytes(12);

  // Create a cipher object
  const cipher = createCipheriv('aes-256-ccm', key, iv, {
    authTagLength: 16,
  });

  // Update the cipher with the data to be encrypted
  let encrypted = cipher.update(data, 'utf8', 'hex');

  // Finalize the encryption
  encrypted += cipher.final('hex');

  // Get the authentication tag
  const tag = cipher.getAuthTag().toString('hex');

  // Concatenate the IV and authentication tag with the encrypted data
  return {
    iv: iv.toString('hex'),
    tag,
    encrypted,
  };
};

/**
 * Decrypts the given string using AES-256-CCM encryption algorithm. It takes the given concatenated string and splits it into the IV, authentication tag, and encrypted data.
 * @param data - The json data to be decrypted: in this case, it is an object with iv, tag and encrypted.
 * @param key - The encryption key.
 * @returns A Promise that resolves to the decrypted string.
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
 * Converts a hexadecimal key to a CipherKey.
 *
 * @param {string} key - The hexadecimal key to be converted.
 * @return {CipherKey} The converted CipherKey.
 */
export const toCipherKey = (key: string): CipherKey => {
  return Buffer.from(key, 'hex');
};

import { Buffer } from 'buffer';
import {
  CipherKey,
  createCipheriv,
  createDecipheriv,
  randomBytes,
  pbkdf2Sync,
  CipherCCMTypes,
  CipherGCMTypes,
} from 'crypto';

/**
 * Represents the output of a symmetric encryption process.
 */
export type SymmetricEncryptOutput = {
  /**
   * The initialization vector (IV) used during encryption.
   * This is typically a random string that ensures the same input produces different encrypted outputs.
   */
  iv: string;

  /**
   * The encrypted data as a string, typically represented in base64 or hex encoding.
   */
  encrypted: string;

  /**
   * The authentication tag generated during encryption, used to verify the integrity of the encrypted data.
   */
  tag: string;
};

/**
 * Supported encryption algorithms for symmetric encryption.
 */
export enum SymmetricAlgorithm {
  AES_256_CCM = 'aes-256-ccm',
  AES_256_GCM = 'aes-256-gcm',
  AES_256_CBC = 'aes-256-cbc',
}

/**
 * Service for symmetric cryptographic operations.
 * Provides functionality for encrypting and decrypting data using symmetric keys.
 */
export class SymmetricCryptoService {
  private readonly defaultAlgorithm: SymmetricAlgorithm;

  /**
   * Creates a new instance of the SymmetricCryptoService.
   *
   * @param defaultAlgorithm - The default encryption algorithm to use (default: AES_256_CCM)
   */
  constructor(defaultAlgorithm: SymmetricAlgorithm = SymmetricAlgorithm.AES_256_CCM) {
    this.defaultAlgorithm = defaultAlgorithm;
  }

  /**
   * Encrypts data using a symmetric key.
   *
   * This method generates a random initialization vector (IV), uses the provided key
   * to encrypt the data, and returns the encrypted data along with the IV and
   * authentication tag.
   *
   * @param data - The data to encrypt
   * @param key - The encryption key (must be 32 bytes for AES-256)
   * @param algorithm - The encryption algorithm to use (default: the service's default algorithm)
   * @returns An object containing the IV, authentication tag, and encrypted data
   * @throws Error if encryption fails
   */
  public encrypt(
    data: string,
    key: CipherKey,
    algorithm: SymmetricAlgorithm = this.defaultAlgorithm
  ): SymmetricEncryptOutput {
    try {
      // Generate a random initialization vector (IV)
      const iv = randomBytes(algorithm === SymmetricAlgorithm.AES_256_CBC ? 16 : 12);

      let cipher;

      // Create cipher based on algorithm
      if (algorithm === SymmetricAlgorithm.AES_256_CCM) {
        cipher = createCipheriv(algorithm as CipherCCMTypes, key, iv, {
          authTagLength: 16,
        });
      } else if (algorithm === SymmetricAlgorithm.AES_256_GCM) {
        cipher = createCipheriv(algorithm as CipherGCMTypes, key, iv, {
          authTagLength: 16,
        });
      } else {
        cipher = createCipheriv(algorithm, key, iv);
      }

      // Update the cipher with the data to be encrypted
      let encrypted = cipher.update(data, 'utf8', 'hex');

      // Finalize the encryption process
      encrypted += cipher.final('hex');

      // Get the authentication tag used for data integrity verification
      // Note: CBC mode doesn't use authentication tags
      const tag =
        algorithm !== SymmetricAlgorithm.AES_256_CBC ? cipher.getAuthTag().toString('hex') : '';

      // Return the IV, authentication tag, and the encrypted data
      return {
        iv: iv.toString('hex'),
        tag,
        encrypted,
      };
    } catch (error: any) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  /**
   * Decrypts data using a symmetric key.
   *
   * This method takes the encrypted data, initialization vector (IV), and authentication tag
   * and decrypts the data using the provided key.
   *
   * @param data - An object containing the IV, authentication tag, and encrypted data
   * @param key - The decryption key (must be 32 bytes for AES-256)
   * @param algorithm - The encryption algorithm that was used (default: the service's default algorithm)
   * @returns The decrypted data
   * @throws Error if decryption fails
   */
  public decrypt(
    data: SymmetricEncryptOutput,
    key: CipherKey,
    algorithm: SymmetricAlgorithm = this.defaultAlgorithm
  ): string {
    try {
      const { iv, tag, encrypted } = data;

      let decipher;

      // Create decipher based on algorithm
      if (algorithm === SymmetricAlgorithm.AES_256_CCM) {
        decipher = createDecipheriv(algorithm as CipherCCMTypes, key, Buffer.from(iv, 'hex'), {
          authTagLength: 16,
        });
      } else if (algorithm === SymmetricAlgorithm.AES_256_GCM) {
        decipher = createDecipheriv(algorithm as CipherGCMTypes, key, Buffer.from(iv, 'hex'), {
          authTagLength: 16,
        });
      } else {
        decipher = createDecipheriv(algorithm, key, Buffer.from(iv, 'hex'));
      }

      // Set the authentication tag for GCM and CCM modes
      if (algorithm !== SymmetricAlgorithm.AES_256_CBC && tag) {
        decipher.setAuthTag(Buffer.from(tag, 'hex'));
      }

      // Update the decipher with the data to be decrypted
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');

      // Finalize the decryption
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error: any) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  /**
   * Converts a hexadecimal string into a CipherKey.
   *
   * @param key - The encryption key in hexadecimal string format
   * @returns The converted key as a Buffer, ready for use in cryptographic functions
   */
  public toCipherKey(key: string): CipherKey {
    return Buffer.from(key, 'hex');
  }

  /**
   * Generates a random key suitable for symmetric encryption.
   *
   * @returns A random 32-byte key as a Buffer
   */
  public generateKey(): CipherKey {
    return randomBytes(32);
  }

  /**
   * Generates a random key and returns it as a hex string.
   *
   * @returns A random 32-byte key as a hex string
   */
  public generateKeyAsHex(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Encrypts data with a key provided as a hex string.
   *
   * @param data - The data to encrypt
   * @param hexKey - The encryption key as a hex string
   * @param algorithm - The encryption algorithm to use (default: the service's default algorithm)
   * @returns An object containing the IV, authentication tag, and encrypted data
   * @throws Error if encryption fails
   */
  public encryptWithHexKey(
    data: string,
    hexKey: string,
    algorithm: SymmetricAlgorithm = this.defaultAlgorithm
  ): SymmetricEncryptOutput {
    const key = this.toCipherKey(hexKey);
    return this.encrypt(data, key, algorithm);
  }

  /**
   * Decrypts data with a key provided as a hex string.
   *
   * @param data - An object containing the IV, authentication tag, and encrypted data
   * @param hexKey - The decryption key as a hex string
   * @param algorithm - The encryption algorithm that was used (default: the service's default algorithm)
   * @returns The decrypted data
   * @throws Error if decryption fails
   */
  public decryptWithHexKey(
    data: SymmetricEncryptOutput,
    hexKey: string,
    algorithm: SymmetricAlgorithm = this.defaultAlgorithm
  ): string {
    const key = this.toCipherKey(hexKey);
    return this.decrypt(data, key, algorithm);
  }

  /**
   * Encrypts a string and returns the result as a single string that includes
   * all the necessary information for decryption.
   *
   * @param data - The data to encrypt
   * @param key - The encryption key
   * @param algorithm - The encryption algorithm to use (default: the service's default algorithm)
   * @returns A string containing the encrypted data, IV, and tag
   * @throws Error if encryption fails
   */
  public encryptToString(
    data: string,
    key: CipherKey,
    algorithm: SymmetricAlgorithm = this.defaultAlgorithm
  ): string {
    const result = this.encrypt(data, key, algorithm);
    return JSON.stringify(result);
  }

  /**
   * Decrypts a string that was encrypted using encryptToString.
   *
   * @param encryptedString - The string containing the encrypted data, IV, and tag
   * @param key - The decryption key
   * @param algorithm - The encryption algorithm that was used (default: the service's default algorithm)
   * @returns The decrypted data
   * @throws Error if decryption fails
   */
  public decryptFromString(
    encryptedString: string,
    key: CipherKey,
    algorithm: SymmetricAlgorithm = this.defaultAlgorithm
  ): string {
    try {
      const data = JSON.parse(encryptedString) as SymmetricEncryptOutput;
      return this.decrypt(data, key, algorithm);
    } catch (error: any) {
      throw new Error(`Decryption from string failed: ${error.message}`);
    }
  }

  /**
   * Derives a key from a password using PBKDF2.
   *
   * @param password - The password to derive the key from
   * @param salt - The salt to use (if not provided, a random salt will be generated)
   * @returns An object containing the derived key and the salt used
   */
  public deriveKeyFromPassword(password: string, salt?: Buffer): { key: CipherKey; salt: Buffer } {
    const usedSalt = salt || randomBytes(16);

    // Use PBKDF2 to derive a key from the password
    const key = pbkdf2Sync(
      password,
      usedSalt,
      100000, // Number of iterations
      32, // Key length in bytes
      'sha256'
    );

    return { key, salt: usedSalt };
  }

  /**
   * Encrypts data using a password instead of a key.
   *
   * This method derives a key from the password using PBKDF2 and then
   * encrypts the data using that key.
   *
   * @param data - The data to encrypt
   * @param password - The password to use for encryption
   * @param algorithm - The encryption algorithm to use (default: the service's default algorithm)
   * @returns An object containing the encrypted data, IV, tag, and salt
   * @throws Error if encryption fails
   */
  public encryptWithPassword(
    data: string,
    password: string,
    algorithm: SymmetricAlgorithm = this.defaultAlgorithm
  ): SymmetricEncryptOutput & { salt: string } {
    try {
      // Derive a key from the password
      const { key, salt } = this.deriveKeyFromPassword(password);

      // Encrypt the data with the derived key
      const result = this.encrypt(data, key, algorithm);

      // Add the salt to the result
      return {
        ...result,
        salt: salt.toString('hex'),
      };
    } catch (error: any) {
      throw new Error(`Password-based encryption failed: ${error.message}`);
    }
  }

  /**
   * Decrypts data that was encrypted using a password.
   *
   * @param data - An object containing the encrypted data, IV, tag, and salt
   * @param password - The password used for encryption
   * @param algorithm - The encryption algorithm that was used (default: the service's default algorithm)
   * @returns The decrypted data
   * @throws Error if decryption fails
   */
  public decryptWithPassword(
    data: SymmetricEncryptOutput & { salt: string },
    password: string,
    algorithm: SymmetricAlgorithm = this.defaultAlgorithm
  ): string {
    try {
      // Extract the salt from the data
      const salt = Buffer.from(data.salt, 'hex');

      // Derive the same key from the password and salt
      const { key } = this.deriveKeyFromPassword(password, salt);

      // Decrypt the data with the derived key
      return this.decrypt(data, key, algorithm);
    } catch (error: any) {
      throw new Error(`Password-based decryption failed: ${error.message}`);
    }
  }
}

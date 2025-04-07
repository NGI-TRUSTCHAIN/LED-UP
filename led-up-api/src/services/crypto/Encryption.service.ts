import { Buffer } from 'buffer';
import * as crypto from 'crypto';

/**
 * Result of an encryption operation
 */
export interface EncryptedData {
  iv: string;
  tag: string;
  encrypted: string;
}

/**
 * Encryption Service for secure data handling using AES-256-GCM
 *
 * This service provides methods for encryption and decryption of data using AES-256-GCM,
 * which provides both confidentiality and authentication.
 */
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32; // 256 bits
  private readonly ivLength = 16; // 128 bits
  private readonly authTagLength = 16; // 128 bits
  private masterKey: Buffer;

  /**
   * Initialize the encryption service with a master key
   *
   * @param masterKeyHex Optional master key in hex format. If not provided, a new one will be generated.
   */
  constructor(masterKeyHex?: string) {
    if (masterKeyHex) {
      this.masterKey = Buffer.from(masterKeyHex, 'hex');
      if (this.masterKey.length !== this.keyLength) {
        throw new Error(`Invalid master key length. Expected ${this.keyLength} bytes.`);
      }
    } else {
      this.masterKey = crypto.randomBytes(this.keyLength);
    }
  }

  /**
   * Get the master key in hex format
   *
   * This should be securely stored in a key vault or similar secure storage
   * in a production environment
   */
  getMasterKeyHex(): string {
    return this.masterKey.toString('hex');
  }

  /**
   * Generate a new data encryption key
   *
   * @returns The generated key in hex format
   */
  generateKey(): string {
    return crypto.randomBytes(this.keyLength).toString('hex');
  }

  /**
   * Generate a new initialization vector
   *
   * @returns The generated IV in hex format
   */
  generateIV(): string {
    return crypto.randomBytes(this.ivLength).toString('hex');
  }

  /**
   * Encrypt a key using the master key
   *
   * @param keyHex Key to encrypt in hex format
   * @returns Encrypted key with authentication tag and IV as a JSON string
   */
  encryptKey(keyHex: string): string {
    const key = Buffer.from(keyHex, 'hex');
    const result = this.encryptWithMasterKey(key.toString('utf8'));
    return JSON.stringify(result);
  }

  /**
   * Decrypt an encrypted key using the master key
   *
   * @param encryptedKeyHex Encrypted key with auth tag and IV as a JSON string
   * @returns Decrypted key in hex format
   */
  decryptKey(encryptedKeyHex: string): string {
    try {
      const encryptedData = JSON.parse(encryptedKeyHex) as EncryptedData;
      const decryptedBuffer = this.decryptWithMasterKey(encryptedData);
      return Buffer.from(decryptedBuffer, 'utf8').toString('hex');
    } catch (error: any) {
      throw new Error(`Key decryption failed: ${error.message}`);
    }
  }

  /**
   * Encrypt data with a specific key
   *
   * @param data Data to encrypt (Buffer or string)
   * @param keyHex Encryption key in hex format
   * @returns Encrypted data with IV and auth tag as a JSON string
   */
  encryptWithKey(data: Buffer | string, keyHex: string): string {
    try {
      const dataStr = typeof data === 'string' ? data : data.toString('utf8');
      const key = Buffer.from(keyHex, 'hex');

      // Generate a random initialization vector
      const iv = crypto.randomBytes(this.ivLength);

      // Create cipher with GCM mode

      const cipher = crypto.createCipheriv(this.algorithm, key, iv, {
        authTagLength: this.authTagLength,
      });

      // Encrypt the data
      let encrypted = cipher.update(dataStr, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      // Get authentication tag

      const tag = cipher.getAuthTag().toString('hex');

      // Return encrypted data with IV and tag
      const result: EncryptedData = {
        iv: iv.toString('hex'),
        tag,
        encrypted,
      };

      return JSON.stringify(result);
    } catch (error: any) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  /**
   * Decrypt data with a specific key
   *
   * @param encryptedDataString Encrypted data JSON string
   * @param keyHex Decryption key in hex format
   * @returns Decrypted data as UTF-8 string
   */
  decryptWithKey(encryptedDataString: string, keyHex: string): string {
    try {
      const encryptedData = JSON.parse(encryptedDataString) as EncryptedData;
      const { iv, tag, encrypted } = encryptedData;

      const key = Buffer.from(keyHex, 'hex');
      const ivBuffer = Buffer.from(iv, 'hex');
      const tagBuffer = Buffer.from(tag, 'hex');

      // Create decipher

      const decipher = crypto.createDecipheriv(this.algorithm, key, ivBuffer, {
        authTagLength: this.authTagLength,
      });

      // Set authentication Tag

      decipher.setAuthTag(tagBuffer);

      // Decrypt the data
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error: any) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  /**
   * Encrypt data using the master key
   *
   * @param data Data to encrypt
   * @returns Encrypted data with IV and auth tag
   */
  private encryptWithMasterKey(data: string): EncryptedData {
    try {
      // Generate a random initialization vector
      const iv = crypto.randomBytes(this.ivLength);

      // Create cipher with GCM mode

      const cipher = crypto.createCipheriv(this.algorithm, this.masterKey, iv, {
        authTagLength: this.authTagLength,
      });

      // Encrypt the data
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      // Get authentication tag

      const tag = cipher.getAuthTag().toString('hex');

      // Return encrypted data with IV and tag
      return {
        iv: iv.toString('hex'),
        tag,
        encrypted,
      };
    } catch (error: any) {
      throw new Error(`Master key encryption failed: ${error.message}`);
    }
  }

  /**
   * Decrypt data using the master key
   *
   * @param encryptedData Encrypted data object
   * @returns Decrypted data as a string
   */
  private decryptWithMasterKey(encryptedData: EncryptedData): string {
    try {
      const { iv, tag, encrypted } = encryptedData;

      const ivBuffer = Buffer.from(iv, 'hex');
      const tagBuffer = Buffer.from(tag, 'hex');

      // Create decipher

      const decipher = crypto.createDecipheriv(this.algorithm, this.masterKey, ivBuffer, {
        authTagLength: this.authTagLength,
      });

      // Set authentication tag

      decipher.setAuthTag(tagBuffer);

      // Decrypt the data
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error: any) {
      throw new Error(`Master key decryption failed: ${error.message}`);
    }
  }

  /**
   * Generate a deterministic key based on a seed string and additional context
   * Useful for creating predictable but secure keys for specific data
   *
   * @param seed Seed string to base the key on
   * @param context Additional context to mix with the seed
   * @returns Deterministic key in hex format
   */
  generateDeterministicKey(seed: string, context: string): string {
    try {
      // Combine seed with context and master key

      const hmac = crypto.createHmac('sha256', this.masterKey);
      hmac.update(`${seed}:${context}`);
      const key = hmac.digest();

      return key.toString('hex');
    } catch (error: any) {
      throw new Error(`Deterministic key generation failed: ${error.message}`);
    }
  }

  /**
   * Encrypt binary data (Uint8Array) using AES-256-GCM
   *
   * @param data Binary data to encrypt as Uint8Array
   * @param key Encryption key as Buffer
   * @param iv Initialization vector as Buffer
   * @returns Encrypted binary data as Uint8Array
   */
  encryptBinary(data: Uint8Array, key: Buffer, iv: Buffer): Uint8Array {
    try {
      // Create cipher with GCM mode

      const cipher = crypto.createCipheriv(this.algorithm, key, iv, {
        authTagLength: this.authTagLength,
      });

      // Encrypt the data
      const encryptedBuffer = Buffer.concat([cipher.update(Buffer.from(data)), cipher.final()]);

      // Get authentication tag

      const tagBuffer = cipher.getAuthTag();

      // Combine IV + Tag + Encrypted data for easier handling
      // Format: [IV (16 bytes)][Tag (16 bytes)][Encrypted Data]
      return new Uint8Array(Buffer.concat([iv, tagBuffer, encryptedBuffer]));
    } catch (error: any) {
      throw new Error(`Binary encryption failed: ${error.message}`);
    }
  }

  /**
   * Decrypt binary data (Uint8Array) using AES-256-GCM
   *
   * @param encryptedData Encrypted data as Uint8Array, including IV and tag
   * @param key Decryption key as Buffer
   * @returns Decrypted binary data as Uint8Array
   */
  decryptBinary(encryptedData: Uint8Array, key: Buffer): Uint8Array {
    try {
      // Extract IV, tag, and data from the combined buffer
      // Format: [IV (16 bytes)][Tag (16 bytes)][Encrypted Data]
      const dataBuffer = Buffer.from(encryptedData);
      const ivBuffer = dataBuffer.subarray(0, this.ivLength);
      const tagBuffer = dataBuffer.subarray(this.ivLength, this.ivLength + this.authTagLength);
      const encryptedBuffer = dataBuffer.subarray(this.ivLength + this.authTagLength);

      // Create decipher
      const decipher = crypto.createDecipheriv(this.algorithm, key, ivBuffer, {
        authTagLength: this.authTagLength,
      });

      // Set authentication tag

      decipher.setAuthTag(tagBuffer);

      // Decrypt the data
      const decryptedBuffer = Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);

      return new Uint8Array(decryptedBuffer);
    } catch (error: any) {
      throw new Error(`Binary decryption failed: ${error.message}`);
    }
  }
}

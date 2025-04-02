import { Buffer } from 'buffer';
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

import { ec as EC, eddsa as EdDSA } from 'elliptic';

/**
 * Supported elliptic curves for asymmetric cryptography.
 */
export enum CurveType {
  SECP256K1 = 'secp256k1',
  ED25519 = 'ed25519',
}

/**
 * Represents the output of an asymmetric encryption process.
 */
export interface AsymmetricEncryptOutput {
  /**
   * The ephemeral public key used in the ECDH key exchange.
   */
  ephemeralPublicKey: string;

  /**
   * The initialization vector (IV) used during encryption.
   */
  iv: string;

  /**
   * The authentication tag generated during encryption, used to verify the integrity of the encrypted data.
   */
  authTag: string;

  /**
   * The encrypted data as a string, typically represented in hex encoding.
   */
  encrypted: string;
}

/**
 * Service for asymmetric cryptographic operations using elliptic curve cryptography.
 * Provides functionality for public/private key encryption, decryption, and key generation.
 * Supports both secp256k1 (Bitcoin/Ethereum) and ed25519 (EdDSA) curves.
 */
export class AsymmetricCryptoService {
  private readonly ecCurve: EC | null;
  private readonly edCurve: EdDSA | null;
  private readonly curveType: CurveType;

  /**
   * Creates a new instance of the AsymmetricCryptoService.
   *
   * @param curveType - The elliptic curve to use (default: CurveType.SECP256K1)
   */
  constructor(curveType: CurveType = CurveType.SECP256K1) {
    this.curveType = curveType;

    // Initialize the appropriate curve based on the curve type
    if (curveType === CurveType.SECP256K1) {
      this.ecCurve = new EC(CurveType.SECP256K1);
      this.edCurve = null;
    } else {
      this.edCurve = new EdDSA(CurveType.ED25519);
      this.ecCurve = null;
    }
  }

  /**
   * Encrypts data using a public key (asymmetric encryption).
   *
   * This method uses Elliptic Curve Diffie-Hellman (ECDH) key exchange to derive a shared secret,
   * which is then used for AES-256-GCM symmetric encryption.
   *
   * Note: This method only works with secp256k1 curve as ed25519 doesn't support ECDH directly.
   *
   * @param data - The data to encrypt
   * @param publicKey - The recipient's public key in hex format
   * @returns The encrypted data as a JSON string
   * @throws Error if the curve type is not secp256k1, the public key is invalid, or encryption fails
   */
  public encryptWithPublicKey(data: string, publicKey: string): string {
    try {
      if (this.curveType !== CurveType.SECP256K1 || !this.ecCurve) {
        throw new Error('Encryption with public key is only supported with secp256k1 curve');
      }

      if (!this.isValidPublicKey(publicKey)) {
        throw new Error('Invalid public key');
      }

      // Generate an ephemeral key pair
      const ephemeralKeyPair = this.ecCurve.genKeyPair();

      // Derive the shared secret using ECDH
      const recipientPublicKey = this.ecCurve.keyFromPublic(publicKey, 'hex');
      const sharedSecret = ephemeralKeyPair.derive(recipientPublicKey.getPublic()).toString(16);

      // Generate a random initialization vector (IV)
      const iv = randomBytes(16);

      // Use the shared secret to encrypt the data symmetrically with AES-256-GCM
      const cipher = createCipheriv(
        'aes-256-gcm',
        Buffer.from(sharedSecret, 'hex').subarray(0, 32),
        iv
      );

      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      // Include the authentication tag for integrity check
      const authTag = cipher.getAuthTag().toString('hex');

      // Include the ephemeral public key, IV, and authTag in the result
      const ephemeralPublicKey = ephemeralKeyPair.getPublic('hex');

      const output: AsymmetricEncryptOutput = {
        ephemeralPublicKey,
        iv: iv.toString('hex'),
        authTag,
        encrypted,
      };

      return JSON.stringify(output);
    } catch (error: any) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  /**
   * Decrypts data using a private key (asymmetric decryption).
   *
   * This method uses the recipient's private key and the sender's ephemeral public key
   * to derive the same shared secret used during encryption, then uses it to decrypt
   * the data with AES-256-GCM.
   *
   * Note: This method only works with secp256k1 curve as ed25519 doesn't support ECDH directly.
   *
   * @param encryptedData - The encrypted data as a JSON string
   * @param privateKey - The recipient's private key in hex format
   * @returns The decrypted data
   * @throws Error if the curve type is not secp256k1, the private key is invalid, the encrypted data is malformed, or decryption fails
   */
  public decryptWithPrivateKey(encryptedData: string, privateKey: string): string {
    try {
      if (this.curveType !== CurveType.SECP256K1 || !this.ecCurve) {
        throw new Error('Decryption with private key is only supported with secp256k1 curve');
      }

      // Parse the encrypted data
      const { ephemeralPublicKey, iv, authTag, encrypted } = JSON.parse(
        encryptedData
      ) as AsymmetricEncryptOutput;

      // Compute the shared secret using ECDH
      const recipientKeyPair = this.ecCurve.keyFromPrivate(privateKey, 'hex');
      const ephemeralKey = this.ecCurve.keyFromPublic(ephemeralPublicKey, 'hex');
      const sharedSecret = recipientKeyPair.derive(ephemeralKey.getPublic()).toString(16);

      // Use the shared secret to decrypt the data symmetrically with AES-256-GCM
      const decipher = createDecipheriv(
        'aes-256-gcm',
        Buffer.from(sharedSecret, 'hex').subarray(0, 32),
        Buffer.from(iv, 'hex')
      );

      // Set the authentication tag
      decipher.setAuthTag(Buffer.from(authTag, 'hex'));

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error: any) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  /**
   * Generates an elliptic curve key pair.
   *
   * For secp256k1, generates an ECDSA key pair.
   * For ed25519, generates an EdDSA key pair.
   *
   * @returns An object containing the public and private keys in hex format
   * @throws Error if key generation fails
   */
  public generateKeyPair(): { publicKey: string; privateKey: string } {
    try {
      if (this.curveType === CurveType.SECP256K1 && this.ecCurve) {
        // Generate secp256k1 key pair
        const keyPair = this.ecCurve.genKeyPair();
        return {
          publicKey: keyPair.getPublic('hex'),
          privateKey: keyPair.getPrivate('hex'),
        };
      } else if (this.curveType === CurveType.ED25519 && this.edCurve) {
        // Generate ed25519 key pair
        // For ed25519, we need to generate a random 32-byte secret
        const secret = randomBytes(32);
        const key = this.edCurve.keyFromSecret(secret);
        return {
          publicKey: key.getPublic('hex'),
          privateKey: secret.toString('hex'),
        };
      } else {
        throw new Error('Invalid curve configuration');
      }
    } catch (error: any) {
      throw new Error(`Key pair generation failed: ${error.message}`);
    }
  }

  /**
   * Verifies if a public key is valid for the configured curve.
   *
   * @param publicKey - The public key to verify in hex format
   * @returns True if the public key is valid, false otherwise
   */
  public isValidPublicKey(publicKey: string): boolean {
    try {
      if (this.curveType === CurveType.SECP256K1 && this.ecCurve) {
        const key = this.ecCurve.keyFromPublic(publicKey, 'hex');
        return key.validate().result;
      } else if (this.curveType === CurveType.ED25519 && this.edCurve) {
        // For ed25519, we can just try to create a key from the public key
        this.edCurve.keyFromPublic(Buffer.from(publicKey, 'hex'));
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Derives a public key from a private key.
   *
   * @param privateKey - The private key in hex format
   * @returns The corresponding public key in hex format
   * @throws Error if the private key is invalid
   */
  public derivePublicKey(privateKey: string): string {
    try {
      if (this.curveType === CurveType.SECP256K1 && this.ecCurve) {
        const keyPair = this.ecCurve.keyFromPrivate(privateKey, 'hex');
        return keyPair.getPublic('hex');
      } else if (this.curveType === CurveType.ED25519 && this.edCurve) {
        const key = this.edCurve.keyFromSecret(privateKey);
        return key.getPublic('hex');
      } else {
        throw new Error('Invalid curve configuration');
      }
    } catch (error: any) {
      throw new Error(`Failed to derive public key: ${error.message}`);
    }
  }

  /**
   * Signs data using a private key.
   *
   * For secp256k1, uses ECDSA signing.
   * For ed25519, uses EdDSA signing.
   *
   * @param data - The data to sign (string or Buffer)
   * @param privateKey - The private key in hex format
   * @returns The signature in hex format
   * @throws Error if the private key is invalid or signing fails
   */
  public sign(data: string | Buffer, privateKey: string): string {
    try {
      // Convert string data to Buffer if needed
      const dataBuffer = typeof data === 'string' ? Buffer.from(data) : data;

      if (this.curveType === CurveType.SECP256K1 && this.ecCurve) {
        const keyPair = this.ecCurve.keyFromPrivate(privateKey, 'hex');
        const signature = keyPair.sign(dataBuffer);
        return signature.toDER('hex');
      } else if (this.curveType === CurveType.ED25519 && this.edCurve) {
        try {
          const key = this.edCurve.keyFromSecret(privateKey);
          // For ED25519, always convert to string to ensure consistent signing
          const message = Buffer.from(dataBuffer).toString();
          return key.sign(message).toHex();
        } catch (edError) {
          console.error('ED25519 signing error:', edError);
          throw new Error(
            `ED25519 signing failed: ${edError instanceof Error ? edError.message : String(edError)}`
          );
        }
      } else {
        throw new Error('Invalid curve configuration');
      }
    } catch (error: any) {
      throw new Error(`Signing failed: ${error.message}`);
    }
  }

  /**
   * Verifies a signature using a public key.
   *
   * For secp256k1, uses ECDSA verification.
   * For ed25519, uses EdDSA verification.
   *
   * @param data - The data that was signed (string or Buffer)
   * @param signature - The signature in hex format
   * @param publicKey - The public key in hex format
   * @returns True if the signature is valid, false otherwise
   */
  public verify(data: string | Buffer, signature: string, publicKey: string): boolean {
    try {
      // Convert string data to Buffer if needed
      const dataBuffer = typeof data === 'string' ? Buffer.from(data) : data;

      if (this.curveType === CurveType.SECP256K1 && this.ecCurve) {
        const key = this.ecCurve.keyFromPublic(publicKey, 'hex');
        // For secp256k1, we need to handle the verification differently
        return key.verify(dataBuffer, signature);
      } else if (this.curveType === CurveType.ED25519 && this.edCurve) {
        try {
          // For ed25519, we need to:
          // 1. Convert message to string (same as in sign method)
          // 2. Parse the hex signature
          const message = Buffer.from(dataBuffer).toString();
          const key = this.edCurve.keyFromPublic(publicKey);

          // Parse signature from hex - this step is critical
          return key.verify(message, signature);
        } catch (edError) {
          console.error('ED25519 verification error:', edError);
          return false;
        }
      }
      return false;
    } catch (error) {
      console.error('Verification error:', error);
      return false;
    }
  }

  /**
   * Encrypts a large amount of data by using hybrid encryption.
   *
   * This method generates a random symmetric key, encrypts the data with that key,
   * and then encrypts the symmetric key with the recipient's public key.
   *
   * Note: This method only works with secp256k1 curve as ed25519 doesn't support ECDH directly.
   *
   * @param data - The data to encrypt
   * @param publicKey - The recipient's public key in hex format
   * @returns An object containing the encrypted data and the encrypted symmetric key
   * @throws Error if the curve type is not secp256k1 or encryption fails
   */
  public encryptLargeData(
    data: string,
    publicKey: string
  ): {
    encryptedData: string;
    encryptedSymmetricKey: string;
  } {
    try {
      if (this.curveType !== CurveType.SECP256K1) {
        throw new Error('Hybrid encryption is only supported with secp256k1 curve');
      }

      // Generate a random symmetric key
      const symmetricKey = randomBytes(32);

      // Encrypt the data with the symmetric key
      const iv = randomBytes(16);
      const cipher = createCipheriv('aes-256-gcm', symmetricKey, iv);

      let encryptedData = cipher.update(data, 'utf8', 'hex');
      encryptedData += cipher.final('hex');

      const authTag = cipher.getAuthTag().toString('hex');

      // Encrypt the symmetric key with the public key
      const encryptedSymmetricKey = this.encryptWithPublicKey(
        symmetricKey.toString('hex'),
        publicKey
      );

      // Return both the encrypted data and the encrypted symmetric key
      return {
        encryptedData: JSON.stringify({
          iv: iv.toString('hex'),
          authTag,
          encrypted: encryptedData,
        }),
        encryptedSymmetricKey,
      };
    } catch (error: any) {
      throw new Error(`Large data encryption failed: ${error.message}`);
    }
  }

  /**
   * Decrypts a large amount of data that was encrypted using hybrid encryption.
   *
   * Note: This method only works with secp256k1 curve as ed25519 doesn't support ECDH directly.
   *
   * @param encryptedData - The encrypted data
   * @param encryptedSymmetricKey - The encrypted symmetric key
   * @param privateKey - The recipient's private key in hex format
   * @returns The decrypted data
   * @throws Error if the curve type is not secp256k1 or decryption fails
   */
  public decryptLargeData(
    encryptedData: string,
    encryptedSymmetricKey: string,
    privateKey: string
  ): string {
    try {
      if (this.curveType !== CurveType.SECP256K1) {
        throw new Error('Hybrid decryption is only supported with secp256k1 curve');
      }

      // Decrypt the symmetric key
      const symmetricKeyHex = this.decryptWithPrivateKey(encryptedSymmetricKey, privateKey);
      const symmetricKey = Buffer.from(symmetricKeyHex, 'hex');

      // Parse the encrypted data
      const { iv, authTag, encrypted } = JSON.parse(encryptedData);

      // Decrypt the data with the symmetric key
      const decipher = createDecipheriv('aes-256-gcm', symmetricKey, Buffer.from(iv, 'hex'));

      decipher.setAuthTag(Buffer.from(authTag, 'hex'));

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error: any) {
      throw new Error(`Large data decryption failed: ${error.message}`);
    }
  }

  /**
   * Encrypts binary data (files or larger content) using hybrid encryption.
   *
   * @param data - The binary data to encrypt as Uint8Array
   * @param publicKey - The recipient's public key in hex format
   * @returns Object containing encrypted data components
   */
  public encryptBinaryData(
    data: Uint8Array,
    publicKey: string
  ): {
    encryptedData: Uint8Array;
    encryptedSymmetricKey: string;
    iv: Uint8Array;
    authTag: Uint8Array;
  } {
    try {
      if (this.curveType !== CurveType.SECP256K1) {
        throw new Error('Binary encryption is only supported with secp256k1 curve');
      }

      // Generate a random symmetric key
      const symmetricKey = randomBytes(32);

      // Generate a random IV
      const iv = randomBytes(16);

      // Encrypt the binary data with AES-256-GCM
      const cipher = createCipheriv('aes-256-gcm', symmetricKey, iv);

      const encryptedData = Buffer.concat([cipher.update(Buffer.from(data)), cipher.final()]);

      // Get the authentication tag
      const authTag = cipher.getAuthTag();

      // Encrypt the symmetric key with the public key
      const encryptedSymmetricKey = this.encryptWithPublicKey(
        symmetricKey.toString('hex'),
        publicKey
      );

      return {
        encryptedData,
        encryptedSymmetricKey,
        iv,
        authTag,
      };
    } catch (error: any) {
      throw new Error(`Binary data encryption failed: ${error.message}`);
    }
  }

  /**
   * Decrypts binary data that was encrypted with encryptBinaryData.
   *
   * @param encryptedData - The encrypted binary data
   * @param iv - The initialization vector used during encryption
   * @param authTag - The authentication tag
   * @param encryptedSymmetricKey - The encrypted symmetric key
   * @param privateKey - The recipient's private key in hex format
   * @returns The decrypted binary data
   */
  public decryptBinaryData(
    encryptedData: Uint8Array,
    iv: Uint8Array,
    authTag: Uint8Array,
    encryptedSymmetricKey: string,
    privateKey: string
  ): Uint8Array {
    try {
      if (this.curveType !== CurveType.SECP256K1) {
        throw new Error('Binary decryption is only supported with secp256k1 curve');
      }

      // Decrypt the symmetric key
      const symmetricKeyHex = this.decryptWithPrivateKey(encryptedSymmetricKey, privateKey);
      const symmetricKey = Buffer.from(symmetricKeyHex, 'hex');

      // Decrypt the binary data
      const decipher = createDecipheriv('aes-256-gcm', symmetricKey, iv);
      decipher.setAuthTag(Buffer.from(authTag));

      const decrypted = Buffer.concat([
        decipher.update(Buffer.from(encryptedData)),
        decipher.final(),
      ]);

      return decrypted;
    } catch (error: any) {
      throw new Error(`Binary data decryption failed: ${error.message}`);
    }
  }

  /**
   * Gets the current curve type used by this service.
   *
   * @returns The curve type (secp256k1 or ed25519)
   */
  public getCurveType(): CurveType {
    return this.curveType;
  }
}

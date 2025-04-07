'use client';

import { createDecipheriv } from 'crypto';
import { ec as EC } from 'elliptic';

// // Function to generate a key pair
// export const generateKeyPair = () => {
//   // In a real implementation, this would use a proper crypto library
//   // This is a simplified version for demonstration
//   const privateKey = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
//   const publicKey = `0x${Array.from({ length: 128 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

//   return { privateKey, publicKey };
// };

export const generateKeyPair = () => {
  const ec = new EC('secp256k1');
  const keyPair = ec.genKeyPair();

  return {
    privateKey: keyPair.getPrivate('hex'),
    publicKey: keyPair.getPublic('hex'),
  };
};

/**
 * Represents the output of an asymmetric encryption process.
 */
export type AsymmetricEncryptOutput = {
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
};

export const decryptWithPrivateKey = (encryptedData: AsymmetricEncryptOutput, privateKey: string): string => {
  // Validate inputs
  if (!encryptedData || !privateKey) {
    throw new Error('Missing required parameters: encryptedData or privateKey');
  }

  const { ephemeralPublicKey, iv, authTag, encrypted } = encryptedData;

  // Validate all required fields exist
  if (!ephemeralPublicKey || !iv || !authTag || !encrypted) {
    throw new Error('Invalid encrypted data: missing required fields');
  }

  try {
    const ec = new EC('secp256k1');
    const recipientKeyPair = ec.keyFromPrivate(privateKey, 'hex');
    const ephemeralKey = ec.keyFromPublic(ephemeralPublicKey, 'hex');
    const sharedSecret = recipientKeyPair.derive(ephemeralKey.getPublic()).toString(16);

    // Ensure shared secret has sufficient length
    if (sharedSecret.length < 64) {
      throw new Error('Derived shared secret is too short');
    }

    // Use the shared secret to decrypt the data symmetrically with AES-256-GCM
    const keyBuffer = Buffer.from(sharedSecret, 'hex').subarray(0, 32);
    const ivBuffer = Buffer.from(iv, 'hex');
    const authTagBuffer = Buffer.from(authTag, 'hex');

    const decipher = createDecipheriv('aes-256-gcm', new Uint8Array(keyBuffer), new Uint8Array(ivBuffer));

    // Set the authentication tag
    decipher.setAuthTag(new Uint8Array(authTagBuffer));

    // Decrypt the data
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    // Improve error reporting by wrapping the original error
    if (error instanceof Error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
    throw new Error('Decryption failed due to unknown error');
  }
};

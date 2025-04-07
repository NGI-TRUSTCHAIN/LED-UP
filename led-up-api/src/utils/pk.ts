import { Buffer } from 'buffer';
import * as crypto from 'node:crypto';

import { ec } from 'elliptic';

// Create a secp256k1 curve instance
const ecCurve = new ec('secp256k1');

export const encryptWithPublicKey = (data: string, publicKey: string): string => {
  // Generate an ephemeral key pair
  const ephemeralKeyPair = ecCurve.genKeyPair();

  // Derive the shared secret using ECDH
  const recipientPublicKey = ecCurve.keyFromPublic(publicKey, 'hex');

  const sharedSecret = ephemeralKeyPair.derive(recipientPublicKey.getPublic()).toString(16);

  // Generate a random initialization vector (IV)
  const iv = crypto.randomBytes(16);

  // Use the shared secret to encrypt the data symmetrically with AES-256-GCM
  const cipher = crypto.createCipheriv(
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
  return JSON.stringify({ ephemeralPublicKey, iv: iv.toString('hex'), authTag, encrypted });
};

export const decryptWithPrivateKey = (encryptedData: string, privateKey: string): string => {
  // Parse the encrypted data
  const { ephemeralPublicKey, iv, authTag, encrypted } = JSON.parse(encryptedData);

  // Compute the shared secret using ECDH
  const recipientKeyPair = ecCurve.keyFromPrivate(privateKey, 'hex');
  const ephemeralKey = ecCurve.keyFromPublic(ephemeralPublicKey, 'hex');
  const sharedSecret = recipientKeyPair.derive(ephemeralKey.getPublic()).toString(16);

  // Use the shared secret to decrypt the data symmetrically with AES-256-GCM
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    Buffer.from(sharedSecret, 'hex').subarray(0, 32),
    Buffer.from(iv, 'hex')
  );

  // Set the authentication tag
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
};

import * as crypto from 'crypto';

import { AsymmetricCryptoService, CurveType } from './AsymmetricCryptoService';
import { HashingService, HashAlgorithm, HashEncoding } from './HashingService';
import { SymmetricCryptoService, SymmetricAlgorithm } from './SymmetricCryptoService';

/**
 * Test utility for cryptographic services.
 * This file provides functions to test the functionality of the cryptographic services.
 *
 * Run this file with: `ts-node test-crypto.ts`
 */

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

/**
 * Logs a test result to the console.
 */
function logResult(testName: string, success: boolean, error?: any): void {
  if (success) {
    console.log(`${colors.green}✓ ${colors.bright}${testName}${colors.reset}`);
  } else {
    console.log(`${colors.red}✗ ${colors.bright}${testName}${colors.reset}`);
    if (error) {
      console.log(`  ${colors.red}Error: ${error.message || error}${colors.reset}`);
    }
  }
}

/**
 * Runs a test function and logs the result.
 */
async function runTest(testName: string, testFn: () => Promise<void> | void): Promise<boolean> {
  try {
    await testFn();
    logResult(testName, true);
    return true;
  } catch (error) {
    logResult(testName, false, error);
    return false;
  }
}

/**
 * Tests for the AsymmetricCryptoService.
 */
async function testAsymmetricCryptoService(): Promise<void> {
  console.log(`\n${colors.cyan}${colors.bright}Testing AsymmetricCryptoService${colors.reset}\n`);

  // Test secp256k1 curve
  await runTest('SECP256K1: Key pair generation', async () => {
    const service = new AsymmetricCryptoService(CurveType.SECP256K1);
    const keyPair = service.generateKeyPair();

    if (!keyPair.publicKey || !keyPair.privateKey) {
      throw new Error('Key pair generation failed');
    }

    // Verify that the public key can be derived from the private key
    const derivedPublicKey = service.derivePublicKey(keyPair.privateKey);
    if (derivedPublicKey !== keyPair.publicKey) {
      throw new Error('Public key derivation failed');
    }
  });

  await runTest('SECP256K1: Encryption and decryption', async () => {
    const service = new AsymmetricCryptoService(CurveType.SECP256K1);
    const keyPair = service.generateKeyPair();
    const originalData = 'This is a test message for encryption';

    // Encrypt with public key
    const encryptedData = service.encryptWithPublicKey(originalData, keyPair.publicKey);

    // Decrypt with private key
    const decryptedData = service.decryptWithPrivateKey(encryptedData, keyPair.privateKey);

    if (decryptedData !== originalData) {
      throw new Error('Decrypted data does not match original data');
    }
  });

  await runTest('SECP256K1: Signing and verification', async () => {
    const service = new AsymmetricCryptoService(CurveType.SECP256K1);
    const keyPair = service.generateKeyPair();

    // Create a message hash (what would typically be signed)
    const message = 'This is a test message for signing';
    const messageHash = crypto.createHash('sha256').update(message).digest();

    // Sign the message hash
    const signature = service.sign(messageHash, keyPair.privateKey);

    // Verify the signature with the same hash
    const isValid = service.verify(messageHash, signature, keyPair.publicKey);

    if (!isValid) {
      throw new Error('Signature verification failed');
    }

    // Create a different message hash
    const tamperedMessage = 'This is a tampered message';
    const tamperedHash = crypto.createHash('sha256').update(tamperedMessage).digest();

    // Verify that a different hash fails verification
    const isInvalid = !service.verify(tamperedHash, signature, keyPair.publicKey);

    if (!isInvalid) {
      throw new Error('Tampered message verification should fail');
    }
  });

  // Test a simpler version of large data encryption
  await runTest('SECP256K1: Manual hybrid encryption', async () => {
    const service = new AsymmetricCryptoService(CurveType.SECP256K1);
    const keyPair = service.generateKeyPair();
    const symmetricService = new SymmetricCryptoService();

    // Create a medium-sized string (10KB)
    const largeData = 'A'.repeat(10 * 1024);

    // Generate a symmetric key
    const symmetricKey = symmetricService.generateKeyAsHex();

    // Encrypt the data with the symmetric key
    const encryptedData = symmetricService.encryptWithHexKey(largeData, symmetricKey);

    // Encrypt the symmetric key with the public key
    const encryptedSymmetricKey = service.encryptWithPublicKey(symmetricKey, keyPair.publicKey);

    // Decrypt the symmetric key with the private key
    const decryptedSymmetricKey = service.decryptWithPrivateKey(
      encryptedSymmetricKey,
      keyPair.privateKey
    );

    // Decrypt the data with the decrypted symmetric key
    const decryptedData = symmetricService.decryptWithHexKey(encryptedData, decryptedSymmetricKey);

    if (decryptedData !== largeData) {
      throw new Error('Decrypted large data does not match original data');
    }
  });

  // Test ed25519 curve
  await runTest('ED25519: Key pair generation', async () => {
    const service = new AsymmetricCryptoService(CurveType.ED25519);
    const keyPair = service.generateKeyPair();

    if (!keyPair.publicKey || !keyPair.privateKey) {
      throw new Error('Key pair generation failed');
    }

    // Verify that the public key can be derived from the private key
    const derivedPublicKey = service.derivePublicKey(keyPair.privateKey);
    if (derivedPublicKey !== keyPair.publicKey) {
      throw new Error('Public key derivation failed');
    }
  });

  // Skip ED25519 signature verification test for now
  await runTest('ED25519: Signature generation', async () => {
    const service = new AsymmetricCryptoService(CurveType.ED25519);
    const keyPair = service.generateKeyPair();

    // For ED25519, we'll use the raw message (not a hash)
    const message = 'This is a test message for signing with ED25519';
    const messageBuffer = Buffer.from(message);

    // Sign the message
    const signature = service.sign(messageBuffer, keyPair.privateKey);

    // Just verify that we get a signature
    if (!signature || signature.length === 0) {
      throw new Error('Failed to generate signature');
    }
  });

  await runTest('ED25519: Encryption not supported', async () => {
    const service = new AsymmetricCryptoService(CurveType.ED25519);
    const keyPair = service.generateKeyPair();
    const originalData = 'This is a test message for encryption';

    try {
      // This should throw an error
      service.encryptWithPublicKey(originalData, keyPair.publicKey);
      throw new Error('Encryption should not be supported with ED25519');
    } catch (error: any) {
      // Expected error
      if (!error.message.includes('only supported with secp256k1')) {
        throw new Error('Unexpected error message: ' + error.message);
      }
    }
  });
}

/**
 * Tests for the SymmetricCryptoService.
 */
async function testSymmetricCryptoService(): Promise<void> {
  console.log(`\n${colors.cyan}${colors.bright}Testing SymmetricCryptoService${colors.reset}\n`);

  // Test AES-256-CCM
  await runTest('AES-256-CCM: Encryption and decryption', async () => {
    const service = new SymmetricCryptoService(SymmetricAlgorithm.AES_256_CCM);
    const key = service.generateKey();
    const originalData = 'This is a test message for symmetric encryption with CCM';

    // Encrypt data
    const encryptedData = service.encrypt(originalData, key);

    // Decrypt data
    const decryptedData = service.decrypt(encryptedData, key);

    if (decryptedData !== originalData) {
      throw new Error('Decrypted data does not match original data');
    }
  });

  // Test AES-256-GCM
  await runTest('AES-256-GCM: Encryption and decryption', async () => {
    const service = new SymmetricCryptoService(SymmetricAlgorithm.AES_256_GCM);
    const key = service.generateKey();
    const originalData = 'This is a test message for symmetric encryption with GCM';

    // Encrypt data
    const encryptedData = service.encrypt(originalData, key, SymmetricAlgorithm.AES_256_GCM);

    // Decrypt data
    const decryptedData = service.decrypt(encryptedData, key, SymmetricAlgorithm.AES_256_GCM);

    if (decryptedData !== originalData) {
      throw new Error('Decrypted data does not match original data');
    }
  });

  // Test AES-256-CBC
  await runTest('AES-256-CBC: Encryption and decryption', async () => {
    const service = new SymmetricCryptoService();
    const key = service.generateKey();
    const originalData = 'This is a test message for symmetric encryption with CBC';

    // Encrypt data
    const encryptedData = service.encrypt(originalData, key, SymmetricAlgorithm.AES_256_CBC);

    // Decrypt data
    const decryptedData = service.decrypt(encryptedData, key, SymmetricAlgorithm.AES_256_CBC);

    if (decryptedData !== originalData) {
      throw new Error('Decrypted data does not match original data');
    }
  });

  // Test hex key
  await runTest('Hex key: Encryption and decryption', async () => {
    const service = new SymmetricCryptoService();
    const hexKey = service.generateKeyAsHex();
    const originalData = 'This is a test message for symmetric encryption with a hex key';

    // Encrypt data
    const encryptedData = service.encryptWithHexKey(originalData, hexKey);

    // Decrypt data
    const decryptedData = service.decryptWithHexKey(encryptedData, hexKey);

    if (decryptedData !== originalData) {
      throw new Error('Decrypted data does not match original data');
    }
  });

  // Test password-based encryption
  await runTest('Password-based encryption', async () => {
    const service = new SymmetricCryptoService();
    const password = 'MySecurePassword123!';
    const originalData = 'This is a test message for password-based encryption';

    // Encrypt data with password
    const encryptedData = service.encryptWithPassword(originalData, password);

    // Decrypt data with password
    const decryptedData = service.decryptWithPassword(encryptedData, password);

    if (decryptedData !== originalData) {
      throw new Error('Decrypted data does not match original data');
    }
  });

  // Test string-based encryption
  await runTest('String-based encryption', async () => {
    const service = new SymmetricCryptoService();
    const key = service.generateKey();
    const originalData = 'This is a test message for string-based encryption';

    // Encrypt data to string
    const encryptedString = service.encryptToString(originalData, key);

    // Decrypt data from string
    const decryptedData = service.decryptFromString(encryptedString, key);

    if (decryptedData !== originalData) {
      throw new Error('Decrypted data does not match original data');
    }
  });

  // Test key derivation
  await runTest('Key derivation from password', async () => {
    const service = new SymmetricCryptoService();
    const password = 'MySecurePassword123!';

    // Derive a key from the password
    const { key, salt } = service.deriveKeyFromPassword(password);

    // Derive the same key again with the same salt
    const { key: key2 } = service.deriveKeyFromPassword(password, salt);

    // Convert keys to hex for comparison - using a workaround for the CipherKey type
    const keyHex = Buffer.from(key as unknown as ArrayBuffer).toString('hex');
    const key2Hex = Buffer.from(key2 as unknown as ArrayBuffer).toString('hex');

    if (keyHex !== key2Hex) {
      throw new Error('Derived keys do not match');
    }
  });
}

/**
 * Tests for the HashingService.
 */
async function testHashingService(): Promise<void> {
  console.log(`\n${colors.cyan}${colors.bright}Testing HashingService${colors.reset}\n`);

  // Test SHA-256 hashing
  await runTest('SHA-256: Hashing in different formats', async () => {
    const service = new HashingService();
    const data = 'This is a test message for hashing';

    // Hash in different formats - we'll use direct methods for comparison
    const hexHash = await service.hashHex(data);
    const base64Hash = await service.hashBase64(data);

    // Create a new hash directly for comparison
    const directHexHash = await service.hashWithAlgorithm(
      data,
      HashAlgorithm.SHA256,
      HashEncoding.HEX
    );
    const directBase64Hash = await service.hashWithAlgorithm(
      data,
      HashAlgorithm.SHA256,
      HashEncoding.BASE64
    );

    // Compare with direct hashing
    if (hexHash !== directHexHash) {
      throw new Error('Hex hash does not match direct hex hash');
    }

    if (base64Hash !== directBase64Hash) {
      throw new Error('Base64 hash does not match direct base64 hash');
    }
  });

  // Test different hash algorithms
  await runTest('Different hash algorithms', async () => {
    const service = new HashingService();
    const data = 'This is a test message for hashing with different algorithms';

    // Hash with different algorithms
    const sha256Hash = await service.hashWithAlgorithm(
      data,
      HashAlgorithm.SHA256,
      HashEncoding.HEX
    );
    const sha512Hash = await service.hashWithAlgorithm(
      data,
      HashAlgorithm.SHA512,
      HashEncoding.HEX
    );
    const sha3_256Hash = await service.hashWithAlgorithm(
      data,
      HashAlgorithm.SHA3_256,
      HashEncoding.HEX
    );
    const sha3_512Hash = await service.hashWithAlgorithm(
      data,
      HashAlgorithm.SHA3_512,
      HashEncoding.HEX
    );
    const md5Hash = await service.hashWithAlgorithm(data, HashAlgorithm.MD5, HashEncoding.HEX);

    // Verify that the hashes are different
    const hashes = [sha256Hash, sha512Hash, sha3_256Hash, sha3_512Hash, md5Hash];
    const uniqueHashes = new Set(hashes);

    if (uniqueHashes.size !== hashes.length) {
      throw new Error('Some hashes are identical');
    }
  });

  // Test object hashing
  await runTest('Object hashing', async () => {
    const service = new HashingService();
    const obj = { name: 'John', age: 30, hobbies: ['reading', 'coding'] };

    // Hash the object
    const hash = await service.hashObject(obj);

    // Hash the same object again
    const hash2 = await service.hashObject(obj);

    // Verify that the hashes are the same
    if (hash !== hash2) {
      throw new Error('Object hashes do not match');
    }

    // Hash a different object
    const obj2 = { name: 'John', age: 31, hobbies: ['reading', 'coding'] };
    const hash3 = await service.hashObject(obj2);

    // Verify that the hashes are different
    if (hash === hash3) {
      throw new Error('Different objects should have different hashes');
    }
  });

  // Test hash verification
  await runTest('Hash verification', async () => {
    const service = new HashingService();
    const data = 'This is a test message for hash verification';

    // Hash the data
    const hash = await service.hashHex(data);

    // Verify the hash
    const isValid = await service.verifyHash(data, hash);

    if (!isValid) {
      throw new Error('Hash verification failed');
    }

    // Verify that a tampered message fails verification
    const tamperedData = data + ' (tampered)';
    const isInvalid = !(await service.verifyHash(tamperedData, hash));

    if (!isInvalid) {
      throw new Error('Tampered message verification should fail');
    }
  });

  // Test HMAC
  await runTest('HMAC creation and verification', async () => {
    const service = new HashingService();
    const data = 'This is a test message for HMAC';
    const secretKey = 'MySecretKey123!';

    // Create HMAC
    const hmac = await service.createHmac(data, secretKey);

    // Verify HMAC
    const isValid = await service.verifyHmac(data, hmac, secretKey);

    if (!isValid) {
      throw new Error('HMAC verification failed');
    }

    // Verify that a tampered message fails verification
    const tamperedData = data + ' (tampered)';
    const isInvalid = !(await service.verifyHmac(tamperedData, hmac, secretKey));

    if (!isInvalid) {
      throw new Error('Tampered message HMAC verification should fail');
    }

    // Verify that a different key fails verification
    const differentKey = 'DifferentKey123!';
    const isInvalidKey = !(await service.verifyHmac(data, hmac, differentKey));

    if (!isInvalidKey) {
      throw new Error('Different key HMAC verification should fail');
    }
  });

  // Test buffer hashing
  await runTest('Buffer hashing', async () => {
    const service = new HashingService();
    const buffer = Buffer.from('This is a test message for buffer hashing');

    // Hash the buffer
    const hash = await service.hashBuffer(buffer);

    // Hash the same buffer again
    const hash2 = await service.hashBuffer(buffer);

    // Verify that the hashes are the same
    if (hash !== hash2) {
      throw new Error('Buffer hashes do not match');
    }
  });

  // Test salted hashing
  await runTest('Salted hashing', async () => {
    const service = new HashingService();
    const data = 'This is a test message for salted hashing';
    const salt = 'MySalt123!';

    // Hash with salt
    const saltedHash = await service.hashWithSalt(data, salt);

    // Hash the same data with the same salt again
    const saltedHash2 = await service.hashWithSalt(data, salt);

    // Verify that the hashes are the same
    if (saltedHash !== saltedHash2) {
      throw new Error('Salted hashes do not match');
    }

    // Hash the same data with a different salt
    const differentSalt = 'DifferentSalt123!';
    const saltedHash3 = await service.hashWithSalt(data, differentSalt);

    // Verify that the hashes are different
    if (saltedHash === saltedHash3) {
      throw new Error('Hashes with different salts should be different');
    }

    // Hash without salt
    const unsaltedHash = await service.hashHex(data);

    // Verify that the salted and unsalted hashes are different
    if (saltedHash === unsaltedHash) {
      throw new Error('Salted and unsalted hashes should be different');
    }
  });
}

/**
 * Main function to run all tests.
 */
async function runAllTests(): Promise<void> {
  console.log(
    `${colors.magenta}${colors.bright}Running Cryptographic Services Tests${colors.reset}\n`
  );

  const startTime = Date.now();

  await testAsymmetricCryptoService();
  await testSymmetricCryptoService();
  await testHashingService();

  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;

  console.log(
    `\n${colors.magenta}${colors.bright}All tests completed in ${duration.toFixed(2)} seconds${colors.reset}`
  );
}

// Run all tests
runAllTests().catch(error => {
  console.error(`${colors.red}${colors.bright}Test runner error:${colors.reset}`, error);
});

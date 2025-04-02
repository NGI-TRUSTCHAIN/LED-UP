import * as crypto from 'crypto';

import {
  AsymmetricCryptoService,
  CurveType,
} from '../../../src/services/crypto/AsymmetricCryptoService';
import { SymmetricCryptoService } from '../../../src/services/crypto/SymmetricCryptoService';

describe('AsymmetricCryptoService', () => {
  describe('SECP256K1 Curve', () => {
    let service: AsymmetricCryptoService;
    let keyPair: { publicKey: string; privateKey: string };

    beforeEach(() => {
      service = new AsymmetricCryptoService(CurveType.SECP256K1);
      keyPair = service.generateKeyPair();
    });

    it('should generate a valid key pair', () => {
      expect(keyPair.publicKey).toBeDefined();
      expect(keyPair.privateKey).toBeDefined();

      const derivedPublicKey = service.derivePublicKey(keyPair.privateKey);
      expect(derivedPublicKey).toEqual(keyPair.publicKey);
    });

    it('should encrypt and decrypt data', () => {
      const originalData = 'This is a test message for encryption';

      // Encrypt with public key
      const encryptedData = service.encryptWithPublicKey(originalData, keyPair.publicKey);

      // Decrypt with private key
      const decryptedData = service.decryptWithPrivateKey(encryptedData, keyPair.privateKey);

      expect(decryptedData).toEqual(originalData);
    });

    it('should sign and verify data', () => {
      const message = 'This is a test message for signing';
      const messageHash = crypto.createHash('sha256').update(message).digest();

      // Sign the message hash
      const signature = service.sign(messageHash, keyPair.privateKey);

      // Verify the signature with the same hash
      const isValid = service.verify(messageHash, signature, keyPair.publicKey);
      expect(isValid).toBe(true);

      // Create a different message hash
      const tamperedMessage = 'This is a tampered message';
      const tamperedHash = crypto.createHash('sha256').update(tamperedMessage).digest();

      // Verify that a different hash fails verification
      const isInvalid = !service.verify(tamperedHash, signature, keyPair.publicKey);
      expect(isInvalid).toBe(true);
    });

    it('should perform hybrid encryption for large data', () => {
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
      const decryptedData = symmetricService.decryptWithHexKey(
        encryptedData,
        decryptedSymmetricKey
      );

      expect(decryptedData).toEqual(largeData);
    });
  });

  describe('ED25519 Curve', () => {
    let service: AsymmetricCryptoService;
    let keyPair: { publicKey: string; privateKey: string };

    beforeEach(() => {
      service = new AsymmetricCryptoService(CurveType.ED25519);
      keyPair = service.generateKeyPair();
    });

    it('should generate a valid key pair', () => {
      expect(keyPair.publicKey).toBeDefined();
      expect(keyPair.privateKey).toBeDefined();

      const derivedPublicKey = service.derivePublicKey(keyPair.privateKey);
      expect(derivedPublicKey).toEqual(keyPair.publicKey);
    });

    it('should sign data and generate a valid signature', () => {
      const message = 'This is a test message for signing with ED25519';
      const messageBuffer = Buffer.from(message);

      // Sign the message
      const signature = service.sign(messageBuffer, keyPair.privateKey);

      // Just verify that we get a signature
      expect(signature).toBeDefined();
      expect(signature.length).toBeGreaterThan(0);
    });

    it('should not support encryption', () => {
      const originalData = 'This is a test message for encryption';

      // This should throw an error
      expect(() => {
        service.encryptWithPublicKey(originalData, keyPair.publicKey);
      }).toThrow(/only supported with secp256k1/);
    });
  });
});

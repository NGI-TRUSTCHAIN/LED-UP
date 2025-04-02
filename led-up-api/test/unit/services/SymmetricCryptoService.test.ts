import {
  SymmetricCryptoService,
  SymmetricAlgorithm,
} from '../../../src/services/crypto/SymmetricCryptoService';

describe('SymmetricCryptoService', () => {
  describe('AES-256-CCM', () => {
    let service: SymmetricCryptoService;

    beforeEach(() => {
      service = new SymmetricCryptoService(SymmetricAlgorithm.AES_256_CCM);
    });

    it('should encrypt and decrypt data', () => {
      const key = service.generateKey();
      const originalData = 'This is a test message for symmetric encryption with CCM';

      // Encrypt data
      const encryptedData = service.encrypt(originalData, key);

      // Decrypt data
      const decryptedData = service.decrypt(encryptedData, key);

      expect(decryptedData).toEqual(originalData);
    });
  });

  describe('AES-256-GCM', () => {
    let service: SymmetricCryptoService;

    beforeEach(() => {
      service = new SymmetricCryptoService(SymmetricAlgorithm.AES_256_GCM);
    });

    it('should encrypt and decrypt data', () => {
      const key = service.generateKey();
      const originalData = 'This is a test message for symmetric encryption with GCM';

      // Encrypt data
      const encryptedData = service.encrypt(originalData, key, SymmetricAlgorithm.AES_256_GCM);

      // Decrypt data
      const decryptedData = service.decrypt(encryptedData, key, SymmetricAlgorithm.AES_256_GCM);

      expect(decryptedData).toEqual(originalData);
    });
  });

  describe('AES-256-CBC', () => {
    let service: SymmetricCryptoService;

    beforeEach(() => {
      service = new SymmetricCryptoService();
    });

    it('should encrypt and decrypt data', () => {
      const key = service.generateKey();
      const originalData = 'This is a test message for symmetric encryption with CBC';

      // Encrypt data
      const encryptedData = service.encrypt(originalData, key, SymmetricAlgorithm.AES_256_CBC);

      // Decrypt data
      const decryptedData = service.decrypt(encryptedData, key, SymmetricAlgorithm.AES_256_CBC);

      expect(decryptedData).toEqual(originalData);
    });
  });

  describe('Hex Key', () => {
    let service: SymmetricCryptoService;

    beforeEach(() => {
      service = new SymmetricCryptoService();
    });

    it('should encrypt and decrypt data with a hex key', () => {
      const hexKey = service.generateKeyAsHex();
      const originalData = 'This is a test message for symmetric encryption with a hex key';

      // Encrypt data
      const encryptedData = service.encryptWithHexKey(originalData, hexKey);

      // Decrypt data
      const decryptedData = service.decryptWithHexKey(encryptedData, hexKey);

      expect(decryptedData).toEqual(originalData);
    });
  });

  describe('Password-based Encryption', () => {
    let service: SymmetricCryptoService;

    beforeEach(() => {
      service = new SymmetricCryptoService();
    });

    it('should encrypt and decrypt data with a password', () => {
      const password = 'MySecurePassword123!';
      const originalData = 'This is a test message for password-based encryption';

      // Encrypt data with password
      const encryptedData = service.encryptWithPassword(originalData, password);

      // Decrypt data with password
      const decryptedData = service.decryptWithPassword(encryptedData, password);

      expect(decryptedData).toEqual(originalData);
    });
  });

  describe('String-based Encryption', () => {
    let service: SymmetricCryptoService;

    beforeEach(() => {
      service = new SymmetricCryptoService();
    });

    it('should encrypt to string and decrypt from string', () => {
      const key = service.generateKey();
      const originalData = 'This is a test message for string-based encryption';

      // Encrypt data to string
      const encryptedString = service.encryptToString(originalData, key);

      // Decrypt data from string
      const decryptedData = service.decryptFromString(encryptedString, key);

      expect(decryptedData).toEqual(originalData);
    });
  });

  describe('Key Derivation', () => {
    let service: SymmetricCryptoService;

    beforeEach(() => {
      service = new SymmetricCryptoService();
    });

    it('should derive the same key from a password and salt', () => {
      const password = 'MySecurePassword123!';

      // Derive a key from the password
      const { key, salt } = service.deriveKeyFromPassword(password);

      // Derive the same key again with the same salt
      const { key: key2 } = service.deriveKeyFromPassword(password, salt);

      // Convert keys to hex for comparison - using a workaround for the CipherKey type
      const keyHex = Buffer.from(key as unknown as ArrayBuffer).toString('hex');
      const key2Hex = Buffer.from(key2 as unknown as ArrayBuffer).toString('hex');

      expect(keyHex).toEqual(key2Hex);
    });
  });
});

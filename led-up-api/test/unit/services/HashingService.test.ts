import {
  HashingService,
  HashAlgorithm,
  HashEncoding,
} from '../../../src/services/crypto/HashingService';

describe('HashingService', () => {
  let service: HashingService;

  beforeEach(() => {
    service = new HashingService();
  });

  describe('SHA-256 Hashing', () => {
    it('should hash data in different formats', async () => {
      const data = 'This is a test message for hashing';

      // Hash in different formats
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
      expect(hexHash).toEqual(directHexHash);
      expect(base64Hash).toEqual(directBase64Hash);
    });
  });

  describe('Different Hash Algorithms', () => {
    it('should produce different hashes with different algorithms', async () => {
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

      expect(uniqueHashes.size).toEqual(hashes.length);
    });
  });

  describe('Object Hashing', () => {
    it('should hash objects consistently', async () => {
      const obj = { name: 'John', age: 30, hobbies: ['reading', 'coding'] };

      // Hash the object
      const hash = await service.hashObject(obj);

      // Hash the same object again
      const hash2 = await service.hashObject(obj);

      // Verify that the hashes are the same
      expect(hash).toEqual(hash2);

      // Hash a different object
      const obj2 = { name: 'John', age: 31, hobbies: ['reading', 'coding'] };
      const hash3 = await service.hashObject(obj2);

      // Verify that the hashes are different
      expect(hash).not.toEqual(hash3);
    });
  });

  describe('Hash Verification', () => {
    it('should verify hashes correctly', async () => {
      const data = 'This is a test message for hash verification';

      // Hash the data
      const hash = await service.hashHex(data);

      // Verify the hash
      const isValid = await service.verifyHash(data, hash);
      expect(isValid).toBe(true);

      // Verify that a tampered message fails verification
      const tamperedData = data + ' (tampered)';
      const isInvalid = !(await service.verifyHash(tamperedData, hash));
      expect(isInvalid).toBe(true);
    });
  });

  describe('HMAC', () => {
    it('should create and verify HMACs', async () => {
      const data = 'This is a test message for HMAC';
      const secretKey = 'MySecretKey123!';

      // Create HMAC
      const hmac = await service.createHmac(data, secretKey);

      // Verify HMAC
      const isValid = await service.verifyHmac(data, hmac, secretKey);
      expect(isValid).toBe(true);

      // Verify that a tampered message fails verification
      const tamperedData = data + ' (tampered)';
      const isInvalid = !(await service.verifyHmac(tamperedData, hmac, secretKey));
      expect(isInvalid).toBe(true);

      // Verify that a different key fails verification
      const differentKey = 'DifferentKey123!';
      const isInvalidKey = !(await service.verifyHmac(data, hmac, differentKey));
      expect(isInvalidKey).toBe(true);
    });
  });

  describe('Buffer Hashing', () => {
    it('should hash buffers consistently', async () => {
      const buffer = Buffer.from('This is a test message for buffer hashing');

      // Hash the buffer
      const hash = await service.hashBuffer(buffer);

      // Hash the same buffer again
      const hash2 = await service.hashBuffer(buffer);

      // Verify that the hashes are the same
      expect(hash).toEqual(hash2);
    });
  });

  describe('Salted Hashing', () => {
    it('should hash with salt correctly', async () => {
      const data = 'This is a test message for salted hashing';
      const salt = 'MySalt123!';

      // Hash with salt
      const saltedHash = await service.hashWithSalt(data, salt);

      // Hash the same data with the same salt again
      const saltedHash2 = await service.hashWithSalt(data, salt);

      // Verify that the hashes are the same
      expect(saltedHash).toEqual(saltedHash2);

      // Hash the same data with a different salt
      const differentSalt = 'DifferentSalt123!';
      const saltedHash3 = await service.hashWithSalt(data, differentSalt);

      // Verify that the hashes are different
      expect(saltedHash).not.toEqual(saltedHash3);

      // Hash without salt
      const unsaltedHash = await service.hashHex(data);

      // Verify that the salted and unsalted hashes are different
      expect(saltedHash).not.toEqual(unsaltedHash);
    });
  });
});

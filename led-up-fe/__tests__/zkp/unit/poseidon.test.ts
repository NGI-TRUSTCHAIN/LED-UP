import { calculatePoseidonHash, splitHashForCircuit, poseidonHashToHex } from '@/features/zkp/utils/poseidon';

// Mock the poseidon instance
jest.mock('circomlibjs', () => {
  const mockF = {
    toObject: jest
      .fn()
      .mockImplementation((hash) => BigInt('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef')),
  };

  const mockPoseidonInstance = {
    hash: jest.fn().mockImplementation((inputs) => 'mock-hash'),
    F: mockF,
  };

  return {
    buildPoseidon: jest.fn().mockResolvedValue(mockPoseidonInstance),
  };
});

describe('Poseidon Hash Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('calculatePoseidonHash', () => {
    it('should calculate hash from array of numbers', async () => {
      const hash = await calculatePoseidonHash([1, 2, 3, 4]);
      // The value should match our mocked return value
      expect(hash).toBe(BigInt('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'));
    });

    it('should handle string inputs', async () => {
      const hash = await calculatePoseidonHash(['0x1234', '0xabcd']);
      expect(hash).toBe(BigInt('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'));
    });
  });

  describe('splitHashForCircuit', () => {
    it('should split a hash into low and high bits', () => {
      const testHash = BigInt('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');
      const [low, high] = splitHashForCircuit(testHash);

      // Check that the low bits contain the bottom 128 bits
      const maxLowValue = (BigInt(1) << BigInt(128)) - BigInt(1);
      expect(low).toBeLessThanOrEqual(maxLowValue);

      // Check that combining them gives us back the original
      const combined = (high << BigInt(128)) | low;
      expect(combined).toBe(testHash);
    });
  });

  describe('poseidonHashToHex', () => {
    it('should convert a BigInt hash to a hex string', () => {
      const testHash = BigInt('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');
      const hexHash = poseidonHashToHex(testHash);

      expect(hexHash).toBe('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');
      expect(hexHash.startsWith('0x')).toBe(true);
      expect(hexHash.length).toBe(2 + 64); // '0x' + 64 hex chars
    });

    it('should pad the hex string properly for small numbers', () => {
      const smallHash = BigInt('0x1234');
      const hexHash = poseidonHashToHex(smallHash);

      expect(hexHash).toBe('0x0000000000000000000000000000000000000000000000000000000000001234');
      expect(hexHash.length).toBe(2 + 64); // '0x' + 64 hex chars
    });
  });
});

import { CircuitTestFramework } from '../CircuitTestFramework';
import { AgeVerificationType, CircuitType } from '../types/index';
import * as path from 'path';
import * as assert from 'assert';
import { calculatePoseidonHash, splitHashForCircuit } from '../utils/poseidon';

// Path configuration - adjust these to the actual paths in your project
const ARTIFACTS_PATH = path.join(__dirname, '../../src/contracts/circuits/circom/enhanced/out-files');

// Paths for AgeVerifier
const AGE_WASM_PATH = path.join(ARTIFACTS_PATH, 'AgeVerifier_js/AgeVerifier.wasm');
const AGE_ZKEY_PATH = path.join(ARTIFACTS_PATH, 'AgeVerifier_0001.zkey');
const AGE_VERIFICATION_KEY_PATH = path.join(ARTIFACTS_PATH, 'verification_key_AgeVerifier.json');

// Paths for HashVerifier
const HASH_WASM_PATH = path.join(ARTIFACTS_PATH, 'HashVerifier_js/HashVerifier.wasm');
const HASH_ZKEY_PATH = path.join(ARTIFACTS_PATH, 'HashVerifier_0001.zkey');
const HASH_VERIFICATION_KEY_PATH = path.join(ARTIFACTS_PATH, 'verification_key_HashVerifier.json');

/**
 * Get current date in YYYYMMDD format
 */
function getCurrentDate(): number {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  return year * 10000 + month * 100 + day;
}

/**
 * Convert years to a date in YYYYMMDD format
 * @param yearsAgo Number of years ago from current date
 */
function getBirthDate(yearsAgo: number): number {
  const now = new Date();
  const birthYear = now.getFullYear() - yearsAgo;
  const month = now.getMonth() + 1;
  const day = now.getDate();
  return birthYear * 10000 + month * 100 + day;
}

describe('Circuit Integration Tests', function () {
  // This may take longer than usual because proof generation is computationally intensive
  this.timeout(60000);

  describe('End-to-end AgeVerifier tests', () => {
    it('should verify age above threshold with full workflow', async () => {
      // 1. Prepare the input data for age verification
      const ageVerifierInput = {
        age: 25,
        birthDate: 0, // not used in this mode
        currentDate: getCurrentDate(),
        threshold: 18,
        verificationType: AgeVerificationType.SIMPLE,
      };

      // 2. Generate the proof
      const { proof, publicSignals } = await CircuitTestFramework.generateProof(
        AGE_WASM_PATH,
        AGE_ZKEY_PATH,
        ageVerifierInput
      );

      // 3. Verify the proof
      const isValid = await CircuitTestFramework.verifyProof(AGE_VERIFICATION_KEY_PATH, proof, publicSignals);
      assert.strictEqual(isValid, true, 'Proof verification should succeed');

      // 4. Check the result code
      const resultCode = parseInt(publicSignals[0], 10);
      assert.strictEqual(resultCode, 1, 'Result code should indicate successful verification');
    });

    it('should integrate birth date verification with age calculation', async () => {
      // 1. Prepare the input data for birth date verification
      const ageVerifierInput = {
        age: 0, // not used in this mode
        birthDate: getBirthDate(25), // Born 25 years ago
        currentDate: getCurrentDate(),
        threshold: 18,
        verificationType: AgeVerificationType.BIRTH_DATE,
      };

      // 2. Generate the proof
      const { proof, publicSignals } = await CircuitTestFramework.generateProof(
        AGE_WASM_PATH,
        AGE_ZKEY_PATH,
        ageVerifierInput
      );

      // 3. Verify the proof
      const isValid = await CircuitTestFramework.verifyProof(AGE_VERIFICATION_KEY_PATH, proof, publicSignals);
      assert.strictEqual(isValid, true, 'Proof verification should succeed');

      // 4. Check the result code
      const resultCode = parseInt(publicSignals[0], 10);
      assert.strictEqual(resultCode, 1, 'Result code should indicate successful verification');
    });
  });

  describe('End-to-end HashVerifier tests', () => {
    it('should verify hash with full workflow', async () => {
      // 1. Prepare the data to hash
      const testData = [123456, 654321, 111111, 999999];

      // 2. Calculate the hash
      const hash = await calculatePoseidonHash(testData);
      const [low, high] = splitHashForCircuit(hash);

      // 3. Create the input for the circuit
      const hashVerifierInput = {
        data: testData,
        expectedHash: [low, high],
      };

      // 4. Generate the proof
      const { proof, publicSignals } = await CircuitTestFramework.generateProof(
        HASH_WASM_PATH,
        HASH_ZKEY_PATH,
        hashVerifierInput
      );

      // 5. Verify the proof
      const isValid = await CircuitTestFramework.verifyProof(HASH_VERIFICATION_KEY_PATH, proof, publicSignals);
      assert.strictEqual(isValid, true, 'Proof verification should succeed');

      // 6. Check the result code
      const resultCode = parseInt(publicSignals[0], 10);
      assert.strictEqual(resultCode, 1, 'Result code should indicate successful verification');
    });

    it('should detect hash mismatch in full workflow', async () => {
      // 1. Prepare the data to hash
      const testData = [123456, 654321, 111111, 999999];

      // 2. Calculate the hash
      const hash = await calculatePoseidonHash(testData);
      const [low, high] = splitHashForCircuit(hash);

      // 3. Modify the hash to create a mismatch
      const modifiedLow = low + 1n;

      // 4. Create the input for the circuit
      const hashVerifierInput = {
        data: testData,
        expectedHash: [modifiedLow, high],
      };

      // 5. Generate the proof
      const { proof, publicSignals } = await CircuitTestFramework.generateProof(
        HASH_WASM_PATH,
        HASH_ZKEY_PATH,
        hashVerifierInput
      );

      // 6. Verify the proof (this should still succeed because the circuit is valid)
      const isValid = await CircuitTestFramework.verifyProof(HASH_VERIFICATION_KEY_PATH, proof, publicSignals);
      assert.strictEqual(isValid, true, 'Proof verification should succeed');

      // 7. Check the result code indicates hash mismatch
      const resultCode = parseInt(publicSignals[0], 10);
      assert.strictEqual(resultCode, 0, 'Result code should indicate hash verification failed');
    });
  });

  describe('Cross-circuit integration', () => {
    it('should use hash verification result as input to age verification', async () => {
      // 1. Generate some data that includes age information
      const ageValue = 25;
      const testData = [ageValue, 654321, 111111, 999999]; // First element is the age

      // 2. Calculate hash for this data
      const hash = await calculatePoseidonHash(testData);
      const [low, high] = splitHashForCircuit(hash);

      // 3. Verify the hash first
      const hashVerifierInput = {
        data: testData,
        expectedHash: [low, high],
      };

      // Generate and verify hash proof
      const hashResult = await CircuitTestFramework.testCircuit(
        hashVerifierInput,
        1, // success code
        HASH_WASM_PATH,
        HASH_ZKEY_PATH,
        HASH_VERIFICATION_KEY_PATH
      );
      assert.strictEqual(hashResult, true, 'Hash verification should succeed');

      // 4. Now use the first element from the data as age in age verification
      const ageVerifierInput = {
        age: testData[0], // use the first element as age
        birthDate: 0,
        currentDate: getCurrentDate(),
        threshold: 18,
        verificationType: AgeVerificationType.SIMPLE,
      };

      // 5. Verify the age
      const ageResult = await CircuitTestFramework.testCircuit(
        ageVerifierInput,
        1, // success code
        AGE_WASM_PATH,
        AGE_ZKEY_PATH,
        AGE_VERIFICATION_KEY_PATH
      );
      assert.strictEqual(ageResult, true, 'Age verification should succeed');
    });
  });
});

import { CircuitTestFramework } from '../CircuitTestFramework';
import * as path from 'path';
import { calculatePoseidonHash, splitHashForCircuit } from '../utils/poseidon';
import { HashVerificationResult } from '../utils/types';
import fs from 'fs';

// Path configuration
const projectRoot = path.resolve(__dirname, '../../');
const outDir = process.env.OUT_DIR || path.join(projectRoot, 'out-files/hash-verifier');
const wasmPath = path.join(outDir, 'HashVerifier_js/HashVerifier.wasm');
const zkeyPath = path.join(outDir, 'HashVerifier_0001.zkey');
const verificationKeyPath = path.join(outDir, 'verification_key_HashVerifier.json');

// Check if required files exist
if (!fs.existsSync(wasmPath)) {
  console.error(`WASM file not found at: ${wasmPath}`);
  console.error('Please compile the circuit first using ./scripts/setup-hash-verifier.sh');
  process.exit(1);
}

// Main test function
async function runHashVerifierTests() {
  console.log('Running HashVerifier Circuit Tests');

  // Test data - ensure all values are non-zero for valid case
  const testData = [123456n, 654321n, 111111n, 999999n];

  // Test: Valid Hash Verification
  try {
    console.log('\nTest: Valid Hash Verification');

    // First calculate the hash for our test data
    const hash = await calculatePoseidonHash(testData.map(Number));
    const [low, high] = splitHashForCircuit(hash);

    const input = {
      data: testData,
      expectedHash: [low, high],
    };

    const result = await CircuitTestFramework.testCircuit(
      input,
      HashVerificationResult.SUCCESS,
      wasmPath,
      zkeyPath,
      verificationKeyPath
    );

    console.log(result ? '✅ Test passed' : '❌ Test failed');
  } catch (error) {
    console.error('❌ Test error:', error);
  }

  // Test: Invalid Input Verification
  try {
    console.log('\nTest: Invalid Input Verification');

    // Use data with zeros (invalid input)
    const invalidData = [123456n, 0n, 111111n, 999999n];
    const hash = await calculatePoseidonHash(invalidData.map(Number));
    const [low, high] = splitHashForCircuit(hash);

    const input = {
      data: invalidData,
      expectedHash: [low, high],
    };

    const result = await CircuitTestFramework.testCircuit(
      input,
      HashVerificationResult.INVALID_INPUT,
      wasmPath,
      zkeyPath,
      verificationKeyPath
    );

    console.log(result ? '✅ Test passed' : '❌ Test failed');
  } catch (error) {
    console.error('❌ Test error:', error);
  }

  // Test: Hash Mismatch Verification
  try {
    console.log('\nTest: Hash Mismatch Verification');

    // Use incorrect expected hash
    const input = {
      data: testData,
      expectedHash: [987654321n, 0n], // Incorrect hash
    };

    const result = await CircuitTestFramework.testCircuit(
      input,
      HashVerificationResult.HASH_MISMATCH,
      wasmPath,
      zkeyPath,
      verificationKeyPath
    );

    console.log(result ? '✅ Test passed' : '❌ Test failed');
  } catch (error) {
    console.error('❌ Test error:', error);
  }

  // Test: Zero Data Verification
  try {
    console.log('\nTest: Zero Data Verification');

    // All zeros data (invalid input)
    const zeroData = [0n, 0n, 0n, 0n];
    const hash = await calculatePoseidonHash(zeroData.map(Number));
    const [low, high] = splitHashForCircuit(hash);

    const input = {
      data: zeroData,
      expectedHash: [low, high],
    };

    const result = await CircuitTestFramework.testCircuit(
      input,
      HashVerificationResult.INVALID_INPUT,
      wasmPath,
      zkeyPath,
      verificationKeyPath
    );

    console.log(result ? '✅ Test passed' : '❌ Test failed');
  } catch (error) {
    console.error('❌ Test error:', error);
  }

  // Test: Large Value Data Verification
  try {
    console.log('\nTest: Large Value Data Verification');

    // Data with large values
    const largeData = [1000000n, 2000000n, 3000000n, 4000000n];
    const hash = await calculatePoseidonHash(largeData.map(Number));
    const [low, high] = splitHashForCircuit(hash);

    const input = {
      data: largeData,
      expectedHash: [low, high],
    };

    const result = await CircuitTestFramework.testCircuit(
      input,
      HashVerificationResult.SUCCESS,
      wasmPath,
      zkeyPath,
      verificationKeyPath
    );

    console.log(result ? '✅ Test passed' : '❌ Test failed');
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

// Run the tests
runHashVerifierTests().catch((error) => {
  console.error('Failed to run tests:', error);
  process.exit(1);
});

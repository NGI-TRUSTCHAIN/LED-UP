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

/**
 * Simple test for the HashVerifier circuit
 * Checks basic functionality with a valid hash
 */
async function runSimpleHashVerifierTest() {
  console.log('Running Simple HashVerifier Test');

  try {
    // Test data
    const testData = [123456n, 654321n, 111111n, 999999n];

    // Calculate hash for the test data
    const hash = await calculatePoseidonHash(testData.map(Number));
    const [low, high] = splitHashForCircuit(hash);

    console.log('Test data:', testData.join(', '));
    console.log('Generated hash:', [low, high].join(', '));

    // Create circuit input
    const input = {
      data: testData,
      expectedHash: [low, high],
    };

    // Run the test
    console.log('Testing circuit with valid data and hash...');
    const result = await CircuitTestFramework.testCircuit(
      input,
      HashVerificationResult.SUCCESS,
      wasmPath,
      zkeyPath,
      verificationKeyPath
    );

    // Output result
    if (result) {
      console.log('✅ Simple test passed: Circuit correctly verified the hash!');
      return true;
    } else {
      console.log('❌ Simple test failed: Circuit did not verify the hash correctly');
      return false;
    }
  } catch (error) {
    console.error('❌ Error during test:', error);
    return false;
  }
}

// Run the simple test
runSimpleHashVerifierTest()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Failed to run simple test:', error);
    process.exit(1);
  });

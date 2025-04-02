import { CircuitTestFramework } from '../CircuitTestFramework';
import * as path from 'path';
import * as assert from 'assert';
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

// Test data generation
function generateTestData(type: 'valid' | 'invalid' | 'mismatch' | 'zero' | 'large' | 'boundary'): {
  data: bigint[];
  expectedHash?: [bigint, bigint];
  expectedResult: HashVerificationResult;
} {
  switch (type) {
    case 'valid':
      const validData = [123456n, 654321n, 111111n, 999999n];
      return {
        data: validData,
        expectedResult: HashVerificationResult.SUCCESS,
      };
    case 'invalid':
      const invalidData = [123456n, 0n, 111111n, 999999n];
      return {
        data: invalidData,
        expectedResult: HashVerificationResult.INVALID_INPUT,
      };
    case 'mismatch':
      const validData2 = [123456n, 654321n, 111111n, 999999n];
      return {
        data: validData2,
        expectedHash: [987654321n, 0n], // Deliberately incorrect hash
        expectedResult: HashVerificationResult.HASH_MISMATCH,
      };
    case 'zero':
      const zeroData = [0n, 0n, 0n, 0n];
      return {
        data: zeroData,
        expectedResult: HashVerificationResult.INVALID_INPUT,
      };
    case 'large':
      const largeData = [1000000n, 2000000n, 3000000n, 4000000n];
      return {
        data: largeData,
        expectedResult: HashVerificationResult.SUCCESS,
      };
    case 'boundary':
      // Use string representation for very large numbers
      const boundaryData = [
        BigInt('21888242871839275222246405745257275088548364400416034343698204186575808495607'), // field size - 10
        BigInt('10944121435919637611123202872628637544274182200208017171849102093287904247808'), // ~field size / 2
        BigInt('5472060717959818805561601436314318772137091100104008585924551046643952123904'), // ~field size / 4
        BigInt('2736030358979909402780800718157159386068545550052004292962275523321976061952'), // ~field size / 8
      ];
      return {
        data: boundaryData,
        expectedResult: HashVerificationResult.SUCCESS,
      };
    default:
      throw new Error(`Unknown test type: ${type}`);
  }
}

// Main test function
async function runHashVerifierDetailedTests() {
  console.log('Running HashVerifier Detailed Circuit Tests');

  // Track test results
  let passedTests = 0;
  let failedTests = 0;
  const totalTests = 6;

  // Test case 1: Valid Hash Verification
  try {
    console.log('\n🔍 Test 1: Valid Hash Verification');

    const { data, expectedResult } = generateTestData('valid');
    const hash = await calculatePoseidonHash(data);
    const [low, high] = splitHashForCircuit(hash);

    const input = {
      data,
      expectedHash: [low, high],
    };

    console.log(`Testing with data: [${data.join(', ')}]`);
    console.log(`Expected hash: [${low}, ${high}]`);
    console.log(`Expected result: ${expectedResult}`);

    const result = await CircuitTestFramework.testCircuit(
      input,
      expectedResult,
      wasmPath,
      zkeyPath,
      verificationKeyPath
    );

    if (result) {
      console.log('✅ Test passed successfully');
      passedTests++;
    } else {
      console.log('❌ Test failed');
      failedTests++;
    }
  } catch (error) {
    console.error('❌ Test error:', error);
    failedTests++;
  }

  // Test case 2: Invalid Input Verification
  try {
    console.log('\n🔍 Test 2: Invalid Input Verification');

    const { data, expectedResult } = generateTestData('invalid');
    const hash = await calculatePoseidonHash(data);
    const [low, high] = splitHashForCircuit(hash);

    const input = {
      data,
      expectedHash: [low, high],
    };

    console.log(`Testing with data: [${data.join(', ')}]`);
    console.log(`Expected hash: [${low}, ${high}]`);
    console.log(`Expected result: ${expectedResult}`);

    const result = await CircuitTestFramework.testCircuit(
      input,
      expectedResult,
      wasmPath,
      zkeyPath,
      verificationKeyPath
    );

    if (result) {
      console.log('✅ Test passed successfully');
      passedTests++;
    } else {
      console.log('❌ Test failed');
      failedTests++;
    }
  } catch (error) {
    console.error('❌ Test error:', error);
    failedTests++;
  }

  // Test case 3: Hash Mismatch Verification
  try {
    console.log('\n🔍 Test 3: Hash Mismatch Verification');

    const { data, expectedHash, expectedResult } = generateTestData('mismatch');

    const input = {
      data,
      expectedHash,
    };

    console.log(`Testing with data: [${data.join(', ')}]`);
    console.log(`Expected hash (incorrect): [${expectedHash?.[0]}, ${expectedHash?.[1]}]`);
    console.log(`Expected result: ${expectedResult}`);

    const result = await CircuitTestFramework.testCircuit(
      input,
      expectedResult,
      wasmPath,
      zkeyPath,
      verificationKeyPath
    );

    if (result) {
      console.log('✅ Test passed successfully');
      passedTests++;
    } else {
      console.log('❌ Test failed');
      failedTests++;
    }
  } catch (error) {
    console.error('❌ Test error:', error);
    failedTests++;
  }

  // Test case 4: Zero Data Verification
  try {
    console.log('\n🔍 Test 4: Zero Data Verification');

    const { data, expectedResult } = generateTestData('zero');
    const hash = await calculatePoseidonHash(data);
    const [low, high] = splitHashForCircuit(hash);

    const input = {
      data,
      expectedHash: [low, high],
    };

    console.log(`Testing with data: [${data.join(', ')}]`);
    console.log(`Expected hash: [${low}, ${high}]`);
    console.log(`Expected result: ${expectedResult}`);

    const result = await CircuitTestFramework.testCircuit(
      input,
      expectedResult,
      wasmPath,
      zkeyPath,
      verificationKeyPath
    );

    if (result) {
      console.log('✅ Test passed successfully');
      passedTests++;
    } else {
      console.log('❌ Test failed');
      failedTests++;
    }
  } catch (error) {
    console.error('❌ Test error:', error);
    failedTests++;
  }

  // Test case 5: Large Value Data Verification
  try {
    console.log('\n🔍 Test 5: Large Value Data Verification');

    const { data, expectedResult } = generateTestData('large');
    const hash = await calculatePoseidonHash(data);
    const [low, high] = splitHashForCircuit(hash);

    const input = {
      data,
      expectedHash: [low, high],
    };

    console.log(`Testing with data: [${data.join(', ')}]`);
    console.log(`Expected hash: [${low}, ${high}]`);
    console.log(`Expected result: ${expectedResult}`);

    const result = await CircuitTestFramework.testCircuit(
      input,
      expectedResult,
      wasmPath,
      zkeyPath,
      verificationKeyPath
    );

    if (result) {
      console.log('✅ Test passed successfully');
      passedTests++;
    } else {
      console.log('❌ Test failed');
      failedTests++;
    }
  } catch (error) {
    console.error('❌ Test error:', error);
    failedTests++;
  }

  // Test case 6: Boundary Values
  try {
    console.log('\n🔍 Test 6: Boundary Values Verification');

    const { data, expectedResult } = generateTestData('boundary');
    const hash = await calculatePoseidonHash(data);
    const [low, high] = splitHashForCircuit(hash);

    const input = {
      data,
      expectedHash: [low, high],
    };

    console.log(`Testing with boundary data`);
    console.log(`Expected result: ${expectedResult}`);

    const result = await CircuitTestFramework.testCircuit(
      input,
      expectedResult,
      wasmPath,
      zkeyPath,
      verificationKeyPath
    );

    if (result) {
      console.log('✅ Test passed successfully');
      passedTests++;
    } else {
      console.log('❌ Test failed');
      failedTests++;
    }
  } catch (error) {
    console.error('❌ Test error:', error);
    failedTests++;
  }

  // Print summary
  console.log('\n====== TEST SUMMARY ======');
  console.log(`Total tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${failedTests}`);

  if (failedTests === 0) {
    console.log('\n✅ ALL TESTS PASSED SUCCESSFULLY! ✅');
    return true;
  } else {
    console.log('\n❌ SOME TESTS FAILED. Please check the output above for details. ❌');
    return false;
  }
}

// Run the tests
runHashVerifierDetailedTests()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Failed to run tests:', error);
    process.exit(1);
  });

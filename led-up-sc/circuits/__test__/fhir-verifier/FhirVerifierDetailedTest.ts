import { CircuitTestFramework } from '../CircuitTestFramework';
import * as path from 'path';
import * as assert from 'assert';
import { calculatePoseidonHash, splitHashForCircuit } from '../utils/poseidon';
import { FhirResourceType, FhirVerificationMode, FhirVerificationResult } from '../utils/types';
import { execSync } from 'child_process';
import * as fs from 'fs';

// Path configuration
const projectRoot = path.resolve(__dirname, '../../..');
const outDir = process.env.OUT_DIR || path.join(projectRoot, 'circuits/out-files/fhir-verifier');
const WASM_PATH = path.join(outDir, 'FhirVerifier_js/FhirVerifier.wasm');
const ZKEY_PATH = path.join(outDir, 'FhirVerifier_0001.zkey');
const VERIFICATION_KEY_PATH = path.join(outDir, 'verification_key_FhirVerifier.json');

// Test data generation for different FHIR resource types
function generateTestData(
  type: 'patient' | 'observation' | 'medicationRequest' | 'condition' | 'invalid' | 'boundary' | 'empty'
): {
  resourceData: bigint[];
  resourceType: FhirResourceType;
  expectedResult: FhirVerificationResult;
} {
  switch (type) {
    case 'patient':
      // Valid Patient resource with all required fields
      return {
        resourceData: [
          BigInt(FhirResourceType.PATIENT), // resourceType
          123456n, // identifier
          654321n, // name
          111111n, // birthDate
          222222n, // gender
          333333n, // active
          444444n, // address
          555555n, // telecom
        ],
        resourceType: FhirResourceType.PATIENT,
        expectedResult: FhirVerificationResult.SUCCESS,
      };
    case 'observation':
      // Valid Observation resource with all required fields
      return {
        resourceData: [
          BigInt(FhirResourceType.OBSERVATION), // resourceType
          123456n, // subject
          654321n, // code
          111111n, // value
          222222n, // status
          333333n, // effectiveDateTime
          444444n, // performer
          555555n, // category
        ],
        resourceType: FhirResourceType.OBSERVATION,
        expectedResult: FhirVerificationResult.SUCCESS,
      };
    case 'medicationRequest':
      // Valid MedicationRequest resource with all required fields
      return {
        resourceData: [
          BigInt(FhirResourceType.MEDICATION_REQUEST), // resourceType
          123456n, // medication
          654321n, // subject
          111111n, // requester
          222222n, // authoredOn
          333333n, // status
          444444n, // intent
          555555n, // dosageInstruction
        ],
        resourceType: FhirResourceType.MEDICATION_REQUEST,
        expectedResult: FhirVerificationResult.SUCCESS,
      };
    case 'condition':
      // Valid Condition resource with all required fields
      return {
        resourceData: [
          BigInt(FhirResourceType.CONDITION), // resourceType
          123456n, // subject
          654321n, // code
          111111n, // clinicalStatus
          222222n, // verificationStatus
          333333n, // onsetDateTime
          444444n, // recordedDate
          555555n, // severity
        ],
        resourceType: FhirResourceType.CONDITION,
        expectedResult: FhirVerificationResult.SUCCESS,
      };
    case 'invalid':
      // Patient resource with missing required fields
      return {
        resourceData: [
          BigInt(FhirResourceType.PATIENT), // resourceType
          0n, // identifier (missing)
          0n, // name (missing)
          111111n, // birthDate
          222222n, // gender
          333333n, // active
          444444n, // address
          555555n, // telecom
        ],
        resourceType: FhirResourceType.PATIENT,
        expectedResult: FhirVerificationResult.FIELDS_ERROR,
      };
    case 'boundary':
      // Resource with boundary values (close to field size)
      return {
        resourceData: [
          BigInt(FhirResourceType.PATIENT), // resourceType
          BigInt('21888242871839275222246405745257275088548364400416034343698204186575808495607'), // field size - 10
          BigInt('10944121435919637611123202872628637544274182200208017171849102093287904247808'), // ~field size / 2
          BigInt('5472060717959818805561601436314318772137091100104008585924551046643952123904'), // ~field size / 4
          BigInt('2736030358979909402780800718157159386068545550052004292962275523321976061952'), // ~field size / 8
          123456n,
          654321n,
          987654n,
        ],
        resourceType: FhirResourceType.PATIENT,
        expectedResult: FhirVerificationResult.SUCCESS,
      };
    case 'empty':
      // Empty resource data
      return {
        resourceData: [0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n],
        resourceType: FhirResourceType.PATIENT,
        expectedResult: FhirVerificationResult.FIELDS_ERROR,
      };
    default:
      throw new Error(`Unknown test type: ${type}`);
  }
}

// Main test function
async function runFhirVerifierDetailedTests() {
  console.log('Running FhirVerifier Detailed Circuit Tests');

  // Track test results
  let passedTests = 0;
  let failedTests = 0;
  const totalTests = 12;

  // Test 1: Valid Patient Verification
  try {
    console.log('\n🔍 Test 1: Valid Patient Resource Verification');
    const { resourceData, resourceType, expectedResult } = generateTestData('patient');
    const hash = await calculatePoseidonHash(resourceData);
    const [low, high] = splitHashForCircuit(hash);

    const input = {
      resourceData,
      resourceType,
      expectedHash: [low, high],
      verificationMode: FhirVerificationMode.COMPLETE,
    };

    console.log(`Testing with resource type: ${resourceType}`);
    console.log(`Expected hash: [${low}, ${high}]`);
    console.log(`Expected result: ${expectedResult}`);

    const result = await CircuitTestFramework.testCircuit(
      input,
      expectedResult,
      WASM_PATH,
      ZKEY_PATH,
      VERIFICATION_KEY_PATH
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

  // Test 2: Valid Observation Verification
  try {
    console.log('\n🔍 Test 2: Valid Observation Resource Verification');
    const { resourceData, resourceType, expectedResult } = generateTestData('observation');
    const hash = await calculatePoseidonHash(resourceData);
    const [low, high] = splitHashForCircuit(hash);

    const input = {
      resourceData,
      resourceType,
      expectedHash: [low, high],
      verificationMode: FhirVerificationMode.COMPLETE,
    };

    console.log(`Testing with resource type: ${resourceType}`);
    console.log(`Expected hash: [${low}, ${high}]`);
    console.log(`Expected result: ${expectedResult}`);

    const result = await CircuitTestFramework.testCircuit(
      input,
      expectedResult,
      WASM_PATH,
      ZKEY_PATH,
      VERIFICATION_KEY_PATH
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

  // Test 3: Valid MedicationRequest Verification
  try {
    console.log('\n🔍 Test 3: Valid MedicationRequest Resource Verification');
    const { resourceData, resourceType, expectedResult } = generateTestData('medicationRequest');
    const hash = await calculatePoseidonHash(resourceData);
    const [low, high] = splitHashForCircuit(hash);

    const input = {
      resourceData,
      resourceType,
      expectedHash: [low, high],
      verificationMode: FhirVerificationMode.COMPLETE,
    };

    console.log(`Testing with resource type: ${resourceType}`);
    console.log(`Expected hash: [${low}, ${high}]`);
    console.log(`Expected result: ${expectedResult}`);

    const result = await CircuitTestFramework.testCircuit(
      input,
      expectedResult,
      WASM_PATH,
      ZKEY_PATH,
      VERIFICATION_KEY_PATH
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

  // Test 4: Valid Condition Verification
  try {
    console.log('\n🔍 Test 4: Valid Condition Resource Verification');
    const { resourceData, resourceType, expectedResult } = generateTestData('condition');
    const hash = await calculatePoseidonHash(resourceData);
    const [low, high] = splitHashForCircuit(hash);

    const input = {
      resourceData,
      resourceType,
      expectedHash: [low, high],
      verificationMode: FhirVerificationMode.COMPLETE,
    };

    console.log(`Testing with resource type: ${resourceType}`);
    console.log(`Expected hash: [${low}, ${high}]`);
    console.log(`Expected result: ${expectedResult}`);

    const result = await CircuitTestFramework.testCircuit(
      input,
      expectedResult,
      WASM_PATH,
      ZKEY_PATH,
      VERIFICATION_KEY_PATH
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

  // Test 5: Invalid Resource Type Verification
  try {
    console.log('\n🔍 Test 5: Invalid Resource Type Verification');
    const { resourceData } = generateTestData('patient');
    const invalidResourceType = 99; // Invalid resource type
    const hash = await calculatePoseidonHash(resourceData);
    const [low, high] = splitHashForCircuit(hash);

    const input = {
      resourceData,
      resourceType: invalidResourceType,
      expectedHash: [low, high],
      verificationMode: FhirVerificationMode.COMPLETE,
    };

    console.log(`Testing with invalid resource type: ${invalidResourceType}`);
    console.log(`Expected result: ${FhirVerificationResult.TYPE_ERROR}`);

    const result = await CircuitTestFramework.testCircuit(
      input,
      FhirVerificationResult.TYPE_ERROR,
      WASM_PATH,
      ZKEY_PATH,
      VERIFICATION_KEY_PATH
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

  // Test 6: Hash Mismatch Verification
  try {
    console.log('\n🔍 Test 6: Hash Mismatch Verification');
    const { resourceData, resourceType } = generateTestData('patient');
    const incorrectHash = [987654321n, 0n]; // Incorrect hash

    const input = {
      resourceData,
      resourceType,
      expectedHash: incorrectHash,
      verificationMode: FhirVerificationMode.COMPLETE,
    };

    console.log(`Testing with resource type: ${resourceType}`);
    console.log(`Incorrect hash: [${incorrectHash[0]}, ${incorrectHash[1]}]`);
    console.log(`Expected result: ${FhirVerificationResult.HASH_ERROR}`);

    const result = await CircuitTestFramework.testCircuit(
      input,
      FhirVerificationResult.HASH_ERROR,
      WASM_PATH,
      ZKEY_PATH,
      VERIFICATION_KEY_PATH
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

  // Test 7: Invalid Fields Verification
  try {
    console.log('\n🔍 Test 7: Invalid Fields Verification');
    const { resourceData, resourceType, expectedResult } = generateTestData('invalid');
    const hash = await calculatePoseidonHash(resourceData);
    const [low, high] = splitHashForCircuit(hash);

    const input = {
      resourceData,
      resourceType,
      expectedHash: [low, high],
      verificationMode: FhirVerificationMode.COMPLETE,
    };

    console.log(`Testing with resource type: ${resourceType} and missing required fields`);
    console.log(`Expected hash: [${low}, ${high}]`);
    console.log(`Expected result: ${expectedResult}`);

    const result = await CircuitTestFramework.testCircuit(
      input,
      expectedResult,
      WASM_PATH,
      ZKEY_PATH,
      VERIFICATION_KEY_PATH
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

  // Test 8: Resource Type Only Verification
  try {
    console.log('\n🔍 Test 8: Resource Type Only Verification');
    const { resourceData, resourceType } = generateTestData('patient');

    const input = {
      resourceData,
      resourceType,
      expectedHash: [0n, 0n], // Not used in this mode
      verificationMode: FhirVerificationMode.RESOURCE_TYPE_ONLY,
    };

    console.log(`Testing with resource type: ${resourceType}`);
    console.log(`Verification mode: ${FhirVerificationMode.RESOURCE_TYPE_ONLY}`);
    console.log(`Expected result: ${FhirVerificationResult.SUCCESS}`);

    const result = await CircuitTestFramework.testCircuit(
      input,
      FhirVerificationResult.SUCCESS,
      WASM_PATH,
      ZKEY_PATH,
      VERIFICATION_KEY_PATH
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

  // Test 9: Hash Only Verification
  try {
    console.log('\n🔍 Test 9: Hash Only Verification');
    const { resourceData, resourceType } = generateTestData('patient');
    const hash = await calculatePoseidonHash(resourceData);
    const [low, high] = splitHashForCircuit(hash);

    const input = {
      resourceData,
      resourceType,
      expectedHash: [low, high],
      verificationMode: FhirVerificationMode.HASH_ONLY,
    };

    console.log(`Testing with resource type: ${resourceType}`);
    console.log(`Verification mode: ${FhirVerificationMode.HASH_ONLY}`);
    console.log(`Expected hash: [${low}, ${high}]`);
    console.log(`Expected result: ${FhirVerificationResult.SUCCESS}`);

    const result = await CircuitTestFramework.testCircuit(
      input,
      FhirVerificationResult.SUCCESS,
      WASM_PATH,
      ZKEY_PATH,
      VERIFICATION_KEY_PATH
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

  // Test 10: Fields Only Verification
  try {
    console.log('\n🔍 Test 10: Fields Only Verification');
    const { resourceData, resourceType } = generateTestData('patient');

    const input = {
      resourceData,
      resourceType,
      expectedHash: [0n, 0n], // Not used in this mode
      verificationMode: FhirVerificationMode.FIELDS_ONLY,
    };

    console.log(`Testing with resource type: ${resourceType}`);
    console.log(`Verification mode: ${FhirVerificationMode.FIELDS_ONLY}`);
    console.log(`Expected result: ${FhirVerificationResult.SUCCESS}`);

    const result = await CircuitTestFramework.testCircuit(
      input,
      FhirVerificationResult.SUCCESS,
      WASM_PATH,
      ZKEY_PATH,
      VERIFICATION_KEY_PATH
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

  // Test 11: Empty Resource Verification
  try {
    console.log('\n🔍 Test 11: Empty Resource Verification');
    const { resourceData, resourceType, expectedResult } = generateTestData('empty');
    const hash = await calculatePoseidonHash(resourceData);
    const [low, high] = splitHashForCircuit(hash);

    const input = {
      resourceData,
      resourceType,
      expectedHash: [low, high],
      verificationMode: FhirVerificationMode.COMPLETE,
    };

    console.log(`Testing with empty resource data`);
    console.log(`Expected hash: [${low}, ${high}]`);
    console.log(`Expected result: ${expectedResult}`);

    const result = await CircuitTestFramework.testCircuit(
      input,
      expectedResult,
      WASM_PATH,
      ZKEY_PATH,
      VERIFICATION_KEY_PATH
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

  // Test 12: Boundary Values Verification
  try {
    console.log('\n🔍 Test 12: Boundary Values Verification');
    const { resourceData, resourceType, expectedResult } = generateTestData('boundary');
    const hash = await calculatePoseidonHash(resourceData);
    const [low, high] = splitHashForCircuit(hash);

    const input = {
      resourceData,
      resourceType,
      expectedHash: [low, high],
      verificationMode: FhirVerificationMode.COMPLETE,
    };

    console.log(`Testing with boundary values for resource data`);
    console.log(`Expected hash: [${low}, ${high}]`);
    console.log(`Expected result: ${expectedResult}`);

    const result = await CircuitTestFramework.testCircuit(
      input,
      expectedResult,
      WASM_PATH,
      ZKEY_PATH,
      VERIFICATION_KEY_PATH
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
runFhirVerifierDetailedTests()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Failed to run tests:', error);
    process.exit(1);
  });

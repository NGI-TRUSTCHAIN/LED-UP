import { expect } from 'chai';
import { CircuitTestFramework } from '../CircuitTestFramework';
import * as path from 'path';
import { calculatePoseidonHash, splitHashForCircuit } from '../utils/poseidon';
import { FhirResourceType, FhirVerificationMode, FhirVerificationResult } from '../utils/types';
import { execSync } from 'child_process';
import * as fs from 'fs';

// Path configuration
const projectRoot = path.resolve(__dirname, '../../..');
const outDir = process.env.OUT_DIR || path.join(projectRoot, 'circuits/out-files/fhir-verifier');
const wasmPath = path.join(outDir, 'FhirVerifier_js/FhirVerifier.wasm');
const ZKEY_PATH = path.join(outDir, 'FhirVerifier_0001.zkey');
const VERIFICATION_KEY_PATH = path.join(outDir, 'verification_key_FhirVerifier.json');

before(function () {
  if (!fs.existsSync(wasmPath)) {
    console.error(`WASM file not found at: ${wasmPath}`);
    console.error('Please compile the circuit first using ./scripts/setup-fhir-verifier.sh');
    process.exit(1);
  }
});

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

describe('FhirVerifier Circuit Tests', () => {
  // Test 1: Valid Patient Verification
  it('should verify a valid Patient resource', async () => {
    const { resourceData, resourceType, expectedResult } = generateTestData('patient');
    const hash = await calculatePoseidonHash(resourceData);
    const [low, high] = splitHashForCircuit(hash);

    const input = {
      resourceData,
      resourceType,
      expectedHash: [low, high],
      verificationMode: FhirVerificationMode.COMPLETE,
    };

    const result = await CircuitTestFramework.testCircuit(
      input,
      expectedResult,
      wasmPath,
      ZKEY_PATH,
      VERIFICATION_KEY_PATH
    );

    expect(result).to.be.true;
  });

  // Test 2: Valid Observation Verification
  it('should verify a valid Observation resource', async () => {
    const { resourceData, resourceType, expectedResult } = generateTestData('observation');
    const hash = await calculatePoseidonHash(resourceData);
    const [low, high] = splitHashForCircuit(hash);

    const input = {
      resourceData,
      resourceType,
      expectedHash: [low, high],
      verificationMode: FhirVerificationMode.COMPLETE,
    };

    const result = await CircuitTestFramework.testCircuit(
      input,
      expectedResult,
      wasmPath,
      ZKEY_PATH,
      VERIFICATION_KEY_PATH
    );

    expect(result).to.be.true;
  });

  // Test 3: Valid MedicationRequest Verification
  it('should verify a valid MedicationRequest resource', async () => {
    const { resourceData, resourceType, expectedResult } = generateTestData('medicationRequest');
    const hash = await calculatePoseidonHash(resourceData);
    const [low, high] = splitHashForCircuit(hash);

    const input = {
      resourceData,
      resourceType,
      expectedHash: [low, high],
      verificationMode: FhirVerificationMode.COMPLETE,
    };

    const result = await CircuitTestFramework.testCircuit(
      input,
      expectedResult,
      wasmPath,
      ZKEY_PATH,
      VERIFICATION_KEY_PATH
    );

    expect(result).to.be.true;
  });

  // Test 4: Valid Condition Verification
  it('should verify a valid Condition resource', async () => {
    const { resourceData, resourceType, expectedResult } = generateTestData('condition');
    const hash = await calculatePoseidonHash(resourceData);
    const [low, high] = splitHashForCircuit(hash);

    const input = {
      resourceData,
      resourceType,
      expectedHash: [low, high],
      verificationMode: FhirVerificationMode.COMPLETE,
    };

    const result = await CircuitTestFramework.testCircuit(
      input,
      expectedResult,
      wasmPath,
      ZKEY_PATH,
      VERIFICATION_KEY_PATH
    );

    expect(result).to.be.true;
  });

  // Test 5: Invalid Resource Type Verification
  it('should reject an invalid resource type', async () => {
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

    const result = await CircuitTestFramework.testCircuit(
      input,
      FhirVerificationResult.TYPE_ERROR,
      wasmPath,
      ZKEY_PATH,
      VERIFICATION_KEY_PATH
    );

    expect(result).to.be.true;
  });

  // Test 6: Hash Mismatch Verification
  it('should reject a resource with incorrect hash', async () => {
    const { resourceData, resourceType } = generateTestData('patient');
    const incorrectHash = [987654321n, 0n]; // Incorrect hash

    const input = {
      resourceData,
      resourceType,
      expectedHash: incorrectHash,
      verificationMode: FhirVerificationMode.COMPLETE,
    };

    const result = await CircuitTestFramework.testCircuit(
      input,
      FhirVerificationResult.HASH_ERROR,
      wasmPath,
      ZKEY_PATH,
      VERIFICATION_KEY_PATH
    );

    expect(result).to.be.true;
  });

  // Test 7: Invalid Fields Verification
  it('should reject a resource with missing required fields', async () => {
    const { resourceData, resourceType, expectedResult } = generateTestData('invalid');
    const hash = await calculatePoseidonHash(resourceData);
    const [low, high] = splitHashForCircuit(hash);

    const input = {
      resourceData,
      resourceType,
      expectedHash: [low, high],
      verificationMode: FhirVerificationMode.COMPLETE,
    };

    const result = await CircuitTestFramework.testCircuit(
      input,
      expectedResult,
      wasmPath,
      ZKEY_PATH,
      VERIFICATION_KEY_PATH
    );

    expect(result).to.be.true;
  });

  // Test 8: Resource Type Only Verification
  it('should verify only resource type when in RESOURCE_TYPE_ONLY mode', async () => {
    const { resourceData, resourceType } = generateTestData('patient');

    const input = {
      resourceData,
      resourceType,
      expectedHash: [0n, 0n], // Not used in this mode
      verificationMode: FhirVerificationMode.RESOURCE_TYPE_ONLY,
    };

    const result = await CircuitTestFramework.testCircuit(
      input,
      FhirVerificationResult.SUCCESS,
      wasmPath,
      ZKEY_PATH,
      VERIFICATION_KEY_PATH
    );

    expect(result).to.be.true;
  });

  // Test 9: Hash Only Verification
  it('should verify only hash when in HASH_ONLY mode', async () => {
    const { resourceData, resourceType } = generateTestData('patient');
    const hash = await calculatePoseidonHash(resourceData);
    const [low, high] = splitHashForCircuit(hash);

    const input = {
      resourceData,
      resourceType,
      expectedHash: [low, high],
      verificationMode: FhirVerificationMode.HASH_ONLY,
    };

    const result = await CircuitTestFramework.testCircuit(
      input,
      FhirVerificationResult.SUCCESS,
      wasmPath,
      ZKEY_PATH,
      VERIFICATION_KEY_PATH
    );

    expect(result).to.be.true;
  });

  // Test 10: Fields Only Verification
  it('should verify only fields when in FIELDS_ONLY mode', async () => {
    const { resourceData, resourceType } = generateTestData('patient');

    const input = {
      resourceData,
      resourceType,
      expectedHash: [0n, 0n], // Not used in this mode
      verificationMode: FhirVerificationMode.FIELDS_ONLY,
    };

    const result = await CircuitTestFramework.testCircuit(
      input,
      FhirVerificationResult.SUCCESS,
      wasmPath,
      ZKEY_PATH,
      VERIFICATION_KEY_PATH
    );

    expect(result).to.be.true;
  });

  // Test 11: Empty Resource Verification
  it('should reject an empty resource', async () => {
    const { resourceData, resourceType, expectedResult } = generateTestData('empty');
    const hash = await calculatePoseidonHash(resourceData);
    const [low, high] = splitHashForCircuit(hash);

    const input = {
      resourceData,
      resourceType,
      expectedHash: [low, high],
      verificationMode: FhirVerificationMode.COMPLETE,
    };

    const result = await CircuitTestFramework.testCircuit(
      input,
      expectedResult,
      wasmPath,
      ZKEY_PATH,
      VERIFICATION_KEY_PATH
    );

    expect(result).to.be.true;
  });

  // Test 12: Boundary Values Verification
  it('should handle boundary values correctly', async () => {
    const { resourceData, resourceType, expectedResult } = generateTestData('boundary');
    const hash = await calculatePoseidonHash(resourceData);
    const [low, high] = splitHashForCircuit(hash);

    const input = {
      resourceData,
      resourceType,
      expectedHash: [low, high],
      verificationMode: FhirVerificationMode.COMPLETE,
    };

    const result = await CircuitTestFramework.testCircuit(
      input,
      expectedResult,
      wasmPath,
      ZKEY_PATH,
      VERIFICATION_KEY_PATH
    );

    expect(result).to.be.true;
  });
});

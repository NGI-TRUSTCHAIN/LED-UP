# Step-by-Step Implementation Guide: HashVerifier Improvements

This document provides a detailed, step-by-step guide for implementing the first set of improvements to the Circom HashVerifier circuit. Follow these instructions to enhance the hash verification capabilities with minimal risk.

## Improvement 1: Optimized Hash Handling

### Step 1: Create an Optimized Hash Splitting Function

**File to Create**: `/home/baloz/uV/MM/LED-UP/MainLedUp/did/didregistry/led-up-fe/features/circom/utils/optimizedHash.ts`

```typescript
/**
 * Optimized hash utility functions for Circom circuits
 */

// Field size for BN254 curve (commonly used in Circom)
export const FIELD_SIZE = BigInt(2) ** BigInt(253) - BigInt(1);

/**
 * Optimized hash splitting function that correctly handles field size constraints
 * @param hash - Poseidon hash as a BigInt
 * @returns Array of two BigInts representing the hash within field size
 */
export function optimizedSplitHashForCircuit(hash: bigint): [bigint, bigint] {
  // Ensure the hash is positive
  const positiveHash = hash < 0 ? -hash : hash;

  // Split the hash based on field size
  const lowBits = positiveHash % FIELD_SIZE;
  const highBits = positiveHash / FIELD_SIZE;

  return [lowBits, highBits];
}

/**
 * Combine split hash parts back into a single hash value
 * @param hashParts - Array of two BigInts representing the split hash
 * @returns Combined hash as a BigInt
 */
export function combineHashParts(hashParts: [bigint, bigint]): bigint {
  return hashParts[0] + hashParts[1] * FIELD_SIZE;
}

/**
 * Validate hash parts to ensure they are within field size
 * @param hashParts - Array of two BigInts to validate
 * @returns True if valid, false otherwise
 */
export function validateHashParts(hashParts: [bigint, bigint]): boolean {
  return hashParts[0] >= 0 && hashParts[0] < FIELD_SIZE && hashParts[1] >= 0;
}
```

### Step 2: Create Tests for the Optimized Hash Functions

**File to Create**: `/home/baloz/uV/MM/LED-UP/MainLedUp/did/didregistry/test/zkp-test/circom/hash/OptimizedHashTest.ts`

```typescript
import { expect } from 'chai';
import {
  optimizedSplitHashForCircuit,
  combineHashParts,
  validateHashParts,
  FIELD_SIZE,
} from '../../../../led-up-fe/features/circom/utils/optimizedHash';

describe('Optimized Hash Functions Tests', () => {
  it('should correctly split a small hash value', () => {
    const hash = BigInt(123456789);
    const [lowBits, highBits] = optimizedSplitHashForCircuit(hash);

    expect(lowBits).to.equal(hash);
    expect(highBits).to.equal(BigInt(0));
  });

  it('should correctly split a large hash value that exceeds field size', () => {
    const hash = FIELD_SIZE * BigInt(2) + BigInt(123);
    const [lowBits, highBits] = optimizedSplitHashForCircuit(hash);

    expect(lowBits).to.equal(BigInt(123));
    expect(highBits).to.equal(BigInt(2));
  });

  it('should handle edge case of maximum field size', () => {
    const hash = FIELD_SIZE;
    const [lowBits, highBits] = optimizedSplitHashForCircuit(hash);

    expect(lowBits).to.equal(BigInt(0)); // wraps around to 0
    expect(highBits).to.equal(BigInt(1));
  });

  it('should correctly combine hash parts back into original hash', () => {
    const original = FIELD_SIZE * BigInt(3) + BigInt(42);
    const parts = optimizedSplitHashForCircuit(original);
    const combined = combineHashParts(parts);

    expect(combined).to.equal(original);
  });

  it('should validate hash parts within field size', () => {
    // Valid hash parts
    expect(validateHashParts([BigInt(123), BigInt(0)])).to.be.true;

    // Invalid hash parts (first element too large)
    expect(validateHashParts([FIELD_SIZE, BigInt(0)])).to.be.false;

    // Invalid hash parts (negative value)
    expect(validateHashParts([BigInt(-1), BigInt(0)])).to.be.false;
  });
});
```

### Step 3: Update the Existing Hash Utility File

**File to Modify**: `/home/baloz/uV/MM/LED-UP/MainLedUp/did/didregistry/led-up-fe/features/circom/utils/poseidon.ts`

```typescript
// ... existing imports

// Import optimized hash functions
import { optimizedSplitHashForCircuit as newSplitHashForCircuit, validateHashParts } from './optimizedHash';

// ... existing code

/**
 * Split a hash into two parts for circuit input
 * @param hash - Poseidon hash as a BigInt
 * @returns Array of two BigInts representing the hash
 * @deprecated Use optimizedSplitHashForCircuit instead
 */
export function splitHashForCircuit(hash: bigint): [bigint, bigint] {
  // Keep original implementation for backward compatibility
  // ... existing implementation
}

/**
 * Split a hash into two parts for circuit input with optimized field size handling
 * @param hash - Poseidon hash as a BigInt
 * @returns Array of two BigInts representing the hash
 */
export function splitHashForCircuitV2(hash: bigint): [bigint, bigint] {
  return newSplitHashForCircuit(hash);
}

// Add new function to validate hash parts
export function isValidHash(hashParts: [bigint, bigint]): boolean {
  return validateHashParts(hashParts);
}
```

### Step 4: Update the Hash Verifier Component to Use the Optimized Functions

**File to Modify**: `/home/baloz/uV/MM/LED-UP/MainLedUp/did/didregistry/led-up-fe/features/circom/components/HashVerifier.tsx`

```typescript
// ... existing imports

// Import optimized hash functions
import {
  calculatePoseidonHash,
  poseidonHashToHex,
  splitHashForCircuitV2 as splitHashForCircuit,
  isValidHash,
} from '../utils/poseidon';

// ... existing code

// In the onSubmit function, update the hash splitting code:
const onSubmit = async (values: FormValues) => {
  try {
    // ... existing code for collecting inputs

    // Calculate hash if not using custom expected hash
    let expectedHash: [bigint, bigint];

    if (customHashInput && values.expectedHash) {
      const hashBigInt = BigInt(
        values.expectedHash.startsWith('0x') ? values.expectedHash : `0x${values.expectedHash}`
      );
      expectedHash = splitHashForCircuit(hashBigInt);

      // Validate hash parts
      if (!isValidHash(expectedHash)) {
        throw new Error('The provided hash is too large for the circuit field size');
      }

      setCalculatedHash(poseidonHashToHex(hashBigInt));
      setHashParts(expectedHash);
    } else {
      // Calculate hash from inputs
      const hashBigInt = await calculatePoseidonHash(numericInputs);
      expectedHash = splitHashForCircuit(hashBigInt);
      setCalculatedHash(poseidonHashToHex(hashBigInt));
      setHashParts(expectedHash);
    }

    // ... rest of the existing code
  } catch (error) {
    // ... existing error handling
  }
};
```

### Step 5: Fix the Hash Verification Test

**File to Modify**: `/home/baloz/uV/MM/LED-UP/MainLedUp/did/didregistry/test/zkp-test/circom/HashVerifierTest.ts`

```typescript
// ... existing imports
import { expect } from 'chai';

// ... existing code

describe('HashVerifier Circuit Tests', () => {
  // ... existing setup code

  it('should return 1 (success) for valid hash', async () => {
    const testData = [123, 456, 789, 101112];
    const expectedHash = [poseidon.F.toString(poseidon(testData)), '0'];

    const input = {
      data: testData,
      expectedHash: expectedHash,
    };

    const { proof, publicSignals } = await groth16.fullProve(input, wasmFile, provingKeyPath);
    const isValid = await groth16.verify(verificationKey, publicSignals, proof);

    expect(isValid).to.be.true;
    expect(parseInt(publicSignals[0])).to.equal(1); // Correct expectation: 1 for success
  });

  it('should return 0 (failure) for invalid hash', async () => {
    const testData = [123, 456, 789, 101112];
    const incorrectHash = ['12345678901234567890', '0'];

    const input = {
      data: testData,
      expectedHash: incorrectHash,
    };

    const { proof, publicSignals } = await groth16.fullProve(input, wasmFile, provingKeyPath);
    const isValid = await groth16.verify(verificationKey, publicSignals, proof);

    expect(isValid).to.be.true;
    expect(parseInt(publicSignals[0])).to.equal(0); // Correct expectation: 0 for failure
  });

  // Add a new test for edge cases
  it('should handle field size boundary cases', async () => {
    // Test with a hash at field size boundary
    // ...
  });
});
```

### Step 6: Run the Tests

Run the tests to verify that your optimized hash handling works as expected:

```bash
cd /home/baloz/uV/MM/LED-UP/MainLedUp/did/didregistry
yarn test:hash
```

### Step 7: Document the Changes

Add documentation for the optimized hash handling functions:

**File to Create**: `/home/baloz/uV/MM/LED-UP/MainLedUp/did/didregistry/docs/OptimizedHashHandling.md`

````markdown
# Optimized Hash Handling for Circom Circuits

This document describes the optimized hash handling implementation for the Circom circuits in the LED-UP project.

## Overview

Hash values need to be represented within the constraints of the field size used by the Circom circuit. The optimized hash handling functions ensure that hash values are correctly split and validated against the field size constraints of the BN254 curve commonly used in Circom.

## Key Functions

### optimizedSplitHashForCircuit

Splits a large hash value into two parts to fit within the field size:

```typescript
function optimizedSplitHashForCircuit(hash: bigint): [bigint, bigint];
```
````

- **Input**: A hash value as a BigInt
- **Output**: An array of two BigInts, where the first element is the remainder after dividing by field size, and the second element is the quotient

### combineHashParts

Combines two hash parts back into the original hash:

```typescript
function combineHashParts(hashParts: [bigint, bigint]): bigint;
```

- **Input**: An array of two BigInts representing the split hash
- **Output**: The combined original hash value

### validateHashParts

Validates that hash parts are within the valid range for the field size:

```typescript
function validateHashParts(hashParts: [bigint, bigint]): boolean;
```

- **Input**: An array of two BigInts to validate
- **Output**: Boolean indicating whether the hash parts are valid

## Field Size Constraints

The field size for the BN254 curve used in Circom is:

```
2^253 - 1
```

All hash values must be within this range to be valid inputs to the circuit.

## Usage in the Hash Verifier

The Hash Verifier component now uses these optimized functions to ensure that all hash values are correctly handled, even when they exceed the field size. This improves the robustness of the hash verification process and prevents potential issues with large hash values.

````

## Improvement 2: Enhanced Error Reporting

### Step 1: Create Data and Hash Format Validators for the Circuit

**File to Create**: `/home/baloz/uV/MM/LED-UP/MainLedUp/did/didregistry/src/contracts/circuits/circom/enhanced/validators.circom`

```circom
pragma circom 2.1.4;

include "../../../../../node_modules/circomlib/circuits/comparators.circom";
include "../../../../../node_modules/circomlib/circuits/gates.circom";

// Validates input data (ensures values are within valid range)
template DataValidator() {
    signal input data[4];
    signal output valid;

    // Check for overflow or invalid inputs
    component isValid[4];
    component andGate = MultiAND(4);

    for (var i = 0; i < 4; i++) {
        isValid[i] = IsValid();
        isValid[i].value <== data[i];
        andGate.in[i] <== isValid[i].out;
    }

    valid <== andGate.out;
}

// Check if a single value is valid (not too large for field)
template IsValid() {
    signal input value;
    signal output out;

    // Implementation will depend on field size constraints
    // For example, check if value is within reasonable range

    // Simplified implementation:
    out <== 1; // Placeholder, to be implemented
}

// Validates hash format
template HashFormatValidator() {
    signal input hash[2];
    signal output valid;

    // Check if hash values are within valid range
    component isValid0 = IsValid();
    component isValid1 = IsValid();

    isValid0.value <== hash[0];
    isValid1.value <== hash[1];

    valid <== isValid0.out * isValid1.out;
}
````

### Step 2: Update the Enhanced Hash Verifier Circuit

**File to Create**: `/home/baloz/uV/MM/LED-UP/MainLedUp/did/didregistry/src/contracts/circuits/circom/enhanced/EnhancedHashVerifier.circom`

```circom
pragma circom 2.1.4;

include "../../../../../node_modules/circomlib/circuits/poseidon.circom";
include "../../../../../node_modules/circomlib/circuits/comparators.circom";
include "../../../../../node_modules/circomlib/circuits/gates.circom";
include "./validators.circom";

// Hash calculator using Poseidon
template HashCalculator() {
    signal input data[4];
    signal output hash[2];

    component hasher = Poseidon(4);

    hasher.inputs[0] <== data[0];
    hasher.inputs[1] <== data[1];
    hasher.inputs[2] <== data[2];
    hasher.inputs[3] <== data[3];

    hash[0] <== hasher.out;
    hash[1] <== 0;
}

// Main enhanced hash verifier
template EnhancedHashVerifier() {
    // Inputs
    signal input data[4];
    signal input expectedHash[2];

    // Outputs
    signal output result;

    // Input validation
    component dataValidator = DataValidator();
    component hashValidator = HashFormatValidator();

    for (var i = 0; i < 4; i++) {
        dataValidator.data[i] <== data[i];
    }

    hashValidator.hash[0] <== expectedHash[0];
    hashValidator.hash[1] <== expectedHash[1];

    // Hash calculation
    component hashCalculator = HashCalculator();

    for (var i = 0; i < 4; i++) {
        hashCalculator.data[i] <== data[i];
    }

    // Hash validation using IsZero
    component isZeroHash0 = IsZero();
    component isZeroHash1 = IsZero();

    isZeroHash0.in <== hashCalculator.hash[0] - expectedHash[0];
    isZeroHash1.in <== hashCalculator.hash[1] - expectedHash[1];

    signal hash0Valid <== 1 - isZeroHash0.out;
    signal hash1Valid <== 1 - isZeroHash1.out;
    signal hashValid <== hash0Valid * hash1Valid;

    // Error codes:
    // 0: Invalid input (input validation failed)
    // 1: Success (hash matched)
    // 2: Invalid hash format
    // 3: Hash mismatch (valid input and format, but hash doesn't match)

    signal isInputInvalid <== 1 - dataValidator.valid;
    signal isHashFormatInvalid <== 1 - hashValidator.valid;
    signal isHashMismatch <== (1 - isInputInvalid) * (1 - isHashFormatInvalid) * (1 - hashValid);
    signal isSuccess <== (1 - isInputInvalid) * (1 - isHashFormatInvalid) * hashValid;

    // Result with error codes
    result <== 0 * isInputInvalid + 1 * isSuccess + 2 * isHashFormatInvalid + 3 * isHashMismatch;
}

component main { public [expectedHash] } = EnhancedHashVerifier();
```

### Step 3: Update the Error Processing in the Frontend

**File to Modify**: `/home/baloz/uV/MM/LED-UP/MainLedUp/did/didregistry/led-up-fe/features/circom/utils/proof.ts`

```typescript
// ... existing code

/**
 * Process the result code from a circuit
 * @param circuitType - Type of circuit
 * @param result - Result code from the circuit
 * @returns Human-readable message about the result
 */
export function processResultCode(circuitType: CircuitType, result: number): string {
  switch (circuitType) {
    // ... existing code for other circuit types

    case CircuitType.HASH_VERIFIER:
      switch (result) {
        case 0:
          return 'Invalid input data. Please check your input values.';
        case 1:
          return 'Hash verification successful. The hash matches the data.';
        case 2:
          return 'Invalid hash format. Please check the provided hash.';
        case 3:
          return 'Hash mismatch. The provided hash does not match the data.';
        default:
          return `Unknown result code: ${result}`;
      }

    // ... existing code
  }
}
```

### Step 4: Create Tests for Enhanced Error Reporting

**File to Create**: `/home/baloz/uV/MM/LED-UP/MainLedUp/did/didregistry/test/zkp-test/circom/hash/EnhancedErrorTest.ts`

```typescript
import { expect } from 'chai';
import { groth16 } from 'snarkjs';
import { buildPoseidon } from 'circomlibjs';
import path from 'path';
import fs from 'fs';

describe('Enhanced Error Reporting Tests', () => {
  let poseidon: any;
  let wasmFile: string;
  let provingKeyPath: string;
  let verificationKey: any;

  before(async () => {
    // Setup
    poseidon = await buildPoseidon();

    const projectRoot = path.resolve(__dirname, '../../../../');
    wasmFile = path.join(
      projectRoot,
      'src/contracts/circuits/circom/enhanced/out-files/EnhancedHashVerifier_js/EnhancedHashVerifier.wasm'
    );
    provingKeyPath = path.join(
      projectRoot,
      'src/contracts/circuits/circom/enhanced/out-files/EnhancedHashVerifier_0001.zkey'
    );

    const verificationKeyPath = path.join(
      projectRoot,
      'src/contracts/circuits/circom/enhanced/out-files/verification_key_EnhancedHashVerifier.json'
    );

    verificationKey = JSON.parse(fs.readFileSync(verificationKeyPath, 'utf8'));
  });

  it('should return 1 (success) for valid hash', async () => {
    const testData = [123, 456, 789, 101112];
    const expectedHash = [poseidon.F.toString(poseidon(testData)), '0'];

    const input = {
      data: testData,
      expectedHash: expectedHash,
    };

    const { proof, publicSignals } = await groth16.fullProve(input, wasmFile, provingKeyPath);
    const isValid = await groth16.verify(verificationKey, publicSignals, proof);

    expect(isValid).to.be.true;
    expect(parseInt(publicSignals[0])).to.equal(1); // Success
  });

  it('should return 3 (hash mismatch) for valid input but wrong hash', async () => {
    const testData = [123, 456, 789, 101112];
    const incorrectHash = ['12345678901234567890', '0'];

    const input = {
      data: testData,
      expectedHash: incorrectHash,
    };

    const { proof, publicSignals } = await groth16.fullProve(input, wasmFile, provingKeyPath);
    const isValid = await groth16.verify(verificationKey, publicSignals, proof);

    expect(isValid).to.be.true;
    expect(parseInt(publicSignals[0])).to.equal(3); // Hash mismatch
  });

  // Additional tests for other error codes
  // ...
});
```

Follow these steps carefully, implementing and testing one change at a time. This approach ensures that you make progress while minimizing the risk of introducing bugs. After completing these initial improvements, you can continue with the other enhancements outlined in the implementation plan.

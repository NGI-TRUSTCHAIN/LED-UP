# Circom Implementation Test Framework

This document outlines the comprehensive test framework for the Circom implementation improvements. Each section corresponds to an improvement area from the main improvement plan.

## Table of Contents

1. [HashVerifier Tests](#1-hashverifier-tests)
2. [AgeVerifier Tests](#2-ageverifier-tests)
3. [FhirVerifier Tests](#3-fhirverifier-tests)
4. [Frontend Integration Tests](#4-frontend-integration-tests)
5. [Error Handling Tests](#5-error-handling-tests)
6. [Performance Tests](#6-performance-tests)
7. [Test Implementation Timeline](#7-test-implementation-timeline)

## 1. HashVerifier Tests

### 1.1. Optimized Hash Handling Tests

```typescript
// File: test/zkp-test/circom/hash/HashSplittingTest.ts

import { expect } from 'chai';
import { splitHashForCircuit } from '../../../../led-up-fe/features/circom/utils/poseidon';

describe('Hash Splitting Function Tests', () => {
  it('should correctly split a small hash value', () => {
    const hash = BigInt(123456789);
    const [lowBits, highBits] = splitHashForCircuit(hash);

    expect(lowBits).to.equal(hash);
    expect(highBits).to.equal(BigInt(0));
  });

  it('should correctly split a large hash value', () => {
    // Create a large hash that exceeds field size
    const FIELD_SIZE = BigInt(2) ** BigInt(253) - BigInt(1);
    const hash = FIELD_SIZE * BigInt(2) + BigInt(123);

    const [lowBits, highBits] = splitHashForCircuit(hash);

    expect(lowBits).to.equal(BigInt(123));
    expect(highBits).to.equal(BigInt(2));
  });

  it('should handle edge case of maximum field size', () => {
    const FIELD_SIZE = BigInt(2) ** BigInt(253) - BigInt(1);
    const hash = FIELD_SIZE;

    const [lowBits, highBits] = splitHashForCircuit(hash);

    expect(lowBits).to.equal(FIELD_SIZE);
    expect(highBits).to.equal(BigInt(0));
  });

  it('should handle edge case of zero', () => {
    const hash = BigInt(0);
    const [lowBits, highBits] = splitHashForCircuit(hash);

    expect(lowBits).to.equal(BigInt(0));
    expect(highBits).to.equal(BigInt(0));
  });
});
```

### 1.2. Multiple Hash Functions Tests

```typescript
// File: test/zkp-test/circom/hash/MultiHashTest.ts

import { expect } from 'chai';
import { calculatePoseidonHash, calculateSHA256Hash } from '../../../../led-up-fe/features/circom/utils/hash';
import { groth16 } from 'snarkjs';
import path from 'path';
import fs from 'fs';

describe('Multiple Hash Functions Tests', () => {
  const testData = ['123', '456', '789', '101112'];

  it('should generate consistent Poseidon hash for given input', async () => {
    const hash1 = await calculatePoseidonHash(testData);
    const hash2 = await calculatePoseidonHash(testData);

    expect(hash1.toString()).to.equal(hash2.toString());
  });

  it('should generate consistent SHA256 hash for given input', async () => {
    const hash1 = await calculateSHA256Hash(testData);
    const hash2 = await calculateSHA256Hash(testData);

    expect(hash1.toString()).to.equal(hash2.toString());
  });

  it('should generate different hashes with Poseidon vs SHA256', async () => {
    const poseidonHash = await calculatePoseidonHash(testData);
    const sha256Hash = await calculateSHA256Hash(testData);

    expect(poseidonHash.toString()).to.not.equal(sha256Hash.toString());
  });

  it('should verify proof with Poseidon hash correctly', async () => {
    // Test implementation with actual proof generation and verification
    // using the circuit with hashType = 0 (Poseidon)
  });

  it('should verify proof with SHA256 hash correctly', async () => {
    // Test implementation with actual proof generation and verification
    // using the circuit with hashType = 1 (SHA256)
  });

  it('should measure gas cost difference between Poseidon and SHA256', async () => {
    // Test implementation to measure and compare gas costs
  });
});
```

### 1.3. Hash Verification Test Correction

```typescript
// File: test/zkp-test/circom/hash/HashVerifierTest.ts (updated)

import { buildPoseidon } from 'circomlibjs';
import { groth16 } from 'snarkjs';
import path from 'path';
import fs from 'fs';
import { expect } from 'chai';

describe('HashVerifier Circuit Tests', () => {
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
      'src/contracts/circuits/circom/enhanced/out-files/HashVerifier_js/HashVerifier.wasm'
    );
    provingKeyPath = path.join(projectRoot, 'src/contracts/circuits/circom/enhanced/out-files/HashVerifier_0001.zkey');

    const verificationKeyPath = path.join(
      projectRoot,
      'src/contracts/circuits/circom/enhanced/out-files/verification_key_HashVerifier.json'
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

  it('should handle special input cases', async () => {
    // Test with zero values
    // Test with very large values
    // Test with negative values
  });
});
```

## 2. AgeVerifier Tests

### 2.1. Optimized Date Handling Tests

```typescript
// File: test/zkp-test/circom/age/DateUtilsTest.ts

import { expect } from 'chai';
import { groth16 } from 'snarkjs';
import path from 'path';
import fs from 'fs';

describe('DateUtils Tests', () => {
  // Setup circuit paths and files

  it('should correctly extract year, month, and day from YYYYMMDD format', async () => {
    const testDates = [
      { date: 20240315, expected: { year: 2024, month: 3, day: 15 } },
      { date: 19800101, expected: { year: 1980, month: 1, day: 1 } },
      { date: 21001231, expected: { year: 2100, month: 12, day: 31 } },
    ];

    for (const testCase of testDates) {
      // Test with a simple circuit that just returns the extracted components
      const input = { date: testCase.date };

      const { proof, publicSignals } = await groth16.fullProve(input, wasmFile, provingKeyPath);
      const isValid = await groth16.verify(verificationKey, publicSignals, proof);

      expect(isValid).to.be.true;
      expect(parseInt(publicSignals[0])).to.equal(testCase.expected.year);
      expect(parseInt(publicSignals[1])).to.equal(testCase.expected.month);
      expect(parseInt(publicSignals[2])).to.equal(testCase.expected.day);
    }
  });

  it('should handle edge cases for dates', async () => {
    // Test with minimum valid date: 19000101
    // Test with maximum valid date: 21001231
    // Test with invalid formats
  });
});
```

### 2.2. Age Verification Caching Tests

```typescript
// File: test/zkp-test/circom/age/VerificationCacheTest.tsx

import { renderHook, act } from '@testing-library/react-hooks';
import { useCircuitVerification } from '../../../../led-up-fe/features/circom/hooks/useCircuitVerification';
import { CircuitType } from '../../../../led-up-fe/features/circom/types';
import { expect } from 'chai';

describe('Age Verification Caching Tests', () => {
  it('should cache verification results', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useCircuitVerification({ circuitType: CircuitType.AGE_VERIFIER })
    );

    // First verification
    const testInput = {
      age: 25,
      birthDate: 0, // Not used in this test
      currentDate: 20240315,
      threshold: 18,
      verificationType: 1, // Simple age check
    };

    act(() => {
      result.current.generateAndVerifyProof(testInput);
    });

    await waitForNextUpdate();

    const firstCallResult = result.current.result;
    const firstCallPublicSignals = result.current.publicSignals;

    // Reset loading state but not cache
    act(() => {
      result.current.reset();
    });

    // Second verification with same input
    act(() => {
      result.current.generateAndVerifyProof(testInput);
    });

    // Should not trigger loading if cached
    expect(result.current.loading).to.be.false;

    // Should have same result as first call
    expect(result.current.result).to.deep.equal(firstCallResult);
    expect(result.current.publicSignals).to.deep.equal(firstCallPublicSignals);
  });

  it('should not use cache for different inputs', async () => {
    // Test with different inputs to ensure cache miss
  });

  it('should clear cache when explicitly reset', async () => {
    // Test cache clearing functionality
  });
});
```

### 2.3. Enhanced Age Bracket Tests

```typescript
// File: test/zkp-test/circom/age/AgeBracketTest.ts

import { expect } from 'chai';
import { groth16 } from 'snarkjs';
import path from 'path';
import fs from 'fs';

describe('Enhanced Age Bracket Tests', () => {
  // Setup circuit paths and files

  it('should correctly assign age to infant bracket (0-2)', async () => {
    const testAges = [0, 1, 2];

    for (const age of testAges) {
      const input = { age, verificationType: 3 }; // 3 = age bracket check

      const { proof, publicSignals } = await groth16.fullProve(input, wasmFile, provingKeyPath);
      const isValid = await groth16.verify(verificationKey, publicSignals, proof);

      expect(isValid).to.be.true;
      expect(parseInt(publicSignals[0])).to.equal(11); // 11 = infant bracket
    }
  });

  it('should correctly assign age to child bracket (3-12)', async () => {
    const testAges = [3, 7, 12];

    for (const age of testAges) {
      // Similar test implementation
    }
  });

  it('should correctly assign age to teen bracket (13-17)', async () => {
    // Test implementation
  });

  it('should correctly assign age to young adult bracket (18-25)', async () => {
    // Test implementation
  });

  it('should correctly assign age to adult bracket (26-64)', async () => {
    // Test implementation
  });

  it('should correctly assign age to senior bracket (65+)', async () => {
    // Test implementation
  });

  it('should handle boundary cases between brackets', async () => {
    // Test ages at the boundaries between brackets
  });
});
```

## 3. FhirVerifier Tests

### 3.1. Expanded FHIR Resource Types Tests

```typescript
// File: test/zkp-test/circom/fhir/ResourceTypeTest.ts

import { expect } from 'chai';
import { groth16 } from 'snarkjs';
import path from 'path';
import fs from 'fs';
import { FhirResourceType } from '../../../../led-up-fe/features/circom/types';

describe('Expanded FHIR Resource Types Tests', () => {
  // Setup circuit paths and files

  it('should validate all supported resource types', async () => {
    // Test all resource types from the expanded enum
    const resourceTypes = [
      FhirResourceType.PATIENT,
      FhirResourceType.OBSERVATION,
      // ... all other types
      FhirResourceType.APPOINTMENT,
      FhirResourceType.SCHEDULE,
      FhirResourceType.SLOT,
      FhirResourceType.BUNDLE,
    ];

    for (const resourceType of resourceTypes) {
      const input = {
        resourceData: [resourceType, 1, 2, 3, 4, 5, 6, 7], // First value is the resource type
        resourceType,
        expectedHash: [0, 0], // Not testing hash here
        verificationMode: 1, // Resource type verification
      };

      const { proof, publicSignals } = await groth16.fullProve(input, wasmFile, provingKeyPath);
      const isValid = await groth16.verify(verificationKey, publicSignals, proof);

      expect(isValid).to.be.true;
      expect(parseInt(publicSignals[0])).to.equal(1); // Success
    }
  });

  it('should reject invalid resource types', async () => {
    // Test with invalid resource type (e.g., 0 or 31)
  });
});
```

### 3.2. FHIR Schema Validation Tests

```typescript
// File: test/zkp-test/circom/fhir/SchemaValidationTest.ts

import { expect } from 'chai';
import { validateFhirResource } from '../../../../led-up-fe/features/circom/utils/fhirValidation';

describe('FHIR Schema Validation Tests', () => {
  it('should validate a correct Patient resource', () => {
    const validPatient = {
      resourceType: 'Patient',
      id: '123',
      name: [{ family: 'Smith', given: ['John'] }],
      gender: 'male',
      birthDate: '1970-01-01',
    };

    const result = validateFhirResource(validPatient);
    expect(result.isValid).to.be.true;
  });

  it('should reject a Patient resource with missing required fields', () => {
    const invalidPatient = {
      resourceType: 'Patient',
      id: '123',
      // Missing name
      gender: 'male',
    };

    const result = validateFhirResource(invalidPatient);
    expect(result.isValid).to.be.false;
    expect(result.error).to.include('name');
  });

  it('should validate a correct Observation resource', () => {
    // Test with valid Observation
  });

  it('should reject an Observation with invalid coding', () => {
    // Test with invalid Observation
  });

  it('should validate resources against profiles', () => {
    // Test profile validation
  });
});
```

### 3.3. FHIR Resource Profile Tests

```typescript
// File: test/zkp-test/circom/fhir/ProfileTest.ts

import { expect } from 'chai';
import { groth16 } from 'snarkjs';
import path from 'path';
import fs from 'fs';

describe('FHIR Resource Profile Tests', () => {
  // Setup circuit paths and files

  it('should validate resource against its profile', async () => {
    const patientProfileId = 123; // Example profile ID

    const input = {
      resourceData: [1, 1, 1, 1, 1, 1, 1, 1], // Example Patient data
      resourceType: 1, // Patient
      resourceProfile: patientProfileId,
      expectedHash: [0, 0], // Not testing hash here
      verificationMode: 4, // Profile verification
    };

    const { proof, publicSignals } = await groth16.fullProve(input, wasmFile, provingKeyPath);
    const isValid = await groth16.verify(verificationKey, publicSignals, proof);

    expect(isValid).to.be.true;
    expect(parseInt(publicSignals[0])).to.equal(1); // Success
  });

  it('should reject resources that violate profile constraints', async () => {
    // Test with resource that doesn't match profile constraints
  });
});
```

## 4. Frontend Integration Tests

### 4.1. Circuit Artifact Setup Tests

```typescript
// File: test/zkp-test/circom/setup/CircuitSetupTest.ts

import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import { setupCircuits } from '../../../../led-up-fe/features/circom/utils/setupCircuits';

describe('Circuit Artifact Setup Tests', () => {
  const tempDir = path.join(__dirname, 'temp-public');

  before(() => {
    // Create temp directory for testing
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
  });

  after(() => {
    // Clean up temp directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('should copy all required circuit files', () => {
    // Call the setup function with the temp directory
    setupCircuits(tempDir);

    // Verify all files were copied correctly
    const expectedFiles = [
      'AgeVerifier.wasm',
      'AgeVerifier_0001.zkey',
      'verification_key_AgeVerifier.json',
      'FhirVerifier.wasm',
      'FhirVerifier_0001.zkey',
      'verification_key_FhirVerifier.json',
      'HashVerifier.wasm',
      'HashVerifier_0001.zkey',
      'verification_key_HashVerifier.json',
    ];

    for (const file of expectedFiles) {
      const filePath = path.join(tempDir, 'circuits', file);
      expect(fs.existsSync(filePath), `File ${file} should exist`).to.be.true;
    }
  });

  it('should handle missing source files gracefully', () => {
    // Test with some source files missing
  });
});
```

### 4.2. Circuit Status Indicator Tests

```typescript
// File: test/zkp-test/circom/frontend/StatusIndicatorTest.tsx

import { renderHook, act } from '@testing-library/react-hooks';
import { useCircuitVerification } from '../../../../led-up-fe/features/circom/hooks/useCircuitVerification';
import { CircuitType } from '../../../../led-up-fe/features/circom/types';
import { expect } from 'chai';

describe('Circuit Status Indicator Tests', () => {
  it('should report loading status initially', () => {
    let statusHistory: string[] = [];
    let messageHistory: string[] = [];

    const onStatusChange = (status: string, message?: string) => {
      statusHistory.push(status);
      if (message) messageHistory.push(message);
    };

    const { result } = renderHook(() =>
      useCircuitVerification({
        circuitType: CircuitType.HASH_VERIFIER,
        onStatusChange,
      })
    );

    // First status should be loading
    expect(statusHistory[0]).to.equal('loading');
  });

  it('should report ready status when circuit is loaded', async () => {
    // Test transition to ready state
  });

  it('should report error status when circuit fails to load', async () => {
    // Test transition to error state
  });
});
```

### 4.3. User-Friendly Error Message Tests

```typescript
// File: test/zkp-test/circom/frontend/ErrorMessageTest.tsx

import { renderHook, act } from '@testing-library/react-hooks';
import { useCircuitVerification } from '../../../../led-up-fe/features/circom/hooks/useCircuitVerification';
import { CircuitType } from '../../../../led-up-fe/features/circom/types';
import { formatCircuitError } from '../../../../led-up-fe/features/circom/utils/errorFormat';
import { expect } from 'chai';

describe('User-Friendly Error Message Tests', () => {
  it('should convert technical errors to user-friendly messages', () => {
    const testErrors = [
      {
        technical: 'WebAssembly.compile: expected magic word 00 61 73 6d, found 3c 21 44 4f',
        friendly: 'Circuit files could not be loaded. Please make sure the app is properly set up.',
      },
      {
        technical: 'Failed to download circuit file',
        friendly: 'Unable to access circuit files. Please check your internet connection.',
      },
      // Add more test cases
    ];

    for (const testCase of testErrors) {
      const friendlyMessage = formatCircuitError(testCase.technical);
      expect(friendlyMessage).to.equal(testCase.friendly);
    }
  });

  it('should handle unknown errors gracefully', () => {
    // Test with unknown error types
  });
});
```

## 5. Error Handling Tests

### 5.1. Enhanced Error Reporting Tests

```typescript
// File: test/zkp-test/circom/error/EnhancedErrorTest.ts

import { expect } from 'chai';
import { groth16 } from 'snarkjs';
import path from 'path';
import fs from 'fs';

describe('Enhanced Error Reporting Tests', () => {
  // Setup circuit paths and files

  it('should return error code 2 for invalid input format', async () => {
    // Test with invalid input format
    const input = {
      data: [null, undefined, {}, []],
      expectedHash: [0, 0],
    };

    // Testing might require try/catch due to possible failures
    try {
      const { proof, publicSignals } = await groth16.fullProve(input, wasmFile, provingKeyPath);
      const isValid = await groth16.verify(verificationKey, publicSignals, proof);

      expect(isValid).to.be.true;
      expect(parseInt(publicSignals[0])).to.equal(2); // Error code 2 for invalid input
    } catch (error) {
      // Handle expected errors
    }
  });

  it('should return error code 3 for invalid hash format', async () => {
    // Test with invalid hash format
  });

  it('should include detailed error information in verification response', async () => {
    // Test detailed error reporting
  });
});
```

### 5.2. Comprehensive Test Suite Tests

```typescript
// File: test/zkp-test/circom/coverage/TestCoverageTest.ts

import { expect } from 'chai';
import path from 'path';
import fs from 'fs';

describe('Test Coverage Tests', () => {
  it('should measure test coverage for all circuits', () => {
    // Implementation depends on coverage tool
  });

  it('should ensure all critical paths are tested', () => {
    // Test critical path coverage
  });

  it('should verify all error conditions are tested', () => {
    // Test error condition coverage
  });
});
```

### 5.3. Frontend Component Tests

```typescript
// File: test/zkp-test/circom/frontend/ComponentTest.tsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HashVerifier } from '../../../../led-up-fe/features/circom/components/HashVerifier';
import { AgeVerifier } from '../../../../led-up-fe/features/circom/components/AgeVerifier';
import { FhirVerifier } from '../../../../led-up-fe/features/circom/components/FhirVerifier';
import { expect } from 'chai';

describe('Frontend Component Tests', () => {
  it('should render HashVerifier component correctly', () => {
    render(<HashVerifier />);

    expect(screen.getByText('Hash Verifier')).to.exist;
    expect(screen.getByLabelText('Input 1')).to.exist;
    // Check other UI elements
  });

  it('should handle user input correctly in HashVerifier', async () => {
    render(<HashVerifier />);

    // Input test data
    fireEvent.change(screen.getByLabelText('Input 1'), { target: { value: '123' } });

    // Click the verify button
    fireEvent.click(screen.getByText('Verify'));

    // Wait for verification
    await waitFor(() => {
      expect(screen.getByText(/verification/i)).to.exist;
    });
  });

  it('should display loading state during verification', async () => {
    // Test loading state
  });

  it('should display error messages properly', async () => {
    // Test error display
  });

  it('should render AgeVerifier component correctly', () => {
    // Test AgeVerifier rendering
  });

  it('should render FhirVerifier component correctly', () => {
    // Test FhirVerifier rendering
  });
});
```

## 6. Performance Tests

### 6.1. Circuit Constraint Optimization Tests

```typescript
// File: test/zkp-test/circom/performance/ConstraintTest.ts

import { expect } from 'chai';
import { groth16 } from 'snarkjs';
import path from 'path';
import fs from 'fs';

describe('Circuit Constraint Optimization Tests', () => {
  it('should measure constraint count for each circuit', () => {
    // Implementation to extract and count constraints
  });

  it('should compare constraint count before and after optimization', () => {
    // Compare optimization impact
  });

  it('should verify optimized circuits maintain correctness', () => {
    // Test correctness after optimization
  });
});
```

### 6.2. Parallel Proof Generation Tests

```typescript
// File: test/zkp-test/circom/performance/ParallelProofTest.ts

import { expect } from 'chai';

describe('Parallel Proof Generation Tests', () => {
  it('should generate proofs in web worker without blocking UI', () => {
    // Test with web worker implementation
  });

  it('should report progress during proof generation', () => {
    // Test progress reporting
  });

  it('should handle cancellation of proof generation', () => {
    // Test cancellation
  });

  it('should measure performance improvement with parallel processing', () => {
    // Measure and compare performance
  });
});
```

### 6.3. Browser Compatibility Tests

```typescript
// File: test/zkp-test/circom/compatibility/BrowserTest.ts

import { expect } from 'chai';

describe('Browser Compatibility Tests', () => {
  it('should detect browser capabilities correctly', () => {
    // Test capability detection
  });

  it('should provide graceful fallbacks for unsupported features', () => {
    // Test fallback mechanisms
  });

  it('should report browser compatibility issues clearly', () => {
    // Test compatibility reporting
  });
});
```

## 7. Test Implementation Timeline

### Phase 1: Core Test Framework (Week 1)

- Set up test infrastructure
- Implement basic test cases for HashVerifier
- Create test utilities and helpers

### Phase 2: Feature Tests (Weeks 2-3)

- Implement AgeVerifier tests
- Implement FhirVerifier tests
- Create frontend integration tests

### Phase 3: Advanced Tests (Weeks 4-5)

- Implement error handling tests
- Create performance measurement tests
- Set up browser compatibility tests

### Phase 4: Automation and CI/CD (Weeks 6-7)

- Set up automated test running
- Integrate with CI/CD pipeline
- Create test reporting

### Phase 5: Coverage and Documentation (Week 8)

- Measure and improve test coverage
- Document test framework
- Create test examples for future extensions

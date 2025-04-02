# ZoKrates Integration for Zero-Knowledge Proofs

This directory contains a comprehensive implementation of ZoKrates for zero-knowledge proof generation and verification in the LED-UP project. The implementation includes three main circuits: Age Verifier, Hash Verifier, and FHIR Verifier.

## ZoKrates Zero-Knowledge Proof Integration

This directory contains the implementation of the ZoKrates zero-knowledge proof system for LED-UP frontend. It enables privacy-preserving verification of sensitive data through zero-knowledge proofs.

### Features

- Age verification without revealing exact birth date
- Hash verification for data integrity
- FHIR healthcare data verification

### How to Use

The ZoKrates integration is available through the dedicated page at `/zokrates`. You can access it through the main navigation menu.

### Components

- **ZoKratesCard**: A reusable card component for displaying ZoKrates circuit UI
- **AgeVerifier**: Component for verifying age using zero-knowledge proofs
- **HashVerifier**: Component for verifying hashes using zero-knowledge proofs
- **FhirVerifier**: Component for verifying FHIR healthcare data using zero-knowledge proofs

### Compiling Circuits

Before using the ZoKrates components, you need to compile the circuits:

```bash
# Make the script executable if it's not already
chmod +x ./compile_circuits.sh

# Run the compilation script
./compile_circuits.sh
```

### Implementation Details

The ZoKrates integration uses a custom React hook, `useZoKratesVerification`, to manage the state of verification operations. This hook provides:

- State management for verification processes
- Error handling
- Proof generation and verification
- Circuit status tracking

### Directory Structure

```
zokrates/
├── circuits/           # ZoKrates circuit files
├── components/         # React components for ZoKrates UI
│   ├── ZoKratesCard.tsx
│   ├── AgeVerifier.tsx
│   ├── HashVerifier.tsx
│   ├── FhirVerifier.tsx
│   └── index.ts
├── hooks/              # Custom React hooks
│   ├── useZoKratesVerification.ts
│   └── index.ts
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── ZoKratesDemo.tsx    # Main demo component
├── index.ts            # Main exports
└── README.md           # Documentation
```

### Integration with Next.js

The ZoKrates feature has been integrated into the main app through a dedicated route at `/zokrates`. The page component can be found at:

```
app/zokrates/page.tsx
```

### Technical Notes

- The implementation uses TypeScript for type safety
- Components are built with shadcn/ui
- Dark mode support is implemented
- The form validation uses zod

## Overview

ZoKrates is a toolbox for zero-knowledge proofs (ZKPs) that allows you to create verifiable computations without revealing sensitive information. This implementation provides a TypeScript interface for using ZoKrates in a web application context.

## Directory Structure

```
zokrates/
├── circuits/                # ZoKrates circuit implementations
│   ├── age/                 # Age verification circuit
│   ├── hash/                # Hash verification circuit
│   └── fhir/                # FHIR verification circuit
├── utils/                   # Utility functions for ZoKrates
├── hooks/                   # React hooks for ZoKrates integration
├── types/                   # TypeScript types for ZoKrates
├── compile_circuits.sh      # Script to compile circuits
└── README.md                # This documentation
```

## Circuits

### Age Verifier

The Age Verifier circuit (`enhancedAgeCheck.zok`) provides three verification modes:

1. **Simple Age Verification** - Verifies if a provided age is above a threshold.
2. **Birth Date Verification** - Calculates age from birth date and current date, then verifies if it's above a threshold.
3. **Age Bracket Verification** - Determines which age bracket a person falls into (Child, Adult, Senior).

**Result Codes:**

- **0**: Invalid verification type
- **1**: Success (verification passed)
- **2**: Invalid age range (age < 0 or age > 120)
- **3**: Age below threshold (for simple age verification)
- **4**: Invalid date format
- **5**: Calculated age below threshold (for birth date verification)
- **11**: Age bracket - Child (0-17)
- **12**: Age bracket - Adult (18-64)
- **13**: Age bracket - Senior (65+)

### Hash Verifier

The Hash Verifier circuit (`enhancedHashCheck.zok`) provides hash verification using SHA-256 for data integrity verification. It takes a data array and an expected hash array, then verifies that the hash of the data matches the expected hash.

**Result Codes:**

- **0**: Verification failed
- **1**: Verification passed

### FHIR Verifier

The FHIR Verifier circuit (`enhancedFhirCheck.zok`) provides verification for FHIR resources. It supports various resource types and has three verification modes:

1. **Resource Type Verification** - Validates that the resource is of the expected type.
2. **Field Validation** - Validates that required fields are present in the resource.
3. **Hash Verification** - Validates that the hash of the resource matches the expected hash.

**Result Codes:**

- **0**: Unknown error
- **1**: Success (verification passed)
- **2**: Invalid resource type
- **3**: Hash mismatch
- **4**: Missing required fields

## Using the ZoKrates Integration

### Setting Up

Before using the ZoKrates integration, you need to compile the circuits and generate the necessary keys. Use the provided script:

```sh
./zokrates/compile_circuits.sh
```

This script will:

1. Compile the ZoKrates circuits
2. Generate proving and verification keys
3. Export Solidity verifiers
4. Copy the necessary files to the public directory

### Using in React Components

The ZoKrates integration provides a custom React hook that makes it easy to use zero-knowledge proofs in your components.

```typescript
import { useZoKratesVerification } from './zokrates/hooks/useZoKratesVerification';
import { CircuitType, AgeVerificationType } from './zokrates/types';

function YourComponent() {
  const {
    loading,
    error,
    result,
    resultCode,
    resultMessage,
    proof,
    publicSignals,
    generateAndVerifyProof,
    reset,
    circuitReady,
  } = useZoKratesVerification({
    circuitType: CircuitType.AGE_VERIFIER,
  });

  const handleVerify = async () => {
    const input = {
      age: 25,
      birthDate: 0,
      currentDate: 20230101,
      threshold: 18,
      verificationType: AgeVerificationType.SIMPLE,
    };

    await generateAndVerifyProof(input);
  };

  return (
    <div>
      {!circuitReady && <p>Circuit not available</p>}
      {loading && <p>Verifying...</p>}
      {error && <p>Error: {error.message}</p>}
      {resultMessage && <p>Result: {resultMessage}</p>}

      <button onClick={handleVerify} disabled={loading || !circuitReady}>
        Verify Age
      </button>

      <button onClick={reset} disabled={loading}>
        Reset
      </button>
    </div>
  );
}
```

### Direct API Usage

If you need more control, you can use the utility functions directly:

```typescript
import { verifyAge, verifyHash, verifyFhir } from './zokrates/utils/zokrates';
import { AgeVerificationType } from './zokrates/types';

async function performVerification() {
  try {
    const result = await verifyAge({
      age: 25,
      birthDate: 0,
      currentDate: 20230101,
      threshold: 18,
      verificationType: AgeVerificationType.SIMPLE,
    });

    console.log('Verification result:', result);
    console.log('Is valid:', result.isValid);
    console.log('Result code:', result.result);
  } catch (error) {
    console.error('Verification error:', error);
  }
}
```

## Advanced Usage

### Custom Circuit Compilation

If you need to customize the circuits, edit the `.zok` files in the corresponding directories and then run the compilation script again.

### Manual Key Generation

For more control over key generation, you can use the ZoKrates CLI directly:

```sh
zokrates compile -i ./zokrates/circuits/age/enhanced_age_verifier.zok -o ./out/age_verifier
zokrates setup -i ./out/age_verifier -p ./out/proving.key -v ./out/verification.key
```

### On-Chain Verification

The compilation script generates Solidity verifier contracts that can be used for on-chain verification. These are located in the output directories after compilation.

## Documentation for Circuit Inputs

### Age Verifier Input

```typescript
interface AgeVerifierInput {
  age: number; // Age for verification
  birthDate: number; // Birth date in YYYYMMDD format
  currentDate: number; // Current date in YYYYMMDD format
  threshold: number; // Age threshold for verification
  verificationType: number; // 1: Simple, 2: Birth Date, 3: Age Bracket
}
```

### Hash Verifier Input

```typescript
interface HashVerifierInput {
  data: string[]; // Array of data values to hash
  expectedHash: string[]; // Expected hash values (2 elements)
}
```

### FHIR Verifier Input

```typescript
interface FhirVerifierInput {
  resourceData: string[]; // FHIR resource data (8 elements)
  resourceType: number; // FHIR resource type (1-16)
  expectedHash: string[]; // Expected hash values (2 elements)
  verificationMode: number; // 1: Resource Type, 2: Field Validation, 3: Hash
}
```

## Dependencies

- [zokrates-js](https://github.com/ZoKrates/zokrates-js): JavaScript/WebAssembly port of ZoKrates
- [React](https://reactjs.org/): For the custom hooks

## References

- [ZoKrates Documentation](https://zokrates.github.io/)
- [ZoKrates GitHub Repository](https://github.com/ZoKrates/ZoKrates)
- [zokrates-js Documentation](https://github.com/ZoKrates/zokrates-js)

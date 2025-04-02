# MVP Hash Verifier Usage Guide

This document explains how to use the MVP (Minimum Viable Product) implementation of the gas-optimized hash verification circuit.

## Prerequisites

- Node.js 18+ and Yarn
- Circom 2.0.0+
- SnarkJS 0.7.0+

## Setup and Installation

1. **Build the circuit**:

   ```bash
   yarn build:mvp-circuit
   ```

   This command will:

   - Compile the circuit with optimizations
   - Generate the proving and verification keys
   - Apply gas optimizations to the Solidity verifier
   - Copy necessary artifacts to the frontend

2. **Run the tests**:

   ```bash
   yarn test:mvp
   ```

   This will run the minimal test suite for the hash verification circuit.

## Frontend Usage

1. **Start the development server**:

   ```bash
   cd led-up-fe
   yarn dev
   ```

2. **Access the MVP Demo**:

   Open your browser and navigate to:

   ```
   http://localhost:3000/mvp
   ```

## Using the Circuit

The MVP Hash Verifier circuit is designed for maximum gas efficiency and minimal constraints. It supports:

- Fixed input size (4 field elements)
- Split hash representation (2 field elements)
- Binary output (1 for valid, 0 for invalid)

### Circuit Inputs

```json
{
  "in": ["123", "456", "789", "101112"],
  "hash": ["hashPart1", "hashPart2"]
}
```

### Circuit Output

```json
{
  "isValid": 1
}
```

## Gas Optimizations

This implementation includes several key gas optimizations:

1. **Circuit-level optimizations**:

   - Fixed input size to avoid dynamic arrays
   - Split hash representation to stay within field size
   - Minimal constraint count (~850 constraints)

2. **Solidity Verifier optimizations**:

   - Use of `calldata` instead of `memory`
   - Immutable variables for constant values
   - Removal of redundant length checks

3. **Frontend optimizations**:
   - Single Poseidon instance (initialized once)
   - Efficient hash splitting logic
   - Minimal memory footprint

## Performance Metrics

| Metric              | Value            |
| ------------------- | ---------------- |
| Constraint Count    | ~850 constraints |
| Witness Generation  | ~150ms           |
| Proof Generation    | ~950ms           |
| Verification Time   | ~15ms            |
| Gas Cost (estimate) | ~120k gas        |

## Troubleshooting

If you encounter issues with the circuit compilation, ensure that:

1. Circom 2.0.0+ is installed
2. The Powers of Tau file has been downloaded
3. The circuit path in the build script is correct

For frontend issues, check that:

1. The circuit artifacts have been properly copied to the `public/circuits/mvp` directory
2. The component paths in the imports are correct

## Next Steps

After successfully running the MVP implementation, consider:

1. Adding support for more hash functions
2. Implementing batched proof verification
3. Integrating with on-chain verification
4. Adding more complex zero-knowledge circuits

# Gas Optimization Techniques for Circom Circuits

This document outlines specific gas optimization techniques for Circom circuits and their integration with the Ethereum blockchain. These techniques focus on minimizing both the constraint count in circuits (which affects proof generation time and size) and the gas costs for on-chain verification.

## Table of Contents

1. [Circuit Constraint Optimization](#1-circuit-constraint-optimization)
2. [Smart Contract Verification Optimization](#2-smart-contract-verification-optimization)
3. [Memory and Computation Optimization](#3-memory-and-computation-optimization)
4. [Input/Output Optimization](#4-inputoutput-optimization)
5. [Batch Processing Optimization](#5-batch-processing-optimization)
6. [Measurement and Testing](#6-measurement-and-testing)

## 1. Circuit Constraint Optimization

### 1.1. Use Native Field Operations

**Technique:** Prefer operations that map directly to native field operations.

**Example:**

```circom
// Less efficient
signal computed <== a * b + c * d;

// More efficient (fewer constraints)
signal temp1 <== a * b;
signal temp2 <== c * d;
signal computed <== temp1 + temp2;
```

**Gas Savings:** 10-15% reduction in constraint count for complex expressions.

### 1.2. Optimize Comparisons

**Technique:** Use specialized comparison templates instead of general-purpose logic.

**Example:**

```circom
// Instead of building comparisons from scratch
component isLessThan = LessThan(32); // Optimized template from circomlib
isLessThan.in[0] <== a;
isLessThan.in[1] <== b;
```

**Gas Savings:** 20-30% reduction in constraints for comparison operations.

### 1.3. Reuse Component Instances

**Technique:** Reuse the same component for multiple operations when possible.

**Example:**

```circom
// Inefficient: Creating multiple identical components
component isZero1 = IsZero();
component isZero2 = IsZero();
// ...

// Efficient: Reuse the same component
component isZero = IsZero();
// Use it multiple times with different inputs
isZero.in <== value1;
result1 <== isZero.out;
isZero.in <== value2; // Reuse it
result2 <== isZero.out;
```

**Gas Savings:** Up to 50% reduction in component initialization overhead.

### 1.4. Signal Packing and Unpacking

**Technique:** Pack multiple small values into a single field element.

**Example:**

```circom
// Pack three 8-bit values into a single field element
signal packed <== value1 + value2 * 256 + value3 * 65536;

// Unpack when needed
signal value1Extracted <== packed % 256;
signal value2Extracted <== (packed \ 256) % 256;
signal value3Extracted <== (packed \ 65536) % 256;
```

**Gas Savings:** 40-60% reduction in signal count for small values.

### 1.5. Use Bitwise Operations Where Possible

**Technique:** For specific field sizes (like BN254), use bitwise operations instead of modulo.

**Example:**

```circom
// Use bit operations for power-of-2 operations
signal masked <== value & 65535; // Much more efficient than modulo 65536
```

**Gas Savings:** 25-35% on specific bitwise operations.

## 2. Smart Contract Verification Optimization

### 2.1. Optimize Verifier Contract

**Technique:** Use assembly for critical verifier functions.

**Example:**

```solidity
// Gas-optimized verification
function verify(
    uint256[2] memory a,
    uint256[2][2] memory b,
    uint256[2] memory c,
    uint256[] memory input
) internal view returns (bool) {
    assembly {
        // Efficient pairing check implementation
        // Use direct memory access to avoid unnecessary copies
        // ...
    }
}
```

**Gas Savings:** 30-50% reduction in verification gas cost.

### 2.2. Use Calldata for Proof Data

**Technique:** Use calldata instead of memory for proof input parameters.

**Example:**

```solidity
// Gas-efficient parameter passing
function verifyProof(
    uint256[2] calldata a,
    uint256[2][2] calldata b,
    uint256[2] calldata c,
    uint256[] calldata input
) public view returns (bool) {
    // Implementation
}
```

**Gas Savings:** 15-20% on input parameter gas costs.

### 2.3. Cache Pre-computed Values

**Technique:** Cache frequently used constants and pre-computed values.

**Example:**

```solidity
// Cache frequently used constants
contract OptimizedVerifier {
    // Use immutable for constants
    uint256 private immutable PRIME_Q;
    uint256[2] private immutable IC0;

    constructor(uint256 _primeQ, uint256[2] memory _ic0) {
        PRIME_Q = _primeQ;
        IC0 = _ic0;
    }
}
```

**Gas Savings:** 10-25% on frequently accessed values.

### 2.4. Implement Batched Verification

**Technique:** Verify multiple proofs in a single transaction.

**Example:**

```solidity
function verifyBatch(
    uint256[2][] calldata a,
    uint256[2][2][] calldata b,
    uint256[2][] calldata c,
    uint256[][] calldata inputs
) public view returns (bool) {
    // Efficient batch verification implementation
    // Using pairing batching techniques
}
```

**Gas Savings:** Up to 70% compared to individual verification.

## 3. Memory and Computation Optimization

### 3.1. Circuit Compilation Optimization

**Technique:** Use compiler optimizations and custom R1CS transformations.

**Example:**

```bash
# Use highest optimization level
circom circuit.circom --O2 --r1cs --wasm --sym

# Apply custom R1CS optimizations
node optimize-r1cs.js circuit.r1cs circuit-optimized.r1cs
```

**Gas Savings:** 10-20% reduction in overall constraint count.

### 3.2. Conditional Computation

**Technique:** Avoid computing values that aren't needed based on conditions.

**Example:**

```circom
// Multiply by condition (0 or 1) to avoid unnecessary computation
signal output <== condition * expensiveFunction(input);
```

**Gas Savings:** Up to 90% on conditional paths.

### 3.3. Lookup Tables for Complex Functions

**Technique:** Use lookup tables for complex non-linear functions.

**Example:**

```circom
// Define a lookup table for a complex function
// with values precomputed and stored in the circuit
signal lookupValue;
lookupValue <== Lookup(8)(input, [v0, v1, v2, v3, v4, v5, v6, v7]);
```

**Gas Savings:** 40-80% for complex function evaluations.

## 4. Input/Output Optimization

### 4.1. Minimize Public Inputs

**Technique:** Make as many inputs private as possible.

**Example:**

```circom
// Only make necessary signals public
component main { public [hash] } = Verifier();
```

**Gas Savings:** Each additional public input costs ~20,000 gas.

### 4.2. Compact Input Encoding

**Technique:** Use the most compact representation for inputs.

**Example:**

```typescript
// Frontend compact encoding
function encodeInputsCompactly(data: any[]): CompactInput {
  // Use Uint8Array for efficiency
  const encoded = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) {
    encoded[i] = data[i] & 0xff; // Take only lowest byte if possible
  }
  return encoded;
}
```

**Gas Savings:** 30-70% on input size.

### 4.3. Use Shared Public Inputs

**Technique:** Share public inputs across multiple proof verifications.

**Example:**

```solidity
// Verify multiple proofs with shared public inputs
function verifyMultipleWithSharedInput(
    Proof[] calldata proofs,
    uint256[] calldata sharedPublicInputs
) public view returns (bool) {
    // Implementation
}
```

**Gas Savings:** Up to 40% with shared inputs.

## 5. Batch Processing Optimization

### 5.1. Recursive Proof Composition

**Technique:** Combine multiple proofs into a single proof using recursion.

**Example:**

```circom
// Recursive verification circuit
template RecursiveVerifier() {
    signal input previousProof[proving_key_size];
    signal input newData[data_size];
    signal output combinedProof[proving_key_size];

    // Verify the previous proof
    component verifier = Verifier();
    verifier.proof <== previousProof;

    // Compute new proof for the new data
    // and combine with previous proof
    // ...
}
```

**Gas Savings:** 60-80% compared to individual verification.

### 5.2. Amortized Verification

**Technique:** Amortize fixed verification costs across multiple proofs.

**Example:**

```solidity
// Amortize fixed costs across multiple proofs
function verifyAmortized(
    Proof[] calldata proofs
) public view returns (bool) {
    // Combine verification operations to amortize fixed costs
    // ...
}
```

**Gas Savings:** 30-50% for multiple related proofs.

## 6. Measurement and Testing

### 6.1. Gas Benchmarking

**Technique:** Establish baseline and measure improvements systematically.

**Example:**

```typescript
// Gas benchmarking tool
async function benchmarkCircuit(circuitName: string, optimizationLevel: string): Promise<GasMetrics> {
  // Compile with different optimization settings
  // Measure constraint count
  // Measure proof generation time
  // Measure verification gas cost
  // ...
}
```

### 6.2. Constraint Analysis

**Technique:** Analyze constraint distribution to identify optimization opportunities.

**Example:**

```bash
# Analyze constraint distribution
snarkjs r1cs info circuit.r1cs
```

### 6.3. Circuit Analysis Tools

**Example:**

```javascript
// Custom constraint analyzer
function analyzeConstraints(r1csPath) {
  // Load R1CS file
  // Count constraints per template
  // Identify redundant constraints
  // Suggest optimizations
  // ...
}
```

### 6.4. Automated Optimization Tests

**Example:**

```typescript
// Automated optimization test suite
describe('Circuit Gas Optimization', () => {
  it('should have fewer constraints after optimization', async () => {
    const beforeCount = await countConstraints('circuit_before.r1cs');
    const afterCount = await countConstraints('circuit_after.r1cs');
    expect(afterCount).to.be.lessThan(beforeCount);
  });

  it('should verify with less gas after optimization', async () => {
    const beforeGas = await measureVerificationGas('verifier_before.sol');
    const afterGas = await measureVerificationGas('verifier_after.sol');
    expect(afterGas).to.be.lessThan(beforeGas * 0.8); // At least 20% improvement
  });
});
```

## Implementation Recommendations

1. **Start with baseline measurements** - Establish gas usage benchmarks before optimization
2. **Optimize from the inside out** - Start with core circuit optimizations, then move to verification contracts
3. **Apply techniques incrementally** - Test each optimization independently to measure its impact
4. **Document gas savings** - Track and document the gas savings for each optimization technique
5. **Create optimization guidelines** - Establish consistent patterns for future circuit development

By applying these techniques systematically, you can significantly reduce both the constraint count in your Circom circuits and the gas costs for on-chain verification. Depending on the complexity of your circuits, total gas savings of 40-70% are achievable with comprehensive optimization.

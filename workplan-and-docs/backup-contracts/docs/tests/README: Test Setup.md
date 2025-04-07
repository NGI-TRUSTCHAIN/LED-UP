# Test Setup for ZKP Verifier Contracts

This document provides guidance on setting up and running tests for the ZKP Verifier contracts, especially the EnhancedFHIRVerifier contract.

## Environment Requirements

The tests rely on the following tools:

- Node.js (v14 or later)
- Hardhat
- Ethers.js or Viem
- TypeScript

## Test Structure

The test suite is organized into several components:

1. **Mock Contracts**: Located in `test/hardhat/zkp/MockZKPVerifier.sol`
2. **Test Helper**: Located in `test/hardhat/zkp/test-helper.js`
3. **Test Files**:
   - `ZKPVerifiers.test.js`: Tests for all ZKP verifier contracts
   - `FHIRVerifier.test.ts`: Tests specifically for the FHIR verifier
   - `EnhancedFHIRVerifier.test.ts`: Tests for the enhanced FHIR verifier

## Running Tests

### Prerequisites

Make sure you have a local Ethereum development environment set up, such as Hardhat's built-in network.

### Commands

To run all tests:

```bash
# Skip Foundry dependency check if you don't have Foundry installed
SKIP_FOUNDRY=true npx hardhat test
```

To run a specific test file:

```bash
SKIP_FOUNDRY=true npx hardhat test ./test/hardhat/zkp/EnhancedFHIRVerifier.test.ts
```

## Robust Testing Approach

The test suite is designed to be robust against environment-specific issues:

1. **Graceful Degradation**: The tests can automatically skip or adapt when features aren't available in a specific environment.
2. **Type Flexibility**: The tests handle different numeric types (number vs. BigInt) appropriately.
3. **Mock Contracts**: Mock implementation of the verifier contracts allows testing without external dependencies.

## Test Helper Utilities

The `test-helper.js` file provides useful utilities for writing robust tests:

- `safeVerify()`: Safely executes a test without failing due to environment limitations
- `safeMock()`: Safely mocks contract functions
- `createDummyProof()`: Creates a dummy proof object for testing
- `assertValidAddress()`: Validates a contract address
- `safeAssert()`: Safely asserts results with type flexibility

## Running Tests with Different Providers

By default, the tests use the Hardhat provider, but you can configure them to run with other providers:

```js
// In hardhat.config.js
networks: {
  localhost: {
    url: "http://127.0.0.1:8545",
  },
  // Add other networks here
}
```

Then run tests with:

```bash
SKIP_FOUNDRY=true npx hardhat test --network localhost
```

## Troubleshooting

1. **Foundry Errors**: If you see errors related to Foundry, use the `SKIP_FOUNDRY=true` environment variable.

2. **Connection Errors**: If you see connection errors, ensure your Ethereum node is running.

3. **Type Errors**: If you see type-related errors, make sure you're using TypeScript version 4.5 or later which properly supports BigInt.

4. **Gas Errors**: If you see out-of-gas errors, try increasing the gas limit in your Hardhat configuration.

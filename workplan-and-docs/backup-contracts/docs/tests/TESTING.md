# Testing Guide for DidRegistry Contract

This document provides a comprehensive guide for testing the DidRegistry smart contract using Hardhat.

## Overview

The DidRegistry contract is tested using:

- **Hardhat**: For the Ethereum development environment
- **Viem**: For interacting with the Ethereum blockchain
- **Chai**: For assertions
- **Mocha**: As the test runner

## Test Files

- `DidRegistry.test.ts`: Original test file with basic functionality tests
- `DidRegistry.enhanced.test.ts`: Comprehensive test suite with extended coverage

## Test Coverage

The enhanced test suite covers:

1. **Deployment**: Basic contract deployment tests
2. **DID Registration**: Tests for registering DIDs with various parameters
3. **DID Resolution**: Tests for resolving DIDs and retrieving their data
4. **DID Document Updates**: Tests for updating DID documents and public keys
5. **DID Deactivation**: Tests for deactivating DIDs and related restrictions
6. **Address to DID Mapping**: Tests for the address-to-DID mapping functionality
7. **Controller Management**: Tests for DID controller authorization
8. **Gas Usage**: Tests for estimating gas costs of various operations
9. **Edge Cases**: Tests for handling edge cases like empty strings and very long documents
10. **Ignition Integration**: Tests for Hardhat Ignition deployment

## Running the Tests

### Prerequisites

Make sure you have the following installed:

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

### Running All Tests

```bash
npx hardhat test
```

### Running Specific Test Files

```bash
npx hardhat test test/DidRegistry.test.ts
npx hardhat test test/DidRegistry.enhanced.test.ts
```

### Running with Gas Reporter

To see gas usage statistics:

```bash
REPORT_GAS=true npx hardhat test
```

### Running with Coverage

To generate a test coverage report:

```bash
npx hardhat coverage
```

## Test Structure

Each test file follows this structure:

1. **Fixture Setup**: The `deployDidRegistryFixture` function that deploys the contract and sets up initial test data
2. **Test Groups**: Organized by functionality area (e.g., "Deployment", "Registration", etc.)
3. **Individual Tests**: Specific test cases that verify particular behaviors

## Key Testing Patterns

### Fixture Pattern

We use the fixture pattern to deploy the contract once and reuse that deployment across multiple tests:

```typescript
async function deployDidRegistryFixture() {
  // Setup code...
  return { didRegistry, owner, otherAccount, ... };
}

// In tests:
const { didRegistry, owner } = await loadFixture(deployDidRegistryFixture);
```

### Event Testing

We verify events are emitted correctly:

```typescript
const log = receipt.logs[0];
const event = decodeEventLog({
  abi: didRegistry.abi,
  data: log.data,
  topics: log.topics,
});

expect(event.eventName).to.equal('DIDRegistered');
expect(event.args.did).to.equal(newDid);
```

### Error Testing

We test that operations revert with the expected errors:

```typescript
await expect(didRegistry.write.registerDid([testDid, TEST_DOCUMENT, TEST_PUBLIC_KEY])).to.be.rejectedWith(
  'DidRegistry__DIDAlreadyRegistered'
);
```

## Hardhat Ignition

The tests include verification of Hardhat Ignition deployment. The Ignition module is defined in `ignition/modules/DidRegistry.ts`.

## Gas Optimization Testing

The enhanced test suite includes gas estimation tests to help optimize the contract for gas efficiency:

```typescript
const gasEstimate = await publicClient.estimateContractGas({
  address: didRegistry.address,
  abi: didRegistry.abi,
  functionName: 'registerDid',
  args: [newDid, TEST_DOCUMENT, TEST_PUBLIC_KEY],
  account: thirdAccount.account,
});

console.log(`Gas estimate for registerDid: ${gasEstimate}`);
```

## Edge Case Testing

We test various edge cases to ensure the contract handles unexpected inputs gracefully:

- Empty document strings
- Empty public key strings
- Very long document strings
- Invalid DIDs
- Unauthorized operations
- Deactivated DIDs

## Continuous Integration

These tests can be integrated into a CI/CD pipeline to ensure code quality before deployment.

## Troubleshooting

If you encounter issues running the tests:

1. Make sure all dependencies are installed
2. Check that you're using the correct Node.js version
3. Try clearing the Hardhat cache: `npx hardhat clean`
4. Ensure your local Ethereum node is running if not using Hardhat Network

## Contributing New Tests

When adding new tests:

1. Follow the existing patterns and structure
2. Group related tests under appropriate `describe` blocks
3. Use descriptive test names that explain what is being tested
4. Include both positive and negative test cases
5. Test edge cases and error conditions

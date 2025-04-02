# DID and Data Registry Testing

This directory contains comprehensive test suites for the DID and Data Registry contracts using Hardhat and TypeScript.

## Test Files

- **DidRegistry.test.ts**: Basic tests for the DidRegistry contract
- **DidRegistry.enhanced.test.ts**: Enhanced tests for the DidRegistry contract with more complex scenarios
- **DataRegistry.test.ts**: Tests for the DataRegistry contract
- **Compensation.test.ts**: Tests for the Compensation contract
- **DidAuth.test.ts**: Tests for the DidAuth contract

## Test Structure

Each test file follows a similar structure:

1. **Deployment Fixture**: Sets up the test environment by deploying contracts and initializing test data
2. **Deployment Tests**: Verify that contracts deploy correctly and initialize with the expected values
3. **Functional Tests**: Test the core functionality of each contract
4. **Edge Cases**: Test error conditions and edge cases
5. **Integration Tests**: Test interactions between contracts

## Running Tests

You can run the tests using the following npm scripts:

```bash
# Run all tests
npm run test

# Run specific test files
npm run test:did
npm run test:did-enhanced
npm run test:data
npm run test:compensation
npm run test:didauth

# Run all tests with the test runner script
npm run test:all

# Run tests with gas reporting
npm run test:gas
npm run test:gas-enhanced
npm run test:gas-data

# Run tests with coverage
npm run coverage
npm run coverage:did
npm run coverage:did-enhanced
npm run coverage:data
npm run coverage:compensation
npm run coverage:didauth
```

## Test Runner Script

The `scripts/run-tests.sh` script provides a convenient way to run multiple test files with different options:

```bash
# Run all tests
./scripts/run-tests.sh --all

# Run specific test files
./scripts/run-tests.sh --did --did-enhanced
./scripts/run-tests.sh --data --compensation
./scripts/run-tests.sh --didauth
```

## Test Coverage

The test suites aim to provide comprehensive coverage of all contract functionality:

### DidRegistry Tests

- DID registration
- DID updates
- DID deactivation
- DID resolution
- Access control

### DataRegistry Tests

- Producer record registration
- Producer record updates
- Data verification
- Data sharing
- Access control
- Admin functions

### Compensation Tests

- Payment processing
- Payment verification
- Balance management
- Admin functions

### DidAuth Tests

- Authentication
- Role management
- DID to address mapping
- Credential verification

## Test Data

The tests use the following test data:

- **Test DIDs**: Generated from wallet addresses in the format `did:ala:testnet:<address>`
- **Test Documents**: Simple JSON documents for DID documents
- **Test Public Keys**: Placeholder public keys for testing
- **Test Records**: Health records with metadata for testing DataRegistry

## Test Environment

The tests use Hardhat's testing environment with the following features:

- **Fixtures**: For efficient test setup and reuse
- **Chai Assertions**: For test assertions
- **Viem**: For interacting with contracts
- **Hardhat Network Helpers**: For testing utilities

## Adding New Tests

When adding new tests:

1. Follow the existing test structure
2. Use the deployment fixture for setup
3. Group related tests in describe blocks
4. Add clear test descriptions
5. Update this README if necessary

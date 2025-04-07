# Circom Zero-Knowledge Proof Verification Testing

This directory contains comprehensive tests for the Circom zero-knowledge proof verifiers used in the LED-UP system. The tests cover both the Circom circuits and the frontend components that integrate with them.

## Test Directory Structure

```
test/
├── circuits/                   # Tests for individual circuits
│   ├── CircuitTestFramework.ts # Shared testing utilities for circuits
│   ├── age-verifier/           # AgeVerifier circuit tests
│   ├── fhir-verifier/          # FhirVerifier circuit tests
│   └── hash-verifier/          # HashVerifier circuit tests
├── frontend/                   # Tests for frontend components
│   ├── components/             # UI component tests
│   ├── hooks/                  # Custom hook tests
│   └── utils/                  # Utility function tests
├── integration/                # End-to-end integration tests
├── jest.config.js              # Jest configuration
├── jest.setup.js               # Test setup and global mocks
└── README.md                   # This file
```

## Prerequisites

Before running the tests, ensure you have the following:

1. Node.js (v16 or later) and npm/yarn installed
2. Circuit artifacts generated and available in the `artifacts/circuits` directory:
   - WASM files (e.g., `AgeVerifier.wasm`)
   - ZKey files (e.g., `AgeVerifier_0001.zkey`)
   - Verification key files (e.g., `verification_key_AgeVerifier.json`)

## Setting Up the Test Environment

1. Install the required dependencies:

```bash
npm install
# or with yarn
yarn install
```

2. Generate the circuit artifacts if they don't exist:

```bash
npm run setup-circuits
# or with yarn
yarn setup-circuits
```

This will compile the Circom circuits and generate the necessary artifacts.

## Running the Tests

### Running All Tests

To run all tests:

```bash
npm run test
# or with yarn
yarn test
```

### Running Specific Test Suites

To run tests for specific components:

```bash
# Circuit tests
npm run test:circuits
# or with yarn
yarn test:circuits

# Frontend tests
npm run test:frontend
# or with yarn
yarn test:frontend

# Integration tests
npm run test:integration
# or with yarn
yarn test:integration
```

To run tests for a specific circuit:

```bash
# AgeVerifier circuit tests
npm run test:age-verifier
# or with yarn
yarn test:age-verifier

# FhirVerifier circuit tests
npm run test:fhir-verifier
# or with yarn
yarn test:fhir-verifier

# HashVerifier circuit tests
npm run test:hash-verifier
# or with yarn
yarn test:hash-verifier
```

### Running with Coverage

To generate test coverage reports:

```bash
npm run test:coverage
# or with yarn
yarn test:coverage
```

The coverage report will be available in the `coverage` directory.

## Test Strategy

The tests are organized into three main categories:

1. **Circuit Tests**: These tests verify that each Circom circuit correctly implements its verification logic.

   - Valid inputs produce expected outputs
   - Invalid inputs are properly detected
   - Edge cases are handled correctly

2. **Frontend Tests**: These tests verify that the frontend components correctly integrate with the circuits.

   - UI components render correctly and handle state properly
   - Hooks manage circuit verification state correctly
   - Utility functions process data correctly

3. **Integration Tests**: These tests verify that the entire verification flow works end-to-end.
   - Data flows correctly through the system
   - Complete verification processes succeed
   - Error cases are handled properly

## Creating New Tests

When adding new tests, follow these guidelines:

1. Place tests in the appropriate directory based on what they're testing.
2. Use the existing test patterns for consistency.
3. Ensure tests are isolated and don't depend on external state.
4. Update this README if you add new test categories.

## Test Mocks

The test environment includes several mocks to facilitate testing:

- The `snarkjs` library is mocked to avoid actual proof generation during testing.
- The `fetch` API is mocked for testing network requests.
- Browser globals like `window` and `document` are mocked for frontend tests.

These mocks are defined in `jest.setup.js`.

## Troubleshooting

If you encounter issues with the tests:

1. Ensure all dependencies are installed.
2. Check that circuit artifacts are generated correctly.
3. Verify that the paths in the tests match your project structure.
4. Check the console output for specific error messages.

If you continue to have issues, please open an issue in the repository.

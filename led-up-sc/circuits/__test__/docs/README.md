# Enhanced Hash Verifier Tests

This directory contains tests for the Enhanced Hash Verifier circuit using zokrates-js.

## Overview

The tests verify the functionality of the Enhanced Hash Verifier circuit by:

1. Testing valid hash verification (should pass)
2. Testing invalid hash verification (should fail)
3. Testing mismatched data and hash (should fail)
4. Testing tampered proofs (should fail verification)

## Setup

To run the tests, you need to have Node.js installed. Then install the dependencies:

```bash
npm install
```

## Running the Tests

To run all tests:

```bash
npm run test:all
```

To run specific tests:

```bash
npm test              # Run basic verification tests
npm run test:invalid  # Run tests for invalid proofs
```

The test scripts will:

1. Initialize zokrates-js
2. Compile the hash computation program
3. Compute hash values for valid and invalid data
4. Compile the main circuit
5. Set up the circuit (generates proving and verification keys)
6. Test various scenarios
7. Save the results to the `results` directory

## Test Cases

### Basic Verification Tests (`test_hash_verification.js`)

#### Valid Case

- Uses valid data: `[12345, 67890, 54321, 98765]`
- Computes the correct hash for this data
- Verifies that the hash matches the data
- Generates a proof
- Verifies the proof (should be valid)

#### Invalid Case

- Uses valid data but with incorrect hash values
- Attempts to verify that the hash matches the data (should fail)
- If verification fails, an error is expected

#### Mismatched Case

- Uses invalid data with hash values computed for the valid data
- Attempts to verify that the hash matches the data (should fail)
- If verification fails, an error is expected

### Invalid Proof Tests (`test_invalid_proof.js`)

#### Tampered Proof

- Generates a valid proof first
- Tampers with the proof by modifying one of the values
- Verifies the tampered proof (should fail)

#### Modified Inputs

- Takes a valid proof
- Modifies the inputs field (changing the last input value from 1 to 0)
- Verifies the proof with modified inputs (should fail)

## Results

The test results are saved to the `results` directory:

- `valid_proof.json`: The proof for the valid case
- `tampered_proof.json`: The tampered proof (should fail verification)
- `modified_inputs_proof.json`: The proof with modified inputs (should fail verification)
- `verification_key.json`: The verification key used for verification

## Troubleshooting

If you encounter any issues:

1. Make sure zokrates-js is properly installed
2. Check that the circuit file (`enhancedHashCheck.zok`) is accessible
3. Verify that the hash computation program is correctly defined
4. Check the console output for detailed error messages

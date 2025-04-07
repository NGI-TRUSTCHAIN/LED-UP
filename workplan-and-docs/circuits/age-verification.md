# AgeVerifier Circuit Documentation

## Overview

The `AgeVerifier` circuit enables zero-knowledge age verification, allowing users to prove age-related claims (e.g., being over 18, falling into a specific age bracket) without revealing their exact birth date.

```circom
import { AgeVerifier } from '@circuits/AgeVerifier.circom';

// Public inputs
const currentDate = Math.floor(Date.now() / 1000); // Current Unix timestamp
const threshold = 18 * 365.25 * 24 * 60 * 60;     // 18 years in seconds
const verificationType = 1;                        // Simple age check

// Private inputs (only known to the prover)
const birthDate = 946684800;                       // Jan 1, 2000 as Unix timestamp

// Circuit instantiation
component verifier = AgeVerifier();
verifier.birthDate <== birthDate;
verifier.currentDate <== currentDate;
verifier.threshold <== threshold;
verifier.verificationType <== verificationType;

// Result will be accessible at verifier.result
```

## Input Signals

| Signal             | Type          | Visibility | Description                                                                |
| ------------------ | ------------- | ---------- | -------------------------------------------------------------------------- |
| `birthDate`        | Field Element | Private    | User's birth date as Unix timestamp (seconds since epoch)                  |
| `currentDate`      | Field Element | Public     | Current date as Unix timestamp                                             |
| `threshold`        | Field Element | Public     | Age threshold in seconds (e.g., `18 * 365.25 * 24 * 60 * 60` for 18 years) |
| `verificationType` | Integer       | Public     | Type of verification to perform (1, 2, or 3)                               |

## Output Signal

| Signal   | Type    | Description                                     |
| -------- | ------- | ----------------------------------------------- |
| `result` | Integer | Result code indicating the verification outcome |

## Verification Types

### Type 1: Simple Age Verification

Checks if the user's age is greater than or equal to the threshold.

```circom
// Example: Verify user is at least 18 years old
verifier.verificationType <== 1;
verifier.threshold <== 18 * 365.25 * 24 * 60 * 60; // 18 years in seconds
```

**Result Codes**:

- `14`: Success - User is at or above the age threshold
- `21`: Failure - User is below the age threshold

### Type 2: Birth Date Verification

Verifies that the birth date is valid (not in the future) AND checks against the age threshold.

```circom
// Example: Verify user is at least 21 years old with birth date validation
verifier.verificationType <== 2;
verifier.threshold <== 21 * 365.25 * 24 * 60 * 60; // 21 years in seconds
```

**Result Codes**:

- `19`: Success - Birth date is valid AND user is at or above the age threshold
- `22`: Failure - Birth date is valid BUT user is below the age threshold
- `23`: Failure - Birth date is invalid (in the future)

### Type 3: Age Bracket Verification

Determines which age bracket the user falls into: Child (0-17), Adult (18-64), or Senior (65+).

```circom
// Example: Determine user's age bracket
verifier.verificationType <== 3;
// threshold is not used for this verification type
```

**Result Codes**:

- `11`: Child (0-17 years)
- `12`: Adult (18-64 years)
- `13`: Senior (65+ years)

## Implementation Details

The circuit implements several key components:

1. **Age Calculation**:

   ```circom
   signal ageInSeconds <== currentDate - birthDate;
   ```

2. **Birth Date Validation**:

   ```circom
   component futureCheck = LessThan(64);
   futureCheck.in[0] <== birthDate;
   futureCheck.in[1] <== currentDate;
   signal birthDateValid <== futureCheck.out;
   ```

3. **Age Threshold Check**:

   ```circom
   component ageThresholdCheck = LessThan(64);
   ageThresholdCheck.in[0] <== threshold;
   ageThresholdCheck.in[1] <== ageInSeconds;
   signal isAboveThreshold <== ageThresholdCheck.out;
   ```

4. **Age Bracket Classification**:

   ```circom
   var CHILD_MAX = 567648000;   // 18 years in seconds
   var ADULT_MAX = 2051328000;  // 65 years in seconds

   component isChildCheck = LessThan(64);
   isChildCheck.in[0] <== ageInSeconds;
   isChildCheck.in[1] <== CHILD_MAX;
   signal isChild <== isChildCheck.out;

   component isSeniorCheck = LessThan(64);
   isSeniorCheck.in[0] <== ADULT_MAX;
   isSeniorCheck.in[1] <== ageInSeconds;
   signal isSenior <== isSeniorCheck.out;

   signal isAdult <== 1 - isChild - isSenior;
   ```

## Usage Examples

### Example 1: Verifying a User is Over 18

```javascript
// Setup
import { generateProof, verifyProof } from '@circuits/utils';

// Create inputs
const currentDate = Math.floor(Date.now() / 1000);
const eighteenYearsInSeconds = Math.floor(18 * 365.25 * 24 * 60 * 60);
const userBirthDate = 978307200; // January 1, 2001 00:00:00 UTC

const circuitInputs = {
  birthDate: userBirthDate,
  currentDate: currentDate,
  threshold: eighteenYearsInSeconds,
  verificationType: 1, // Simple age check
};

// Generate ZK proof
const { proof, publicSignals } = await generateProof(circuitInputs, 'age-verifier.wasm', 'age-verifier.zkey');

// Verify the proof
const isValid = await verifyProof(proof, publicSignals, 'age-verifier-verification-key.json');

// Extract and interpret the result
const resultCode = parseInt(publicSignals[0]);
console.log('Is proof valid?', isValid);
console.log('Result code:', resultCode);
console.log('User is over 18:', resultCode === 14);
```

### Example 2: Determining Age Bracket

```javascript
const circuitInputs = {
  birthDate: userBirthDate,
  currentDate: currentDate,
  threshold: 0, // Not used for age bracket verification
  verificationType: 3, // Age bracket check
};

const { proof, publicSignals } = await generateProof(circuitInputs, 'age-verifier.wasm', 'age-verifier.zkey');

const resultCode = parseInt(publicSignals[0]);
let ageBracket;

switch (resultCode) {
  case 11:
    ageBracket = 'Child (0-17 years)';
    break;
  case 12:
    ageBracket = 'Adult (18-64 years)';
    break;
  case 13:
    ageBracket = 'Senior (65+ years)';
    break;
  default:
    ageBracket = 'Unknown';
}

console.log('User age bracket:', ageBracket);
```

## Integration with Smart Contracts

The AgeVerifier circuit can be integrated with blockchain applications using the generated Solidity verifier:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./AgeVerifier.sol"; // Generated Solidity verifier

contract AgeVerificationService {
    AgeVerifier public verifier;

    constructor(address _verifierAddress) {
        verifier = AgeVerifier(_verifierAddress);
    }

    function verifyAgeProof(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[3] memory input // [currentDate, threshold, verificationType]
    ) public view returns (bool success, uint8 resultCode) {
        // Verify the proof
        bool isValidProof = verifier.verifyProof(a, b, c, input);

        if (!isValidProof) {
            return (false, 0);
        }

        // Extract result code from the proof's public inputs
        // (The actual implementation depends on how the circuit outputs the result)
        uint8 code = uint8(input[3]); // This may vary based on the verifier contract

        return (true, code);
    }
}
```

## Limitations and Considerations

- The circuit assumes Unix timestamps fit within a 64-bit field element
- No verification is performed on the reasonableness of the birth date (e.g., very old dates)
- For age bracket verification (Type 3), birth date validation is not explicitly performed
- When integrating with applications, ensure the current date is provided by a trusted source

For further information on compiling and using this circuit, refer to the [Installation and Setup](./installation-and-setup.md) documentation.

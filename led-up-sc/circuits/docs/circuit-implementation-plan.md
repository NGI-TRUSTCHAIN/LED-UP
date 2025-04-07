# Circom Circuit Implementation Plan

This document outlines a detailed implementation plan for enhancing the Circom circuits in the LED-UP project. Each section describes specific improvements to be made to the circuits, implementation details, and considerations for testing and integration.

## Table of Contents

1. [HashVerifier Circuit Enhancements](#1-hashverifier-circuit-enhancements)
2. [AgeVerifier Circuit Enhancements](#2-ageverifier-circuit-enhancements)
3. [FhirVerifier Circuit Enhancements](#3-fhirverifier-circuit-enhancements)
4. [Circuit Optimization Techniques](#4-circuit-optimization-techniques)
5. [Circuit Integration Improvements](#5-circuit-integration-improvements)
6. [Advanced Circuit Features](#6-advanced-circuit-features)
7. [Implementation Timeline](#7-implementation-timeline)

## 1. HashVerifier Circuit Enhancements

### 1.1. Multi-Hash Algorithm Support

**Current Limitation:** The HashVerifier circuit only supports Poseidon hash.

**Implementation:**

```circom
// Enhanced HashVerifier with multiple hash algorithm support
pragma circom 2.1.4;

include "../../../../../node_modules/circomlib/circuits/poseidon.circom";
include "../../../../../node_modules/circomlib/circuits/sha256/sha256.circom";
include "../../../../../node_modules/circomlib/circuits/comparators.circom";
include "../../../../../node_modules/circomlib/circuits/gates.circom";

// Hash calculator using Poseidon
template PoseidonHashCalculator() {
    signal input data[4];
    signal output hash[2];

    component hasher = Poseidon(4);

    hasher.inputs[0] <== data[0];
    hasher.inputs[1] <== data[1];
    hasher.inputs[2] <== data[2];
    hasher.inputs[3] <== data[3];

    hash[0] <== hasher.out;
    hash[1] <== 0;
}

// Hash calculator using SHA256
template SHA256HashCalculator() {
    signal input data[4];
    signal output hash[2];

    // Implementation for SHA256
    component sha256Hasher = SHA256(512);
    // Convert inputs to bits and feed to hasher
    // Process outputs to field elements

    // Implementation details...
}

// Main enhanced hash verifier with multiple hash algorithms
template EnhancedHashVerifier() {
    // Inputs
    signal input data[4];
    signal input expectedHash[2];
    signal input hashType; // 0 for Poseidon, 1 for SHA256

    // Outputs
    signal output result;

    // Components
    component poseidonHasher = PoseidonHashCalculator();
    component sha256Hasher = SHA256HashCalculator();

    // Feed inputs to both hashers
    for (var i = 0; i < 4; i++) {
        poseidonHasher.data[i] <== data[i];
        sha256Hasher.data[i] <== data[i];
    }

    // Select correct hash based on hashType
    signal selectedHash[2];
    selectedHash[0] <== (1 - hashType) * poseidonHasher.hash[0] + hashType * sha256Hasher.hash[0];
    selectedHash[1] <== (1 - hashType) * poseidonHasher.hash[1] + hashType * sha256Hasher.hash[1];

    // Hash validation using IsZero
    component isZeroHash0 = IsZero();
    component isZeroHash1 = IsZero();

    isZeroHash0.in <== selectedHash[0] - expectedHash[0];
    isZeroHash1.in <== selectedHash[1] - expectedHash[1];

    signal hash0Valid <== 1 - isZeroHash0.out;
    signal hash1Valid <== 1 - isZeroHash1.out;
    signal hashValid <== hash0Valid * hash1Valid;

    // Result
    result <== hashValid;
}

component main { public [expectedHash, hashType] } = EnhancedHashVerifier();
```

**Considerations:**

- SHA-256 in Circom has higher constraint count than Poseidon
- Ensure proper bit-level handling for SHA-256 inputs/outputs
- Add comprehensive tests for both hash algorithms

### 1.2. Enhanced Error Reporting

**Current Limitation:** The HashVerifier returns only success/failure without detailed error information.

**Implementation:**

```circom
// Enhanced HashVerifier with detailed error reporting
template EnhancedHashVerifier() {
    // Existing implementation...

    // Input validation
    component isValidData = DataValidator();
    for (var i = 0; i < 4; i++) {
        isValidData.data[i] <== data[i];
    }

    // Hash format validation
    component isValidHashFormat = HashFormatValidator();
    isValidHashFormat.hash[0] <== expectedHash[0];
    isValidHashFormat.hash[1] <== expectedHash[1];

    // Detailed error codes
    // 0: Invalid input (input validation failed)
    // 1: Success (hash matched)
    // 2: Invalid hash format
    // 3: Hash mismatch (valid input and format, but hash doesn't match)

    signal isInputInvalid <== 1 - isValidData.valid;
    signal isHashFormatInvalid <== 1 - isValidHashFormat.valid;
    signal isHashMismatch <== (1 - isInputInvalid) * (1 - isHashFormatInvalid) * (1 - hashValid);
    signal isSuccess <== (1 - isInputInvalid) * (1 - isHashFormatInvalid) * hashValid;

    // Result with error codes
    result <== 0 * isInputInvalid + 1 * isSuccess + 2 * isHashFormatInvalid + 3 * isHashMismatch;
}
```

**Considerations:**

- Ensure error codes are properly documented
- Update the frontend to handle and display different error codes
- Add tests for each error case

### 1.3. Support for Variable Input Length

**Current Limitation:** The HashVerifier only supports fixed-size inputs (4 elements).

**Implementation:**

```circom
// HashVerifier with variable input length support
template VariableInputHasher() {
    // Signal declaration with variable length
    signal input inputLength; // Number of valid inputs
    signal input data[8]; // Max 8 inputs, but can use fewer
    signal output hash[2];

    // Use inputLength to select which inputs to include in hash
    // Implementation details...
}

template EnhancedHashVerifier() {
    // Inputs
    signal input inputLength;
    signal input data[8];
    signal input expectedHash[2];

    // Implementation using variable input length
    // ...
}
```

**Considerations:**

- Circom requires fixed array sizes, so we need to use a maximum size and a length parameter
- Ensure proper handling of unused array elements
- Add validation for inputLength (must be between 1 and 8)

## 2. AgeVerifier Circuit Enhancements

### 2.1. Optimized Date Handling

**Current Limitation:** Date manipulation in the circuit is complex and uses bit operations.

**Implementation:**

```circom
// Optimized date utilities
template DateUtils() {
    signal input date; // YYYYMMDD format
    signal output year;
    signal output month;
    signal output day;

    // Directly extract using division and modulo operations
    year <== date \ 10000; // Integer division
    month <== (date \ 100) % 100;
    day <== date % 100;
}
```

**Considerations:**

- Test with various date formats to ensure correct extraction
- Ensure compatibility with existing age calculation logic
- Add edge case handling for dates like 00000000 or very large dates

### 2.2. Enhanced Age Bracket Definition

**Current Limitation:** The current age bracket system is too basic (child, adult, senior).

**Implementation:**

```circom
// Enhanced age bracket checker
template DetailedAgeBracketChecker() {
    signal input age;
    signal output bracket; // 0: Invalid, 1: Infant (0-2), 2: Child (3-12), 3: Teen (13-17), 4: Young Adult (18-25), 5: Adult (26-64), 6: Senior (65+)

    // Bracket validation
    component lt3 = LessThan(8);
    component lt13 = LessThan(8);
    component lt18 = LessThan(8);
    component lt26 = LessThan(8);
    component lt65 = LessThan(8);
    component lt121 = LessThan(8);

    lt3.in[0] <== age;
    lt3.in[1] <== 3;

    lt13.in[0] <== age;
    lt13.in[1] <== 13;

    lt18.in[0] <== age;
    lt18.in[1] <== 18;

    lt26.in[0] <== age;
    lt26.in[1] <== 26;

    lt65.in[0] <== age;
    lt65.in[1] <== 65;

    lt121.in[0] <== age;
    lt121.in[1] <== 121;

    // Calculate bracket values
    signal isInfant <== lt3.out * lt121.out;
    signal isChild <== (1 - lt3.out) * lt13.out * lt121.out;
    signal isTeen <== (1 - lt13.out) * lt18.out * lt121.out;
    signal isYoungAdult <== (1 - lt18.out) * lt26.out * lt121.out;
    signal isAdult <== (1 - lt26.out) * lt65.out * lt121.out;
    signal isSenior <== (1 - lt65.out) * lt121.out;
    signal isInvalid <== 1 - lt121.out;

    // Compute final bracket
    bracket <== 0 * isInvalid +
               1 * isInfant +
               2 * isChild +
               3 * isTeen +
               4 * isYoungAdult +
               5 * isAdult +
               6 * isSenior;
}
```

**Considerations:**

- Optimize the number of comparisons needed
- Ensure all age values have exactly one bracket assigned
- Test boundary cases at each bracket transition

### 2.3. Advanced Date Verification

**Current Limitation:** Limited date validation capabilities.

**Implementation:**

```circom
// Advanced date validator
template AdvancedDateValidator() {
    signal input date; // YYYYMMDD format
    signal output valid;
    signal output reason; // 0: Valid, 1: Invalid year, 2: Invalid month, 3: Invalid day, 4: Invalid month length

    component dateUtils = DateUtils();
    dateUtils.date <== date;

    // Year validation (1900-2100)
    component yearLowerBound = GreaterEqThan(16);
    component yearUpperBound = LessThan(16);

    yearLowerBound.in[0] <== dateUtils.year;
    yearLowerBound.in[1] <== 1900;

    yearUpperBound.in[0] <== dateUtils.year;
    yearUpperBound.in[1] <== 2101;

    signal yearValid <== yearLowerBound.out * yearUpperBound.out;

    // Month validation (1-12)
    component monthLowerBound = GreaterEqThan(8);
    component monthUpperBound = LessThan(8);

    monthLowerBound.in[0] <== dateUtils.month;
    monthLowerBound.in[1] <== 1;

    monthUpperBound.in[0] <== dateUtils.month;
    monthUpperBound.in[1] <== 13;

    signal monthValid <== monthLowerBound.out * monthUpperBound.out;

    // Day validation based on month
    // Implementation with proper day validation based on month...

    // More detailed validation logic...

    // Final validation result with reason code
    signal monthLengthValid <== ...; // Logic to check day against month length

    valid <== yearValid * monthValid * dayValid * monthLengthValid;

    // Assign reason code
    reason <== (1 - yearValid) * 1 +
              yearValid * (1 - monthValid) * 2 +
              yearValid * monthValid * (1 - dayValid) * 3 +
              yearValid * monthValid * dayValid * (1 - monthLengthValid) * 4;
}
```

**Considerations:**

- Handle leap years correctly
- Account for different month lengths
- Provide detailed error information for invalid dates

## 3. FhirVerifier Circuit Enhancements

### 3.1. Expanded FHIR Resource Types

**Current Limitation:** Limited number of FHIR resource types supported.

**Implementation:**

```circom
// Enhanced FHIR Resource Type validator
template EnhancedResourceTypeValidator() {
    signal input resourceType;
    signal output valid;

    // Support for 30 resource types (expanded from 16)
    component lessThan31 = LessThan(8);
    component greaterThan0 = GreaterThan(8);

    lessThan31.in[0] <== resourceType;
    lessThan31.in[1] <== 31;

    greaterThan0.in[0] <== resourceType;
    greaterThan0.in[1] <== 0;

    valid <== lessThan31.out * greaterThan0.out;
}
```

**Considerations:**

- Update enum in TypeScript to match expanded resource types
- Maintain backward compatibility with existing resource types
- Add tests for all new resource types

### 3.2. Resource Profile Support

**Current Limitation:** No support for FHIR profiles which specify constraints on resources.

**Implementation:**

```circom
// Profile validator for FHIR resources
template ProfileValidator() {
    signal input resourceData[8];
    signal input resourceType;
    signal input profileId;
    signal output valid;

    // Implementation logic for profile validation
    // This will depend on how profiles are encoded and identified

    // Simplified example:
    signal isPatientUSCore <== profileId == 1 && resourceType == 1; // Profile 1 for Patient
    signal isObservationVitals <== profileId == 2 && resourceType == 2; // Profile 2 for Observation

    // Profile-specific validation logic
    signal patientUSCoreValid <== isPatientUSCore * (resourceData[1] != 0) * (resourceData[2] != 0);
    signal observationVitalsValid <== isObservationVitals * (resourceData[3] != 0);

    // Combine validations
    valid <== patientUSCoreValid + observationVitalsValid;
}
```

**Considerations:**

- Define a clear mapping between profileId values and actual FHIR profiles
- Implement profile-specific validation logic
- Consider how to efficiently encode profile constraints in circuit logic

### 3.3. Enhanced Field Validation

**Current Limitation:** Basic field presence checks without detailed validation.

**Implementation:**

```circom
// Enhanced field validator with detailed validation
template EnhancedFieldValidator() {
    signal input resourceType;
    signal input resourceData[8];
    signal output valid;
    signal output reason; // Detailed validation reason code

    // Patient field validation (resourceType == 1)
    component patientValidator = PatientValidator();
    patientValidator.resourceData <== resourceData;

    // Observation field validation (resourceType == 2)
    component observationValidator = ObservationValidator();
    observationValidator.resourceData <== resourceData;

    // More resource type validators...

    // Select appropriate validator result based on resourceType
    // Using a series of multiplexers

    // Implementation details...

    // More detailed field validation logic...
}

// Patient-specific validator
template PatientValidator() {
    signal input resourceData[8];
    signal output valid;
    signal output reason;

    // Check required fields
    signal hasIdentifier <== resourceData[1] != 0;
    signal hasName <== resourceData[2] != 0;
    signal hasGender <== resourceData[3] != 0;

    // Additional validation logic based on field relationships

    valid <== hasIdentifier * hasName; // Minimum required fields

    // Assign reason code for failures
    reason <== (1 - hasIdentifier) * 1 +
             hasIdentifier * (1 - hasName) * 2 +
             hasIdentifier * hasName * (1 - hasGender) * 3;
}
```

**Considerations:**

- Balance between validation detail and circuit complexity
- Define clear error codes for each validation failure
- Consider how to efficiently validate field relationships

## 4. Circuit Optimization Techniques

### 4.1. Constraint Reduction

**Current Issue:** Some circuits may have unnecessary constraints.

**Implementation Approach:**

- Analyze R1CS files to identify constraint patterns
- Replace complex operations with simpler equivalents
- Use custom optimized gadgets for common operations
- Reuse component instances where possible

**Example Optimization:**

```circom
// Before optimization
signal sum;
sum <== a + b + c + d + e;

// After optimization - uses fewer constraints
signal sum1;
signal sum2;
sum1 <== a + b;
sum2 <== c + d;
sum <== sum1 + sum2 + e;
```

**Considerations:**

- Verify optimizations don't change circuit behavior
- Measure constraint count before and after optimization
- Document optimization techniques for future reference

### 4.2. Signal Packing

**Current Issue:** Using separate signals for related values increases constraint count.

**Implementation Approach:**

- Pack multiple small values into a single field element
- Use bit operations to extract individual values when needed
- Define clear packing and unpacking methods

**Example Implementation:**

```circom
// Pack multiple small values into a single field element
template FieldPacker() {
    signal input value1; // 0-999
    signal input value2; // 0-999
    signal input value3; // 0-999
    signal output packed;

    // Pack values: value1 * 1000000 + value2 * 1000 + value3
    packed <== value1 * 1000000 + value2 * 1000 + value3;
}

// Unpack a field element into multiple values
template FieldUnpacker() {
    signal input packed;
    signal output value1;
    signal output value2;
    signal output value3;

    // Unpack values
    value1 <== packed \ 1000000;
    value2 <== (packed \ 1000) % 1000;
    value3 <== packed % 1000;
}
```

**Considerations:**

- Define clear value ranges to prevent overflow
- Balance between packing efficiency and readability
- Document packing schemes for each template

### 4.3. Custom Gadget Development

**Current Issue:** Using general-purpose components for specific operations may be inefficient.

**Implementation Approach:**

- Develop custom gadgets for frequently used operations
- Optimize for specific input ranges and constraints
- Replace standard library components with optimized versions

**Example Custom Gadget:**

```circom
// Custom optimized range check gadget
// More efficient than using LessThan for common ranges
template OptimizedRangeCheck() {
    signal input value;
    signal input min;
    signal input max;
    signal output isInRange;

    // Implementation optimized for common ranges
    // ...
}
```

**Considerations:**

- Test custom gadgets extensively
- Document the optimization gains
- Maintain compatibility with the rest of the circuit

## 5. Circuit Integration Improvements

### 5.1. Modular Circuit Architecture

**Current Issue:** Circuits may have fixed functionality with limited reuse.

**Implementation Approach:**

- Create a library of reusable components
- Define clear interfaces for component interaction
- Implement circuit composition patterns

**Example Implementation:**

```circom
// Library of reusable components
include "./lib/DateUtils.circom";
include "./lib/HashUtils.circom";
include "./lib/ValidationUtils.circom";

// Main circuit using the library
template EnhancedVerifier() {
    // Circuit implementation using library components
    // ...
}
```

**Considerations:**

- Document component interfaces
- Test components independently
- Establish naming conventions for library components

### 5.2. Circuit Parameter Configuration

**Current Issue:** Circuits have fixed parameters with limited configurability.

**Implementation Approach:**

- Define configuration parameters for circuits
- Allow adjusting circuit behavior through parameters
- Support different levels of verification detail

**Example Implementation:**

```circom
// Configurable verifier template
template ConfigurableVerifier(MAX_INPUTS, VERIFICATION_LEVEL) {
    // Circuit implementation using the parameters
    // MAX_INPUTS: Maximum number of inputs supported
    // VERIFICATION_LEVEL: Detail level for verification (1=basic, 2=detailed, 3=comprehensive)

    signal input data[MAX_INPUTS];
    // Rest of implementation...
}

// Usage with different configurations
component basicVerifier = ConfigurableVerifier(4, 1);
component detailedVerifier = ConfigurableVerifier(8, 3);
```

**Considerations:**

- Document parameter options and effects
- Test different parameter combinations
- Consider impact on constraint count

### 5.3. Cross-Circuit Compatibility

**Current Issue:** Different circuits may not work well together.

**Implementation Approach:**

- Standardize input and output formats across circuits
- Define protocols for circuit communication
- Create adapter circuits for legacy integration

**Example Implementation:**

```circom
// Standard output format for all verifiers
template StandardVerifierOutput() {
    signal output isValid;
    signal output errorCode;
    signal output additionalData[4];
}

// Adapter for legacy circuits
template LegacyAdapter() {
    signal input legacyOutput;
    signal output standardOutput;
    signal output standardErrorCode;
    signal output standardAdditionalData[4];

    // Conversion logic
    // ...
}
```

**Considerations:**

- Document standard formats
- Create test suites for integrated circuits
- Plan migration path for existing circuits

## 6. Advanced Circuit Features

### 6.1. Conditional Computation

**Current Issue:** Circuits compute everything, even when only part is needed.

**Implementation Approach:**

- Implement conditional execution patterns
- Use flag signals to enable/disable computation paths
- Optimize constraint generation for conditional logic

**Example Implementation:**

```circom
// Conditional computation template
template ConditionalOperation() {
    signal input condition; // 0 or 1
    signal input a;
    signal input b;
    signal output result;

    // Only compute when condition is 1
    signal intermediateResult <== condition * (a * b);

    // Result is either intermediateResult or default value
    result <== intermediateResult + (1 - condition) * a;
}
```

**Considerations:**

- Test conditional logic carefully
- Document constraint implications
- Consider impact on proof generation time

### 6.2. ZK-Friendly Algorithms

**Current Issue:** Some algorithms are inefficient in ZK circuits.

**Implementation Approach:**

- Adapt algorithms to be ZK-friendly
- Replace inefficient operations with equivalent efficient ones
- Implement optimized versions of common algorithms

**Example Implementation:**

```circom
// ZK-friendly sorting algorithm
// Instead of using comparison-based sort, use a different approach
template ZKFriendlySort(n) {
    signal input arr[n];
    signal output sorted[n];

    // ZK-friendly sorting implementation
    // ...
}
```

**Considerations:**

- Validate algorithm correctness
- Measure performance improvements
- Document algorithm adaptations

### 6.3. Privacy-Preserving Features

**Current Issue:** Some verifications may leak more information than necessary.

**Implementation Approach:**

- Implement range proofs for age verification
- Add selective disclosure capabilities
- Support zero-knowledge predicates

**Example Implementation:**

```circom
// Range proof for age verification
// Proves age is within a range without revealing exact age
template AgeRangeProof() {
    signal private input age;
    signal input minAge;
    signal input maxAge;
    signal output isInRange;

    // Prove age >= minAge
    component geqMin = GreaterEqThan(8);
    geqMin.in[0] <== age;
    geqMin.in[1] <== minAge;

    // Prove age <= maxAge
    component leqMax = LessThan(8);
    leqMax.in[0] <== age;
    leqMax.in[1] <== maxAge + 1;

    // Both conditions must be true
    isInRange <== geqMin.out * leqMax.out;
}
```

**Considerations:**

- Analyze information leakage
- Define privacy requirements clearly
- Test with different disclosure levels

## 7. Implementation Timeline

### Phase 1: Core Circuit Enhancements (Weeks 1-2)

- Optimize hash handling in HashVerifier
- Implement enhanced error reporting
- Optimize date handling in AgeVerifier

### Phase 2: Feature Expansion (Weeks 3-4)

- Implement multiple hash algorithm support
- Enhance age bracket definitions
- Expand FHIR resource types

### Phase 3: Advanced Features (Weeks 5-6)

- Develop resource profile support
- Implement enhanced field validation
- Create modular circuit architecture

### Phase 4: Optimization (Weeks 7-8)

- Apply constraint reduction techniques
- Implement signal packing where beneficial
- Develop custom gadgets for performance

### Phase 5: Integration and Testing (Weeks 9-10)

- Ensure cross-circuit compatibility
- Implement conditional computation where beneficial
- Add privacy-preserving features
- Comprehensive testing and documentation

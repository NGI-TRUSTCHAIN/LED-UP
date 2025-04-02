# Offchain-First ZKP Implementation Plan

## Overview

This document outlines the implementation plan for an offchain-first Zero Knowledge Proof (ZKP) system that supports:

- Age Verification
- Hash Verification
- Comprehensive FHIR Verification

The system will use ZoKrates for circuit implementation and integrate with Azure Functions for offchain verification, with only verification results stored on-chain.

## Project Structure

1. **ZKP Circuits**: `./src/contracts/circuits/` ✅

   - Age verification circuit ✅
   - Hash verification circuit 🔄
   - FHIR verification circuit ✅

2. **Smart Contracts**: `./src/contracts/zkp/` ✅

   - Verifier contracts ✅
   - Registry contracts ✅

3. **Azure Functions**: `./led-up-api/src/functions`, `./led-up-api/services/` and more 🔄

   - Proof generation 🔄
   - Verification logic 🔄
   - On-chain result registration ❌

4. **Frontend Components**: `./led-up-fe/features/zkp/` ✅

   - User interfaces ✅
   - Client-side logic ✅

5. **Testing**: 🔄
   - Hardhat tests: `./test/hardhat/` ✅
   - Foundry tests: `./test/foundry/` ✅
   - Azure Function tests: `./led-up-api/test/` ❌

## Architecture Overview

1. **Client-Side**: User provides private data for verification ✅
2. **Azure Functions**: Generate and verify ZKP proofs offchain 🔄
3. **Blockchain**: Only store verification results and metadata 🔄
4. **Smart Contracts**: Serve as the source of truth for verification status ✅

## Implementation Tasks

### 1. Circuit Development and Optimization

- 🔄 Review and optimize existing circuits
  - ✅ Age verification circuit
    - ✅ Enhance age range validation (currently 0-150)
    - ✅ Add support for birth date verification instead of just age
    - ✅ Optimize constraints for better performance
  - 🔄 Hash verification circuit
    - ✅ Extend to support multiple hash algorithms (currently only SHA-256)
    - ✅ Add support for larger input data (currently limited to 4 fields)
    - ✅ Implement Merkle tree verification for efficient batch processing
  - ✅ FHIR verification circuit
    - ✅ Improve resource type validation (currently limited to 4 types)
    - ✅ Enhance field validation logic (currently simplistic)
    - ✅ Add support for nested FHIR resources
    - ✅ Implement selective disclosure for FHIR attributes
- ❌ Implement new circuit features
  - ❌ Create unified circuit interface for all verifier types
    - ❌ Design common input/output format
    - ❌ Implement circuit factory pattern
  - ❌ Add support for composite proofs
    - ❌ Implement proof aggregation
    - ❌ Create recursive proof system
  - ❌ Optimize circuit size and complexity
    - ❌ Reduce number of constraints
    - ❌ Implement batching techniques
  - ❌ Add support for batch verification
    - ❌ Design batch verification protocol
    - ❌ Implement efficient verification for multiple proofs
- 🔄 Circuit testing and validation
  - ✅ Create comprehensive test suite for each circuit
    - ✅ Unit tests with various input combinations
    - ✅ Edge case testing
    - ✅ Invalid input testing
  - ❌ Integration tests
    - ❌ Test circuits with smart contracts
    - ❌ Test with Azure Functions
  - ❌ Performance benchmarks
    - ❌ Measure proof generation time
    - ❌ Measure verification time
    - ❌ Compare gas costs for different circuit designs

### 2. Smart Contract Development

- 🔄 ZKP Registry Contract
  - 🔄 Implement verification result storage
  - 🔄 Add proof metadata support
  - ❌ Implement proof revocation
  - ❌ Add proof expiration
- 🔄 Access Control
  - 🔄 Implement role-based access control
  - 🔄 Add verifier authorization
  - ❌ Implement secure update mechanisms
- 🔄 Contract Testing
  - ✅ Unit tests
  - ❌ Integration tests
  - ❌ Gas optimization
  - ❌ Security audit preparation

### 3. Azure Function Implementation

- 🔄 Proof Generation Functions
  - ✅ Age verification proof generation
  - ✅ Hash verification proof generation
  - ✅ FHIR verification proof generation
- 🔄 Verification Functions
  - ✅ Age verification
  - ✅ Hash verification
  - ✅ FHIR verification
- ❌ Blockchain Integration
  - ❌ Implement transaction submission
  - ❌ Handle transaction confirmation
  - ❌ Implement retry mechanisms
- 🔄 Security Implementation
  - ✅ Authentication
  - ✅ Authorization
  - ✅ Data encryption
  - ❌ Rate limiting
  - ❌ Input validation

### 4. Frontend Development

- ✅ ZKP Components
  - ✅ Proof request UI
  - ✅ Verification status UI
  - ✅ Verification history dashboard
- ✅ Integration with Azure Functions
  - ✅ API client implementation
  - ✅ Error handling
  - ✅ Loading states
- ✅ User Experience
  - ✅ Loading states
  - ✅ Error handling
  - ✅ Success feedback
  - ✅ Guided verification flow

### 5. Testing Infrastructure

- 🔄 Unit Tests
  - ✅ Circuit tests
  - ✅ Contract tests
  - ✅ Frontend component tests
  - ❌ Azure Function tests
- ❌ Integration Tests
  - ❌ End-to-end tests
  - ❌ Cross-component tests
  - ❌ Mobile responsiveness
- ❌ Performance Tests
  - ❌ Load testing
  - ❌ Stress testing
  - ❌ Benchmarking

### 6. Documentation

- 🔄 Technical Documentation
  - ✅ Architecture overview
  - ✅ API documentation
  - ✅ Deployment guide
- 🔄 User Documentation
  - ✅ User guides
  - ✅ API usage examples
  - ❌ Troubleshooting guide
- 🔄 Security Documentation
  - ✅ Security considerations
  - ✅ Best practices
  - ❌ Compliance documentation

### 7. Deployment and DevOps

- ❌ CI/CD Pipeline
  - ❌ Build automation
  - ❌ Test automation
  - ❌ Deployment automation
- ❌ Monitoring
  - ❌ Performance monitoring
  - ❌ Error tracking
  - ❌ Usage analytics
- ❌ Maintenance
  - ❌ Backup procedures
  - ❌ Update procedures
  - ❌ Scaling procedures

## Dependencies

- ZoKrates ✅
- Solidity ^0.8.0 ✅
- Azure Functions ✅
- Azure Storage ✅
- React/Next.js ✅
- TypeScript ✅
- Hardhat ✅
- Foundry ✅

## Timeline

1. Circuit Development: 2 weeks 🔄
2. Smart Contract Development: 2 weeks 🔄
3. Azure Function Implementation: 2 weeks 🔄
4. Frontend Development: 2 weeks ✅
5. Testing: 2 weeks 🔄
6. Documentation: 1 week 🔄
7. Deployment: 1 week ❌

Total estimated time: 12 weeks

## Success Criteria

1. All circuits successfully generate and verify proofs 🔄
2. Smart contracts are gas-efficient and secure 🔄
3. Azure Functions reliably handle verification logic 🔄
4. Frontend provides smooth user experience ✅
5. All tests pass with >90% coverage 🔄
6. Documentation is comprehensive and clear 🔄
7. System is deployed and monitored ❌

## Notes

- Prioritize gas efficiency in smart contracts
- Follow test-driven development (TDD) approach
- Implement offchain-first verification via Azure Functions
- Register only verification results on-chain
- Ensure security and privacy throughout development
- Follow best practices for ZKP implementation
- Regular security audits and reviews

## Detailed Implementation Plan: Age Verification Circuit

### Current Implementation Analysis

The current age verification circuit (`ageCheck.zok`) is simple:

- Takes a private age field and a public threshold field
- Validates age is within 0-150 range
- Validates threshold is within 0-150 range
- Returns true if age > threshold

### Enhancement Plan

#### 1. Enhanced Age Range Validation

- ✅ Implement more realistic age validation (0-120 years)
- ✅ Add validation for specific age brackets (child, adult, senior)
- ✅ Support for age verification with specific date cutoffs

```zokrates
// Enhanced age validation
def validate_age_range(field age) -> bool {
    // More realistic maximum age
    return age >= 0 && age <= 120;
}

// Age bracket validation
def check_age_bracket(field age) -> field {
    // 0: Invalid, 1: Child (0-17), 2: Adult (18-64), 3: Senior (65+)
    field bracket = 0;

    if (age >= 0 && age <= 17) {
        bracket = 1;
    } else if (age >= 18 && age <= 64) {
        bracket = 2;
    } else if (age >= 65 && age <= 120) {
        bracket = 3;
    }

    return bracket;
}
```

#### 2. Birth Date Verification

- ✅ Implement date representation (year, month, day)
- ✅ Add date comparison logic
- ✅ Support for age calculation based on birth date and current date

```zokrates
// Date representation (packed into a single field for simplicity)
// Format: YYYYMMDD as a field
// Example: 19900315 for March 15, 1990

// Calculate age from birth date and current date
def calculate_age(field birthDate, field currentDate) -> field {
    field birthYear = birthDate / 10000;
    field birthMonth = (birthDate / 100) % 100;
    field birthDay = birthDate % 100;

    field currentYear = currentDate / 10000;
    field currentMonth = (currentDate / 100) % 100;
    field currentDay = currentDate % 100;

    field age = currentYear - birthYear;

    // Adjust age if birthday hasn't occurred yet this year
    if (currentMonth < birthMonth || (currentMonth == birthMonth && currentDay < birthDay)) {
        age = age - 1;
    }

    return age;
}
```

#### 3. Performance Optimization

- ✅ Reduce constraint count
- ✅ Implement efficient date comparison
- ✅ Optimize range checks

```zokrates
// Efficient range check for dates
def validate_date(field date) -> bool {
    field year = date / 10000;
    field month = (date / 100) % 100;
    field day = date % 100;

    // Basic validation
    bool validYear = year >= 1900 && year <= 2100;
    bool validMonth = month >= 1 && month <= 12;
    bool validDay = day >= 1 && day <= 31;

    // Simplified month length check (could be expanded)
    bool validDayInMonth = true;
    if (month == 2) {
        // February: max 29 days
        validDayInMonth = day <= 29;
    } else if (month == 4 || month == 6 || month == 9 || month == 11) {
        // April, June, September, November: max 30 days
        validDayInMonth = day <= 30;
    }

    return validYear && validMonth && validDay && validDayInMonth;
}
```

#### 4. New Main Function

- ✅ Implement enhanced main function with all new features
- ✅ Support both simple age verification and birth date verification
- ✅ Return detailed verification result

```zokrates
// Enhanced main function
def main(private field age, private field birthDate, field currentDate, field threshold, field verificationType) -> field {
    // verificationType: 1 = simple age check, 2 = birth date check, 3 = age bracket check

    field result = 0; // 0 = invalid, 1 = valid, 2+ = specific results

    if (verificationType == 1) {
        // Simple age verification
        assert(validate_age_range(age));
        if (age > threshold) {
            result = 1; // Valid: age > threshold
        }
    } else if (verificationType == 2) {
        // Birth date verification
        assert(validate_date(birthDate));
        assert(validate_date(currentDate));

        field calculatedAge = calculate_age(birthDate, currentDate);
        if (calculatedAge > threshold) {
            result = 1; // Valid: calculated age > threshold
        }
    } else if (verificationType == 3) {
        // Age bracket verification
        assert(validate_age_range(age));
        field bracket = check_age_bracket(age);

        // Return the bracket as the result (1, 2, or 3)
        // This allows the verifier to know which bracket the person falls into
        result = bracket;
    }

    return result;
}
```

#### 5. Testing Strategy

- ✅ Create test cases for simple age verification
- ✅ Create test cases for birth date verification
- ✅ Test edge cases (age = threshold, birthdate = today)
- ✅ Test invalid inputs
- ✅ Benchmark performance

#### 6. Integration with Smart Contract

- ✅ Update AgeVerifier.sol to support new circuit
- ✅ Add new verification methods
- ✅ Update events and error handling

#### 7. Azure Function Integration

- ✅ Create proof generation function for enhanced age verification
- ✅ Implement secure storage for verification keys
- ✅ Add API endpoints for verification
- ❌ Implement on-chain result registration

## Detailed Implementation Plan: Hash Verification Circuit

### Current Implementation Analysis

The current hash verification circuit (`hashCheck.zok`) is basic:

- Takes private data (4 fields) and expected hash (2 fields)
- Uses SHA-256 for hashing (via sha256packed import)
- Returns true if computed hash matches expected hash

### Enhancement Plan

#### 1. Support for Multiple Hash Algorithms

- ❌ Add support for Keccak-256 (Ethereum's hash function)
- ❌ Add support for Poseidon (ZK-friendly hash function)
- ❌ Implement algorithm selection parameter

```zokrates
// Import multiple hash functions
import "hashes/sha256/512bitPacked" as sha256packed;
import "hashes/keccak256/512bitPacked" as keccak256packed;
import "hashes/poseidon/poseidon" as poseidon;

// Hash selection function
def hash_data(field[4] data, field algorithm) -> field[2] {
    field[2] result = [0, 0];

    // algorithm: 1 = SHA-256, 2 = Keccak-256, 3 = Poseidon
    if (algorithm == 1) {
        // SHA-256
        result = sha256packed(data);
    } else if (algorithm == 2) {
        // Keccak-256
        result = keccak256packed(data);
    } else if (algorithm == 3) {
        // Poseidon (simplified - actual implementation would depend on ZoKrates version)
        // Note: Poseidon output would need to be formatted to match the expected output format
        field[5] poseidon_input = [data[0], data[1], data[2], data[3], 0];
        field poseidon_result = poseidon(poseidon_input);
        result = [poseidon_result, 0];
    }

    return result;
}
```

#### 2. Support for Larger Input Data

- ❌ Extend input data size from 4 fields to variable length
- ❌ Implement chunking for large inputs
- ❌ Add support for different data types

```zokrates
// Chunked hashing for larger inputs
// This is a simplified example - actual implementation would depend on ZoKrates capabilities
def hash_large_data(field[8] data, field algorithm) -> field[2] {
    // Split data into two chunks
    field[4] chunk1 = [data[0], data[1], data[2], data[3]];
    field[4] chunk2 = [data[4], data[5], data[6], data[7]];

    // Hash each chunk
    field[2] hash1 = hash_data(chunk1, algorithm);
    field[2] hash2 = hash_data(chunk2, algorithm);

    // Combine the hashes
    field[4] combined = [hash1[0], hash1[1], hash2[0], hash2[1]];

    // Hash the combined result
    return hash_data(combined, algorithm);
}

// Support for different data types (example for string-like data)
def hash_string(field[32] chars, field algorithm) -> field[2] {
    // Process in chunks of 4
    field[4] chunk1 = [chars[0], chars[1], chars[2], chars[3]];
    field[4] chunk2 = [chars[4], chars[5], chars[6], chars[7]];
    // ... more chunks as needed

    // Hash first chunk
    field[2] result = hash_data(chunk1, algorithm);

    // Iteratively hash with remaining chunks
    field[4] intermediate = [result[0], result[1], chunk2[0], chunk2[1]];
    result = hash_data(intermediate, algorithm);

    // Continue for all chunks...

    return result;
}
```

#### 3. Merkle Tree Verification

- ❌ Implement Merkle tree construction
- ❌ Add Merkle proof verification
- ❌ Support for inclusion proofs

```zokrates
// Merkle tree node hashing
def hash_node(field left, field right, field algorithm) -> field {
    field[4] data = [left, right, 0, 0];
    field[2] result = hash_data(data, algorithm);
    return result[0]; // Simplified to use just the first part of the hash
}

// Verify Merkle proof
def verify_merkle_proof(field leaf, field[10] proof, field root, field algorithm) -> bool {
    field computed_root = leaf;

    // Apply each proof element
    for u32 i in 0..10 {
        field sibling = proof[i];
        // Direction is encoded in the highest bit of the sibling
        field direction = sibling & (1 << 255);
        // Clear direction bit to get actual value
        sibling = sibling & ((1 << 255) - 1);

        if (direction == 0) {
            // Current node is left child
            computed_root = hash_node(computed_root, sibling, algorithm);
        } else {
            // Current node is right child
            computed_root = hash_node(sibling, computed_root, algorithm);
        }
    }

    return computed_root == root;
}
```

#### 4. New Main Function

- ❌ Implement enhanced main function with all new features
- ❌ Support different verification modes
- ❌ Add detailed result reporting

```zokrates
// Enhanced main function
def main(
    private field[8] data,
    field[2] expectedHash,
    field algorithm,
    field mode,
    private field[10] merkleProof,
    field merkleRoot
) -> field {
    // mode: 1 = direct hash verification, 2 = Merkle proof verification

    field result = 0; // 0 = invalid, 1 = valid

    if (mode == 1) {
        // Direct hash verification
        field[2] computedHash;

        if (data[4] == 0 && data[5] == 0 && data[6] == 0 && data[7] == 0) {
            // Small data (4 fields)
            field[4] smallData = [data[0], data[1], data[2], data[3]];
            computedHash = hash_data(smallData, algorithm);
        } else {
            // Large data (8 fields)
            computedHash = hash_large_data(data, algorithm);
        }

        if (computedHash[0] == expectedHash[0] && computedHash[1] == expectedHash[1]) {
            result = 1;
        }
    } else if (mode == 2) {
        // Merkle proof verification
        // Hash the data first
        field[4] smallData = [data[0], data[1], data[2], data[3]];
        field[2] leafHash = hash_data(smallData, algorithm);

        // Verify the Merkle proof
        if (verify_merkle_proof(leafHash[0], merkleProof, merkleRoot, algorithm)) {
            result = 1;
        }
    }

    return result;
}
```

#### 5. Testing Strategy

- ❌ Create test cases for each hash algorithm
- ❌ Test with various data sizes
- ❌ Create Merkle tree test cases
- ❌ Test invalid proofs and edge cases
- ❌ Benchmark performance across algorithms

#### 6. Integration with Smart Contract

- ❌ Update HashVerifier.sol to support new circuit
- ❌ Add support for multiple hash algorithms
- ❌ Implement Merkle tree verification
- ❌ Update events and error handling

#### 7. Azure Function Integration

- ❌ Create proof generation function for enhanced hash verification
- ❌ Implement Merkle tree construction in Azure Functions
- ❌ Add API endpoints for different verification modes

## Detailed Implementation Plan: FHIR Verification Circuit

### Current Implementation Analysis

The current FHIR verification circuit (`fhirCheck.zok`) has basic functionality:

- Takes private resource data (4 fields), resource type, expected hash, and required field
- Supports only 4 resource types (Patient, Observation, MedicationRequest, Condition)
- Uses SHA-256 for hashing
- Performs simple field validation
- Returns true if all validations pass

### Enhancement Plan

#### 1. Improved Resource Type Validation

- ✅ Extend support for more FHIR resource types
- ✅ Add version-specific validation
- ✅ Implement resource type hierarchy

#### 2. Enhanced Field Validation

- ✅ Implement structured field validation
- ✅ Add support for required fields by resource type
- ✅ Validate field formats (dates, identifiers, codes)

#### 3. Support for Nested FHIR Resources

- ✅ Implement reference validation between resources
- ✅ Add support for contained resources
- ✅ Validate resource relationships

#### 4. Selective Disclosure for FHIR Attributes

- ✅ Implement attribute-level disclosure control
- ✅ Add support for redacted fields
- ✅ Validate partial resource disclosure

#### 5. New Main Function

- ✅ Implement enhanced main function with all new features
- ✅ Support different verification modes
- ✅ Add detailed result reporting

#### 6. Testing Strategy

- ✅ Create test cases for each FHIR resource type
- ✅ Test selective disclosure scenarios
- ✅ Test reference validation
- ✅ Test with real FHIR data examples
- ✅ Benchmark performance with different resource sizes

#### 7. Integration with Smart Contract

- ✅ Update FHIRVerifier.sol to support new circuit
- ✅ Add support for selective disclosure
- ✅ Implement reference validation
- ✅ Update events and error handling

#### 8. Azure Function Integration

- ✅ Create proof generation function for enhanced FHIR verification
- ✅ Implement FHIR data preprocessing
- ✅ Add API endpoints for different verification modes
- ✅ Implement secure storage for FHIR verification keys

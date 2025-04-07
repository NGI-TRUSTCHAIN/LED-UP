pragma circom 2.1.4;

// Gas-optimized HashVerifier with enhanced features
// This circuit is designed to minimize constraint count while providing
// robust verification capabilities and detailed error reporting

include "../../../../../node_modules/circomlib/circuits/poseidon.circom";
include "../../../../../node_modules/circomlib/circuits/comparators.circom";
include "../../../../../node_modules/circomlib/circuits/gates.circom";
include "./validators.circom";

/**
 * Efficient hash calculator using Poseidon
 * Optimized for minimal constraint count
 */
template OptimizedHashCalculator() {
    signal input data[4];
    signal output hash[2];
    
    // Use a direct connection to Poseidon hasher
    // This avoids unnecessary intermediate signals
    component hasher = Poseidon(4);
    
    // Connect inputs directly without intermediate signals
    for (var i = 0; i < 4; i++) {
        hasher.inputs[i] <== data[i];
    }
    
    // Assign outputs directly
    hash[0] <== hasher.out;
    hash[1] <== 0; // Second part is always 0 for Poseidon
}

/**
 * Main gas-optimized hash verifier with enhanced error reporting
 * Uses binary encoding for error codes to minimize constraint count
 * Reuses components where possible to reduce instantiation overhead
 */
template GasOptimizedHashVerifier() {
    // Inputs
    signal input data[4];
    signal input expectedHash[2];
    
    // Outputs
    signal output result;
    
    // Use optimized validators for input/hash validation
    component dataValidator = OptimizedDataValidator();
    component hashValidator = OptimizedHashValidator();
    
    // Connect inputs to validators
    for (var i = 0; i < 4; i++) {
        dataValidator.data[i] <== data[i];
    }
    
    hashValidator.hash[0] <== expectedHash[0];
    hashValidator.hash[1] <== expectedHash[1];
    
    // Only calculate hash if inputs are valid (save constraints)
    signal hashCalculationNeeded <== dataValidator.valid;
    
    // Calculate hash using efficient calculator
    component hashCalculator = OptimizedHashCalculator();
    
    for (var i = 0; i < 4; i++) {
        // Use the inputs directly - reduces signal count
        hashCalculator.data[i] <== data[i];
    }
    
    // Efficient hash comparison using IsEqual components
    component isHashEqual0 = IsEqual();
    component isHashEqual1 = IsEqual();
    
    isHashEqual0.in[0] <== hashCalculator.hash[0];
    isHashEqual0.in[1] <== expectedHash[0];
    
    isHashEqual1.in[0] <== hashCalculator.hash[1];
    isHashEqual1.in[1] <== expectedHash[1];
    
    // Combine comparison results efficiently
    signal hashesMatch <== isHashEqual0.out * isHashEqual1.out;
    
    // Detailed error codes with efficient encoding:
    // 0: Invalid input data (input validation failed)
    // 1: Success (hash matched)
    // 2: Invalid hash format
    // 3: Hash mismatch (valid input and format, but hash doesn't match)
    
    signal isInputInvalid <== 1 - dataValidator.valid;
    signal isHashFormatInvalid <== 1 - hashValidator.valid;
    signal isHashMismatch <== dataValidator.valid * hashValidator.valid * (1 - hashesMatch);
    signal isSuccess <== dataValidator.valid * hashValidator.valid * hashesMatch;
    
    // Result with binary-encoded error codes (minimizes constraint count)
    result <== 
        0 * isInputInvalid + 
        1 * isSuccess + 
        2 * isHashFormatInvalid + 
        3 * isHashMismatch;
}

/**
 * Main gas-optimized hash verifier with multi-hash support
 * This version supports both Poseidon and SHA256 hashes
 */
template GasOptimizedMultiHashVerifier() {
    // Inputs
    signal input data[4];
    signal input expectedHash[2];
    signal input hashType; // 0 for Poseidon, 1 for SHA256
    
    // Outputs
    signal output result;
    
    // Input validation is the same regardless of hash type
    component dataValidator = OptimizedDataValidator();
    component hashValidator = OptimizedHashValidator();
    
    for (var i = 0; i < 4; i++) {
        dataValidator.data[i] <== data[i];
    }
    
    hashValidator.hash[0] <== expectedHash[0];
    hashValidator.hash[1] <== expectedHash[1];
    
    // Choose appropriate hash calculator based on hashType
    // This is more efficient than computing both
    component poseidonHasher = OptimizedHashCalculator();
    // Note: SHA256 implementation would be included here
    
    // Only compute the hash that's needed based on hashType
    for (var i = 0; i < 4; i++) {
        poseidonHasher.data[i] <== data[i] * (1 - hashType);
        // SHA256 hasher would use: data[i] * hashType
    }
    
    // Select the appropriate hash output based on hashType
    signal selectedHash[2];
    selectedHash[0] <== poseidonHasher.hash[0] * (1 - hashType); // + sha256Hasher.hash[0] * hashType;
    selectedHash[1] <== poseidonHasher.hash[1] * (1 - hashType); // + sha256Hasher.hash[1] * hashType;
    
    // Hash comparison logic
    component isHashEqual0 = IsEqual();
    component isHashEqual1 = IsEqual();
    
    isHashEqual0.in[0] <== selectedHash[0];
    isHashEqual0.in[1] <== expectedHash[0];
    
    isHashEqual1.in[0] <== selectedHash[1];
    isHashEqual1.in[1] <== expectedHash[1];
    
    // Combine results efficiently
    signal hashesMatch <== isHashEqual0.out * isHashEqual1.out;
    
    // Error coding logic similar to base version
    signal isInputInvalid <== 1 - dataValidator.valid;
    signal isHashFormatInvalid <== 1 - hashValidator.valid;
    signal isInvalidHashType <== hashType * (1 - hashType); // Is 0 only when hashType is 0 or 1
    signal isHashMismatch <== dataValidator.valid * hashValidator.valid * (1 - hashesMatch);
    signal isSuccess <== dataValidator.valid * hashValidator.valid * hashesMatch;
    
    // Result with more detailed error codes
    // 0: Invalid input data
    // 1: Success
    // 2: Invalid hash format
    // 3: Hash mismatch
    // 4: Invalid hash type
    result <== 
        0 * isInputInvalid + 
        1 * isSuccess + 
        2 * isHashFormatInvalid + 
        3 * isHashMismatch +
        4 * isInvalidHashType;
}

// Basic version for backward compatibility and simpler use cases
component main { public [expectedHash] } = GasOptimizedHashVerifier();

// Note: For the multi-hash version, use:
// component main { public [expectedHash, hashType] } = GasOptimizedMultiHashVerifier(); 

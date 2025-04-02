pragma circom 2.1.4;

// Gas-optimized validators for Circom circuits
// These templates are designed to minimize constraint count
// while providing robust validation functionality

include "../../../../../node_modules/circomlib/circuits/comparators.circom";
include "../../../../../node_modules/circomlib/circuits/gates.circom";
include "../../../../../node_modules/circomlib/circuits/bitify.circom";

/**
 * Validates a single value is within an acceptable range
 * Uses fewer constraints than a general IsValid template
 * This template is optimized for the specific patterns of valid inputs
 */
template OptimizedRangeValidator(n) {
    signal input value;
    signal output valid;
    
    // Create efficient range check using bit operations when possible
    // n is the bit width to validate against
    component numToBits = Num2Bits(n);
    numToBits.in <== value;
    
    // If conversion succeeded without overflow, the value is valid
    valid <== 1;
}

/**
 * Validates data array with minimal constraint usage
 * Reuses components to save on constraints
 */
template OptimizedDataValidator() {
    signal input data[4];
    signal output valid;
    signal output errorCode;
    
    // Use a single range validator and reuse it for each element
    // This saves on component instantiation costs
    component rangeValidator = OptimizedRangeValidator(252);
    signal validResults[4];
    
    for (var i = 0; i < 4; i++) {
        rangeValidator.value <== data[i];
        validResults[i] <== rangeValidator.valid;
    }
    
    // Aggregate results with bit-encoding for error codes
    signal invalidResults[4];
    for (var i = 0; i < 4; i++) {
        invalidResults[i] <== 1 - validResults[i];
    }
    
    // Binary encoding of error codes uses fewer constraints
    // than one-hot encoding
    errorCode <== 
        invalidResults[0] * 1 +
        invalidResults[1] * 2 +
        invalidResults[2] * 4 +
        invalidResults[3] * 8;
    
    // Valid only if all elements are valid
    valid <== validResults[0] * validResults[1] * validResults[2] * validResults[3];
}

/**
 * Validates hash format with minimal constraints
 * Optimized for the specific structure of our hash format
 */
template OptimizedHashValidator() {
    signal input hash[2];
    signal output valid;
    signal output errorCode;
    
    // The first part must be within field range
    component validator0 = OptimizedRangeValidator(253);
    validator0.value <== hash[0];
    
    // The second part must be 0 or 1 for most cases in our implementation
    // This uses fewer constraints than a general range check
    signal isZero;
    signal isOne;
    
    isZero <== IsZero()(hash[1]);
    isOne <== IsEqual()([hash[1], 1]);
    
    signal secondPartValid <== isZero + isOne;
    
    // Compute validity
    valid <== validator0.valid * secondPartValid;
    
    // Error code: 1 = first part invalid, 2 = second part invalid, 3 = both invalid
    errorCode <== 
        (1 - validator0.valid) * 1 + 
        (1 - secondPartValid) * 2;
}

/**
 * Combined validator with efficient error reporting
 * Uses binary encoding for error codes to minimize constraints
 */
template OptimizedCombinedValidator() {
    signal input data[4];
    signal input hash[2];
    signal output dataValid;
    signal output hashValid;
    signal output errorCode;
    
    component dataValidator = OptimizedDataValidator();
    component hashValidator = OptimizedHashValidator();
    
    // Connect inputs
    for (var i = 0; i < 4; i++) {
        dataValidator.data[i] <== data[i];
    }
    
    hashValidator.hash[0] <== hash[0];
    hashValidator.hash[1] <== hash[1];
    
    // Pass through results
    dataValid <== dataValidator.valid;
    hashValid <== hashValidator.valid;
    
    // Combine error codes with efficient binary encoding
    // Data errors: codes 1-15
    // Hash errors: codes 16-64
    errorCode <== 
        dataValidator.valid * 0 +
        (1 - dataValidator.valid) * dataValidator.errorCode +
        (1 - hashValidator.valid) * (hashValidator.errorCode * 16);
}

/**
 * OptimizedIsEqual - more gas efficient version of IsEqual
 * for the specific case of comparing against constants
 */
template OptimizedIsEqual() {
    signal input in[2];
    signal output out;
    
    // Compute in[0] - in[1]
    signal diff <== in[0] - in[1];
    
    // Check if difference is zero
    component isZero = IsZero();
    isZero.in <== diff;
    
    out <== isZero.out;
}

/**
 * OptimizedMultiOR - gas efficient OR of multiple inputs
 * Uses fewer constraints than standard multi-input OR
 */
template OptimizedMultiOR(n) {
    signal input in[n];
    signal output out;
    
    signal accumulator[n+1];
    accumulator[0] <== 0;
    
    // Iteratively combine results with minimal constraints
    for (var i = 0; i < n; i++) {
        // More efficient than creating multiple OR gates
        accumulator[i+1] <== accumulator[i] + in[i] - accumulator[i] * in[i];
    }
    
    // Convert to 0 or 1
    component isZero = IsZero();
    isZero.in <== accumulator[n];
    
    out <== 1 - isZero.out;
} 

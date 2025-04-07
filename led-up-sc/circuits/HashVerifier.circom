pragma circom 2.1.4;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/comparators.circom";
include "../node_modules/circomlib/circuits/gates.circom";

// Hash calculator using Poseidon
template HashCalculator() {
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

// Main enhanced hash verifier
template EnhancedHashVerifier() {
    // Inputs
    signal input data[4];
    signal input expectedHash[2];
    
    // Outputs
    signal output result;
    
    // Components
    component hashCalculator = HashCalculator();
    
    // Hash calculation
    for (var i = 0; i < 4; i++) {
        hashCalculator.data[i] <== data[i];
    }
    
    // Hash validation using IsZero
    component isZeroHash0 = IsZero();
    component isZeroHash1 = IsZero();
    
    isZeroHash0.in <== hashCalculator.hash[0] - expectedHash[0];
    isZeroHash1.in <== hashCalculator.hash[1] - expectedHash[1];
    
    signal hash0Match <== isZeroHash0.out;
    signal hash1Match <== isZeroHash1.out;
    signal hashMatch <== hash0Match * hash1Match;
    
    // Input validation - Check if any input is zero
    component isZeroData[4];
    for (var i = 0; i < 4; i++) {
        isZeroData[i] = IsZero();
        isZeroData[i].in <== data[i];
    }
    
    // Valid if all values are non-zero
    signal input0Valid <== 1 - isZeroData[0].out;
    signal input1Valid <== 1 - isZeroData[1].out;
    signal input2Valid <== 1 - isZeroData[2].out;
    signal input3Valid <== 1 - isZeroData[3].out;
    
    // Break down into quadratic constraints
    signal input01Valid <== input0Valid * input1Valid;
    signal input23Valid <== input2Valid * input3Valid;
    signal allInputsValid <== input01Valid * input23Valid;
    
    // Simple result code for ease of testing
    // 1: Success - valid inputs and hash match
    // 2: Invalid input - has zero in data
    // 3: Hash mismatch - valid inputs but hash doesn't match
    
    // Calculate results with quadratic constraints
    signal successCase <== hashMatch * allInputsValid;
    signal invalidInputCase <== 1 - allInputsValid;
    signal hashMismatchCase <== allInputsValid * (1 - hashMatch);
    
    result <== successCase * 1 + 
              invalidInputCase * 2 + 
              hashMismatchCase * 3;
}

component main { public [expectedHash] } = EnhancedHashVerifier(); 

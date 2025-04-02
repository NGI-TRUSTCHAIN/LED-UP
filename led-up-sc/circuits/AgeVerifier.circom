pragma circom 2.1.4;

include "../node_modules/circomlib/circuits/comparators.circom";

template AgeVerifier() {
    // Input signals
    signal input birthDate;       // User's birth date as a Unix timestamp (in seconds)
    signal input currentDate;     // Current date as a Unix timestamp (in seconds)
    signal input threshold;       // The threshold age in seconds (not years)
    signal input verificationType; // Type of verification (1: simple age, 2: birth date, 3: age bracket)

    // Output signals
    signal output result;         // The verification result code

    // Calculate the age in seconds
    signal ageInSeconds;
    ageInSeconds <== currentDate - birthDate;
    
    // ===== VALIDATION CHECKS =====
    
    // Check if birth date is valid (not in the future)
    component futureCheck = LessThan(64);
    futureCheck.in[0] <== birthDate;
    futureCheck.in[1] <== currentDate;
    
    signal birthDateValid <== futureCheck.out;
    signal birthDateInvalid <== 1 - birthDateValid;
    
    // ===== AGE THRESHOLD CHECK =====
    
    // Check if age is above threshold
    component ageThresholdCheck = LessThan(64);
    ageThresholdCheck.in[0] <== threshold;
    ageThresholdCheck.in[1] <== ageInSeconds;
    
    signal isAboveThreshold <== ageThresholdCheck.out;
    signal isBelowThreshold <== 1 - isAboveThreshold;
    
    // ===== AGE BRACKET CLASSIFICATION =====
    
    // Constants for age brackets (in seconds)
    var CHILD_MAX = 567648000;   // 18 years in seconds
    var ADULT_MAX = 2051328000;  // 65 years in seconds
    
    // Check if age is child (0-17)
    component isChildCheck = LessThan(64);
    isChildCheck.in[0] <== ageInSeconds;
    isChildCheck.in[1] <== CHILD_MAX;
    
    // Check if age is senior (65+)
    component isSeniorCheck = LessThan(64);
    isSeniorCheck.in[0] <== ADULT_MAX;
    isSeniorCheck.in[1] <== ageInSeconds;
    
    signal isChild <== isChildCheck.out;
    signal isSenior <== isSeniorCheck.out;
    signal isAdult <== 1 - isChild - isSenior; // Adult if not child and not senior
    
    // ===== VERIFICATION TYPE CHECKS =====
    
    // Check which verification type was requested
    component isTypeSimpleAge = IsEqual();
    component isTypeBirthDate = IsEqual();
    component isTypeAgeBracket = IsEqual();
    
    isTypeSimpleAge.in[0] <== verificationType;
    isTypeSimpleAge.in[1] <== 1;
    
    isTypeBirthDate.in[0] <== verificationType;
    isTypeBirthDate.in[1] <== 2;
    
    isTypeAgeBracket.in[0] <== verificationType;
    isTypeAgeBracket.in[1] <== 3;
    
    // ===== RESULT CODES =====
    
    // Type 1: Simple Age Verification
    // 14: Above threshold
    // 21: Below threshold
    signal simpleAgeAboveResult <== isAboveThreshold * 14;
    signal simpleAgeBelowResult <== isBelowThreshold * 21;
    signal simpleAgeResult <== isTypeSimpleAge.out * (simpleAgeAboveResult + simpleAgeBelowResult);
    
    // Type 2: Birth Date Verification
    // 19: Valid date & above threshold
    // 22: Valid date & below threshold
    // 23: Invalid date
    signal birthDateAboveResult <== birthDateValid * isAboveThreshold * 19;
    signal birthDateBelowResult <== birthDateValid * isBelowThreshold * 22;
    signal birthDateInvalidResult <== birthDateInvalid * 23;
    signal birthDateResult <== isTypeBirthDate.out * (birthDateAboveResult + birthDateBelowResult + birthDateInvalidResult);
    
    // Type 3: Age Bracket Verification
    // 10: Invalid age
    // 11: Child (0-17)
    // 12: Adult (18-64)
    // 13: Senior (65+)
    signal childResult <== isChild * 11;
    signal adultResult <== isAdult * 12;
    signal seniorResult <== isSenior * 13;
    signal ageBracketResult <== isTypeAgeBracket.out * (childResult + adultResult + seniorResult);
    
    // Final result is the sum of all three possible result types
    // Only one will be non-zero based on the verificationType
    result <== simpleAgeResult + birthDateResult + ageBracketResult;
}

component main { public [currentDate, threshold, verificationType] } = AgeVerifier();

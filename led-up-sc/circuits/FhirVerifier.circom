pragma circom 2.2.2;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/comparators.circom";
include "../node_modules/circomlib/circuits/gates.circom";
include "../node_modules/circomlib/circuits/bitify.circom";

// Define valid FHIR resource types
template FhirResourceType() {
    signal input resourceType;
    signal output valid;
    
    // Check if resource type is valid (1-4)
    component isValid = LessThan(64);
    component isNotZero = IsZero();
    component isLessThanMax = LessThan(64);
    
    isValid.in[0] <== 0;
    isValid.in[1] <== resourceType;
    
    isNotZero.in <== resourceType;
    
    isLessThanMax.in[0] <== resourceType;
    isLessThanMax.in[1] <== 5; // Maximum resource type + 1
    
    // Combine conditions: resourceType > 0 AND resourceType < 5
    valid <== (1 - isNotZero.out) * isLessThanMax.out;
}

// Resource type validator
template ResourceTypeValidator() {
    signal input resourceType;
    signal output valid;
    
    component fhirResourceType = FhirResourceType();
    fhirResourceType.resourceType <== resourceType;
    valid <== fhirResourceType.valid;
}

// Field validator for different resource types
template FieldValidator() {
    signal input resourceType;
    signal input resourceData[8];
    signal output valid;
    
    // Field presence checks using IsZero - create separate components for each field
    component isZeroIdentifier = IsZero();
    component isZeroName = IsZero();
    component isZeroSubject = IsZero();
    component isZeroCode = IsZero();
    component isZeroValue = IsZero();
    component isZeroMedication = IsZero();
    
    isZeroIdentifier.in <== resourceData[1]; // Identifier field
    isZeroName.in <== resourceData[2];      // Name field
    isZeroSubject.in <== resourceData[1];   // Subject field (same position as Identifier)
    isZeroCode.in <== resourceData[2];      // Code field (same position as Name)
    isZeroValue.in <== resourceData[3];     // Value field
    isZeroMedication.in <== resourceData[1]; // Medication field (same position as Identifier/Subject)
    
    signal hasIdentifier <== 1 - isZeroIdentifier.out;
    signal hasName <== 1 - isZeroName.out;
    signal hasSubject <== 1 - isZeroSubject.out;
    signal hasCode <== 1 - isZeroCode.out;
    signal hasValue <== 1 - isZeroValue.out;
    signal hasMedication <== 1 - isZeroMedication.out;
    
    // Resource type specific validation using IsZero
    component isZeroType1 = IsZero();
    component isZeroType2 = IsZero();
    component isZeroType3 = IsZero();
    component isZeroType4 = IsZero();
    
    isZeroType1.in <== resourceType - 1;
    isZeroType2.in <== resourceType - 2;
    isZeroType3.in <== resourceType - 3;
    isZeroType4.in <== resourceType - 4;
    
    signal isPatient <== 1 - isZeroType1.out;
    signal isObservation <== 1 - isZeroType2.out;
    signal isMedicationRequest <== 1 - isZeroType3.out;
    signal isCondition <== 1 - isZeroType4.out;
    
    // Patient validation - breaking down into quadratic constraints
    signal hasIdentifierAndName <== hasIdentifier * hasName;
    signal patientValid <== isPatient * hasIdentifierAndName;
    
    // Observation validation - breaking down into quadratic constraints
    signal hasSubjectAndCode <== hasSubject * hasCode;
    signal hasSubjectCodeValue <== hasSubjectAndCode * hasValue;
    signal observationValid <== isObservation * hasSubjectCodeValue;
    
    // MedicationRequest validation
    signal hasMedicationAndSubject <== hasMedication * hasSubject;
    signal medicationRequestValid <== isMedicationRequest * hasMedicationAndSubject;
    
    // Condition validation
    signal hasSubjectAndCodeForCondition <== hasSubject * hasCode;
    signal conditionValid <== isCondition * hasSubjectAndCodeForCondition;
    
    // Default validation for other resource types
    component isZeroDefault = IsZero();
    isZeroDefault.in <== resourceData[1];
    signal hasDefaultField <== 1 - isZeroDefault.out;
    signal defaultValid <== (1 - (isPatient + isObservation + isMedicationRequest + isCondition)) * hasDefaultField;
    
    // Combine all validations with proper signal handling
    signal combinedValid <== patientValid + observationValid + medicationRequestValid + conditionValid + defaultValid;
    
    // Output the combined valid signal directly - a non-zero value means valid
    valid <== combinedValid;
}

// Hash calculator using Poseidon
template HashCalculator() {
    signal input data[8];
    signal output hash[2];
    
    component hasher = Poseidon(8);
    
    // Hash all data at once
    for (var i = 0; i < 8; i++) {
        hasher.inputs[i] <== data[i];
    }
    
    hash[0] <== hasher.out;
    hash[1] <== 0;
}

// Main enhanced FHIR verifier
template EnhancedFhirVerifier() {
    // Inputs
    signal input resourceData[8];
    signal input resourceType;
    signal input expectedHash[2];
    signal input verificationMode;
    
    // Outputs
    signal output result;
    signal output debug[16]; // Expanded debug signals from 5 to 16
    
    // Components
    component resourceTypeValidator = ResourceTypeValidator();
    component fieldValidator = FieldValidator();
    component hashCalculator = HashCalculator();
    
    // Resource type validation
    resourceTypeValidator.resourceType <== resourceType;
    
    // Field validation
    fieldValidator.resourceType <== resourceType;
    for (var i = 0; i < 8; i++) {
        fieldValidator.resourceData[i] <== resourceData[i];
    }
    
    // Hash calculation
    for (var i = 0; i < 8; i++) {
        hashCalculator.data[i] <== resourceData[i];
    }
    
    // Hash validation using IsEqual
    component hashMatcher0 = IsEqual();
    component hashMatcher1 = IsEqual();
    
    hashMatcher0.in[0] <== hashCalculator.hash[0];
    hashMatcher0.in[1] <== expectedHash[0];
    hashMatcher1.in[0] <== hashCalculator.hash[1];
    hashMatcher1.in[1] <== expectedHash[1];
    
    signal hashMatch0 <== hashMatcher0.out;
    signal hashMatch1 <== hashMatcher1.out;
    signal hashOk <== hashMatch0 * hashMatch1;
    
    // Verification mode checks using IsEqual
    component modeChecker1 = IsEqual();
    component modeChecker2 = IsEqual();
    component modeChecker3 = IsEqual();
    component modeChecker4 = IsEqual();
    
    modeChecker1.in[0] <== verificationMode;
    modeChecker1.in[1] <== 1;
    modeChecker2.in[0] <== verificationMode;
    modeChecker2.in[1] <== 2;
    modeChecker3.in[0] <== verificationMode;
    modeChecker3.in[1] <== 3;
    modeChecker4.in[0] <== verificationMode;
    modeChecker4.in[1] <== 4;
    
    signal isTypeOnlyMode <== modeChecker1.out;
    signal isHashOnlyMode <== modeChecker2.out;
    signal isFieldsOnlyMode <== modeChecker3.out;
    signal isCompleteMode <== modeChecker4.out;
    
    // Check if resource type is valid
    signal typeOk <== resourceTypeValidator.valid;
    
    // Check if fields are valid
    signal fieldsOk <== fieldValidator.valid;
    
    // MODE 1: RESOURCE TYPE ONLY
    signal typeOnlySuccess <== isTypeOnlyMode * typeOk;
    signal typeOnlyError <== isTypeOnlyMode * (1 - typeOk);
    
    // MODE 2: HASH ONLY - Break down triple multiplication
    signal typeAndHash <== typeOk * hashOk;
    signal hashOnlySuccess <== isHashOnlyMode * typeAndHash;
    signal hashOnlyTypeError <== isHashOnlyMode * (1 - typeOk);
    signal typeAndNotHash <== typeOk * (1 - hashOk);
    signal hashOnlyHashError <== isHashOnlyMode * typeAndNotHash;
    
    // MODE 3: FIELDS ONLY - Break down triple multiplication
    signal typeAndFields <== typeOk * fieldsOk;
    signal fieldsOnlySuccess <== isFieldsOnlyMode * typeAndFields;
    signal fieldsOnlyTypeError <== isFieldsOnlyMode * (1 - typeOk);
    
    // Only set fieldsOnlyFieldsError when fields are actually invalid and type is OK
    signal typeOkButFieldsNotOk <== typeOk * (1 - fieldsOk);
    signal fieldsOnlyFieldsError <== isFieldsOnlyMode * typeOkButFieldsNotOk;
    
    // MODE 4: COMPLETE VERIFICATION - Break down quadruple multiplication
    signal typeAndHashAndFields <== typeAndHash * fieldsOk;
    signal completeSuccess <== isCompleteMode * typeAndHashAndFields;
    signal completeTypeError <== isCompleteMode * (1 - typeOk);
    signal typeOkAndNotHash <== typeOk * (1 - hashOk);
    signal completeHashError <== isCompleteMode * typeOkAndNotHash;
    signal typeHashOkAndNotFields <== typeAndHash * (1 - fieldsOk);
    signal completeFieldsError <== isCompleteMode * typeHashOkAndNotFields;
    
    // Combine all success and error signals
    signal successResult <== typeOnlySuccess + 
                           hashOnlySuccess + 
                           fieldsOnlySuccess + 
                           completeSuccess;
                           
    signal typeErrorResult <== typeOnlyError + 
                             hashOnlyTypeError + 
                             fieldsOnlyTypeError + 
                             completeTypeError;
                             
    signal hashErrorResult <== hashOnlyHashError + 
                             completeHashError;
                             
    signal fieldsErrorResult <== fieldsOnlyFieldsError + 
                               completeFieldsError;
    
    // Check if mode is valid
    signal isValidMode <== isTypeOnlyMode + isHashOnlyMode + isFieldsOnlyMode + isCompleteMode;
    
    // Calculate final result with priority order:
    // 1. Check if mode is valid
    // 2. If valid mode, use error codes in priority: TYPE_ERROR (2), HASH_ERROR (3), FIELDS_ERROR (4)
    // 3. If no errors, return SUCCESS (1)
    // 4. If invalid mode, return 5
    
    // Check if we have any success cases
    component isSuccessZero = IsZero();
    isSuccessZero.in <== successResult;
    signal hasSuccess <== 1 - isSuccessZero.out;
    
    // Check if we have any type errors
    component isTypeErrorZero = IsZero();
    isTypeErrorZero.in <== typeErrorResult;
    signal hasTypeError <== 1 - isTypeErrorZero.out;
    
    // Check if we have any hash errors, but only if no type errors
    component isHashErrorZero = IsZero();
    isHashErrorZero.in <== hashErrorResult;
    signal hasNoTypeError <== 1 - hasTypeError;
    signal hasHashError <== (1 - isHashErrorZero.out) * hasNoTypeError;
    
    // Check if we have any fields errors, but only if no type or hash errors
    component isFieldsErrorZero = IsZero();
    isFieldsErrorZero.in <== fieldsErrorResult;
    signal hasNoHashError <== 1 - hasHashError;
    signal hasNoTypeAndNoHash <== hasNoTypeError * hasNoHashError;
    signal hasFieldsError <== (1 - isFieldsErrorZero.out) * hasNoTypeAndNoHash;
    
    // Calculate result based on the first applicable case
    signal finalResult <== hasTypeError * 2 + 
                         hasHashError * 3 + 
                         hasFieldsError * 4 + 
                         (1 - (hasTypeError + hasHashError + hasFieldsError)) * hasSuccess * 1;
    
    // Check if the mode is valid
    component isValidModeZero = IsZero();
    isValidModeZero.in <== isValidMode;
    signal hasValidMode <== 1 - isValidModeZero.out;
    
    signal invalidModeResult <== (1 - hasValidMode) * 5;
    
    result <== hasValidMode * finalResult + invalidModeResult;
    
    // Debug outputs
    debug[0] <== fieldValidator.valid; // fieldsOk
    debug[1] <== typeOk;
    debug[2] <== isFieldsOnlyMode;
    debug[3] <== fieldsOnlySuccess;
    debug[4] <== fieldsOnlyFieldsError;
    
    // Additional debug signals
    debug[5] <== hashOk; 
    debug[6] <== hashCalculator.hash[0];
    debug[7] <== expectedHash[0];
    debug[8] <== resourceData[1]; // First field data
    debug[9] <== resourceData[2]; // Second field data
    debug[10] <== fieldValidator.resourceType; // Resource type passed to field validator
    debug[11] <== hasHashError;
    debug[12] <== hasFieldsError;
    debug[13] <== typeAndFields; // Check if both type and fields are valid
    debug[14] <== isValidMode; // Check if mode is valid
    debug[15] <== fieldsOnlyFieldsError; // New debug signal to check if fields are invalid
}

component main { public [resourceType, expectedHash, verificationMode] } = EnhancedFhirVerifier();

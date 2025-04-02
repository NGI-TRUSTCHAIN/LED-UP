/**
 * Types for the ZK circuit tests
 */

// Age verification types
export enum AgeVerificationType {
  SIMPLE_AGE = 1,
  BIRTH_DATE = 2,
  AGE_BRACKET = 3,
}

// FHIR resource types
export enum FhirResourceType {
  PATIENT = 1,
  OBSERVATION = 2,
  MEDICATION_REQUEST = 3,
  CONDITION = 4,
  PROCEDURE = 5,
  ENCOUNTER = 6,
  DIAGNOSTIC_REPORT = 7,
  CARE_PLAN = 8,
  IMMUNIZATION = 9,
  ALLERGY_INTOLERANCE = 10,
  DEVICE = 11,
  ORGANIZATION = 12,
  PRACTITIONER = 13,
  LOCATION = 14,
  MEDICATION = 15,
  COVERAGE = 16,
}

// FHIR verification modes
export enum FhirVerificationMode {
  RESOURCE_TYPE_ONLY = 1,
  HASH_ONLY = 2,
  FIELDS_ONLY = 3,
  COMPLETE = 4,
}

// Age verification result codes
export enum AgeVerificationResult {
  // Simple Age Verification
  SIMPLE_AGE_SUCCESS = 14, // Age above threshold
  SIMPLE_AGE_BELOW_THRESHOLD = 21, // Age below threshold

  // Birth Date Verification
  BIRTH_DATE_SUCCESS = 19, // Valid date, age above threshold
  BIRTH_DATE_BELOW_THRESHOLD = 22, // Valid date, age below threshold
  BIRTH_DATE_INVALID = 23, // Invalid date

  // Age Bracket Verification
  AGE_BRACKET_CHILD = 11,
  AGE_BRACKET_ADULT = 12,
  AGE_BRACKET_SENIOR = 13,
  AGE_BRACKET_INVALID = 10,
}

// Hash verification result codes (based on actual circuit outputs)
export enum HashVerificationResult {
  SUCCESS = 1, // Valid input and matching hash
  INVALID_INPUT = 2, // Input contains zeros
  HASH_MISMATCH = 3, // Valid input but wrong hash
}

// FHIR verification result codes
export enum FhirVerificationResult {
  SUCCESS = 1,
  TYPE_ERROR = 2,
  HASH_ERROR = 3,
  FIELDS_ERROR = 4,
}

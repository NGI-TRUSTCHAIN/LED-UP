// Age Verifier Types
export interface AgeVerifierInput {
  age: number;
  birthDate: number; // in YYYYMMDD format
  currentDate: number; // in YYYYMMDD format
  threshold: number;
  verificationType: number; // 1: simple, 2: birth date, 3: bracket
}

export interface AgeVerifierOutput {
  result: number;
}

// FHIR Verifier Types
export interface FhirVerifierInput {
  resourceData: Array<number>; // Array of 8 numbers representing the resource data
  resourceType: number;
  expectedHash: Array<number>; // Array of 2 numbers representing the expected hash
  verificationMode: number;
}

export interface FhirVerifierOutput {
  result: number;
}

// Hash Verifier Types
export interface HashVerifierInput {
  data: Array<number>; // Array of 4 numbers representing the input data
  expectedHash: Array<number>; // Array of 2 numbers representing the expected hash
}

export interface HashVerifierOutput {
  result: number;
}

// Common Proof Types
export interface Proof {
  pi_a: Array<string>;
  pi_b: Array<Array<string>>;
  pi_c: Array<string>;
  protocol: string;
  curve: string;
}

export interface VerificationResult {
  success: boolean;
  message: string;
}

// Circuit Metadata
export interface CircuitMetadata {
  name: string;
  description: string;
  wasmPath: string;
  zkeyPath: string;
  verificationKeyPath: string;
}

// Circuit Types
export enum CircuitType {
  AGE_VERIFIER = 'AgeVerifier',
  FHIR_VERIFIER = 'FhirVerifier',
  HASH_VERIFIER = 'HashVerifier',
}

// Age Verification Types
export enum AgeVerificationType {
  SIMPLE = 'simple',
  BIRTH_DATE = 'birth_date',
  AGE_BRACKET = 'age_bracket',
}

// Age Brackets
export enum AgeBracket {
  CHILD = 1,
  ADULT = 2,
  SENIOR = 3,
}

// FHIR Resource Types
export enum FhirResourceType {
  PATIENT = 1,
  OBSERVATION = 2,
  MEDICATION = 3,
  CONDITION = 4,
  ENCOUNTER = 5,
  PROCEDURE = 6,
  DIAGNOSTIC_REPORT = 7,
  IMMUNIZATION = 8,
  CLAIM = 9,
  COVERAGE = 10,
  PRACTITIONER = 11,
  ORGANIZATION = 12,
  LOCATION = 13,
  CARE_PLAN = 14,
  ALLERGY_INTOLERANCE = 15,
  FAMILY_MEMBER_HISTORY = 16,
}

// FHIR Verification Modes
export enum FhirVerificationMode {
  RESOURCE_TYPE_ONLY = 1,
  FIELD_VALIDATION = 2,
  HASH_VERIFICATION = 3,
  COMPLETE = 4,
}

// FHIR verification result codes
export enum FhirVerificationResult {
  SUCCESS = 1, // Valid verification
  RESOURCE_TYPE_ERROR = 2, // Invalid resource type
  HASH_ERROR = 3, // Hash mismatch
  FIELD_ERROR = 4, // Field validation error
}

// Hash verification result codes (based on actual circuit outputs)
export enum HashVerificationResult {
  SUCCESS = 1, // Valid input and matching hash
  INVALID_INPUT = 2, // Input contains zeros
  HASH_MISMATCH = 3, // Valid input but wrong hash
}

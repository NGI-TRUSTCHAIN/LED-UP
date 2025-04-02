import type { ZoKratesProvider } from 'zokrates-js';

/**
 * Result of a ZoKrates computation
 */
export interface ZoKratesComputationResult {
  witness: Uint8Array;
  output: string;
}

/**
 * Result of a ZoKrates proof generation
 */
export interface ZoKratesProofResult {
  proof: {
    a: [string, string];
    b: [[string, string], [string, string]];
    c: [string, string];
  };
  inputs: string[];
}

/**
 * Setup keypair for ZoKrates
 */
export interface ZoKratesSetupKeypair {
  pk: Uint8Array;
  vk: {
    alpha: string[][];
    beta: string[][][];
    gamma: string[][][];
    delta: string[][][];
    gamma_abc: string[][][];
  };
}

/**
 * Verification key for ZoKrates
 */
export interface ZoKratesVerificationKey {
  alpha: string[][];
  beta: string[][][];
  gamma: string[][][];
  delta: string[][][];
  gamma_abc: string[][][];
}

/**
 * Input for the age verification circuit
 */
export interface AgeVerifierInput {
  age: number;
  birthDate: number;
  currentDate: number;
  threshold: number;
  verificationType: number;
}

/**
 * Input for the hash verification circuit
 */
export interface HashVerifierInput {
  data: string[];
  expectedHash: string[];
}

/**
 * Input for the FHIR verification circuit
 */
export interface FhirVerifierInput {
  resourceData: string[];
  resourceType: number;
  expectedHash: string[];
  verificationMode: number;
}

/**
 * Result of a verification operation
 */
export interface VerificationResult {
  isValid: boolean;
  result: number;
  proof: ZoKratesProofResult;
  publicSignals: string[];
}

/**
 * Types of verification circuits
 */
export enum CircuitType {
  AGE_VERIFIER = 'AGE_VERIFIER',
  HASH_VERIFIER = 'HASH_VERIFIER',
  FHIR_VERIFIER = 'FHIR_VERIFIER',
}

/**
 * Age verification types
 */
export enum AgeVerificationType {
  SIMPLE = 1,
  BIRTH_DATE = 2,
  AGE_BRACKET = 3,
}

/**
 * FHIR resource types
 */
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

/**
 * FHIR verification modes
 */
export enum FhirVerificationMode {
  RESOURCE_TYPE_ONLY = 1,
  FIELD_VALIDATION = 2,
  HASH_VERIFICATION = 3,
}

/**
 * Age verification result codes
 */
export enum AgeVerificationResultCode {
  INVALID_TYPE = 0,
  SUCCESS = 1,
  INVALID_AGE = 2,
  BELOW_THRESHOLD = 3,
  INVALID_DATE = 4,
  CALCULATED_AGE_BELOW_THRESHOLD = 5,
  AGE_BRACKET_CHILD = 11,
  AGE_BRACKET_ADULT = 12,
  AGE_BRACKET_SENIOR = 13,
}

/**
 * Hash verification result codes
 */
export enum HashVerificationResultCode {
  FAILURE = 0,
  SUCCESS = 1,
}

/**
 * FHIR verification result codes
 */
export enum FhirVerificationResultCode {
  FAILURE = 0,
  SUCCESS = 1,
  TYPE_ERROR = 2,
  HASH_ERROR = 3,
  FIELDS_ERROR = 4,
}

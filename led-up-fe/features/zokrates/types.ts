/**
 * Types of zero-knowledge proof circuits available in the ZoKrates integration
 */
export enum CircuitType {
  AGE_VERIFIER = 'age_verifier',
  HASH_VERIFIER = 'hash_verifier',
  FHIR_VERIFIER = 'fhir_verifier',
}

/**
 * Result of a zero-knowledge proof verification
 */
export enum VerificationResult {
  UNKNOWN = 'unknown',
  SUCCESS = 'success',
  FAILURE = 'failure',
  ERROR = 'error',
}

/**
 * Status code for verification results
 */
export enum VerificationCode {
  UNKNOWN = 0,
  VERIFIED = 1,
  INVALID_PROOF = 2,
  INVALID_INPUT = 3,
  CIRCUIT_ERROR = 4,
  COMPUTATION_ERROR = 5,
}

/**
 * Zero-knowledge proof and verification metadata
 */
export interface ZkProof {
  proof: {
    a: [string, string];
    b: [[string, string], [string, string]];
    c: [string, string];
  };
  inputs: string[];
}

/**
 * Configuration for ZoKrates verification hook
 */
export interface ZoKratesVerificationConfig {
  circuitType: CircuitType;
}

/**
 * State for the ZoKrates verification hook
 */
export interface ZoKratesVerificationState {
  loading: boolean;
  error: string | null;
  result: string;
  resultCode: number;
  resultMessage: string;
  proof: any | null;
  publicSignals: string[] | null;
  circuitReady: boolean;
}

/**
 * Input types for different verifier circuits
 */

// Age verifier input
export interface AgeVerifierInput {
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  minAge: string;
  currentYear: string;
  currentMonth: string;
  currentDay: string;
}

// Hash verifier input
export interface HashVerifierInput {
  data: string[];
  expectedHash: [string, string]; // Low and high parts of the hash
}

// FHIR verifier input
export interface FhirVerifierInput {
  patientId: string;
  resourceType: string;
  dataField: string;
  dataValue: string;
  recordHash: [string, string]; // Low and high parts of the hash
}

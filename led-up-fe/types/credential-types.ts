/**
 * Types related to Verifiable Credentials.
 */

/**
 * Represents a proof object in a Verifiable Credential.
 */
export interface CredentialProof {
  type: string;
  created: string;
  proofPurpose: string;
  verificationMethod: string;
  jws: string;
  [key: string]: any;
}

/**
 * Represents a Verifiable Credential.
 */
export interface VerifiableCredential {
  '@context': string[];
  id: string;
  type: string[];
  issuer: string;
  issuanceDate: string;
  credentialSubject: {
    id: string;
    [key: string]: any;
  };
  proof: CredentialProof;
  [key: string]: any;
}

/**
 * Represents the purpose result in a verification result.
 */
export interface PurposeResult {
  valid: boolean;
  error?: string;
}

/**
 * Represents a single verification result.
 */
export interface VerificationResult {
  proof: CredentialProof;
  verified: boolean;
  purposeResult: PurposeResult;
  error?: string;
}

/**
 * Represents the complete verification result.
 */
export interface VerificationResults {
  verified: boolean;
  results: VerificationResult[];
  error?: string;
}

/**
 * Request to verify a Verifiable Credential.
 */
export interface VerifyCredentialRequest {
  credential: VerifiableCredential;
}

/**
 * Response from verifying a Verifiable Credential.
 */
export interface VerifyCredentialResponse {
  verified: boolean;
  results: VerificationResult[];
  error?: string;
}

/**
 * Request to issue a Verifiable Credential.
 */
export interface IssueCredentialRequest {
  issuer: string;
  subject: string;
  type: string[];
  claims: Record<string, any>;
  expirationDate?: string;
}

/**
 * Response from issuing a Verifiable Credential.
 */
export interface IssueCredentialResponse {
  credential: VerifiableCredential;
}

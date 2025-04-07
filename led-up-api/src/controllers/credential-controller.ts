/**
 * Controller for managing Verifiable Credentials.
 */
import { v4 as uuidv4 } from 'uuid';

import { DidResolver } from '../helpers/did-resolver';
import {
  VerifiableCredential,
  VerificationResults,
  IssueCredentialRequest,
  IssueCredentialResponse,
} from '../types/credential-types';

/**
 * Credential Controller class for managing Verifiable Credentials
 */
export class CredentialController {
  private readonly didResolver: DidResolver;
  private readonly credentials: Map<string, VerifiableCredential>;

  /**
   * Constructor
   */
  constructor() {
    this.didResolver = new DidResolver();
    this.credentials = new Map<string, VerifiableCredential>();
  }

  /**
   * Issue a new Verifiable Credential
   *
   * @param request - The issue credential request
   * @returns The issued credential response
   */
  public async issueCredential(request: IssueCredentialRequest): Promise<IssueCredentialResponse> {
    // Validate the request
    if (!request.issuer) {
      throw new Error('Issuer is required');
    }

    if (!request.subject) {
      throw new Error('Subject is required');
    }

    if (!request.type || !Array.isArray(request.type) || request.type.length === 0) {
      throw new Error('Type is required and must be an array');
    }

    if (!request.claims || Object.keys(request.claims).length === 0) {
      throw new Error('Claims are required');
    }

    // Create a new Verifiable Credential
    const issuanceDate = new Date().toISOString();
    const id = `urn:uuid:${uuidv4()}`;

    // Resolve the issuer DID to get the verification method
    const issuerDidResolution = await this.didResolver.resolve(request.issuer);
    if (issuerDidResolution.didResolutionMetadata.error) {
      throw new Error(`Failed to resolve issuer DID: ${issuerDidResolution.didResolutionMetadata.error}`);
    }

    // Get the first verification method from the issuer's DID document
    const verificationMethod = issuerDidResolution.didDocument.verificationMethod?.[0];
    if (!verificationMethod) {
      throw new Error('Issuer DID does not have any verification methods');
    }

    // Create the credential
    const credential: VerifiableCredential = {
      '@context': ['https://www.w3.org/2018/credentials/v1', 'https://www.w3.org/2018/credentials/examples/v1'],
      id,
      type: ['VerifiableCredential', ...request.type],
      issuer: request.issuer,
      issuanceDate,
      credentialSubject: {
        id: request.subject,
        ...request.claims,
      },
      proof: {
        type: 'EcdsaSecp256k1Signature2019',
        created: issuanceDate,
        proofPurpose: 'assertionMethod',
        verificationMethod: verificationMethod.id,
        jws: 'eyJhbGciOiJFUzI1NksiLCJiNjQiOmZhbHNlLCJjcml0IjpbImI2NCJdfQ..MEQCIB_h7G9QPPHyGHpkzz-VHUFq5xAYu-XHGLmXY9v1_4OEAiB0X-CrFhUWukvv8f-pY4F2AWALUYkObZ8Pvb0rKg3LYQ', // Simulated signature
      },
    };

    // Add expiration date if provided
    if (request.expirationDate) {
      credential.expirationDate = request.expirationDate;
    }

    // Store the credential
    this.credentials.set(credential.id, credential);

    // Return the credential
    return {
      credential,
    };
  }

  /**
   * Verify a Verifiable Credential
   *
   * @param credential - The credential to verify
   * @returns The verification results
   */
  public async verifyCredential(credential: VerifiableCredential): Promise<VerificationResults> {
    return this.didResolver.verifyCredential(credential);
  }

  /**
   * Get a Verifiable Credential by ID
   *
   * @param id - The credential ID
   * @returns The credential
   */
  public async getCredential(id: string): Promise<VerifiableCredential> {
    const credential = this.credentials.get(id);
    if (!credential) {
      throw new Error(`Credential not found: ${id}`);
    }
    return credential;
  }

  /**
   * Get all Verifiable Credentials
   *
   * @returns All credentials
   */
  public async getCredentials(): Promise<VerifiableCredential[]> {
    return Array.from(this.credentials.values());
  }

  /**
   * Revoke a Verifiable Credential
   *
   * @param id - The credential ID
   * @returns True if the credential was revoked
   */
  public async revokeCredential(id: string): Promise<boolean> {
    const credential = this.credentials.get(id);
    if (!credential) {
      throw new Error(`Credential not found: ${id}`);
    }

    // In a real implementation, we would update a revocation registry
    // For this example, we'll just remove the credential from our map
    this.credentials.delete(id);

    return true;
  }

  /**
   * Filter credentials based on query parameters
   *
   * @param query - The query parameters
   * @returns Filtered credentials
   */
  public filterCredentials(query: Record<string, any>): VerifiableCredential[] {
    const credentials = Array.from(this.credentials.values());

    if (!query || Object.keys(query).length === 0) {
      return credentials;
    }

    return credentials.filter((credential) => {
      for (const [key, value] of Object.entries(query)) {
        if (key === 'type' && Array.isArray(credential.type)) {
          if (!credential.type.includes(value)) {
            return false;
          }
        } else if (key === 'issuer') {
          if (credential.issuer !== value) {
            return false;
          }
        } else if (key === 'subject') {
          if (credential.credentialSubject.id !== value) {
            return false;
          }
        } else if (key.startsWith('claim.')) {
          const claimKey = key.substring(6);
          if (credential.credentialSubject[claimKey] !== value) {
            return false;
          }
        }
      }
      return true;
    });
  }
}

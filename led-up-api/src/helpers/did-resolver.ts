/**
 * DID resolver for resolving DIDs to DID documents.
 */
import { ethers } from 'ethers';

import { VerifiableCredential, VerificationResults } from '../types/credential-types';

/**
 * DID Document interface
 */
export interface DidDocument {
  '@context': string[];
  id: string;
  controller?: string[];
  verificationMethod?: VerificationMethod[];
  authentication?: (string | VerificationMethod)[];
  assertionMethod?: (string | VerificationMethod)[];
  keyAgreement?: (string | VerificationMethod)[];
  capabilityInvocation?: (string | VerificationMethod)[];
  capabilityDelegation?: (string | VerificationMethod)[];
  service?: ServiceEndpoint[];
}

/**
 * Verification Method interface
 */
export interface VerificationMethod {
  id: string;
  type: string;
  controller: string;
  publicKeyJwk?: {
    kty: string;
    crv: string;
    x: string;
    y?: string;
  };
  publicKeyMultibase?: string;
  blockchainAccountId?: string;
}

/**
 * Service Endpoint interface
 */
export interface ServiceEndpoint {
  id: string;
  type: string;
  serviceEndpoint: string | string[];
  description?: string;
}

/**
 * DID Resolution Result interface
 */
export interface DidResolutionResult {
  '@context': string;
  didDocument: DidDocument;
  didResolutionMetadata: {
    contentType: string;
    error?: string;
  };
  didDocumentMetadata: {
    created?: string;
    updated?: string;
    deactivated?: boolean;
    versionId?: string;
  };
}

/**
 * DID Resolver class
 */
export class DidResolver {
  private provider: ethers.JsonRpcProvider;

  /**
   * Constructor
   */
  constructor() {
    this.provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  }

  /**
   * Resolve a DID to a DID document
   *
   * @param did - The DID to resolve
   * @returns The DID resolution result
   */
  public async resolve(did: string): Promise<DidResolutionResult> {
    try {
      // Validate DID format
      if (!this.isValidDid(did)) {
        return this.createErrorResult(did, 'invalidDid');
      }

      // Extract the address from the DID
      const address = this.extractAddressFromDid(did);

      if (!address) {
        return this.createErrorResult(did, 'invalidDid');
      }

      // Create a DID document
      const didDocument = await this.createDidDocument(did, address);

      // Return the DID resolution result
      return {
        '@context': 'https://w3id.org/did-resolution/v1',
        didDocument,
        didResolutionMetadata: {
          contentType: 'application/did+ld+json',
        },
        didDocumentMetadata: {
          created: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error('Error resolving DID:', error);
      return this.createErrorResult(did, 'notFound');
    }
  }

  /**
   * Create a DID document
   *
   * @param did - The DID
   * @param address - The Ethereum address
   * @returns The DID document
   */
  private async createDidDocument(did: string, address: string): Promise<DidDocument> {
    // Create a basic DID document
    const didDocument: DidDocument = {
      '@context': [
        'https://www.w3.org/ns/did/v1',
        'https://w3id.org/security/suites/secp256k1-2019/v1',
      ],
      id: did,
      controller: [did],
      verificationMethod: [
        {
          id: `${did}#keys-1`,
          type: 'EcdsaSecp256k1VerificationKey2019',
          controller: did,
          blockchainAccountId: `eip155:1:${address}`,
        },
      ],
      authentication: [`${did}#keys-1`],
      assertionMethod: [`${did}#keys-1`],
    };

    return didDocument;
  }

  /**
   * Create an error result
   *
   * @param did - The DID
   * @param error - The error
   * @returns The DID resolution result with error
   */
  private createErrorResult(did: string, error: string): DidResolutionResult {
    return {
      '@context': 'https://w3id.org/did-resolution/v1',
      didDocument: {
        '@context': ['https://www.w3.org/ns/did/v1'],
        id: did,
      },
      didResolutionMetadata: {
        contentType: 'application/did+ld+json',
        error,
      },
      didDocumentMetadata: {},
    };
  }

  /**
   * Check if a DID is valid
   *
   * @param did - The DID to check
   * @returns True if the DID is valid, false otherwise
   */
  private isValidDid(did: string): boolean {
    // Check if the DID starts with 'did:ethr:'
    return did.startsWith('did:ethr:');
  }

  /**
   * Extract the address from a DID
   *
   * @param did - The DID
   * @returns The Ethereum address
   */
  private extractAddressFromDid(did: string): string | null {
    try {
      // Extract the address part from the DID
      const parts = did.split(':');
      if (parts.length !== 3) {
        return null;
      }

      const address = parts[2];

      // Validate the address
      if (!ethers.isAddress(address)) {
        return null;
      }

      return address;
    } catch (error) {
      console.error('Error extracting address from DID:', error);
      return null;
    }
  }

  /**
   * Create a DID from an Ethereum address
   *
   * @param address - The Ethereum address
   * @returns The DID
   */
  public createDid(address: string): string {
    // Validate the address
    if (!ethers.isAddress(address)) {
      throw new Error('Invalid Ethereum address');
    }

    // Create a DID
    return `did:ethr:${address}`;
  }

  /**
   * Update a DID document
   *
   * @param did - The DID
   * @param updates - The updates to apply
   * @returns The updated DID document
   */
  public async updateDidDocument(did: string, updates: Partial<DidDocument>): Promise<DidDocument> {
    try {
      // Resolve the DID
      const result = await this.resolve(did);

      // Check if the DID was resolved successfully
      if (result.didResolutionMetadata.error) {
        throw new Error(`Failed to resolve DID: ${result.didResolutionMetadata.error}`);
      }

      // Apply updates
      const updatedDocument = {
        ...result.didDocument,
        ...updates,
      };

      return updatedDocument;
    } catch (error) {
      console.error('Error updating DID document:', error);
      throw error;
    }
  }

  /**
   * Deactivate a DID
   *
   * @param did - The DID to deactivate
   * @returns The deactivated DID document
   */
  public async deactivateDid(did: string): Promise<DidResolutionResult> {
    try {
      // Resolve the DID
      const result = await this.resolve(did);

      // Check if the DID was resolved successfully
      if (result.didResolutionMetadata.error) {
        throw new Error(`Failed to resolve DID: ${result.didResolutionMetadata.error}`);
      }

      // Update the metadata to indicate deactivation
      result.didDocumentMetadata.deactivated = true;

      return result;
    } catch (error) {
      console.error('Error deactivating DID:', error);
      throw error;
    }
  }

  /**
   * Verify a Verifiable Credential
   *
   * @param credential - The Verifiable Credential to verify
   * @returns The verification results
   */
  public async verifyCredential(credential: VerifiableCredential): Promise<VerificationResults> {
    try {
      // Validate the credential
      if (!credential || !credential.proof) {
        throw new Error('Invalid credential: missing proof');
      }

      // Get the issuer's DID document
      const issuerDid =
        typeof credential.issuer === 'string'
          ? credential.issuer
          : (credential.issuer as { id: string }).id;

      const issuerDidResolution = await this.resolve(issuerDid);

      if (issuerDidResolution.didResolutionMetadata.error) {
        throw new Error(
          `Failed to resolve issuer DID: ${issuerDidResolution.didResolutionMetadata.error}`
        );
      }

      // Verify the signature using the issuer's public key
      const verificationMethodId = credential.proof.verificationMethod;
      const verificationMethod = issuerDidResolution.didDocument.verificationMethod?.find(
        vm => vm.id === verificationMethodId
      );

      if (!verificationMethod) {
        throw new Error(`Verification method not found: ${verificationMethodId}`);
      }

      // In a real implementation, we would verify the JWS signature here
      // For this example, we'll simulate a successful verification
      const verified = true;

      return {
        verified,
        results: [
          {
            proof: credential.proof,
            verified,
            purposeResult: {
              valid: true,
            },
          },
        ],
      };
    } catch (error: any) {
      console.error('Error verifying credential:', error);

      return {
        verified: false,
        results: [],
        error: error.message,
      };
    }
  }
}

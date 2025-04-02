/**
 * Service for resolving DIDs to DID documents using blockchain services.
 */
import { generateKeyPairSync } from 'node:crypto';

import { InvocationContext } from '@azure/functions';
import { ethers } from 'ethers';

import { VerifiableCredential, VerificationResults } from '../../types/credential-types';
import { DataRegistryService, DidRegistryService } from '../contracts';

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
 * Service class for resolving DIDs to DID documents using blockchain services.
 * This class provides methods for resolving, creating, updating, and deactivating DIDs.
 */
export class DidResolverService {
  private didRegistryService: DidRegistryService;
  private dataRegistryService?: DataRegistryService;
  private context?: InvocationContext;

  /**
   * Creates a new instance of the DidResolverService.
   * @param didRegistryService The DID Registry service to use for blockchain interactions.
   * @param dataRegistryService Optional Data Registry service for additional data lookups.
   * @param context Optional invocation context for logging.
   */
  constructor(
    didRegistryService: DidRegistryService,
    dataRegistryService?: DataRegistryService,
    context?: InvocationContext
  ) {
    this.didRegistryService = didRegistryService;
    this.dataRegistryService = dataRegistryService;
    this.context = context;
  }

  /**
   * Resolve a DID to a DID document
   *
   * @param did - The DID to resolve
   * @returns The DID resolution result
   */
  public async resolve(did: string): Promise<DidResolutionResult> {
    try {
      this.logInfo(`Resolving DID: ${did}`);

      // Validate DID format
      if (!this.isValidDid(did)) {
        this.logError(`Invalid DID format: ${did}`);
        return this.createErrorResult(did, 'invalidDid');
      }

      // Extract the address from the DID
      const address = this.extractAddressFromDid(did);

      if (!address) {
        this.logError(`Failed to extract address from DID: ${did}`);
        return this.createErrorResult(did, 'invalidDid');
      }

      // Check if the DID exists and is active
      const isActive = await this.didRegistryService.isDidActive(did);

      if (!isActive) {
        this.logError(`DID is not active or does not exist: ${did}`);
        return this.createErrorResult(did, 'deactivated');
      }

      // Get the DID document from the blockchain
      const documentString = await this.didRegistryService.getDidDocument(did);

      if (!documentString) {
        this.logError(`DID document not found for: ${did}`);
        return this.createErrorResult(did, 'notFound');
      }

      // Parse the DID document
      let didDocument: DidDocument;

      try {
        didDocument = JSON.parse(documentString);
      } catch (error) {
        this.logError(`Failed to parse DID document for ${did}: ${error}`);
        return this.createErrorResult(did, 'invalidDidDocument');
      }

      // Get the controller of the DID - this could be used to enhance the document if needed
      // const controller = await this.didRegistryService.getDidController(did);

      // Return the DID resolution result
      return {
        '@context': 'https://w3id.org/did-resolution/v1',
        didDocument,
        didResolutionMetadata: {
          contentType: 'application/did+ld+json',
        },
        didDocumentMetadata: {
          created: new Date().toISOString(),
          deactivated: !isActive,
        },
      };
    } catch (error) {
      this.logError(`Error resolving DID ${did}: ${error}`);
      return this.createErrorResult(did, 'notFound');
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
   * Create a DID document for a new DID
   *
   * @param did - The DID
   * @param address - The Ethereum address
   * @returns The DID document
   */
  public createDidDocument(did: string, address: string): DidDocument {
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
   * Update a DID document
   *
   * @param did - The DID
   * @param updates - The updates to apply
   * @returns The updated DID document
   */
  public async updateDidDocument(did: string, updates: Partial<DidDocument>): Promise<DidDocument> {
    try {
      this.logInfo(`Updating DID document for: ${did}`);

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

      // Convert the updated document to a string
      const documentString = JSON.stringify(updatedDocument);

      // Update the DID document on the blockchain
      await this.didRegistryService.updateDidDocument(did, documentString);

      return updatedDocument;
    } catch (error) {
      this.logError(`Error updating DID document for ${did}: ${error}`);
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
      this.logInfo(`Deactivating DID: ${did}`);

      // Resolve the DID
      const result = await this.resolve(did);

      // Check if the DID was resolved successfully
      if (result.didResolutionMetadata.error) {
        throw new Error(`Failed to resolve DID: ${result.didResolutionMetadata.error}`);
      }

      // Deactivate the DID on the blockchain
      await this.didRegistryService.deactivateDid(did);

      // Update the metadata to indicate deactivation
      result.didDocumentMetadata.deactivated = true;

      return result;
    } catch (error) {
      this.logError(`Error deactivating DID ${did}: ${error}`);
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
      this.logInfo(`Verifying credential: ${credential.id || 'unknown'}`);

      // Validate the credential
      if (!credential || !credential.proof) {
        throw new Error('Invalid credential: missing proof');
      }

      // Get the issuer's DID
      const issuerDid =
        typeof credential.issuer === 'string'
          ? credential.issuer
          : (credential.issuer as { id: string }).id;

      // Resolve the issuer's DID
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

      // Extract the address from the issuer's DID
      const issuerAddress = this.extractAddressFromDid(issuerDid);
      if (!issuerAddress) {
        throw new Error(`Failed to extract address from issuer DID: ${issuerDid}`);
      }

      // Verify the signature
      const credentialString = JSON.stringify({
        '@context': credential['@context'],
        type: credential.type,
        issuer: credential.issuer,
        issuanceDate: credential.issuanceDate,
        credentialSubject: credential.credentialSubject,
      });

      const verified = await this.didRegistryService.verifySignature(
        issuerAddress,
        credentialString,
        credential.proof.signature
      );

      return {
        verified,
        results: [
          {
            proof: credential.proof,
            verified,
            purposeResult: {
              valid: verified,
            },
          },
        ],
      };
    } catch (error: any) {
      this.logError(`Error verifying credential: ${error}`);

      return {
        verified: false,
        results: [],
        error: error.message,
      };
    }
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
      this.logError(`Error extracting address from DID: ${error}`);
      return null;
    }
  }

  /**
   * Generate a unique private and public key pair
   */

  public async getKeyPair(): Promise<string> {
    try {
      const { privateKey, publicKey } = await generateKeyPairSync('ec', {
        namedCurve: 'secp256k1',
      });

      console.log('privateKey:', privateKey);
      console.log('publicKey:', publicKey);
      const publicKeyDer = publicKey.export({ format: 'der', type: 'spki' });
      const publicKeyHex = '0x' + publicKeyDer.toString('hex').slice(-128);

      return publicKeyHex;
    } catch (error) {
      this.logError(`Error generating key pair: ${error}`);
      return null;
    }
  }

  /** function get public key from didRegistryService */
  public async getPublicKey(did: string): Promise<string> {
    const publicKey = await this.didRegistryService.getPublicKeyForDid(did);
    return publicKey;
  }

  /**
   * Log an informational message
   *
   * @param message - The message to log
   */
  private logInfo(message: string): void {
    if (this.context) {
      this.context.log(message);
    } else {
      console.log(message);
    }
  }

  /**
   * Log an error message
   *
   * @param message - The message to log
   */
  private logError(message: string): void {
    if (this.context) {
      this.context.error(message);
    } else {
      console.error(message);
    }
  }
}

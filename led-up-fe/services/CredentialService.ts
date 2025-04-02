import { ethers } from 'ethers';

import { DidIssuerService } from './DidIssuerService';
import { DidRegistryService } from './DidRegistryService';
import { DidVerifierService } from './DidVerifierService';

/**
 * Service for managing DID-based verifiable credentials.
 * This service provides methods for issuing, verifying, and revoking credentials.
 */
export class CredentialService {
  private didIssuerService: DidIssuerService;
  private didVerifierService: DidVerifierService;
  private didRegistryService: DidRegistryService;

  /**
   * Creates a new instance of the CredentialService.
   *
   * @param didIssuerService - The DID Issuer service instance
   * @param didVerifierService - The DID Verifier service instance
   * @param didRegistryService - The DID Registry service instance
   * @param context - The invocation context for logging
   */
  constructor(
    didIssuerService: DidIssuerService,
    didVerifierService: DidVerifierService,
    didRegistryService: DidRegistryService
  ) {
    this.didIssuerService = didIssuerService;
    this.didVerifierService = didVerifierService;
    this.didRegistryService = didRegistryService;
  }

  /**
   * Issues a verifiable credential.
   * @param issuerDid The DID of the issuer.
   * @param subjectDid The DID of the subject.
   * @param credentialData The data to include in the credential.
   * @param privateKey The private key of the issuer to sign the credential.
   * @returns A promise that resolves to the issued credential.
   */
  public async issueCredential(
    issuerDid: string,
    subjectDid: string,
    credentialData: any,
    privateKey: string
  ): Promise<any> {
    try {
      // Check if the issuer and subject DIDs are active
      const isIssuerActive = await this.didRegistryService.isDidActive(issuerDid);
      const isSubjectActive = await this.didRegistryService.isDidActive(subjectDid);

      if (!isIssuerActive) {
        throw new Error('Issuer DID is not active');
      }

      if (!isSubjectActive) {
        throw new Error('Subject DID is not active');
      }

      // Create the credential object
      const credential = {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        type: ['VerifiableCredential', credentialData.type],
        issuer: issuerDid,
        issuanceDate: new Date().toISOString(),
        credentialSubject: {
          id: subjectDid,
          ...credentialData.claims,
        },
      };

      // Convert the credential to a string for hashing
      const credentialString = JSON.stringify(credential);

      // Issue the credential on-chain
      // Use the credentialType from the credential data and generate a unique credentialId
      await this.didIssuerService.issueCredentialWithMetadata(
        issuerDid,
        subjectDid,
        credentialData.type,
        credentialString
      );

      // Sign the credential for off-chain verification
      const wallet = new ethers.Wallet(privateKey);
      const signature = await wallet.signMessage(ethers.toUtf8Bytes(credentialString));

      // Return the complete verifiable credential
      return {
        ...credential,
        proof: {
          type: 'EcdsaSecp256k1Signature2019',
          created: new Date().toISOString(),
          proofPurpose: 'assertionMethod',
          verificationMethod: `${issuerDid}#keys-1`,
          signature,
        },
      };
    } catch (error) {
      console.error(`Error issuing credential: ${error}`);
      throw error;
    }
  }

  /**
   * Verifies a credential.
   *
   * @param credential - The credential to verify
   * @returns True if the credential is valid, false otherwise
   */
  public async verifyCredential(credential: any): Promise<boolean> {
    console.log(`Verifying credential ${credential.id}`);

    try {
      // Extract relevant information
      const issuerDid = credential.issuer;
      const subjectDid = credential.credentialSubject.id;

      // Extract credential type from the credential
      const credentialType =
        credential.type && credential.type.length > 1
          ? credential.type[1] // Use the second type as the credential type (after VerifiableCredential)
          : 'DefaultCredential'; // Fallback if no specific type is provided

      // Check if the issuer is active
      const isIssuerActive = await this.didRegistryService.isDidActive(issuerDid);
      if (!isIssuerActive) {
        console.log(`Issuer DID ${issuerDid} is not active`);
        return false;
      }

      // Check if the subject is active
      const isSubjectActive = await this.didRegistryService.isDidActive(subjectDid);
      if (!isSubjectActive) {
        console.log(`Subject DID ${subjectDid} is not active`);
        return false;
      }

      // Verify the credential on-chain
      // The DidVerifier contract expects credentialType, issuer address, and subject DID
      return await this.didVerifierService.verifyCredential(credentialType, issuerDid, subjectDid);
    } catch (error) {
      console.error(`Credential verification error: ${error}`);
      return false;
    }
  }

  /**
   * Revokes a credential.
   * This is a placeholder method since the contract doesn't support revoking credentials directly.
   * @param _issuerDid The DID of the issuer (unused parameter).
   * @param _subjectDid The DID of the subject (unused parameter).
   * @param _credentialId The ID of the credential to revoke (unused parameter).
   * @returns A promise that resolves to a status message.
   */
  public async revokeCredential(_issuerDid: string, _subjectDid: string, _credentialId: string): Promise<any> {
    try {
      // This functionality is not supported by the contract
      console.log(`Credential revocation is not supported by the contract`);
      return {
        success: false,
        message: 'Credential revocation is not supported by the current contract implementation',
      };
    } catch (error) {
      console.error(`Error revoking credential: ${error}`);
      throw error;
    }
  }

  /**
   * Checks if a credential is valid.
   * @param issuerDid The DID of the issuer.
   * @param subjectDid The DID of the subject.
   * @param credentialId The ID of the credential.
   * @returns A promise that resolves to a boolean indicating if the credential is valid.
   */
  public async isCredentialValid(issuerDid: string, subjectDid: string, credentialId: string): Promise<boolean> {
    try {
      // For backward compatibility, if credentialId is a JSON string, treat it as metadata
      if (credentialId.startsWith('{') && credentialId.endsWith('}')) {
        return await this.didIssuerService.isCredentialValidWithMetadata(
          issuerDid,
          subjectDid,
          'VerifiableCredential',
          credentialId
        );
      }

      // Otherwise, use the credentialId directly
      return await this.didIssuerService.isCredentialValid(credentialId);
    } catch (error) {
      console.error(`Error checking credential validity: ${error}`);
      return false;
    }
  }

  /**
   * Gets the credentials issued by an issuer.
   * This is a placeholder method since the contract doesn't support this functionality directly.
   * @param _issuerDid The DID of the issuer (unused parameter).
   * @returns A promise that resolves to an array of credential IDs.
   */
  public async getIssuerCredentials(_issuerDid: string): Promise<string[]> {
    try {
      // This functionality is not supported by the contract
      console.log(`getIssuerCredentials is not supported by the contract`);
      return [];
    } catch (error) {
      console.error(`Error getting issuer credentials: ${error}`);
      return [];
    }
  }

  /**
   * Gets the credentials issued to a subject.
   * This is a placeholder method since the contract doesn't support this functionality directly.
   * @param _subjectDid The DID of the subject (unused parameter).
   * @returns A promise that resolves to an array of credential IDs.
   */
  public async getSubjectCredentials(_subjectDid: string): Promise<string[]> {
    try {
      // This functionality is not supported by the contract
      console.log(`getSubjectCredentials is not supported by the contract`);
      return [];
    } catch (error) {
      console.error(`Error getting subject credentials: ${error}`);
      return [];
    }
  }

  /**
   * Checks if an issuer is trusted for a specific credential type.
   *
   * @param credentialType - The type of credential
   * @param issuerDid - The DID of the issuer
   * @returns True if the issuer is trusted for the credential type, false otherwise
   */
  public async isIssuerTrusted(credentialType: string, issuerDid: string): Promise<boolean> {
    console.log(`Checking if issuer ${issuerDid} is trusted for credential type ${credentialType}`);

    try {
      return await this.didVerifierService.isIssuerTrusted(credentialType, issuerDid);
    } catch (error) {
      console.error(`Error checking issuer trust status: ${error}`);
      return false;
    }
  }

  /**
   * Sets the trust status of an issuer for a specific credential type.
   *
   * @param credentialType - The type of credential
   * @param issuerDid - The DID of the issuer
   * @param trusted - Boolean indicating if the issuer should be trusted
   * @returns The result of the operation
   */
  public async setIssuerTrustStatus(credentialType: string, issuerDid: string, trusted: boolean): Promise<any> {
    console.log(`Setting trust status for issuer ${issuerDid} to ${trusted} for credential type ${credentialType}`);

    try {
      return await this.didVerifierService.setIssuerTrustStatus(credentialType, issuerDid, trusted);
    } catch (error) {
      console.error(`Error setting issuer trust status: ${error}`);
      throw error;
    }
  }
}

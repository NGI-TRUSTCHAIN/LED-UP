/**
 * Controller for managing Verifiable Presentations.
 */
import { DidResolver } from '../helpers/did-resolver';
import { VerifiableCredential, VerificationResults } from '../types/credential-types';

/**
 * Interface for a Verifiable Presentation
 */
export interface VerifiablePresentation {
  '@context': string[];
  type: string[];
  id?: string;
  holder: string;
  verifiableCredential: VerifiableCredential[];
  proof: {
    type: string;
    created: string;
    verificationMethod: string;
    proofPurpose: string;
    challenge?: string;
    domain?: string;
    jws: string;
  };
}

/**
 * Interface for presentation verification results
 */
export interface PresentationVerificationResult {
  verified: boolean;
  presentationResult: {
    verified: boolean;
    error?: string;
  };
  credentialResults: VerificationResults[];
}

/**
 * Presentation Controller class for managing Verifiable Presentations
 */
export class PresentationController {
  private readonly didResolver: DidResolver;

  /**
   * Constructor
   */
  constructor() {
    this.didResolver = new DidResolver();
  }

  /**
   * Verify a Verifiable Presentation
   *
   * @param presentation - The presentation to verify
   * @param challenge - Optional challenge to verify
   * @param domain - Optional domain to verify
   * @returns The verification result
   */
  public async verifyPresentation(
    presentation: VerifiablePresentation,
    challenge?: string,
    domain?: string
  ): Promise<PresentationVerificationResult> {
    // Validate the presentation
    if (
      !presentation['@context'] ||
      !presentation.type ||
      !presentation.holder ||
      !presentation.verifiableCredential ||
      !presentation.proof
    ) {
      throw new Error('Invalid presentation format');
    }

    // Check challenge and domain if provided
    if (challenge && challenge !== presentation.proof.challenge) {
      throw new Error('Challenge mismatch');
    }

    if (domain && domain !== presentation.proof.domain) {
      throw new Error('Domain mismatch');
    }

    // Verify the presentation signature
    // In a real implementation, we would verify the JWS signature here
    // For this example, we'll simulate a successful verification
    const presentationVerified = true;

    // Verify each credential in the presentation
    const credentialResults: VerificationResults[] = [];
    for (const credential of presentation.verifiableCredential) {
      const verificationResult = await this.didResolver.verifyCredential(credential);
      credentialResults.push(verificationResult);
    }

    // Check if all credentials are verified
    const allCredentialsVerified = credentialResults.every((result) => result.verified);

    // Return the verification result
    return {
      verified: presentationVerified && allCredentialsVerified,
      presentationResult: {
        verified: presentationVerified,
      },
      credentialResults,
    };
  }

  /**
   * Create a Verifiable Presentation
   *
   * @param holderDid - The DID of the holder
   * @param credentials - The credentials to include in the presentation
   * @param challenge - Optional challenge for the presentation
   * @param domain - Optional domain for the presentation
   * @returns The created presentation
   */
  public async createPresentation(
    holderDid: string,
    credentials: VerifiableCredential[],
    challenge?: string,
    domain?: string
  ): Promise<VerifiablePresentation> {
    // Validate the holder DID
    const holderDidResolution = await this.didResolver.resolve(holderDid);
    if (holderDidResolution.didResolutionMetadata.error) {
      throw new Error(`Failed to resolve holder DID: ${holderDidResolution.didResolutionMetadata.error}`);
    }

    // Get the first verification method from the holder's DID document
    const verificationMethod = holderDidResolution.didDocument.verificationMethod?.[0];
    if (!verificationMethod) {
      throw new Error('Holder DID does not have any verification methods');
    }

    // Create the presentation
    const created = new Date().toISOString();
    const presentation: VerifiablePresentation = {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiablePresentation'],
      holder: holderDid,
      verifiableCredential: credentials,
      proof: {
        type: 'EcdsaSecp256k1Signature2019',
        created,
        verificationMethod: verificationMethod.id,
        proofPurpose: 'authentication',
        jws: 'eyJhbGciOiJFUzI1NksiLCJiNjQiOmZhbHNlLCJjcml0IjpbImI2NCJdfQ..MEYCIQD8wQeB8KcXMzSqnQGdM7VXN5RAtrTiEO9g5yUUQl1ZvwIhALlK7jXVS2entVXd1KsZOZ5tUAPuF0jGCuRSQRiJJvT0', // Simulated signature
      },
    };

    // Add challenge and domain if provided
    if (challenge) {
      presentation.proof.challenge = challenge;
    }

    if (domain) {
      presentation.proof.domain = domain;
    }

    return presentation;
  }
}

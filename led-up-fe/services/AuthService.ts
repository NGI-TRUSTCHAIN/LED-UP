import { ethers } from 'ethers';
import { DidAuthService } from './DidAuthService';
import { DidRegistryService } from './DidRegistryService';
import { DidVerifierService } from './DidVerifierService';
import { AuthError, UserRole, AuthResponse, TokenPayload } from '../types/auth-types';
import { generateChallenge, verifyChallenge, getChallenge } from '../utils/challenge-store';
import { generateTokens, verifyAccessToken, verifyRefreshToken } from '../utils/jwt';

/**
 * Service for handling DID-based authentication operations.
 * This service integrates with the blockchain-based DID system for secure authentication.
 */
export class AuthService {
  private didAuthService: DidAuthService;
  private didRegistryService: DidRegistryService;
  private didVerifierService: DidVerifierService;

  /**
   * Creates a new instance of the AuthService.
   *
   * @param didAuthService - The DID Auth service instance
   * @param didRegistryService - The DID Registry service instance
   * @param didVerifierService - The DID Verifier service instance
   * @param context - The invocation context for logging
   */
  constructor(
    didAuthService: DidAuthService,
    didRegistryService: DidRegistryService,
    didVerifierService: DidVerifierService
  ) {
    this.didAuthService = didAuthService;
    this.didRegistryService = didRegistryService;
    this.didVerifierService = didVerifierService;
  }

  /**
   * Generates a challenge for authentication.
   *
   * @param address - The Ethereum address to generate a challenge for
   * @returns The generated challenge and its expiration timestamp
   */
  public generateAuthChallenge(address: string): { challenge: string; expiresAt: number } {
    // Normalize the address to lowercase for consistency

    return generateChallenge(address.toLowerCase());
  }

  /**
   * Authenticates a user using their Ethereum address and signature.
   *
   * @param address - The user's Ethereum address
   * @param signature - The signature of the challenge
   * @returns Authentication response with tokens and user information
   * @throws Error if authentication fails
   */
  public async authenticate(address: string, signature: string): Promise<AuthResponse> {
    // Normalize the address to lowercase for consistency
    const normalizedAddress = address.toLowerCase();

    // Get the challenge for this address
    const challengeData = getChallenge(normalizedAddress);

    if (!challengeData) {
      throw new Error(AuthError.INVALID_CHALLENGE);
    }

    // Verify the challenge signature
    const isSignatureValid = await this.verifySignature(normalizedAddress, signature, challengeData.challenge);

    if (!isSignatureValid) {
      throw new Error(AuthError.INVALID_SIGNATURE);
    }

    // Verify the challenge
    if (!verifyChallenge(normalizedAddress, challengeData.challenge)) {
      throw new Error(AuthError.INVALID_CHALLENGE);
    }

    // Get the DID for this address
    let did: string | null = null;
    let role: UserRole = UserRole.CONSUMER; // Default role

    try {
      // Check if the address has a registered DID
      const didDocument = await this.didRegistryService.getDidForAddress(normalizedAddress);

      if (didDocument && didDocument.did) {
        did = didDocument.did;

        // Check if the DID is active
        const isActive = await this.didRegistryService.isDidActive(did as string);
        if (!isActive) {
          console.log(`DID is deactivated for address: ${normalizedAddress}`);
          throw new Error(AuthError.DEACTIVATED_USER);
        }

        // Determine the user's role based on credentials or other factors
        role = await this.determineUserRole(did as string);
      }
    } catch (error) {
      console.log(`Could not retrieve DID for address: ${normalizedAddress}. Using default role.`);
      // Continue with authentication even if DID retrieval fails
    }

    // Generate tokens
    const tokens = generateTokens(normalizedAddress, role, did as string);

    return {
      ...tokens,
      user: {
        address: normalizedAddress,
        role,
        did: did as string, // Always include did property, even if null
      },
    };
  }

  /**
   * Verifies a signature against a message.
   *
   * @param address - The Ethereum address that supposedly signed the message
   * @param signature - The signature to verify
   * @param message - The message that was signed
   * @returns True if the signature is valid, false otherwise
   */
  private async verifySignature(address: string, signature: string, message: string): Promise<boolean> {
    try {
      // Normalize the address to lowercase for consistency
      const normalizedAddress = address.toLowerCase();

      // First try to verify using the DID Verifier contract
      if (this.didVerifierService) {
        try {
          // If we have a DID for this address, use the DID Verifier
          const didDocument = await this.didRegistryService.getDidForAddress(normalizedAddress);

          if (didDocument && didDocument.did) {
            return await this.didRegistryService.verifySignature(normalizedAddress, message, signature);
          }
        } catch (error) {
          console.log(`DID verification failed, falling back to local verification: ${error}`);
        }
      }

      // Fallback to local verification using ethers
      const recoveredAddress = ethers.verifyMessage(message, signature);
      return recoveredAddress.toLowerCase() === normalizedAddress;
    } catch (error) {
      console.log(`Signature verification error: ${error}`);
      return false;
    }
  }

  /**
   * Determines the user's role based on their DID and credentials.
   *
   * @param did - The user's DID
   * @returns The user's role based on their credentials
   */
  private async determineUserRole(did: string): Promise<UserRole> {
    try {
      // Check if the user has the PRODUCER role
      if (await this.didAuthService.authenticate(did, this.didAuthService.PRODUCER_ROLE)) {
        return UserRole.PRODUCER;
      }

      // Check if the user has the CONSUMER role
      if (await this.didAuthService.authenticate(did, this.didAuthService.CONSUMER_ROLE)) {
        return UserRole.CONSUMER;
      }

      // Check if the user has the SERVICE_PROVIDER role
      if (await this.didAuthService.authenticate(did, this.didAuthService.SERVICE_PROVIDER_ROLE)) {
        return UserRole.SERVICE_PROVIDER;
      }

      // Default to CONSUMER role if no specific role is found
      return UserRole.CONSUMER;
    } catch (error) {
      console.log(`Error determining user role: ${error}`);
      return UserRole.CONSUMER; // Default to CONSUMER role on error
    }
  }

  /**
   * Verifies an access token.
   *
   * @param token - The access token to verify
   * @returns The token payload if valid, null otherwise
   */
  public verifyToken(token: string): TokenPayload | null {
    return verifyAccessToken(token);
  }

  /**
   * Refreshes an access token using a refresh token.
   *
   * @param refreshToken - The refresh token
   * @returns New authentication tokens if the refresh token is valid
   * @throws Error if the refresh token is invalid
   */
  public async refreshToken(
    refreshToken: string
  ): Promise<Omit<AuthResponse, 'user'> & { user?: AuthResponse['user'] }> {
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      throw new Error(AuthError.INVALID_REFRESH_TOKEN);
    }

    const address = payload.sub;
    // Normalize the address to lowercase for consistency
    const normalizedAddress = address.toLowerCase();

    let did: string | undefined;
    let role: UserRole = UserRole.CONSUMER;

    try {
      // Try to get the DID and role
      const didDocument = await this.didRegistryService.getDidForAddress(normalizedAddress);
      if (didDocument && didDocument.did) {
        did = didDocument.did;

        // Check if the DID is active
        const isActive = await this.didRegistryService.isDidActive(did as string);
        if (!isActive) {
          throw new Error(AuthError.DEACTIVATED_USER);
        }

        // Determine the user's role
        role = await this.determineUserRole(did as string);
      }
    } catch (error) {
      console.log(`Error retrieving DID during token refresh: ${error}`);
      // Continue with token refresh even if DID retrieval fails
    }

    // Generate new tokens
    const tokens = generateTokens(normalizedAddress, role, did);

    // Include user info if available
    const response: Omit<AuthResponse, 'user'> & { user?: AuthResponse['user'] } = tokens;

    if (did) {
      response.user = {
        address: normalizedAddress,
        role,
        did,
      };
    }

    return response;
  }

  /**
   * Checks if a DID is active.
   *
   * @param did - The DID to check
   * @returns True if the DID is active, false otherwise
   */
  public async isDidActive(did: string): Promise<boolean> {
    return this.didRegistryService.isDidActive(did);
  }

  /**
   * Gets the DID for an Ethereum address.
   *
   * @param address - The Ethereum address
   * @returns The DID document if found
   */
  public async getDidForAddress(address: string): Promise<any> {
    // Normalize the address to lowercase for consistency
    const normalizedAddress = address.toLowerCase();
    return this.didRegistryService.getDidForAddress(normalizedAddress);
  }
}

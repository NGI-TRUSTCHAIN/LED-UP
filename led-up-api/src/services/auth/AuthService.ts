import { InvocationContext, HttpRequest, HttpResponseInit } from '@azure/functions';
import { ethers } from 'ethers';

import { AuthError, UserRole, AuthResponse, TokenPayload } from '../../types/auth-types';
import { generateChallenge, verifyChallenge, getChallenge } from '../../utils/challenge-store';
import { DidAuthService, DidRegistryService, DidVerifierService } from '../contracts';
import { JWTService } from './JWTService';

/**
 * Service for handling DID-based authentication operations.
 * This service integrates with the blockchain-based DID system for secure authentication.
 */
export class AuthService {
  private didAuthService: DidAuthService;
  private didRegistryService: DidRegistryService;
  private didVerifierService: DidVerifierService;
  private jwtService: JWTService;
  private context: InvocationContext;

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
    didVerifierService: DidVerifierService,
    context: InvocationContext
  ) {
    this.didAuthService = didAuthService;
    this.didRegistryService = didRegistryService;
    this.didVerifierService = didVerifierService;
    this.context = context;

    // Initialize JWT service
    this.jwtService = new JWTService(context);
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
      this.context.log(`No valid challenge found for address: ${normalizedAddress}`);
      throw new Error(AuthError.INVALID_CHALLENGE);
    }

    // Verify the challenge signature
    const isSignatureValid = await this.verifySignature(
      normalizedAddress,
      signature,
      challengeData.challenge
    );

    if (!isSignatureValid) {
      this.context.log(`Invalid signature for address: ${normalizedAddress}`);
      throw new Error(AuthError.INVALID_SIGNATURE);
    }

    // Verify the challenge
    if (!verifyChallenge(normalizedAddress, challengeData.challenge)) {
      this.context.log(`Challenge verification failed for address: ${normalizedAddress}`);
      throw new Error(AuthError.INVALID_CHALLENGE);
    }

    // Get the DID for this address
    let did: string | null = null;
    let role: UserRole = UserRole.CONSUMER; // Default role

    try {
      // Check if the address has a registered DID
      const didDocument = await this.didRegistryService.getDidForAddress(normalizedAddress);

      if (didDocument) {
        did = didDocument.did;

        // Check if the DID is active
        const isActive = await this.didRegistryService.isDidActive(did);
        if (!isActive) {
          this.context.log(`DID is deactivated for address: ${normalizedAddress}`);
          throw new Error(AuthError.DEACTIVATED_USER);
        }

        // Determine the user's role based on credentials or other factors
        role = await this.determineUserRole(did);
      }
    } catch (error) {
      this.context.log(
        `Could not retrieve DID for address: ${normalizedAddress}. Using default role.`
      );
      // Continue with authentication even if DID retrieval fails
    }

    // Generate tokens using the JWT service
    const tokens = this.jwtService.generateTokens(normalizedAddress, role, did);

    return {
      ...tokens,
      user: {
        address: normalizedAddress,
        role,
        did, // Always include did property, even if null
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
  private async verifySignature(
    address: string,
    signature: string,
    message: string
  ): Promise<boolean> {
    try {
      // Normalize the address to lowercase for consistency
      const normalizedAddress = address.toLowerCase();

      // First try to verify using the DID Verifier contract
      if (this.didVerifierService) {
        try {
          // If we have a DID for this address, use the DID Verifier
          const didDocument = await this.didRegistryService.getDidForAddress(normalizedAddress);

          if (didDocument && didDocument.did) {
            return await this.didRegistryService.verifySignature(
              normalizedAddress,
              message,
              signature
            );
          }
        } catch (error) {
          this.context.log(`DID verification failed, falling back to local verification: ${error}`);
        }
      }

      // Fallback to local verification using ethers
      const recoveredAddress = ethers.verifyMessage(message, signature);
      return recoveredAddress.toLowerCase() === normalizedAddress;
    } catch (error) {
      this.context.log(`Signature verification error: ${error}`);
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
      if (await this.didAuthService.authenticate(did, this.didAuthService.PROVIDER_ROLE)) {
        return UserRole.PROVIDER;
      }

      // Default to CONSUMER role if no specific role is found
      return UserRole.CONSUMER;
    } catch (error) {
      this.context.log(`Error determining user role: ${error}`);
      return UserRole.CONSUMER;
    }
  }

  /**
   * Verifies an access token.
   *
   * @param token - The access token to verify
   * @returns The token payload if valid, null otherwise
   */
  public verifyToken(token: string): TokenPayload | null {
    return this.jwtService.verifyAccessToken(token);
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
    const payload = this.jwtService.verifyRefreshToken(refreshToken);
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
      if (didDocument) {
        did = didDocument.did;

        // Check if the DID is active
        const isActive = await this.didRegistryService.isDidActive(did);
        if (!isActive) {
          throw new Error(AuthError.DEACTIVATED_USER);
        }

        // Determine the user's role
        role = await this.determineUserRole(did);
      }
    } catch (error) {
      this.context.log(`Error retrieving DID during token refresh: ${error}`);
      // Continue with token refresh even if DID retrieval fails
    }

    // Generate new tokens using JWT service
    const tokens = this.jwtService.generateTokens(normalizedAddress, role, did);

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

  /**
   * Logs out a user by invalidating their access token.
   *
   * @param address - The user's address
   * @param token - The access token to invalidate
   * @returns True if logout was successful
   * @throws Error if token is invalid or doesn't match the address
   */
  public async logout(address: string, token: string): Promise<boolean> {
    // Normalize the address to lowercase for consistency
    const normalizedAddress = address.toLowerCase();

    this.context.log(`Logging out address: ${normalizedAddress}`);

    try {
      // Use the JWT service to invalidate the token
      return await this.jwtService.invalidateToken(token, normalizedAddress);
    } catch (error) {
      this.context.error(`Logout failed: ${error}`);
      throw error;
    }
  }

  /**
   * Middleware function to authenticate requests.
   *
   * @param request - The HTTP request
   * @param requiredRoles - Optional array of roles required to access the endpoint
   * @returns An error response if authentication fails, null otherwise
   */
  public authenticateRequest(
    request: HttpRequest,
    requiredRoles?: UserRole[]
  ): HttpResponseInit | null {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');

    // Check if the authorization header exists
    if (!authHeader) {
      return {
        status: 401,
        jsonBody: {
          error: 'Unauthorized',
          message: 'Missing authorization header',
        },
      };
    }

    // Check if the authorization header is in the correct format
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return {
        status: 401,
        jsonBody: {
          error: 'Unauthorized',
          message: 'Invalid authorization header format',
        },
      };
    }

    // Get the token
    const token = parts[1];

    // Verify the token
    const payload = this.verifyToken(token);
    if (!payload) {
      return {
        status: 401,
        jsonBody: {
          error: 'Unauthorized',
          message: 'Invalid or expired token',
        },
      };
    }

    // Check if the user has the required role
    if (requiredRoles && requiredRoles.length > 0) {
      if (!requiredRoles.includes(payload.role)) {
        return {
          status: 403,
          jsonBody: {
            error: 'Forbidden',
            message: 'Insufficient permissions',
          },
        };
      }
    }

    // Authentication successful
    return null;
  }

  /**
   * Get the authenticated user from the request.
   *
   * @param request - The HTTP request
   * @returns The user if authenticated, null otherwise
   */
  public getUserFromRequest(
    request: HttpRequest
  ): { address: string; role: UserRole; did: string } | null {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');

    // Check if the authorization header exists
    if (!authHeader) {
      return null;
    }

    // Check if the authorization header is in the correct format
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    // Get the token
    const token = parts[1];

    // Verify the token
    const payload = this.verifyToken(token);
    if (!payload) {
      return null;
    }

    // Return the user
    return {
      address: payload.sub,
      role: payload.role,
      did: payload.did,
    };
  }
}

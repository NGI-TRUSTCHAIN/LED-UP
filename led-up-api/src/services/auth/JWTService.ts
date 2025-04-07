import { randomBytes } from 'crypto';

import { InvocationContext } from '@azure/functions';
import * as jwt from 'jsonwebtoken';

import { TokenPayload, RefreshTokenPayload, UserRole, AuthError } from '../../types/auth-types';

/**
 * Service for handling JWT token operations.
 * This service provides methods for generating and verifying JWT tokens.
 */
export class JWTService {
  private accessTokenSecret: string;
  private refreshTokenSecret: string;
  private accessTokenExpiry: string;
  private refreshTokenExpiry: string;
  private context: InvocationContext;

  // Token blacklist storage (in-memory)
  private static blacklistedTokens = new Set<string>();
  private static tokenExpiries = new Map<string, number>();

  /**
   * Creates a new instance of the JWTService.
   *
   * @param context - The invocation context for logging
   * @param accessTokenSecret - Secret for signing access tokens (defaults to env var or fallback)
   * @param refreshTokenSecret - Secret for signing refresh tokens (defaults to env var or fallback)
   * @param accessTokenExpiry - Expiry time for access tokens (defaults to 1h)
   * @param refreshTokenExpiry - Expiry time for refresh tokens (defaults to 7d)
   */
  constructor(
    context: InvocationContext,
    accessTokenSecret?: string,
    refreshTokenSecret?: string,
    accessTokenExpiry?: string,
    refreshTokenExpiry?: string
  ) {
    this.context = context;
    this.accessTokenSecret = accessTokenSecret || process.env.JWT_SECRET || 'your-secret-key';
    this.refreshTokenSecret =
      refreshTokenSecret || process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
    this.accessTokenExpiry = accessTokenExpiry || '1h';
    this.refreshTokenExpiry = refreshTokenExpiry || '7d';

    // Log warning if using default secrets in production
    if (
      process.env.NODE_ENV === 'production' &&
      (this.accessTokenSecret === 'your-secret-key' ||
        this.refreshTokenSecret === 'your-refresh-secret-key')
    ) {
      this.context.log('WARNING: Using default JWT secrets in production environment');
    }
  }

  /**
   * Generates an access token for a user.
   *
   * @param address - The user's Ethereum address
   * @param role - The user's role
   * @param did - The user's DID (optional)
   * @returns The generated JWT token
   */
  public generateAccessToken(address: string, role: UserRole, did?: string): string {
    const payload: Omit<TokenPayload, 'iat' | 'exp'> = {
      sub: address,
      role,
      ...(did && { did }),
    };

    // Convert string expiry to number of seconds if it's in format like '1h'
    const expiresIn = this.parseExpiryToSeconds(this.accessTokenExpiry);
    return jwt.sign(payload, this.accessTokenSecret, { expiresIn });
  }

  /**
   * Generates a refresh token for a user.
   *
   * @param address - The user's Ethereum address
   * @returns The generated refresh token
   */
  public generateRefreshToken(address: string): string {
    const tokenId = randomBytes(16).toString('hex');

    const payload: Omit<RefreshTokenPayload, 'iat' | 'exp'> = {
      sub: address,
      jti: tokenId,
    };

    // Convert string expiry to number of seconds if it's in format like '7d'
    const expiresIn = this.parseExpiryToSeconds(this.refreshTokenExpiry);
    return jwt.sign(payload, this.refreshTokenSecret, { expiresIn });
  }

  /**
   * Parses expiry string to seconds
   *
   * @param expiry - Expiry string (e.g., '1h', '7d')
   * @returns Number of seconds
   */
  private parseExpiryToSeconds(expiry: string): number {
    const unit = expiry.slice(-1);
    const value = parseInt(expiry.slice(0, -1), 10);

    switch (unit) {
      case 'h': // hours
        return value * 60 * 60;
      case 'd': // days
        return value * 24 * 60 * 60;
      case 'm': // minutes
        return value * 60;
      case 's': // seconds
        return value;
      default:
        return 3600; // default to 1 hour
    }
  }

  /**
   * Verifies an access token.
   *
   * @param token - The JWT token to verify
   * @returns The decoded token payload if valid, null otherwise
   */
  public verifyAccessToken(token: string): TokenPayload | null {
    try {
      // Check if the token is blacklisted
      if (this.isTokenBlacklisted(token)) {
        this.context.log('Token is blacklisted');
        return null;
      }

      return jwt.verify(token, this.accessTokenSecret) as TokenPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        this.context.log('Token expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        this.context.log('Invalid token');
      } else {
        this.context.log(`Token verification error: ${error}`);
      }
      return null;
    }
  }

  /**
   * Check if a token is blacklisted.
   *
   * @param token - The token to check
   * @returns true if the token is blacklisted, false otherwise
   */
  private isTokenBlacklisted(token: string): boolean {
    return JWTService.blacklistedTokens.has(token);
  }

  /**
   * Add a token to the blacklist
   *
   * @param token - The JWT token to blacklist
   * @param expiryInSeconds - Optional expiry time in seconds (defaults to 24 hours)
   */
  private addToBlacklist(token: string, expiryInSeconds: number = 24 * 60 * 60): void {
    JWTService.blacklistedTokens.add(token);

    // Set expiry time
    const expiryTime = Date.now() + expiryInSeconds * 1000;
    JWTService.tokenExpiries.set(token, expiryTime);

    // Trigger cleanup of expired tokens
    this.cleanupBlacklist();
  }

  /**
   * Remove expired tokens from the blacklist
   * This helps prevent the blacklist from growing indefinitely
   */
  private cleanupBlacklist(): void {
    const now = Date.now();

    for (const [token, expiry] of JWTService.tokenExpiries.entries()) {
      if (expiry <= now) {
        JWTService.blacklistedTokens.delete(token);
        JWTService.tokenExpiries.delete(token);
      }
    }
  }

  /**
   * Invalidates a token by adding it to the blacklist.
   *
   * @param token - The token to invalidate
   * @param address - The associated address (for validation)
   * @returns true if the token was invalidated successfully
   * @throws Error if the token is invalid or doesn't match the address
   */
  public async invalidateToken(token: string, address: string): Promise<boolean> {
    // Normalize the address to lowercase for consistency
    const normalizedAddress = address.toLowerCase();

    this.context.log(`Invalidating token for address: ${normalizedAddress}`);

    // Verify the token
    const payload = this.verifyAccessToken(token);

    if (!payload) {
      this.context.log(`Invalid token for address: ${normalizedAddress}`);
      throw new Error(AuthError.INVALID_TOKEN);
    }

    // Verify that the token belongs to the requesting address
    if (payload.sub.toLowerCase() !== normalizedAddress) {
      this.context.log(`Token subject doesn't match address: ${normalizedAddress}`);
      throw new Error(AuthError.UNAUTHORIZED);
    }

    try {
      // Get the expiry time from the token if possible
      let expiryInSeconds: number | undefined;
      try {
        const decodedToken = jwt.decode(token) as any;
        if (decodedToken && decodedToken.exp) {
          // Calculate remaining time in seconds
          expiryInSeconds = Math.max(0, decodedToken.exp - Math.floor(Date.now() / 1000));
        }
      } catch (error) {
        // Use default expiry
      }

      // Add the token to the blacklist
      this.addToBlacklist(token, expiryInSeconds);

      this.context.log(`Successfully invalidated token for address: ${normalizedAddress}`);

      return true;
    } catch (error) {
      this.context.error(`Error adding token to blacklist: ${error}`);
      throw new Error(
        `Token invalidation failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Verifies a refresh token.
   *
   * @param token - The refresh token to verify
   * @returns The decoded refresh token payload if valid, null otherwise
   */
  public verifyRefreshToken(token: string): RefreshTokenPayload | null {
    try {
      // Check if the token is blacklisted
      if (this.isTokenBlacklisted(token)) {
        this.context.log('Refresh token is blacklisted');
        return null;
      }

      return jwt.verify(token, this.refreshTokenSecret) as RefreshTokenPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        this.context.log('Refresh token expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        this.context.log('Invalid refresh token');
      } else {
        this.context.log(`Refresh token verification error: ${error}`);
      }
      return null;
    }
  }

  /**
   * Generates both access and refresh tokens for a user.
   *
   * @param address - The user's Ethereum address
   * @param role - The user's role
   * @param did - The user's DID (optional)
   * @returns Object containing both tokens and expiry information
   */
  public generateTokens(
    address: string,
    role: UserRole,
    did?: string
  ): {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  } {
    const accessToken = this.generateAccessToken(address, role, did);
    const refreshToken = this.generateRefreshToken(address);

    // Calculate expiry in seconds (for client-side handling)
    // This assumes the access token expiry is in hours format like '1h'
    const expiresInHours = parseInt(this.accessTokenExpiry.replace(/[^0-9]/g, ''), 10) || 1;
    const expiresIn = expiresInHours * 60 * 60;

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  /**
   * Extracts the token from the authorization header.
   *
   * @param authHeader - The authorization header value
   * @returns The extracted token or null if not found
   */
  public extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1];
  }

  /**
   * Validates a token from the authorization header.
   *
   * @param authHeader - The authorization header value
   * @returns The token payload if valid
   * @throws Error if the token is missing or invalid
   */
  public validateTokenFromHeader(authHeader?: string): TokenPayload {
    const token = this.extractTokenFromHeader(authHeader);

    if (!token) {
      throw new Error(AuthError.MISSING_TOKEN);
    }

    const payload = this.verifyAccessToken(token);

    if (!payload) {
      throw new Error(AuthError.INVALID_TOKEN);
    }

    return payload;
  }
}

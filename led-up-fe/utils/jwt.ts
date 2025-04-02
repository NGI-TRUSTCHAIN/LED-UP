/**
 * JWT utility functions for authentication.
 */
import { randomBytes } from 'crypto';

import * as jwt from 'jsonwebtoken';

import { TokenPayload, RefreshTokenPayload, UserRole } from '../types/auth-types';

// JWT secret key - should be stored in environment variables in production
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';

// Token expiration times
const ACCESS_TOKEN_EXPIRY = '1h'; // 1 hour
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 days

/**
 * Generate an access token for a user
 *
 * @param address - The user's Ethereum address
 * @param role - The user's role
 * @param did - The user's DID (optional)
 * @returns The generated JWT token
 */
export function generateAccessToken(address: string, role: UserRole, did?: string): string {
  const payload: Omit<TokenPayload, 'iat' | 'exp'> = {
    sub: address,
    role,
    ...(did && { did }),
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

/**
 * Generate a refresh token for a user
 *
 * @param address - The user's Ethereum address
 * @returns The generated refresh token
 */
export function generateRefreshToken(address: string): string {
  const tokenId = randomBytes(16).toString('hex');

  const payload: Omit<RefreshTokenPayload, 'iat' | 'exp'> = {
    sub: address,
    jti: tokenId,
  };

  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
}

/**
 * Verify an access token
 *
 * @param token - The JWT token to verify
 * @returns The decoded token payload if valid, null otherwise
 */
export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Verify a refresh token
 *
 * @param token - The refresh token to verify
 * @returns The decoded refresh token payload if valid, null otherwise
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as RefreshTokenPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Generate both access and refresh tokens for a user
 *
 * @param address - The user's Ethereum address
 * @param role - The user's role
 * @param did - The user's DID (optional)
 * @returns Object containing both tokens and expiry information
 */
export function generateTokens(
  address: string,
  role: UserRole,
  did?: string
): {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
} {
  const accessToken = generateAccessToken(address, role, did);
  const refreshToken = generateRefreshToken(address);

  // Calculate expiry in seconds (for client-side handling)
  const expiresIn = 60 * 60; // 1 hour in seconds

  return {
    accessToken,
    refreshToken,
    expiresIn,
  };
}

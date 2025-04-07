/**
 * This file contains TypeScript type definitions for authentication-related types.
 */

/**
 * Authentication error types
 */
export enum AuthError {
  INVALID_CREDENTIALS = 'Auth__InvalidCredentials',
  INVALID_TOKEN = 'Auth__InvalidToken',
  EXPIRED_TOKEN = 'Auth__ExpiredToken',
  UNAUTHORIZED = 'Auth__Unauthorized',
  INVALID_CHALLENGE = 'Auth__InvalidChallenge',
  INVALID_SIGNATURE = 'Auth__InvalidSignature',
  DEACTIVATED_USER = 'Auth__DeactivatedUser',
  INVALID_ROLE = 'Auth__InvalidRole',
  MISSING_TOKEN = 'Auth__MissingToken',
  INVALID_REFRESH_TOKEN = 'Auth__InvalidRefreshToken',
  DEACTIVATED = 'Deactivated',
}

/**
 * User roles
 */
export enum UserRole {
  ADMIN = 'admin',
  PRODUCER = 'producer',
  CONSUMER = 'consumer',
  SERVICE_PROVIDER = 'service_provider',
  VERIFIER = 'verifier',
}

/**
 * Authentication request
 */
export interface AuthRequest {
  address: string;
  signature: string;
  challenge?: string;
}

/**
 * Challenge request
 */
export interface ChallengeRequest {
  address: string;
}

/**
 * Challenge response
 */
export interface ChallengeResponse {
  challenge: string;
  expiresAt: number;
}

/**
 * Authentication response
 */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    address: string;
    role: UserRole;
    did?: string;
  };
}

/**
 * Refresh token request
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * Token payload
 */
export interface TokenPayload {
  sub: string; // address
  role: UserRole;
  did?: string;
  iat: number;
  exp: number;
}

/**
 * Refresh token payload
 */
export interface RefreshTokenPayload {
  sub: string; // address
  jti: string; // token id
  iat: number;
  exp: number;
}

/**
 * Verify request
 */
export interface VerifyRequest {
  token: string;
}

/**
 * Verify response
 */
export interface VerifyResponse {
  valid: boolean;
  payload?: TokenPayload;
}

/**
 * Get DID request
 */
export interface GetDidRequest {
  address: string;
}

/**
 * Get DID response
 */
export interface GetDidResponse {
  did: string;
  active: boolean;
}

/**
 * Check DID active request
 */
export interface CheckDidActiveRequest {
  did: string;
}

/**
 * Check DID active response
 */
export interface CheckDidActiveResponse {
  active: boolean;
}

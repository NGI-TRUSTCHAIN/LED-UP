/**
 * Represents a refresh token in the system
 * Used for maintaining user sessions and generating new access tokens
 */
export interface RefreshToken {
  id: string;
  userAddress: string;
  token: string;
  issuedAt: Date;
  expiresAt: Date;
  used: boolean;
  usedAt?: Date;
  revoked: boolean;
  revokedAt?: Date;
  replacedByTokenId?: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Input for creating a new refresh token
 */
export interface RefreshTokenInput {
  userAddress: string;
  token: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

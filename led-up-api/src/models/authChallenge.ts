/**
 * Represents an authentication challenge in the system
 * Used for wallet authentication with SIWE (Sign-In with Ethereum)
 */
export interface AuthChallenge {
  id: string;
  address: string;
  nonce: string;
  message: string;
  issuedAt: Date;
  expiresAt: Date;
  used: boolean;
  usedAt?: Date;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Input for creating a new authentication challenge
 */
export interface AuthChallengeInput {
  address: string;
  nonce: string;
  message: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

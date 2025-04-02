/**
 * Types for authentication-related functionality
 */

export interface DidDocument {
  '@context': string[];
  id: string;
  controller: string[];
  verificationMethod?: {
    id: string;
    type: string;
    controller: string;
    blockchainAccountId?: string;
    publicKeyMultibase?: string;
    publicKeyJwk?: Record<string, any>;
  }[];
  authentication?: string[];
  assertionMethod?: string[];
}

export interface User {
  address: `0x${string}`;
  role: string;
  did?: string;
  publicKey?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

export interface ChallengeResponse {
  challenge: string;
  expiresAt: number;
}

export interface CreateDidResponse {
  did: string;
  didDocument: DidDocument;
}

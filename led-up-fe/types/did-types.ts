/**
 * This file contains TypeScript type definitions for DID-related types.
 */

import { DidDocument, DidResolutionResult, VerificationMethod } from '../helpers/did-resolver';

/**
 * DID error types
 */
export enum DidError {
  INVALID_DID = 'Did__InvalidDID',
  NOT_FOUND = 'Did__NotFound',
  ALREADY_EXISTS = 'Did__AlreadyExists',
  UNAUTHORIZED = 'Did__Unauthorized',
  DEACTIVATED = 'Did__Deactivated',
  INVALID_DOCUMENT = 'Did__InvalidDocument',
  INVALID_VERIFICATION_METHOD = 'Did__InvalidVerificationMethod',
  INVALID_SERVICE = 'Did__InvalidService',
}

/**
 * Create DID request
 */
export interface CreateDidRequest {
  address: string;
}

/**
 * Create DID response
 */
export interface CreateDidResponse {
  did: string;
  didDocument: DidDocument;
}

/**
 * Resolve DID request
 */
export interface ResolveDidRequest {
  did: string;
}

/**
 * Resolve DID response
 */
export interface ResolveDidResponse extends DidResolutionResult {}

/**
 * Get DID document request
 */
export interface GetDidDocumentRequest {
  did: string;
}

/**
 * Get DID document response
 */
export interface GetDidDocumentResponse {
  didDocument: DidDocument;
}

/**
 * Update DID document request
 */
export interface UpdateDidDocumentRequest {
  did: string;
  updates: Partial<DidDocument>;
}

/**
 * Update DID document response
 */
export interface UpdateDidDocumentResponse {
  didDocument: DidDocument;
}

/**
 * Update public key request
 */
export interface UpdatePublicKeyRequest {
  did: string;
  keyId: string;
  publicKey: Partial<VerificationMethod>;
}

/**
 * Update public key response
 */
export interface UpdatePublicKeyResponse {
  didDocument: DidDocument;
}

/**
 * Deactivate DID request
 */
export interface DeactivateDidRequest {
  did: string;
}

/**
 * Deactivate DID response
 */
export interface DeactivateDidResponse {
  deactivated: boolean;
  didDocument: DidDocument;
}

/**
 * Get DID by address request
 */
export interface GetDidByAddressRequest {
  address: string;
}

/**
 * Get DID by address response
 */
export interface GetDidByAddressResponse {
  did: string;
  active: boolean;
}

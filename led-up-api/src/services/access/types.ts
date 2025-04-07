/**
 * Interface for data access request parameters
 */
export interface DataAccessRequest {
  /** Consumer's DID */
  did: string;
  /** Consumer's public key */
  publicKey: string;
  /** Content identifier of the requested data */
  cid: string;
  /** Consumer's address */
  address: string;
  /** Consumer's signature */
  signature: string;
}

/**
 * Interface for data access response
 */
export interface DataAccessResponse {
  /** Data encrypted with shared secret */
  encryptedData: string;
  /** Shared secret encrypted with consumer's public key */
  encryptedSharedSecret: string;
}

/**
 * Interface for access log entry
 */
export interface AccessLogEntry {
  /** Consumer's DID */
  did: string;
  /** Content identifier of the accessed data */
  cid: string;
  /** Timestamp of the access */
  timestamp: string;
  /** Type of action performed */
  action: 'access' | 'revoke';
}

/**
 * Interface for key storage options
 */
export interface KeyStorageOptions {
  /** Expiration time for the key */
  expiresIn: string;
  /** Type of key being stored */
  type: 'shared-secret' | 'master-key' | 'public-key';
}

/**
 * Interface for encrypted data format
 */
export interface EncryptedData {
  /** Initialization vector */
  iv: string;
  /** Authentication tag */
  authTag: string;
  /** Encrypted data */
  encrypted: string;
}

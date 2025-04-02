/**
 * Represents an access grant in the system
 * This model handles the record of who has access to what data
 */
export interface AccessGrant {
  id: string;
  userAddress: string;
  dataId: string;
  grantedAt: Date;
  expiresAt: Date;
  revoked: boolean;
  revokedAt?: Date;
  transactionHash?: string;
  ipfsHash?: string;
  paymentAmount?: string;
}

/**
 * Input for creating a new access grant
 */
export interface AccessGrantInput {
  userAddress: string;
  dataId: string;
  expiresAt: Date;
  transactionHash?: string;
  ipfsHash?: string;
  paymentAmount?: string;
}

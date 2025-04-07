import { Address } from 'viem';

export interface SharedRecord {
  recordId: string;
  consumerDid: string;
  expiration: bigint;
  accessLevel: number;
  isRevoked: boolean;
  revokedBy?: Address;
  grantedAt: Date;
}

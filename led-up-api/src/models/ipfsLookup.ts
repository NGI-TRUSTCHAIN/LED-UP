export interface IPFSLookupInput {
  id?: string;
  cid: string;
  ownerDid: string;
  keyvaultName: string;
  createdAt: number;
  updatedAt?: number;
  deletedAt?: number;
}

export interface IPFSLookup {
  id: string;
  cid: string;
  ownerDid: string;
  keyvaultName: string;
  createdAt: number;
  updatedAt?: number;
}

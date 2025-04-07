export interface MerkleProof {
  pathElements: string[];
  pathIndices: number[];
  leaf: string;
  root: string;
}

export declare class MerkleTree {
  constructor(height: number, leaves?: string[]);
  initialize(): Promise<void>;
  _hash(left: bigint, right: bigint): bigint;
  buildTree(): Promise<bigint>;
  get root(): bigint;
  generateProof(leafIndex: number): MerkleProof;
  hashFhirResource(resourceType: number, resourceData: number[]): Promise<bigint>;
  addLeaf(leaf: string | bigint): Promise<number>;
}

export declare class FhirMerkleDatabase {
  merkleTree: MerkleTree;
  resourceIndex: Map<string, number>;
  resourceData: Array<{
    id: string;
    type: number;
    data: number[];
  }>;

  constructor(height?: number);
  initialize(): Promise<void>;
  addResource(
    resourceType: number,
    resourceData: number[],
    resourceId: string
  ): Promise<{
    index: number;
    hash: string;
  }>;
  getRoot(): string;
  getProof(resourceId: string): MerkleProof;
  getResourceData(resourceId: string): {
    id: string;
    type: number;
    data: number[];
  };
  verifyProof(resourceType: number, resourceData: number[], proof: MerkleProof): Promise<boolean>;
}

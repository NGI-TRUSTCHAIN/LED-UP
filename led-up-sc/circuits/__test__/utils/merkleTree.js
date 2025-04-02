const { buildPoseidon } = require('circomlibjs');
const { ethers } = require('ethers');

class MerkleTree {
  constructor(height, leaves = []) {
    this.height = height;
    this.zeroValues = [];
    this.totalElements = 2 ** height;
    this.poseidon = null;
    this.tree = [];
    this.zeros = [];
    this.leaves = leaves;
  }

  async initialize() {
    // Initialize Poseidon hash function
    this.poseidon = await buildPoseidon();

    // Calculate zero values for each level
    this.zeros = new Array(this.height + 1);
    this.zeros[0] = 0n;

    for (let i = 1; i <= this.height; i++) {
      this.zeros[i] = this._hash(this.zeros[i - 1], this.zeros[i - 1]);
    }

    // Build initial tree
    await this.buildTree();
  }

  _hash(left, right) {
    const result = this.poseidon([left, right]);
    const hashStr = this.poseidon.F.toString(result);
    return BigInt(hashStr);
  }

  async buildTree() {
    let currentLevel = this.leaves.length > 0 ? this.leaves.map(BigInt) : [];

    // Fill with zeros if needed
    currentLevel = currentLevel.concat(Array(this.totalElements - currentLevel.length).fill(this.zeros[0]));

    // Store the tree structure
    this.tree = [currentLevel];

    // Build each level of the tree
    for (let level = 0; level < this.height; level++) {
      let nextLevel = [];
      for (let i = 0; i < currentLevel.length / 2; i++) {
        nextLevel.push(this._hash(currentLevel[2 * i], currentLevel[2 * i + 1]));
      }
      this.tree.push(nextLevel);
      currentLevel = nextLevel;
    }

    return this.root;
  }

  get root() {
    return this.tree[this.height][0];
  }

  generateProof(leafIndex) {
    if (leafIndex >= this.totalElements) {
      throw new Error('Leaf index out of bounds');
    }

    const pathElements = [];
    const pathIndices = [];

    let currentIndex = leafIndex;

    for (let i = 0; i < this.height; i++) {
      const isRight = currentIndex % 2 === 1;
      const siblingIndex = isRight ? currentIndex - 1 : currentIndex + 1;

      pathElements.push(this.tree[i][siblingIndex]);
      pathIndices.push(isRight ? 0 : 1);

      currentIndex = Math.floor(currentIndex / 2);
    }

    return {
      pathElements: pathElements.map(String),
      pathIndices,
      leaf: String(this.tree[0][leafIndex]),
      root: String(this.root),
    };
  }

  async hashFhirResource(resourceType, resourceData) {
    const inputs = [BigInt(resourceType)];
    for (const data of resourceData) {
      inputs.push(BigInt(data));
    }

    const result = this.poseidon(inputs);
    return BigInt(this.poseidon.F.toString(result));
  }

  async addLeaf(leaf) {
    const bigIntLeaf = BigInt(leaf);
    const index = this.leaves.length;

    if (index >= this.totalElements) {
      throw new Error('Tree is full');
    }

    this.leaves.push(bigIntLeaf);

    // Update the tree with the new leaf
    let currentIndex = index;
    let currentHash = bigIntLeaf;

    this.tree[0][currentIndex] = currentHash;

    for (let i = 0; i < this.height; i++) {
      const isRight = currentIndex % 2 === 1;
      const siblingIndex = isRight ? currentIndex - 1 : currentIndex + 1;
      const siblingHash = this.tree[i][siblingIndex] || this.zeros[i];

      currentIndex = Math.floor(currentIndex / 2);

      if (isRight) {
        currentHash = this._hash(siblingHash, currentHash);
      } else {
        currentHash = this._hash(currentHash, siblingHash);
      }

      this.tree[i + 1][currentIndex] = currentHash;
    }

    return index;
  }
}

class FhirMerkleDatabase {
  constructor(height = 10) {
    this.merkleTree = new MerkleTree(height);
    this.resourceIndex = new Map(); // Maps resource ID to tree index
    this.resourceData = []; // Stores the actual FHIR resources
  }

  async initialize() {
    await this.merkleTree.initialize();
  }

  async addResource(resourceType, resourceData, resourceId) {
    // Hash the resource to create a leaf value
    const hash = await this.merkleTree.hashFhirResource(resourceType, resourceData);

    // Add the leaf to the tree
    const index = await this.merkleTree.addLeaf(hash);

    // Store the resource data and index mapping
    this.resourceData.push({
      id: resourceId,
      type: resourceType,
      data: resourceData,
    });

    this.resourceIndex.set(resourceId, index);

    return { index, hash: hash.toString() };
  }

  getRoot() {
    return this.merkleTree.root.toString();
  }

  getProof(resourceId) {
    const index = this.resourceIndex.get(resourceId);

    if (index === undefined) {
      throw new Error(`Resource with ID ${resourceId} not found`);
    }

    return this.merkleTree.generateProof(index);
  }

  getResourceData(resourceId) {
    const index = this.resourceIndex.get(resourceId);

    if (index === undefined) {
      throw new Error(`Resource with ID ${resourceId} not found`);
    }

    return this.resourceData[index];
  }

  async verifyProof(resourceType, resourceData, proof) {
    // Hash the resource to recreate the leaf
    const hash = await this.merkleTree.hashFhirResource(resourceType, resourceData);

    // Verify that this matches the leaf in the proof
    if (hash.toString() !== proof.leaf) {
      return false;
    }

    // Verify the proof path
    let currentHash = BigInt(proof.leaf);

    for (let i = 0; i < proof.pathElements.length; i++) {
      const element = BigInt(proof.pathElements[i]);
      const position = proof.pathIndices[i];

      if (position === 0) {
        currentHash = this.merkleTree._hash(currentHash, element);
      } else {
        currentHash = this.merkleTree._hash(element, currentHash);
      }
    }

    return currentHash.toString() === proof.root;
  }
}

module.exports = {
  MerkleTree,
  FhirMerkleDatabase,
};

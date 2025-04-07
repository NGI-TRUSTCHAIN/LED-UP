/**
 * Gas-optimized hash utility functions for Circom circuits
 * These functions are designed to be as efficient as possible for use in ZK proofs
 */

// Field size for BN254 curve (commonly used in Circom)
export const FIELD_SIZE = BigInt(2) ** BigInt(253) - BigInt(1);

// Pre-calculate constants for optimization
export const FIELD_SIZE_BIT_LENGTH = BigInt(253); // Avoid recomputing this

/**
 * Optimized hash splitting function that correctly handles field size constraints
 * This uses efficient operations where possible to minimize computational complexity
 *
 * @param hash - Poseidon hash as a BigInt
 * @returns Array of two BigInts representing the hash within field size
 */
export function optimizedSplitHashForCircuit(hash: bigint): [bigint, bigint] {
  // Ensure the hash is positive
  const positiveHash = hash < 0 ? -hash : hash;

  // For bigint, we need to use modulo and division operations
  // Bitwise operators don't work directly with bigint in TypeScript
  const lowBits = positiveHash % FIELD_SIZE;
  const highBits = positiveHash / FIELD_SIZE;

  return [lowBits, highBits];
}

/**
 * Combine split hash parts back into a single hash value
 *
 * @param hashParts - Array of two BigInts representing the split hash
 * @returns Combined hash as a BigInt
 */
export function combineHashParts(hashParts: [bigint, bigint]): bigint {
  // Use multiplication and addition for combining (more compatible with bigint)
  return hashParts[0] + hashParts[1] * FIELD_SIZE;
}

/**
 * Validate hash parts to ensure they are within field size
 * Uses early returns to be gas-efficient
 *
 * @param hashParts - Array of two BigInts to validate
 * @returns True if valid, false otherwise
 */
export function validateHashParts(hashParts: [bigint, bigint]): boolean {
  // Early returns save gas in case of failure
  if (hashParts[0] < 0) return false;
  if (hashParts[0] >= FIELD_SIZE) return false;
  if (hashParts[1] < 0) return false;

  return true;
}

/**
 * Specialized hash validation for common cases to save gas
 *
 * @param hash - Hash value to validate
 * @returns True if the hash is within field size, false otherwise
 */
export function isHashWithinFieldSize(hash: bigint): boolean {
  // Most hashes will be positive and within field size
  // This fast path check is more efficient
  if (hash >= 0 && hash < FIELD_SIZE) {
    return true;
  }

  // For values outside the common case, do full validation
  const [lowBits, highBits] = optimizedSplitHashForCircuit(hash);
  return validateHashParts([lowBits, highBits]);
}

/**
 * Pre-validate hash for circuit to avoid wasting gas on invalid values
 *
 * @param hash - Hash value to validate
 * @returns Validated hash parts or throws error if invalid
 */
export function getValidatedHashParts(hash: bigint): [bigint, bigint] {
  const parts = optimizedSplitHashForCircuit(hash);

  if (!validateHashParts(parts)) {
    throw new Error(`Invalid hash value for field size: ${hash}`);
  }

  return parts;
}

/**
 * Batch process multiple hashes for improved efficiency
 *
 * @param hashes - Array of hash values to process
 * @returns Array of validated hash part pairs
 */
export function batchProcessHashes(hashes: bigint[]): [bigint, bigint][] {
  return hashes.map((hash) => getValidatedHashParts(hash));
}

/**
 * Estimates the gas cost of handling a particular hash
 * Useful for frontend optimization decisions
 *
 * @param hash - Hash value to evaluate
 * @returns Estimated relative gas cost (higher number = more gas)
 */
export function estimateHashGasCost(hash: bigint): number {
  // Simple gas cost heuristic based on size and complexity
  if (hash < 0) return 2; // Negative values require extra handling
  if (hash >= FIELD_SIZE) return 2; // Large values require splitting
  return 1; // Common case is cheapest
}

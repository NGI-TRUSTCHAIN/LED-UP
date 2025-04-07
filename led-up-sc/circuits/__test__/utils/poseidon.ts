/**
 * Poseidon hash utilities for the ZK circuit tests
 */

import { buildPoseidon } from 'circomlibjs';

let poseidonInstance: any = null;

/**
 * Initialize the Poseidon hasher
 */
async function initPoseidon() {
  if (!poseidonInstance) {
    poseidonInstance = await buildPoseidon();
  }
  return poseidonInstance;
}

/**
 * Calculate Poseidon hash for an array of values
 * @param values Array of values to hash (can be numbers or BigInts)
 * @returns Poseidon hash as BigInt
 */
export async function calculatePoseidonHash(values: (number | bigint)[]): Promise<bigint> {
  const poseidon = await initPoseidon();

  // Convert input values to field elements
  const fieldElements = values.map((val) => poseidon.F.e(val.toString()));

  // Calculate the hash
  const hash = poseidon(fieldElements);

  // Convert to BigInt for easier handling
  return BigInt(poseidon.F.toString(hash));
}

/**
 * Split a BigInt hash into low and high parts for circuit input
 * @param hash BigInt hash to split
 * @returns [low, high] representation suitable for circuit input
 */
export function splitHashForCircuit(hash: bigint): [bigint, bigint] {
  // For simplicity, we'll just use the hash as the low part and 0 as high
  // In a real implementation, you'd split a large hash into multiple parts
  return [hash, 0n];
}

/**
 * Generate a dummy hash for testing
 * @returns A predetermined hash value
 */
export function getDummyHash(): [bigint, bigint] {
  // For testing purposes only
  return [123456789n, 0n];
}

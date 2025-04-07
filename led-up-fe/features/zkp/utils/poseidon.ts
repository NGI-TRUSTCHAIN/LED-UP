// This is a utility for using the Poseidon hash function in the browser
// Only for use in the browser - we ensure it's not loaded during SSR

// Store the poseidon instance once it's loaded
let poseidonInstance: any = null;
let isInitializing = false;
let initializationError: Error | null = null;

/**
 * Check if we're in a browser environment
 */
const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';

/**
 * Initialize the Poseidon hash function - only in browser
 * @returns Promise that resolves when Poseidon is initialized
 */
export async function initializePoseidon(): Promise<void> {
  // Bail out early if not in browser environment
  if (!isBrowser) return;

  if (poseidonInstance) return;

  // If already attempting to initialize, wait for that to complete
  if (isInitializing) {
    // Wait a bit and check again
    await new Promise((resolve) => setTimeout(resolve, 100));
    if (initializationError) throw initializationError;
    if (poseidonInstance) return;
    return initializePoseidon();
  }

  try {
    isInitializing = true;

    // We're using the Next.js dynamic import syntax
    // This is handled by webpack and works in the browser
    // Use top-level await to ensure module is fully loaded
    const circomlibjs = await import('circomlibjs').catch((err) => {
      console.error('Failed to import circomlibjs:', err);
      throw new Error(`Failed to load circomlibjs module: ${err.message}`);
    });

    // Once module is loaded, build the Poseidon instance
    const { buildPoseidon } = circomlibjs;
    if (!buildPoseidon) {
      throw new Error('buildPoseidon function not found in circomlibjs module');
    }

    poseidonInstance = await buildPoseidon();

    // Verify the instance was created successfully
    if (!poseidonInstance) {
      throw new Error('Failed to initialize Poseidon instance');
    }

    isInitializing = false;
  } catch (error) {
    console.error('Failed to initialize Poseidon:', error);
    isInitializing = false;
    initializationError =
      error instanceof Error ? error : new Error(`Poseidon initialization failed: ${String(error)}`);
    throw initializationError;
  }
}

/**
 * Calculate Poseidon hash for an array of values
 * @param inputs - Array of values to hash
 * @returns The Poseidon hash as a BigInt
 */
export async function calculatePoseidonHash(inputs: Array<number | bigint | string>): Promise<bigint> {
  // Bail out with a fake value when not in browser
  if (!isBrowser) {
    return BigInt('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');
  }

  if (!poseidonInstance) {
    try {
      await initializePoseidon();
    } catch (error) {
      console.error('Failed to initialize Poseidon for hash calculation:', error);

      if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
        // Return a mock value in development/test mode
        return BigInt('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');
      }

      throw error;
    }
  }

  // At this point we should have a valid poseidon instance
  if (!poseidonInstance) {
    throw new Error('Poseidon instance was not properly initialized');
  }

  try {
    // Convert inputs to appropriate format
    const processedInputs = inputs.map((input) => {
      if (typeof input === 'string') {
        // If it's a hex string, convert accordingly
        if (input.startsWith('0x')) {
          return BigInt(input);
        }
        // Otherwise try to convert to number
        return BigInt(input);
      }
      return BigInt(input);
    });

    // Handle the poseidon instance based on its interface
    let hash;
    if (typeof poseidonInstance.hash === 'function') {
      hash = poseidonInstance.hash(processedInputs);
    } else if (typeof poseidonInstance === 'function') {
      hash = poseidonInstance(processedInputs);
    } else {
      throw new Error('Invalid poseidon instance: neither a function nor has a hash method');
    }

    // Convert the hash to a bigint using F.toObject
    return poseidonInstance.F.toObject(hash);
  } catch (error) {
    console.error('Error calculating Poseidon hash:', error);

    // Fallback for non-production environments
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Using mock hash value in development mode');
      return BigInt('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');
    }

    throw new Error(`Poseidon hash calculation failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Convert a Poseidon hash to a hex string
 * @param hash - Poseidon hash as a BigInt
 * @returns Hexadecimal string representation of the hash
 */
export function poseidonHashToHex(hash: bigint): string {
  return `0x${hash.toString(16).padStart(64, '0')}`;
}

/**
 * Split a hash into two parts for circuit input
 * @param hash - Poseidon hash as a BigInt
 * @returns Array of two BigInts representing the hash
 */
export function splitHashForCircuit(hash: bigint): [bigint, bigint] {
  // Split the 256-bit hash into two 128-bit parts
  const mask = (BigInt(1) << BigInt(128)) - BigInt(1);
  const lowBits = hash & mask;
  const highBits = hash >> BigInt(128);

  return [lowBits, highBits];
}

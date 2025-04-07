import { CircuitMetadata, CircuitType, Proof, VerificationResult } from '../types';
// Use next/dynamic with noSSR for snarkjs
let snarkjs: any = null;

// Path to the circuit files - updated to use public path
const CIRCUIT_PATHS = {
  [CircuitType.AGE_VERIFIER]: {
    name: 'AgeVerifier',
    description:
      'Verifies age-related claims like simple age check, birth date calculation, and age bracket verification',
    wasmPath: '/circuits/AgeVerifier.wasm',
    zkeyPath: '/circuits/AgeVerifier_0001.zkey',
    verificationKeyPath: '/circuits/verification_key_AgeVerifier.json',
  },
  [CircuitType.FHIR_VERIFIER]: {
    name: 'FhirVerifier',
    description: 'Verifies FHIR resources, resource types, field validation, and hash verification',
    wasmPath: '/circuits/FhirVerifier.wasm',
    zkeyPath: '/circuits/FhirVerifier_0001.zkey',
    verificationKeyPath: '/circuits/verification_key_FhirVerifier.json',
  },
  [CircuitType.HASH_VERIFIER]: {
    name: 'HashVerifier',
    description: 'Verifies hash values for data integrity checks',
    wasmPath: '/circuits/HashVerifier.wasm',
    zkeyPath: '/circuits/HashVerifier_final.zkey',
    verificationKeyPath: '/circuits/verification_key_HashVerifier.json',
  },
};

/**
 * Initialize snarkjs on the client side only
 */
async function initSnarkjs() {
  if (typeof window !== 'undefined' && !snarkjs) {
    snarkjs = await import('snarkjs');
  }
  return snarkjs;
}

/**
 * Generate a proof for a specific circuit
 * @param circuitType - Type of circuit to generate proof for
 * @param input - Circuit input (can be array or object)
 * @returns Promise with the proof and public signals
 */
export async function generateProof(
  circuitType: CircuitType,
  input: any
): Promise<{ proof: Proof; publicSignals: string[] }> {
  try {
    const circuitMetadata = CIRCUIT_PATHS[circuitType];

    console.log(`Generating proof for ${circuitMetadata.name} with input:`, input);

    // Process input based on circuit type
    let processedInput;

    // Handle different circuit types with appropriate input formats
    if (circuitType === CircuitType.HASH_VERIFIER) {
      // For HashVerifier, expect data array and expectedHash
      if (!input.data || !input.expectedHash) {
        throw new Error('HashVerifier requires data and expectedHash inputs');
      }

      processedInput = {
        data: input.data.map((val: any) => val.toString()),
        expectedHash: input.expectedHash.map((val: any) => val.toString()),
      };
    } else if (circuitType === CircuitType.AGE_VERIFIER) {
      // For AgeVerifier, handle different input formats
      if (Array.isArray(input)) {
        // Legacy array format support
        if (input.length !== 5) {
          throw new Error(`Input array must have exactly 5 elements, got ${input.length}`);
        }

        processedInput = {
          birthDate: input[0].toString(),
          currentDate: input[1].toString(),
          threshold: input[2].toString(),
          verificationType: input[3].toString(),
        };
      } else if (typeof input === 'object' && input !== null) {
        // Object format for AgeVerifier
        processedInput = {
          birthDate: input.birthDate?.toString() || '0',
          currentDate: input.currentDate?.toString() || '0',
          threshold: input.threshold?.toString() || '0',
          verificationType: input.verificationType?.toString() || '1',
        };
      } else {
        throw new Error('AgeVerifier input must be an array or object with required circuit parameters');
      }
    } else if (circuitType === CircuitType.FHIR_VERIFIER) {
      // For FHIR Verifier, handle its specific input format
      if (typeof input === 'object' && input !== null) {
        processedInput = input; // For now, pass the input directly
      } else {
        throw new Error('FHIR Verifier input must be an object with required parameters');
      }
    } else {
      // Default fallback for any other circuit types
      processedInput = input;
    }

    // Log exact format for debugging
    console.log(`Processed input: ${JSON.stringify(processedInput)}`);

    // Initialize snarkjs on client only
    const snarkjsInstance = await initSnarkjs();
    if (!snarkjsInstance) {
      throw new Error('Failed to load snarkjs - only available in browser');
    }

    // Generate the proof
    const { proof, publicSignals } = await snarkjsInstance.groth16.fullProve(
      processedInput,
      circuitMetadata.wasmPath,
      circuitMetadata.zkeyPath
    );

    console.log(`Result: ${publicSignals[0]}`);
    return { proof, publicSignals };
  } catch (error) {
    console.error('Error generating proof:', error);
    throw new Error(`Failed to generate proof: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Verify a proof for a specific circuit
 * @param circuitType - Type of circuit to verify proof for
 * @param proof - The proof to verify
 * @param publicSignals - The public signals from proof generation
 * @returns Promise with verification result
 */
export async function verifyProof(
  circuitType: CircuitType,
  proof: Proof,
  publicSignals: string[]
): Promise<VerificationResult> {
  try {
    const circuitMetadata = CIRCUIT_PATHS[circuitType];

    // Load the verification key
    const response = await fetch(circuitMetadata.verificationKeyPath);
    const verificationKey = await response.json();

    // Initialize snarkjs on client only
    const snarkjsInstance = await initSnarkjs();
    if (!snarkjsInstance) {
      throw new Error('Failed to load snarkjs - only available in browser');
    }

    // Verify the proof
    const isValid = await snarkjsInstance.groth16.verify(verificationKey, publicSignals, proof);

    return {
      success: isValid,
      message: isValid ? 'Proof verified successfully' : 'Proof verification failed',
    };
  } catch (error) {
    console.error('Error verifying proof:', error);
    return {
      success: false,
      message: `Proof verification error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Process a result code from a circuit
 * @param circuitType - Type of circuit
 * @param resultCode - Result code from the circuit
 * @returns Descriptive message for the result code
 */
export function processResultCode(circuitType: CircuitType, resultCode: number): string {
  // Common result codes across all circuits
  if (resultCode === 1) {
    return 'Verification successful';
  } else if (resultCode === 0) {
    return 'Verification failed';
  }

  // Circuit-specific result codes
  switch (circuitType) {
    case CircuitType.AGE_VERIFIER:
      // Simple Age Verification
      if (resultCode === 14) return 'Age is above the minimum threshold';
      if (resultCode === 21) return 'Age is below the minimum threshold';

      // Birth Date Verification
      if (resultCode === 19) return 'Birth date verification successful - above threshold';
      if (resultCode === 22) return 'Birth date verification failed - below threshold';
      if (resultCode === 23) return 'Birth date verification failed - date must be valid and in the past';

      // Age Bracket Verification
      if (resultCode === 11) return 'Age bracket: Child (0-17)';
      if (resultCode === 12) return 'Age bracket: Adult (18-64)';
      if (resultCode === 13) return 'Age bracket: Senior (65+)';
      if (resultCode === 10) return 'Age bracket verification failed';
      break;
    case CircuitType.HASH_VERIFIER:
      if (resultCode === 1) return 'Hash verification successful';
      if (resultCode === 2) return 'Invalid input (contains zeros or invalid values)';
      if (resultCode === 3) return 'Valid input but hash mismatch';
      break;
    case CircuitType.FHIR_VERIFIER:
      if (resultCode === 2) return 'Resource type verification failed';
      if (resultCode === 3) return 'Required field verification failed';
      if (resultCode === 4) return 'Field format verification failed';
      break;
  }

  return `Unknown result code: ${resultCode}`;
}

/**
 * Get metadata for a specific circuit
 * @param circuitType - Type of circuit
 * @returns Circuit metadata
 */
export function getCircuitMetadata(circuitType: CircuitType): CircuitMetadata {
  return CIRCUIT_PATHS[circuitType];
}

/**
 * Get metadata for all available circuits
 * @returns Object with all circuit metadata
 */
export function getAllCircuitMetadata(): Record<CircuitType, CircuitMetadata> {
  return CIRCUIT_PATHS;
}

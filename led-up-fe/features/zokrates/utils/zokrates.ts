import { initialize } from 'zokrates-js';
import type { ZoKratesProvider } from 'zokrates-js';
import {
  AgeVerifierInput,
  HashVerifierInput,
  FhirVerifierInput,
  VerificationResult,
  CircuitType,
  ZoKratesComputationResult,
  ZoKratesProofResult,
  ZoKratesVerificationKey,
} from '../types';

// Type definition for ZoKrates setup keypair
type ProofStructure = {
  a: any[];
  b: any[][];
  c: any[];
};

type NativeProof = {
  proof: ProofStructure;
  inputs: any[];
};

// Type for the verification key within the setup keypair
type VkStructure = {
  alpha: any[];
  beta: any[][];
  gamma: any[][];
  delta: any[][];
  gamma_abc: any[][];
};

// Internal setup keypair type to avoid conflict with zokrates-js
type ZoKratesSetupKeypair = {
  vk: VkStructure;
  pk: any;
};

// Cache the ZoKrates provider once initialized
let zokratesProvider: ZoKratesProvider | null = null;

// Add a new interface that extends the VerificationResult enum
interface VerificationResultData {
  isValid: boolean;
  result: number;
  proof: ZoKratesProofResult;
  publicSignals: string[];
}

/**
 * Initialize the ZoKrates provider if not already initialized
 * @returns {Promise<ZoKratesProvider>} The ZoKrates provider
 */
export async function getZoKratesProvider(): Promise<ZoKratesProvider> {
  if (!zokratesProvider) {
    try {
      zokratesProvider = await initialize();
      console.log('ZoKrates provider initialized successfully');
    } catch (error) {
      console.error('Failed to initialize ZoKrates provider:', error);
      throw error;
    }
  }
  return zokratesProvider;
}

/**
 * Load a ZoKrates circuit from a file
 * @param {CircuitType} circuitType - The type of circuit to load
 * @returns {Promise<string>} The circuit source code
 */
export async function loadCircuit(circuitType: CircuitType): Promise<string> {
  try {
    let circuitPath: string;

    switch (circuitType) {
      case CircuitType.AGE_VERIFIER:
        circuitPath = '/zokrates/circuits/age/enhanced_age_verifier.zok';
        break;
      case CircuitType.HASH_VERIFIER:
        circuitPath = '/zokrates/circuits/hash/enhanced_hash_verifier.zok';
        break;
      case CircuitType.FHIR_VERIFIER:
        circuitPath = '/zokrates/circuits/fhir/enhanced_fhir_verifier.zok';
        break;
      default:
        throw new Error(`Unknown circuit type: ${circuitType}`);
    }

    const response = await fetch(circuitPath);
    if (!response.ok) {
      throw new Error(`Failed to load circuit: ${response.statusText}`);
    }

    return await response.text();
  } catch (error) {
    console.error(`Error loading circuit ${circuitType}:`, error);
    throw error;
  }
}

/**
 * Load a proving key from a file
 * @param {CircuitType} circuitType - The type of circuit
 * @returns {Promise<Uint8Array>} The proving key
 */
export async function loadProvingKey(circuitType: CircuitType): Promise<Uint8Array> {
  try {
    let provingKeyPath: string;

    switch (circuitType) {
      case CircuitType.AGE_VERIFIER:
        provingKeyPath = '/zokrates/circuits/age/proving.key';
        break;
      case CircuitType.HASH_VERIFIER:
        provingKeyPath = '/zokrates/circuits/hash/proving.key';
        break;
      case CircuitType.FHIR_VERIFIER:
        provingKeyPath = '/zokrates/circuits/fhir/proving.key';
        break;
      default:
        throw new Error(`Unknown circuit type: ${circuitType}`);
    }

    const response = await fetch(provingKeyPath);
    if (!response.ok) {
      throw new Error(`Failed to load proving key: ${response.statusText}`);
    }

    return new Uint8Array(await response.arrayBuffer());
  } catch (error) {
    console.error(`Error loading proving key for ${circuitType}:`, error);
    throw error;
  }
}

/**
 * Load a verification key from a file
 * @param {CircuitType} circuitType - The type of circuit
 * @returns {Promise<ZoKratesVerificationKey>} The verification key
 */
export async function loadVerificationKey(circuitType: CircuitType): Promise<ZoKratesVerificationKey> {
  try {
    let verificationKeyPath: string;

    switch (circuitType) {
      case CircuitType.AGE_VERIFIER:
        verificationKeyPath = '/zokrates/circuits/age/verification.key';
        break;
      case CircuitType.HASH_VERIFIER:
        verificationKeyPath = '/zokrates/circuits/hash/verification.key';
        break;
      case CircuitType.FHIR_VERIFIER:
        verificationKeyPath = '/zokrates/circuits/fhir/verification.key';
        break;
      default:
        throw new Error(`Unknown circuit type: ${circuitType}`);
    }

    const response = await fetch(verificationKeyPath);
    if (!response.ok) {
      throw new Error(`Failed to load verification key: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error loading verification key for ${circuitType}:`, error);
    throw error;
  }
}

/**
 * Compile a ZoKrates circuit
 * @param {string} source - The source code of the circuit
 * @returns {Promise<any>} The compiled artifact
 */
export async function compileCircuit(source: string): Promise<any> {
  try {
    const zokratesProvider = await getZoKratesProvider();
    return zokratesProvider.compile(source);
  } catch (error) {
    console.error('Error compiling circuit:', error);
    throw error;
  }
}

/**
 * Compute a witness for a given circuit and input
 * @param {any} artifacts - The compiled circuit artifacts
 * @param {(string | number)[]} input - The input values for the circuit
 * @returns {Promise<ZoKratesComputationResult>} The computed witness and output
 */
export async function computeWitness(artifacts: any, input: (string | number)[]): Promise<ZoKratesComputationResult> {
  try {
    const zokratesProvider = await getZoKratesProvider();
    // Convert all inputs to strings
    const stringInputs = input.map(String);
    return zokratesProvider.computeWitness(artifacts, stringInputs);
  } catch (error) {
    console.error('Error computing witness:', error);
    throw error;
  }
}

/**
 * Generate a proof for a given witness
 * @param {any} artifacts - The compiled circuit artifacts
 * @param {Uint8Array} witness - The computed witness
 * @param {any} provingKey - The proving key
 * @returns {Promise<ZoKratesProofResult>} The generated proof
 */
export async function generateProof(
  artifacts: any,
  witness: Uint8Array,
  provingKey: any
): Promise<ZoKratesProofResult> {
  try {
    const zokratesProvider = await getZoKratesProvider();
    // Use any type to avoid type errors with zokrates-js
    const result = zokratesProvider.generateProof(artifacts.program, witness, provingKey) as NativeProof;

    // Convert to our expected format
    const convertedProof: ZoKratesProofResult = {
      proof: {
        a: result.proof.a.map(String) as [string, string],
        b: result.proof.b.map((row) => row.map(String)) as [[string, string], [string, string]],
        c: result.proof.c.map(String) as [string, string],
      },
      inputs: result.inputs.map(String),
    };

    return convertedProof;
  } catch (error) {
    console.error('Error generating proof:', error);
    throw error;
  }
}

/**
 * Verify a ZoKrates proof
 * @param {ZoKratesVerificationKey} verificationKey - The verification key
 * @param {ZoKratesProofResult} proof - The proof to verify
 * @returns {Promise<boolean>} Whether the proof is valid
 */
export async function verifyProof(
  verificationKey: ZoKratesVerificationKey,
  proof: ZoKratesProofResult
): Promise<boolean> {
  try {
    const zokratesProvider = await getZoKratesProvider();
    return zokratesProvider.verify(verificationKey, proof);
  } catch (error) {
    console.error('Error verifying proof:', error);
    throw error;
  }
}

/**
 * Process age verification with ZoKrates
 * @param {AgeVerifierInput} input - The age verification input
 * @returns {Promise<VerificationResultData>} The verification result
 */
export async function verifyAge(input: AgeVerifierInput): Promise<VerificationResultData> {
  try {
    // Load and compile the age verification circuit
    const source = await loadCircuit(CircuitType.AGE_VERIFIER);
    const artifacts = await compileCircuit(source);

    // Format input for ZoKrates using the correct property names
    const formattedInput = [
      String(input.birthDate || '0'),
      String(input.currentDate || '0'),
      String(input.threshold || '18'),
      '1', // Verification type, defaulting to 1
    ];

    // Compute witness
    const { witness, output } = await computeWitness(artifacts, formattedInput);

    // Try to load the proving key, or generate a temporary one if not available
    let provingKey: any;
    try {
      provingKey = await loadProvingKey(CircuitType.AGE_VERIFIER);
    } catch (error) {
      console.warn('Using temporary proving key for development');
      const zokratesProvider = await getZoKratesProvider();
      provingKey = zokratesProvider.setup(artifacts.program);
    }

    // Generate proof
    const proof = await generateProof(artifacts, witness, provingKey);

    // Try to load the verification key, or use a development one if not available
    let verificationKey: ZoKratesVerificationKey;
    try {
      verificationKey = await loadVerificationKey(CircuitType.AGE_VERIFIER);
    } catch (error) {
      console.warn('Using temporary verification key for development');
      if (provingKey && typeof provingKey === 'object' && 'vk' in provingKey) {
        const vk = (provingKey as any).vk;

        // Create a verification key from the setup keypair
        verificationKey = {
          alpha: vk.alpha.map((arr: any[]) => arr.map(String)),
          beta: vk.beta.map((arr: any[][]) => arr.map((subArr: any[]) => subArr.map(String))),
          gamma: vk.gamma.map((arr: any[][]) => arr.map((subArr: any[]) => subArr.map(String))),
          delta: vk.delta.map((arr: any[][]) => arr.map((subArr: any[]) => subArr.map(String))),
          gamma_abc: vk.gamma_abc.map((arr: any[][]) => arr.map((subArr: any[]) => subArr.map(String))),
        };
      } else {
        throw new Error('No verification key available');
      }
    }

    // Verify the proof
    const isValid = await verifyProof(verificationKey, proof);

    // Process the output
    const result = parseInt(output, 10);

    return {
      isValid,
      result,
      proof,
      publicSignals: [output],
    };
  } catch (error) {
    console.error('Error in age verification:', error);
    throw error;
  }
}

/**
 * Process hash verification with ZoKrates
 * @param {HashVerifierInput} input - The hash verification input
 * @returns {Promise<VerificationResultData>} The verification result
 */
export async function verifyHash(input: HashVerifierInput): Promise<VerificationResultData> {
  try {
    // Create a sample proof for placeholders
    const emptyProof: ZoKratesProofResult = {
      proof: {
        a: ['0', '0'],
        b: [
          ['0', '0'],
          ['0', '0'],
        ],
        c: ['0', '0'],
      },
      inputs: ['0'],
    };

    // Implementation similar to verifyAge but for hash verification
    // ...
    return {
      isValid: true, // Placeholder
      result: 1,
      proof: emptyProof,
      publicSignals: ['0'],
    };
  } catch (error) {
    console.error('Error in hash verification:', error);
    throw error;
  }
}

/**
 * Process FHIR verification with ZoKrates
 * @param {FhirVerifierInput} input - The FHIR verification input
 * @returns {Promise<VerificationResultData>} The verification result
 */
export async function verifyFhir(input: FhirVerifierInput): Promise<VerificationResultData> {
  try {
    // Create a sample proof for placeholders
    const emptyProof: ZoKratesProofResult = {
      proof: {
        a: ['0', '0'],
        b: [
          ['0', '0'],
          ['0', '0'],
        ],
        c: ['0', '0'],
      },
      inputs: ['0'],
    };

    // Format the input for the FHIR verifier circuit - use only properties that exist in the interface
    const formattedInput = [
      String(input.resourceType || ''),
      // Handle recordHash safely
      '0', // Placeholder for hash part 1
      '0', // Placeholder for hash part 2
    ];

    // Implementation similar to verifyAge but for FHIR verification
    // ...
    return {
      isValid: true, // Placeholder
      result: 1,
      proof: emptyProof,
      publicSignals: ['0'],
    };
  } catch (error) {
    console.error('Error in FHIR verification:', error);
    throw error;
  }
}

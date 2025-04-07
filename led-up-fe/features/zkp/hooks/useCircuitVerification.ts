import { useState, useEffect } from 'react';
import { CircuitType, Proof, VerificationResult } from '../types';
import { generateProof, verifyProof, processResultCode } from '../utils/proof';

interface UseCircuitVerificationProps {
  circuitType: CircuitType;
}

interface UseCircuitVerificationReturn {
  loading: boolean;
  error: string | null;
  result: VerificationResult | null;
  resultCode: number | null;
  resultMessage: string | null;
  proof: Proof | null;
  publicSignals: string[] | null;
  generateAndVerifyProof: (input: any) => Promise<void>;
  reset: () => void;
  circuitReady: boolean;
}

/**
 * Custom hook for handling circuit verification
 * @param props - Hook configuration
 * @returns Object with state and functions for circuit verification
 */
export function useCircuitVerification({ circuitType }: UseCircuitVerificationProps): UseCircuitVerificationReturn {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [resultCode, setResultCode] = useState<number | null>(null);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [proof, setProof] = useState<Proof | null>(null);
  const [publicSignals, setPublicSignals] = useState<string[] | null>(null);
  const [circuitReady, setCircuitReady] = useState<boolean>(false);

  // Check if circuits are available
  useEffect(() => {
    const checkCircuits = async () => {
      try {
        // Try to fetch verification key to check if circuits are available
        const response = await fetch(`/circuits/verification_key_${circuitType}.json`);
        if (response.ok) {
          setCircuitReady(true);
        } else {
          console.warn(`Circuit files not found for ${circuitType}. Status: ${response.status}`);
          setError(`Circuit files not available for ${circuitType}. Make sure to run setup-circuits script.`);
        }
      } catch (err) {
        console.error('Error checking circuit files:', err);
        setError(`Error loading circuit files: ${err instanceof Error ? err.message : String(err)}`);
      }
    };

    checkCircuits();
  }, [circuitType]);

  /**
   * Generate and verify a proof for the specified circuit
   * @param input - Circuit input
   */
  const generateAndVerifyProof = async (input: any) => {
    if (!circuitReady) {
      setError(`Circuit files not available for ${circuitType}. Make sure to run setup-circuits script.`);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setResultCode(null);
    setResultMessage(null);
    setProof(null);
    setPublicSignals(null);

    try {
      console.log(`Attempting to generate proof with input:`, input);

      // Don't format the input - use numeric values directly like in tests
      // Generate proof with the input directly
      const { proof, publicSignals } = await generateProof(circuitType, input);

      setProof(proof);
      setPublicSignals(publicSignals);

      console.log(`Generated proof with ${publicSignals.length} public signals`);
      if (publicSignals.length > 0) {
        console.log(`First signal (result code): ${publicSignals[0]}`);
      }

      // Verify the proof
      const verificationResult = await verifyProof(circuitType, proof, publicSignals);
      setResult(verificationResult);

      // Extract and process the result code
      if (publicSignals && publicSignals.length > 0) {
        // Tests show the result code is in the first element of public signals array
        console.log('Public signals from proof generation:', publicSignals);

        // Extract the result code - make sure to parse as integer properly
        const code = parseInt(publicSignals[0], 10);
        setResultCode(code);

        // Get readable message for this code
        const message = processResultCode(circuitType, code);
        setResultMessage(message);

        console.log('Result code:', code, 'Message:', message);
      }
    } catch (err) {
      const errorMsg = `Error: ${err instanceof Error ? err.message : String(err)}`;
      console.error(errorMsg);
      setError(errorMsg);

      // Specific handling for WebAssembly.compile error
      if (errorMsg.includes('WebAssembly.compile') && errorMsg.includes('expected magic word')) {
        setError(
          `Failed to load WebAssembly circuit file. Please check that circuit files are properly copied to the public folder by running the setup-circuits script.`
        );
      }

      // Special handling for witness length errors
      if (errorMsg.includes('witness length')) {
        setError(
          `Invalid witness length. The circuit expects inputs in this exact order: age, birthDate, currentDate, threshold, verificationType - as numeric values.`
        );
        console.error(`Circuit expects: ${circuitType}, but witness length mismatch`);
        console.error(`Input provided:`, input);
        console.error(`Input JSON:`, JSON.stringify(input));
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reset the state
   */
  const reset = () => {
    setLoading(false);
    setError(null);
    setResult(null);
    setResultCode(null);
    setResultMessage(null);
    setProof(null);
    setPublicSignals(null);
  };

  return {
    loading,
    error,
    result,
    resultCode,
    resultMessage,
    proof,
    publicSignals,
    generateAndVerifyProof,
    reset,
    circuitReady,
  };
}

export default useCircuitVerification;

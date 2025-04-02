import * as fs from 'fs';
import * as path from 'path';
import { groth16 } from 'snarkjs';

/**
 * CircuitTestFramework provides utilities for testing Circom circuits
 */
export class CircuitTestFramework {
  /**
   * Generate a proof for a given circuit and input
   * @param wasmPath Path to the WASM file
   * @param zkeyPath Path to the zkey file
   * @param input Circuit input
   * @returns Promise containing the proof and public signals
   */
  public static async generateProof(
    wasmPath: string,
    zkeyPath: string,
    input: any
  ): Promise<{ proof: any; publicSignals: string[] }> {
    try {
      if (!fs.existsSync(wasmPath)) {
        throw new Error(`WASM file not found at: ${wasmPath}`);
      }

      if (!fs.existsSync(zkeyPath)) {
        throw new Error(`zkey file not found at: ${zkeyPath}`);
      }

      console.log(`Generating proof using wasm: ${wasmPath}`);
      console.log(`Using zkey: ${zkeyPath}`);

      const { proof, publicSignals } = await groth16.fullProve(input, wasmPath, zkeyPath);
      return { proof, publicSignals };
    } catch (error) {
      console.error('Error generating proof:', error);
      throw new Error(`Failed to generate proof: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Verify a proof using the verification key
   * @param verificationKeyPath Path to the verification key file
   * @param proof The proof to verify
   * @param publicSignals The public signals from proof generation
   * @returns Promise with boolean indicating verification success
   */
  public static async verifyProof(verificationKeyPath: string, proof: any, publicSignals: string[]): Promise<boolean> {
    try {
      if (!fs.existsSync(verificationKeyPath)) {
        throw new Error(`Verification key file not found at: ${verificationKeyPath}`);
      }

      console.log(`Verifying proof using verification key: ${verificationKeyPath}`);

      // Load the verification key
      const verificationKey = JSON.parse(fs.readFileSync(verificationKeyPath, 'utf-8'));

      // Verify the proof
      return await groth16.verify(verificationKey, publicSignals, proof);
    } catch (error) {
      console.error('Error verifying proof:', error);
      throw new Error(`Failed to verify proof: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Custom JSON replacer function to handle BigInt values
   */
  private static bigIntReplacer(key: string, value: any): any {
    if (typeof value === 'bigint') {
      return value.toString();
    }
    return value;
  }

  /**
   * Run a full test case for a circuit
   * @param input Circuit input
   * @param expectedResultCode Expected result code in the public signals
   * @param wasmPath Path to the WASM file
   * @param zkeyPath Path to the zkey file
   * @param verificationKeyPath Path to the verification key file
   * @returns Promise with boolean indicating test success
   */
  public static async testCircuit(
    input: any,
    expectedResultCode: number,
    wasmPath: string,
    zkeyPath: string,
    verificationKeyPath: string
  ): Promise<boolean> {
    try {
      // Check if files exist
      if (!fs.existsSync(wasmPath)) {
        console.error(`❌ WASM file not found at: ${wasmPath}`);
        return false;
      }

      if (!fs.existsSync(zkeyPath)) {
        console.error(`❌ zkey file not found at: ${zkeyPath}`);
        return false;
      }

      if (!fs.existsSync(verificationKeyPath)) {
        console.error(`❌ Verification key file not found at: ${verificationKeyPath}`);
        return false;
      }

      console.log('Testing with input:', JSON.stringify(input, this.bigIntReplacer, 2));

      // Generate proof
      const { proof, publicSignals } = await this.generateProof(wasmPath, zkeyPath, input);

      // Verify the proof is valid
      const isValid = await this.verifyProof(verificationKeyPath, proof, publicSignals);

      if (!isValid) {
        console.error('❌ Proof verification failed');
        return false;
      }

      // Check result code matches expected value
      const resultCode = parseInt(publicSignals[0], 10);
      console.log(`Result code: ${resultCode}, Expected: ${expectedResultCode}`);

      if (resultCode !== expectedResultCode) {
        console.error(`❌ Result code mismatch: Expected ${expectedResultCode}, got ${resultCode}`);
        return false;
      }

      console.log('✅ Test passed successfully');
      return true;
    } catch (error) {
      console.error('❌ Test failed with error:', error);
      return false;
    }
  }
}

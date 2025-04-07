import { Contract } from 'ethers';

import { BaseErrorHandler } from './BaseErrorHandler';

/**
 * Error handler for the ZKP contract
 */
export class ZKPErrorHandler extends BaseErrorHandler {
  /**
   * Creates a new instance of the ZKPErrorHandler
   * @param contract The ZKP contract instance
   */
  constructor(contract: Contract) {
    super(contract);
  }

  /**
   * Directly decode an InvalidProof error
   * @param data The error data
   * @returns The decoded error arguments and a user-friendly message
   */
  public decodeInvalidProofError(data: string): { args: Record<string, any>; message: string } {
    try {
      const args = this.decodeKnownError('InvalidProof', data);
      return {
        args,
        message: 'Invalid proof: The zero-knowledge proof is invalid',
      };
    } catch (error) {
      throw new Error(`Failed to decode InvalidProof error: ${error.message}`);
    }
  }

  /**
   * Directly decode a VerificationFailed error
   * @param data The error data
   * @returns The decoded error arguments and a user-friendly message
   */
  public decodeVerificationFailedError(data: string): {
    args: Record<string, any>;
    message: string;
  } {
    try {
      const args = this.decodeKnownError('VerificationFailed', data);
      return {
        args,
        message: 'Verification failed: The proof verification has failed',
      };
    } catch (error) {
      throw new Error(`Failed to decode VerificationFailed error: ${error.message}`);
    }
  }

  /**
   * Formats an error message based on the error name and arguments
   * @param errorName The name of the error
   * @param args The error arguments
   * @returns A formatted error message
   */
  protected formatErrorMessage(errorName: string, args: Record<string, any>): string {
    // Format ZKP-specific errors
    switch (errorName) {
      case 'InvalidProof':
        return 'Invalid proof: The zero-knowledge proof is invalid';

      case 'InvalidInput':
        return 'Invalid input: The input parameters for the proof are invalid';

      case 'VerificationFailed':
        return 'Verification failed: The proof verification has failed';

      // Default case for unknown errors
      default: {
        // For custom errors, create a message from the arguments
        const argString = Object.entries(args)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ');

        return `${errorName}${argString ? ` (${argString})` : ''}`;
      }
    }
  }
}

import { Contract, ethers } from 'ethers';

import { ContractHandlerFactory, ContractType } from '../../helpers/ContractHandlerFactory';
import { ZKPErrorHandler } from '../../helpers/error-handler/ZKPErrorHandler';
import { ZKPEventParser } from '../../helpers/event-parser/ZKPEventParser';
import { signer } from '../../helpers/get-signer';

/**
 * Service class for interacting with the ZKP Verification Registry smart contract.
 * This class provides methods for managing ZKP verification results on the blockchain.
 */
export class ZKPVerificationRegistryService {
  private contract: Contract;
  private errorHandler: ZKPErrorHandler;
  private eventParser: ZKPEventParser;

  /**
   * Creates a new instance of the ZKPVerificationRegistryService.
   * @param contractAddress The address of the ZKP Verification Registry contract.
   * @param abi The ABI of the ZKP Verification Registry contract.
   */
  constructor(contractAddress: string, abi: any) {
    this.contract = new Contract(contractAddress, abi, signer);

    // Initialize error handler and event parser
    this.errorHandler = ContractHandlerFactory.createErrorHandler(
      ContractType.ZKP,
      this.contract
    ) as ZKPErrorHandler;

    this.eventParser = ContractHandlerFactory.createEventParser(
      ContractType.ZKP,
      this.contract
    ) as ZKPEventParser;
  }

  /**
   * Registers a new verification result.
   * @param subject Address of the subject being verified.
   * @param verificationType Type of verification (e.g., "age", "hash", "fhir").
   * @param result Result of the verification.
   * @param expirationTime When the verification expires (0 = never).
   * @param metadata Additional metadata about the verification.
   * @returns A promise that resolves to the transaction receipt and verification ID.
   */
  async registerVerification(
    subject: string,
    verificationType: string,
    result: boolean,
    expirationTime: number,
    metadata: any
  ): Promise<{ verificationId: string; transactionReceipt: any }> {
    try {
      // Generate a unique verification ID using a hash of subject, type, and timestamp
      const timestamp = Math.floor(Date.now() / 1000);
      const verificationId = ethers.keccak256(
        ethers.solidityPacked(
          ['address', 'bytes32', 'uint256'],
          [subject, ethers.encodeBytes32String(verificationType), timestamp]
        )
      );

      // Convert metadata to bytes
      const metadataBytes = ethers.toUtf8Bytes(JSON.stringify(metadata || {}));

      // Register the verification
      const tx = await this.contract.registerVerification(
        subject,
        ethers.encodeBytes32String(verificationType),
        verificationId,
        result,
        expirationTime,
        metadataBytes
      );

      const receipt = await tx.wait();
      return {
        verificationId,
        transactionReceipt: receipt,
      };
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Revokes a verification.
   * @param verificationId ID of the verification to revoke.
   * @returns A promise that resolves to the transaction receipt.
   */
  async revokeVerification(verificationId: string): Promise<any> {
    try {
      const tx = await this.contract.revokeVerification(verificationId);
      return await tx.wait();
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Authorizes a verifier for a specific verification type.
   * @param verifier Address of the verifier.
   * @param verificationType Type of verification.
   * @returns A promise that resolves to the transaction receipt.
   */
  async authorizeVerifier(verifier: string, verificationType: string): Promise<any> {
    try {
      const tx = await this.contract.authorizeVerifier(
        verifier,
        ethers.encodeBytes32String(verificationType)
      );
      return await tx.wait();
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Revokes a verifier's authorization for a specific verification type.
   * @param verifier Address of the verifier.
   * @param verificationType Type of verification.
   * @returns A promise that resolves to the transaction receipt.
   */
  async revokeVerifierAuthorization(verifier: string, verificationType: string): Promise<any> {
    try {
      const tx = await this.contract.revokeVerifierAuthorization(
        verifier,
        ethers.encodeBytes32String(verificationType)
      );
      return await tx.wait();
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Adds an administrator.
   * @param admin Address of the administrator to add.
   * @returns A promise that resolves to the transaction receipt.
   */
  async addAdministrator(admin: string): Promise<any> {
    try {
      const tx = await this.contract.addAdministrator(admin);
      return await tx.wait();
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Removes an administrator.
   * @param admin Address of the administrator to remove.
   * @returns A promise that resolves to the transaction receipt.
   */
  async removeAdministrator(admin: string): Promise<any> {
    try {
      const tx = await this.contract.removeAdministrator(admin);
      return await tx.wait();
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Gets a verification result.
   * @param verificationId ID of the verification.
   * @returns A promise that resolves to the verification result.
   */
  async getVerification(verificationId: string): Promise<any> {
    try {
      const verification = await this.contract.getVerification(verificationId);

      // Parse metadata from bytes to JSON
      let metadata = {};
      try {
        if (verification.metadata && verification.metadata.length > 2) {
          metadata = JSON.parse(ethers.toUtf8String(verification.metadata));
        }
      } catch (e) {
        console.warn('Failed to parse verification metadata:', e);
      }

      return {
        subject: verification.subject,
        verificationType: verification.verificationType,
        verificationId: verification.verificationId,
        timestamp: Number(verification.timestamp),
        expirationTime: Number(verification.expirationTime),
        result: verification.result,
        revoked: verification.revoked,
        metadata,
      };
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Checks if a verification is valid.
   * @param verificationId ID of the verification.
   * @returns A promise that resolves to a boolean indicating if the verification is valid.
   */
  async isVerificationValid(verificationId: string): Promise<boolean> {
    try {
      return await this.contract.isVerificationValid(verificationId);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Gets all verifications for a subject.
   * @param subject Address of the subject.
   * @returns A promise that resolves to an array of verification IDs.
   */
  async getSubjectVerifications(subject: string): Promise<string[]> {
    try {
      return await this.contract.getSubjectVerifications(subject);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Checks if a verifier is authorized for a specific verification type.
   * @param verifier Address of the verifier.
   * @param verificationType Type of verification.
   * @returns A promise that resolves to a boolean indicating if the verifier is authorized.
   */
  async isVerifierAuthorized(verifier: string, verificationType: string): Promise<boolean> {
    try {
      return await this.contract.isVerifierAuthorized(
        verifier,
        ethers.encodeBytes32String(verificationType)
      );
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Checks if an address is an administrator.
   * @param admin Address to check.
   * @returns A promise that resolves to a boolean indicating if the address is an administrator.
   */
  async isAdministrator(admin: string): Promise<boolean> {
    try {
      return await this.contract.isAdministrator(admin);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Checks if a specific error occurred
   * @param error The error to check
   * @param errorName The name of the error to check for
   * @returns True if the error matches the specified name
   */
  isErrorType(error: any, errorName: string): boolean {
    return this.errorHandler.isErrorType(error, errorName);
  }

  /**
   * Listens for events from the contract
   * @param eventName The name of the event to listen for
   * @param filter Optional filter for the event
   * @param callback Callback function to handle the parsed event
   * @returns A function to remove the event listener
   */
  listenForEvents(eventName: string, filter: any = {}, callback: (event: any) => void): () => void {
    return this.eventParser.listenForEvents(eventName, filter, callback);
  }
}

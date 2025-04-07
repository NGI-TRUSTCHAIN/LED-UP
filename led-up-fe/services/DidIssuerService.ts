import { Contract, ContractRunner, ethers } from 'ethers';

import { ContractHandlerFactory, ContractType } from '@/helpers/ContractHandlerFactory';
import { DidIssuerErrorHandler } from '@/helpers/error-handler/DidIssuerErrorHandler';
import { DidIssuerEventParser } from '@/helpers/event-parser/DidIssuerEventParser';

/**
 * Service class for interacting with the DID Issuer smart contract.
 * This class provides methods for issuing and managing credentials.
 */
export class DidIssuerService {
  private contract: Contract;
  private errorHandler: DidIssuerErrorHandler;
  private eventParser: DidIssuerEventParser;

  /**
   * Creates a new instance of the DidIssuerService.
   * @param contractAddress The address of the DID Issuer contract.
   * @param abi The ABI of the DID Issuer contract.
   */
  constructor(contractAddress: string, abi: any, signer: ContractRunner) {
    this.contract = new Contract(contractAddress, abi, signer);

    // Initialize error handler and event parser
    this.errorHandler = ContractHandlerFactory.createErrorHandler(
      ContractType.DID_ISSUER,
      this.contract
    ) as DidIssuerErrorHandler;

    this.eventParser = ContractHandlerFactory.createEventParser(
      ContractType.DID_ISSUER,
      this.contract
    ) as DidIssuerEventParser;
  }

  /**
   * Issues a credential to a subject.
   * @param credentialType The type of credential to issue.
   * @param subject The DID of the subject.
   * @param credentialId The unique identifier of the credential (bytes32).
   * @returns A promise that resolves to the formatted transaction receipt.
   */
  async issueCredential(credentialType: string, subject: string, credentialId: string): Promise<Record<string, any>> {
    try {
      const tx = await this.contract.issueCredential(credentialType, subject, credentialId);
      const receipt = await tx.wait();

      // Format the receipt with events
      return this.eventParser.formatTransactionReceipt(receipt);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Helper method to issue a credential with additional metadata.
   * This is a wrapper around the issueCredential method that generates a credentialId from the provided data.
   * @param issuerDid The DID of the issuer.
   * @param subjectDid The DID of the subject.
   * @param credentialType The type of credential to issue.
   * @param metadata Additional metadata for the credential.
   * @returns A promise that resolves to the formatted transaction receipt.
   */
  async issueCredentialWithMetadata(
    issuerDid: string,
    subjectDid: string,
    credentialType: string,
    metadata: string
  ): Promise<Record<string, any>> {
    try {
      // Generate a unique credentialId from the provided data
      const credentialId = ethers.keccak256(
        ethers.concat([
          ethers.toUtf8Bytes(issuerDid),
          ethers.toUtf8Bytes(subjectDid),
          ethers.toUtf8Bytes(credentialType),
          ethers.toUtf8Bytes(metadata),
          ethers.toUtf8Bytes(Date.now().toString()),
        ])
      );

      // Issue the credential
      return await this.issueCredential(credentialType, subjectDid, credentialId);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Checks if a credential is valid.
   * @param credentialId The unique identifier of the credential (bytes32).
   * @returns A promise that resolves to a boolean indicating if the credential is valid.
   */
  async isCredentialValid(credentialId: string): Promise<boolean> {
    try {
      return await this.contract.isCredentialValid(credentialId);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Helper method to check if a credential is valid using metadata.
   * This is a wrapper around the isCredentialValid method that generates a credentialId from the provided data.
   * @param issuerDid The DID of the issuer.
   * @param subjectDid The DID of the subject.
   * @param credentialType The type of credential.
   * @param metadata Additional metadata for the credential.
   * @returns A promise that resolves to a boolean indicating if the credential is valid.
   */
  async isCredentialValidWithMetadata(
    issuerDid: string,
    subjectDid: string,
    credentialType: string,
    metadata: string
  ): Promise<boolean> {
    try {
      // Generate the credentialId from the provided data
      const credentialId = ethers.keccak256(
        ethers.concat([
          ethers.toUtf8Bytes(issuerDid),
          ethers.toUtf8Bytes(subjectDid),
          ethers.toUtf8Bytes(credentialType),
          ethers.toUtf8Bytes(metadata),
        ])
      );

      // Check if the credential is valid
      return await this.isCredentialValid(credentialId);
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

import { Contract } from 'ethers';

import { ContractHandlerFactory, ContractType } from '../../helpers/ContractHandlerFactory';
import { DidVerifierErrorHandler } from '../../helpers/error-handler/DidVerifierErrorHandler';
import { DidVerifierEventParser } from '../../helpers/event-parser/DidVerifierEventParser';
import { signer } from '../../helpers/get-signer';

/**
 * Service class for interacting with the DID Verifier smart contract.
 * This class provides methods to verify DIDs and their associated data.
 */
export class DidVerifierService {
  private contract: Contract;
  private errorHandler: DidVerifierErrorHandler;
  private eventParser: DidVerifierEventParser;

  /**
   * Creates a new instance of the DidVerifierService.
   * @param contractAddress The address of the DID Verifier contract.
   * @param abi The ABI of the DID Verifier contract.
   */
  constructor(contractAddress: string, abi: any) {
    this.contract = new Contract(contractAddress, abi, signer);

    // Initialize error handler and event parser
    this.errorHandler = ContractHandlerFactory.createErrorHandler(
      ContractType.DID_VERIFIER,
      this.contract
    ) as DidVerifierErrorHandler;

    this.eventParser = ContractHandlerFactory.createEventParser(
      ContractType.DID_VERIFIER,
      this.contract
    ) as DidVerifierEventParser;
  }

  /**
   * Verifies a credential for a DID.
   * @param credentialType The type of credential to verify.
   * @param issuer The address of the issuer.
   * @param subject The DID of the subject.
   * @returns A promise that resolves to a boolean indicating if the credential is verified.
   */
  async verifyCredential(
    credentialType: string,
    issuer: string,
    subject: string
  ): Promise<boolean> {
    try {
      return await this.contract.verifyCredential(credentialType, issuer, subject);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Sets the trust status of an issuer for a specific credential type.
   * @param credentialType The type of credential.
   * @param issuer The address of the issuer.
   * @param trusted Boolean indicating if the issuer should be trusted.
   * @returns A promise that resolves to the formatted transaction receipt.
   */
  async setIssuerTrustStatus(
    credentialType: string,
    issuer: string,
    trusted: boolean
  ): Promise<Record<string, any>> {
    try {
      const tx = await this.contract.setIssuerTrustStatus(credentialType, issuer, trusted);
      const receipt = await tx.wait();

      // Format the receipt with events
      return this.eventParser.formatTransactionReceipt(receipt);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Checks if an issuer is trusted for a specific credential type.
   * @param credentialType The type of credential.
   * @param issuer The address of the issuer.
   * @returns A promise that resolves to a boolean indicating if the issuer is trusted.
   */
  async isIssuerTrusted(credentialType: string, issuer: string): Promise<boolean> {
    try {
      return await this.contract.isIssuerTrusted(credentialType, issuer);
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

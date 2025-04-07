import { Contract, ContractRunner } from 'ethers';

import { ContractHandlerFactory, ContractType } from '@/helpers/ContractHandlerFactory';
import { ConsentErrorHandler } from '@/helpers/error-handler/ConsentErrorHandler';
import { ConsentEventParser } from '@/helpers/event-parser/ConsentEventParser';

/**
 * Service class for interacting with the Consent Management smart contract.
 * This class provides methods for managing consent between producers and providers.
 */
export class ConsentService {
  private contract: Contract;
  private errorHandler: ConsentErrorHandler;
  private eventParser: ConsentEventParser;

  /**
   * Creates a new instance of the ConsentService.
   * @param contractAddress The address of the Consent Management contract.
   * @param abi The ABI of the Consent Management contract.
   */
  constructor(contractAddress: string, abi: any, signer: ContractRunner) {
    this.contract = new Contract(contractAddress, abi, signer);

    // Initialize error handler and event parser
    this.errorHandler = ContractHandlerFactory.createErrorHandler(
      ContractType.CONSENT,
      this.contract
    ) as ConsentErrorHandler;

    this.eventParser = ContractHandlerFactory.createEventParser(
      ContractType.CONSENT,
      this.contract
    ) as ConsentEventParser;
  }

  /**
   * Grants consent to a provider.
   * @param providerDid The DID of the provider receiving consent.
   * @param purpose The purpose for which consent is granted.
   * @param expiryTime Optional timestamp when consent expires (0 for no expiry).
   * @returns A promise that resolves to the formatted transaction receipt.
   */
  async grantConsent(providerDid: string, purpose: string, expiryTime: number): Promise<Record<string, any>> {
    try {
      const tx = await this.contract.grantConsent(providerDid, purpose, expiryTime);
      const receipt = await tx.wait();

      // Format the receipt with events
      return this.eventParser.formatTransactionReceipt(receipt);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Revokes previously granted consent.
   * @param providerDid The DID of the provider.
   * @param reason The reason for revoking consent.
   * @returns A promise that resolves to the formatted transaction receipt.
   */
  async revokeConsent(providerDid: string, reason: string): Promise<Record<string, any>> {
    try {
      const tx = await this.contract.revokeConsent(providerDid, reason);
      const receipt = await tx.wait();

      // Format the receipt with events
      return this.eventParser.formatTransactionReceipt(receipt);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Queries consent status between a producer and provider.
   * @param producerDid The DID of the consent giver.
   * @param providerDid The DID of the consent receiver.
   * @returns A promise that resolves to an object containing the consent status, timestamp, and purpose.
   */
  async queryConsent(
    producerDid: string,
    providerDid: string
  ): Promise<{ status: number; timestamp: number; purpose: string }> {
    try {
      const result = await this.contract.queryConsent(producerDid, providerDid);
      return {
        status: result[0],
        timestamp: result[1],
        purpose: result[2],
      };
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Checks if valid consent exists between producer and provider.
   * @param producerDid The DID of the consent giver.
   * @param providerDid The DID of the consent receiver.
   * @returns A promise that resolves to a boolean indicating if valid consent exists.
   */
  async hasValidConsent(producerDid: string, providerDid: string): Promise<boolean> {
    try {
      return await this.contract.hasValidConsent(producerDid, providerDid);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Transfers ownership of the contract to a new owner.
   * @param newOwner The address of the new owner.
   * @returns A promise that resolves to the formatted transaction receipt.
   */
  async transferOwnership(newOwner: string): Promise<Record<string, any>> {
    try {
      const tx = await this.contract.transferOwnership(newOwner);
      const receipt = await tx.wait();

      // Format the receipt with events
      return this.eventParser.formatTransactionReceipt(receipt);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Renounces ownership of the contract.
   * @returns A promise that resolves to the formatted transaction receipt.
   */
  async renounceOwnership(): Promise<Record<string, any>> {
    try {
      const tx = await this.contract.renounceOwnership();
      const receipt = await tx.wait();

      // Format the receipt with events
      return this.eventParser.formatTransactionReceipt(receipt);
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

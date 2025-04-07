import { Contract } from 'ethers';

import { ContractHandlerFactory, ContractType } from '../../helpers/ContractHandlerFactory';
import { CompensationErrorHandler } from '../../helpers/error-handler/CompensationErrorHandler';
import { CompensationEventParser } from '../../helpers/event-parser/CompensationEventParser';
import { signer } from '../../helpers/get-signer';
import { ProcessPaymentParams } from '../../types';

/**
 * Service class for interacting with the Compensation smart contract.
 * This class provides methods for managing payments and compensation.
 */
export class CompensationService {
  private contract: Contract;
  private errorHandler: CompensationErrorHandler;
  private eventParser: CompensationEventParser;

  /**
   * Creates a new instance of the CompensationService.
   * @param contractAddress The address of the Compensation contract.
   * @param abi The ABI of the Compensation contract.
   */
  constructor(contractAddress: string, abi: any) {
    this.contract = new Contract(contractAddress, abi, signer);

    // Initialize error handler and event parser
    this.errorHandler = ContractHandlerFactory.createErrorHandler(
      ContractType.COMPENSATION,
      this.contract
    ) as CompensationErrorHandler;

    this.eventParser = ContractHandlerFactory.createEventParser(
      ContractType.COMPENSATION,
      this.contract
    ) as CompensationEventParser;
  }

  /**
   * Processes a payment.
   * @param params The parameters for processing the payment.
   * @returns A promise that resolves to the formatted transaction receipt.
   */
  async processPayment(params: ProcessPaymentParams): Promise<Record<string, any>> {
    try {
      const { producer, recordId, dataSize, consumerDid } = params;

      const tx = await this.contract.processPayment(producer, recordId, dataSize, consumerDid);
      const receipt = await tx.wait();

      return this.eventParser.formatTransactionReceipt(receipt);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Withdraws a producer's balance.
   * @param amount The amount to withdraw.
   * @returns A promise that resolves to the formatted transaction receipt.
   */
  async withdrawProducerBalance(amount: number): Promise<Record<string, any>> {
    try {
      const tx = await this.contract.withdrawProducerBalance(amount);
      const receipt = await tx.wait();

      return this.eventParser.formatTransactionReceipt(receipt);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Withdraws service fees.
   * @param amount The amount to withdraw.
   * @returns A promise that resolves to the formatted transaction receipt.
   */
  async withdrawServiceFees(amount: number): Promise<Record<string, any>> {
    try {
      const tx = await this.contract.withdrawServiceFee(amount);
      const receipt = await tx.wait();

      return this.eventParser.formatTransactionReceipt(receipt);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Changes the service fee.
   * @param newServiceFee The new service fee.
   * @returns A promise that resolves to the formatted transaction receipt.
   */
  async changeServiceFee(newServiceFee: number): Promise<Record<string, any>> {
    try {
      const tx = await this.contract.changeServiceFee(newServiceFee);
      const receipt = await tx.wait();

      return this.eventParser.formatTransactionReceipt(receipt);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Changes the unit price.
   * @param newUnitPrice The new unit price.
   * @returns A promise that resolves to the formatted transaction receipt.
   */
  async changeUnitPrice(newUnitPrice: number): Promise<Record<string, any>> {
    try {
      const tx = await this.contract.changeUnitPrice(newUnitPrice);
      const receipt = await tx.wait();

      return this.eventParser.formatTransactionReceipt(receipt);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Sets the minimum withdraw amount.
   * @param amount The minimum withdraw amount.
   * @returns A promise that resolves to the formatted transaction receipt.
   */
  async setMinimumWithdrawAmount(amount: number): Promise<Record<string, any>> {
    try {
      const tx = await this.contract.setMinimumWithdrawAmount(amount);
      const receipt = await tx.wait();

      return this.eventParser.formatTransactionReceipt(receipt);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Changes the token address.
   * @param tokenAddress The new token address.
   * @returns A promise that resolves to the formatted transaction receipt.
   */
  async changeTokenAddress(tokenAddress: string): Promise<Record<string, any>> {
    try {
      const tx = await this.contract.changeTokenAddress(tokenAddress);
      const receipt = await tx.wait();

      return this.eventParser.formatTransactionReceipt(receipt);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Pauses the service.
   * @returns A promise that resolves to the formatted transaction receipt.
   */
  async pauseService(): Promise<Record<string, any>> {
    try {
      const tx = await this.contract.pauseService();
      const receipt = await tx.wait();

      return this.eventParser.formatTransactionReceipt(receipt);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Unpauses the service.
   * @returns A promise that resolves to the formatted transaction receipt.
   */
  async unpauseService(): Promise<Record<string, any>> {
    try {
      const tx = await this.contract.unpauseService();
      const receipt = await tx.wait();

      return this.eventParser.formatTransactionReceipt(receipt);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Gets the service fee.
   * @returns A promise that resolves to the service fee.
   */
  async getServiceFee(): Promise<number> {
    try {
      return await this.contract.getServiceFee();
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Gets the unit price.
   * @returns A promise that resolves to the unit price.
   */
  async getUnitPrice(): Promise<number> {
    try {
      return await this.contract.getUnitPrice();
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Gets the minimum withdraw amount.
   * @returns A promise that resolves to the minimum withdraw amount.
   */
  async getMinimumWithdrawAmount(): Promise<number> {
    try {
      return await this.contract.getMinimumWithdrawAmount();
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Gets the token address.
   * @returns A promise that resolves to the token address.
   */
  async getTokenAddress(): Promise<string> {
    try {
      return await this.contract.getPaymentTokenAddress();
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Gets the producer's balance.
   * @param producer The address of the producer.
   * @returns A promise that resolves to the producer's balance.
   */
  async getProducerBalance(producer: string): Promise<number> {
    try {
      return await this.contract.getProducerBalance(producer);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Gets the provider's balance.
   * @returns A promise that resolves to the provider's balance.
   */
  async getProviderBalance(): Promise<number> {
    try {
      return await this.contract.getProviderBalance();
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Gets the service fee balance.
   * @returns A promise that resolves to the service fee balance.
   */
  async getServiceFeeBalance(): Promise<number> {
    try {
      return await this.contract.serviceFeeBalance();
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Gets the pause state of the contract.
   * @returns A promise that resolves to the pause state.
   */
  async getPauseState(): Promise<boolean> {
    try {
      return await this.contract.paused();
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Verifies if a payment has been processed.
   * @param recordId The ID of the record to verify.
   * @returns A promise that resolves to a boolean indicating if the payment has been processed.
   */
  async verifyPayment(recordId: string): Promise<boolean> {
    try {
      return await this.contract.verifyPayment(recordId);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Removes a producer.
   * @param producer The address of the producer to remove.
   * @returns A promise that resolves to the formatted transaction receipt.
   */
  async removeProducer(producer: string): Promise<Record<string, any>> {
    try {
      const tx = await this.contract.removeProducer(producer);
      const receipt = await tx.wait();

      return this.eventParser.formatTransactionReceipt(receipt);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Gets the DID of a producer.
   * @param producer The address of the producer.
   * @returns A promise that resolves to the producer's DID.
   */
  async getProducerDid(producer: string): Promise<string> {
    try {
      return await this.contract.getProducerDid(producer);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Gets the DID of a consumer.
   * @param consumer The address of the consumer.
   * @returns A promise that resolves to the consumer's DID.
   */
  async getConsumerDid(consumer: string): Promise<string> {
    try {
      return await this.contract.getConsumerDid(consumer);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Updates the DidAuth contract address.
   * @param didAuthAddress The new DidAuth contract address.
   * @returns A promise that resolves to the formatted transaction receipt.
   */
  async updateDidAuthAddress(didAuthAddress: string): Promise<Record<string, any>> {
    try {
      const tx = await this.contract.updateDidAuthAddress(didAuthAddress);
      const receipt = await tx.wait();

      return this.eventParser.formatTransactionReceipt(receipt);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Checks if a producer exists.
   * @param producer The address of the producer.
   * @returns A promise that resolves to a boolean indicating if the producer exists.
   */
  async producerExists(producer: string): Promise<boolean> {
    try {
      return await this.contract.producerExist(producer);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Transfers ownership of the contract.
   * @param newOwner The address of the new owner.
   * @returns A promise that resolves to the formatted transaction receipt.
   */
  async transferOwnership(newOwner: string): Promise<Record<string, any>> {
    try {
      const tx = await this.contract.transferOwnership(newOwner);
      const receipt = await tx.wait();

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

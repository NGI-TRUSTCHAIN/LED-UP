import { Contract, ContractRunner } from 'ethers';

import { ContractHandlerFactory, ContractType } from '@/helpers/ContractHandlerFactory';
import { DataRegistryErrorHandler } from '@/helpers/error-handler/DataRegistryErrorHandler';
import { DataRegistryEventParser } from '@/helpers/event-parser/DataRegistryEventParser';
import { Metadata, ProducerRegistrationParam, RecordSchema } from '@/types';

/**
 * Service class for interacting with the Data Registry smart contract.
 * This class provides methods for managing data records on the blockchain,
 * including registration, updates, sharing, and querying of health records.
 */
export class DataRegistryService {
  private contract: Contract;
  private errorHandler: DataRegistryErrorHandler;
  private eventParser: DataRegistryEventParser;

  /**
   * Creates a new instance of the DataRegistryService.
   * @param contractAddress The address of the Data Registry contract.
   * @param abi The ABI of the Data Registry contract.
   * @param signer The signer to use
   */
  constructor(contractAddress: string, abi: any, signer: ContractRunner) {
    this.contract = new Contract(contractAddress, abi, signer);

    // Initialize error handler and event parser
    this.errorHandler = ContractHandlerFactory.createErrorHandler(
      ContractType.DATA_REGISTRY,
      this.contract
    ) as DataRegistryErrorHandler;

    this.eventParser = ContractHandlerFactory.createEventParser(
      ContractType.DATA_REGISTRY,
      this.contract
    ) as DataRegistryEventParser;
  }

  /**
   * Changes the pause state of the contract.
   * @param pause Whether to pause or unpause the contract.
   * @returns A promise that resolves to the formatted transaction receipt.
   * @throws Will throw an error if the transaction fails.
   */
  async changePauseState(pause: boolean): Promise<Record<string, any>> {
    try {
      const tx = await this.contract.changePauseState(pause);
      const receipt = await tx.wait();

      // Format the receipt with events
      return this.eventParser.formatTransactionReceipt(receipt);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Gets the pause state of the contract.
   * @returns A promise that resolves to a boolean indicating if the contract is paused.
   * @throws Will throw an error if the query fails.
   */
  async getPauseState(): Promise<boolean> {
    try {
      return await this.contract.paused();
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Registers a producer on the blockchain.
   * @param status The status of the producer.
   * @param consent The consent status of the producer.
   * @returns A promise that resolves to the formatted transaction receipt.
   * @throws Will throw an error if the transaction fails.
   */
  async registerProducer(status: number, consent: number): Promise<Record<string, any>> {
    try {
      const tx = await this.contract.registerProducer(status, consent);
      const receipt = await tx.wait();

      // Format the receipt with events
      return this.eventParser.formatTransactionReceipt(receipt);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Registers a producer record on the blockchain.
   * @param params The parameters for registering the producer record.
   * @returns A promise that resolves to the formatted transaction receipt.
   * @throws Will throw an error if the transaction fails.
   */
  async registerProducerRecord(params: ProducerRegistrationParam): Promise<Record<string, any>> {
    try {
      const { ownerDid, recordId, producer, signature, resourceType, consent, metadata } = params;
      const tx = await this.contract.registerProducerRecord(
        ownerDid,
        recordId,
        producer,
        signature,
        resourceType,
        consent,
        metadata
      );
      const receipt = await tx.wait();

      // Format the receipt with events
      return this.eventParser.formatTransactionReceipt(receipt);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Updates a producer record on the blockchain.
   * @param params The parameters for updating the producer record.
   * @returns A promise that resolves to the formatted transaction receipt.
   * @throws Will throw an error if the transaction fails.
   */
  async updateProducerRecord(params: ProducerRegistrationParam): Promise<Record<string, any>> {
    try {
      const { recordId, producer, signature, resourceType, status, consent, metadata, updaterDid } = params;
      const tx = await this.contract.updateProducerRecord(
        recordId,
        producer,
        signature,
        resourceType,
        status,
        consent,
        metadata,
        updaterDid
      );
      const receipt = await tx.wait();

      // Format the receipt with events
      return this.eventParser.formatTransactionReceipt(receipt);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Updates a producer record's metadata.
   * @param producer The address of the producer.
   * @param recordId The ID of the record.
   * @param metadata The new metadata.
   * @returns A promise that resolves to the formatted transaction receipt.
   * @throws Will throw an error if the transaction fails.
   */
  async updateProducerRecordMetadata(
    producer: string,
    recordId: string,
    metadata: Metadata
  ): Promise<Record<string, any>> {
    try {
      const tx = await this.contract.updateProducerRecordMetadata(producer, recordId, metadata);
      const receipt = await tx.wait();

      // Format the receipt with events
      return this.eventParser.formatTransactionReceipt(receipt);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Updates a producer record's status.
   * @param producer The address of the producer.
   * @param status The new status.
   * @returns A promise that resolves to the formatted transaction receipt.
   * @throws Will throw an error if the transaction fails.
   */
  async updateProducerRecordStatus(producer: string, status: number): Promise<Record<string, any>> {
    try {
      const tx = await this.contract.updateProducerRecordStatus(producer, status);
      const receipt = await tx.wait();

      // Format the receipt with events
      return this.eventParser.formatTransactionReceipt(receipt);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Updates a producer's consent status.
   * @param producer The address of the producer.
   * @param status The new consent status.
   * @returns A promise that resolves to the formatted transaction receipt.
   * @throws Will throw an error if the transaction fails.
   */
  async updateProducerConsent(producer: string, status: number): Promise<Record<string, any>> {
    try {
      const tx = await this.contract.updateProducerConsent(producer, status);
      const receipt = await tx.wait();

      // Format the receipt with events
      return this.eventParser.formatTransactionReceipt(receipt);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Updates the provider's metadata.
   * @param metadata The new metadata.
   * @returns A promise that resolves to the formatted transaction receipt.
   * @throws Will throw an error if the transaction fails.
   */
  async updateProviderMetadata(metadata: Metadata): Promise<Record<string, any>> {
    try {
      const tx = await this.contract.updateProviderMetadata(metadata);
      const receipt = await tx.wait();

      // Format the receipt with events
      return this.eventParser.formatTransactionReceipt(receipt);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Updates the provider's record schema.
   * @param schemaRef The new schema reference.
   * @returns A promise that resolves to the formatted transaction receipt.
   * @throws Will throw an error if the transaction fails.
   */
  async updateProviderRecordSchema(schemaRef: RecordSchema): Promise<Record<string, any>> {
    try {
      const tx = await this.contract.updateProviderRecordSchema(schemaRef);
      const receipt = await tx.wait();

      // Format the receipt with events
      return this.eventParser.formatTransactionReceipt(receipt);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Shares data with a consumer.
   * @param recordId The ID of the record to share.
   * @param consumerDid The DID of the consumer to share with.
   * @param ownerDid The DID of the owner sharing the data.
   * @returns A promise that resolves to the formatted transaction receipt.
   * @throws Will throw an error if the transaction fails.
   */
  async shareData(recordId: string, consumerDid: string, ownerDid: string): Promise<Record<string, any>> {
    try {
      const tx = await this.contract.shareData(recordId, consumerDid, ownerDid);
      const receipt = await tx.wait();

      // Format the receipt with events
      return this.eventParser.formatTransactionReceipt(receipt);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Verifies data for a specific record.
   * @param recordId The ID of the record to verify.
   * @param verifierDid The DID of the verifier.
   * @returns A promise that resolves to the formatted transaction receipt.
   * @throws Will throw an error if the transaction fails.
   */
  async verifyData(recordId: string, verifierDid: string): Promise<Record<string, any>> {
    try {
      const tx = await this.contract.verifyData(recordId, verifierDid);
      const receipt = await tx.wait();

      // Format the receipt with events
      return this.eventParser.formatTransactionReceipt(receipt);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Removes a producer.
   * @param producer The address of the producer to remove.
   * @returns A promise that resolves to the formatted transaction receipt.
   * @throws Will throw an error if the transaction fails.
   */
  async removeProducerRecord(producer: string): Promise<Record<string, any>> {
    try {
      const tx = await this.contract.removeProducerRecord(producer);
      const receipt = await tx.wait();

      // Format the receipt with events
      return this.eventParser.formatTransactionReceipt(receipt);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Gets a producer record.
   * @param producer The address of the producer.
   * @param recordId The ID of the record.
   * @returns A promise that resolves to the producer record.
   * @throws Will throw an error if the query fails.
   */
  async getProducerRecord(producer: string, recordId: string): Promise<any> {
    try {
      return await this.contract.getProducerRecord(producer, recordId);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Gets a producer's records.
   * @param producer The address of the producer.
   * @returns A promise that resolves to an array containing record status, consent status, health records, record IDs, and nonce.
   * @throws Will throw an error if the query fails.
   */
  async getProducerRecords(producer: string): Promise<any> {
    try {
      return await this.contract.getProducerRecords(producer);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Gets a producer record's status.
   * @param producer The address of the producer.
   * @returns A promise that resolves to the record's status.
   * @throws Will throw an error if the query fails.
   */
  async getProducerRecordStatus(producer: string): Promise<number> {
    try {
      return await this.contract.getProducerRecordStatus(producer);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Gets a producer record's info.
   * @param producer The address of the producer.
   * @returns A promise that resolves to the record's info.
   * @throws Will throw an error if the query fails.
   */
  async getProducerRecordInfo(producer: string): Promise<any> {
    try {
      return await this.contract.getProducerRecordInfo(producer);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Gets a producer's record count.
   * @param producer The address of the producer.
   * @returns A promise that resolves to the record count.
   * @throws Will throw an error if the query fails.
   */
  async getProducerRecordCount(producer: string): Promise<number> {
    try {
      return await this.contract.getProducerRecordCount(producer);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Gets the total records count.
   * @returns A promise that resolves to the total records count.
   * @throws Will throw an error if the query fails.
   */
  async getTotalRecordsCount(): Promise<number> {
    try {
      return await this.contract.getTotalRecordsCount();
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Gets a record CID for an authorized consumer.
   * @param recordId The ID of the record.
   * @param requesterDid The DID of the requester.
   * @returns A promise that resolves to the record CID.
   * @throws Will throw an error if the query fails or the requester is not authorized.
   */
  async getRecordCid(recordId: string, requesterDid: string): Promise<string> {
    try {
      return await this.contract.getRecordCid(recordId, requesterDid);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Gets the provider's metadata.
   * @returns A promise that resolves to the provider's metadata.
   * @throws Will throw an error if the query fails.
   */
  async getProviderMetadata(): Promise<Metadata> {
    try {
      return await this.contract.getProviderMetadata();
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Gets the record schema.
   * @returns A promise that resolves to the record schema.
   * @throws Will throw an error if the query fails.
   */
  async getRecordSchema(): Promise<RecordSchema> {
    try {
      return await this.contract.getRecordSchema();
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Gets the producer's consent status.
   * @param producer The address of the producer.
   * @returns A promise that resolves to the producer's consent status.
   * @throws Will throw an error if the query fails.
   */
  async getProducerConsent(producer: string): Promise<number> {
    try {
      return await this.contract.getProducerConsent(producer);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Checks if a producer exists.
   * @param producer The address of the producer.
   * @returns A promise that resolves to a boolean indicating if the producer exists.
   * @throws Will throw an error if the query fails.
   */
  async producerExists(producer: string): Promise<boolean> {
    try {
      return await this.contract.producerExists(producer);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Checks if a consumer is authorized for a specific record.
   * @param recordId The ID of the record.
   * @param consumerDid The DID of the consumer.
   * @returns A promise that resolves to a boolean indicating if the consumer is authorized.
   * @throws Will throw an error if the query fails.
   */
  async isConsumerAuthorized(recordId: string, consumerDid: string): Promise<boolean> {
    try {
      return await this.contract.isConsumerAuthorized(recordId, consumerDid);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Gets the address associated with a DID.
   * @param did The DID to look up.
   * @returns A promise that resolves to the address associated with the DID.
   * @throws Will throw an error if the query fails.
   */
  async getAddressFromDid(did: string): Promise<string> {
    try {
      return await this.contract.getAddressFromDid(did);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Gets the DID associated with a producer address.
   * @param producer The producer address to look up.
   * @returns A promise that resolves to the DID associated with the producer address.
   * @throws Will throw an error if the query fails.
   */
  async getProducerDid(producer: string): Promise<string> {
    try {
      return await this.contract.getProducerDid(producer);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Gets the compensation contract address.
   * @returns A promise that resolves to the compensation contract address.
   * @throws Will throw an error if the query fails.
   */
  async getCompensationContractAddress(): Promise<string> {
    try {
      return await this.contract.getCompensationContractAddress();
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Updates the DidAuth contract address.
   * @param didAuthAddress The new DidAuth contract address.
   * @returns A promise that resolves to the formatted transaction receipt.
   * @throws Will throw an error if the transaction fails.
   */
  async updateDidAuthAddress(didAuthAddress: string): Promise<Record<string, any>> {
    try {
      const tx = await this.contract.updateDidAuthAddress(didAuthAddress);
      const receipt = await tx.wait();

      // Format the receipt with events
      return this.eventParser.formatTransactionReceipt(receipt);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Changes the token address.
   * @param tokenAddress The new token address.
   * @returns A promise that resolves to the formatted transaction receipt.
   * @throws Will throw an error if the transaction fails.
   */
  async changeTokenAddress(tokenAddress: string): Promise<Record<string, any>> {
    try {
      const tx = await this.contract.changeTokenAddress(tokenAddress);
      const receipt = await tx.wait();

      // Format the receipt with events
      return this.eventParser.formatTransactionReceipt(receipt);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Transfers ownership of the contract to a new owner.
   * @param newOwner The address of the new owner.
   * @returns A promise that resolves to the formatted transaction receipt.
   * @throws Will throw an error if the transaction fails.
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
   * @throws Will throw an error if the transaction fails.
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

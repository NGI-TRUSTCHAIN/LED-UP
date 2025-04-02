import { Contract } from 'ethers';

import { ContractHandlerFactory, ContractType } from '../../helpers/ContractHandlerFactory';
import { DataRegistryErrorHandler } from '../../helpers/error-handler/DataRegistryErrorHandler';
import { DataRegistryEventParser } from '../../helpers/event-parser/DataRegistryEventParser';
import { signer } from '../../helpers/get-signer';
import { Metadata, ProducerRegistrationParam, RecordSchema } from '../../types';

// Enums to match contract
export enum ResourceType {
  HEALTH_RECORD,
  CONSENT_RECORD,
  VERIFICATION_RECORD,
}

export enum AccessLevel {
  READ,
  WRITE,
  ADMIN,
}

export enum ConsentStatus {
  NOT_SET,
  GRANTED,
  REVOKED,
  EXPIRED,
}

export enum RecordStatus {
  ACTIVE,
  INACTIVE,
  SUSPENDED,
  DELETED,
}

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
   */
  constructor(contractAddress: string, abi: any) {
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
  async registerProducer(
    status: RecordStatus,
    consent: ConsentStatus
  ): Promise<Record<string, any>> {
    try {
      const tx = await this.contract.registerProducer(status, consent);
      const receipt = await tx.wait();
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
      const { recordId, producer, signature, resourceType, status, consent, metadata, updaterDid } =
        params;
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
   * Registers a record on the blockchain.
   * @param recordId The ID of the record.
   * @param cid The IPFS CID of the record.
   * @param contentHash The hash of the record content.
   * @param resourceType The type of resource.
   * @param dataSize The size of the data in bytes.
   * @returns A promise that resolves to the formatted transaction receipt.
   */
  async registerRecord(
    recordId: string,
    cid: string,
    contentHash: string,
    resourceType: ResourceType,
    dataSize: number
  ): Promise<Record<string, any>> {
    try {
      const tx = await this.contract.registerRecord(
        recordId,
        cid,
        contentHash,
        resourceType,
        dataSize
      );
      const receipt = await tx.wait();
      return this.eventParser.formatTransactionReceipt(receipt);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Updates a record on the blockchain.
   * @param recordId The ID of the record.
   * @param cid The new IPFS CID.
   * @param contentHash The new content hash.
   * @returns A promise that resolves to the formatted transaction receipt.
   */
  async updateRecord(
    recordId: string,
    cid: string,
    contentHash: string
  ): Promise<Record<string, any>> {
    try {
      const tx = await this.contract.updateRecord(recordId, cid, contentHash);
      const receipt = await tx.wait();
      return this.eventParser.formatTransactionReceipt(receipt);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Shares data with a consumer.
   * @param recordId The ID of the record.
   * @param consumerAddress The address of the consumer.
   * @param accessDuration The duration of access in seconds.
   * @returns A promise that resolves to the formatted transaction receipt.
   */
  async shareData(
    recordId: string,
    consumerAddress: string,
    accessDuration: number
  ): Promise<Record<string, any>> {
    try {
      const tx = await this.contract.shareData(recordId, consumerAddress, accessDuration);
      const receipt = await tx.wait();
      return this.eventParser.formatTransactionReceipt(receipt);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Shares data with a provider.
   * @param recordId The ID of the record.
   * @param provider The address of the provider.
   * @param accessDuration The duration of access in seconds.
   * @param accessLevel The level of access to grant.
   * @returns A promise that resolves to the formatted transaction receipt.
   */
  async shareToProvider(
    recordId: string,
    provider: string,
    accessDuration: number,
    accessLevel: AccessLevel
  ): Promise<Record<string, any>> {
    try {
      const tx = await this.contract.shareToProvider(
        recordId,
        provider,
        accessDuration,
        accessLevel
      );
      const receipt = await tx.wait();
      return this.eventParser.formatTransactionReceipt(receipt);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Revokes access to a record for a consumer.
   * @param recordId The ID of the record.
   * @param consumerAddress The address of the consumer.
   * @returns A promise that resolves to the formatted transaction receipt.
   */
  async revokeAccess(recordId: string, consumerAddress: string): Promise<Record<string, any>> {
    try {
      const tx = await this.contract.revokeAccess(recordId, consumerAddress);
      const receipt = await tx.wait();
      return this.eventParser.formatTransactionReceipt(receipt);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Triggers access to a record.
   * @param recordId The ID of the record.
   * @returns A promise that resolves to the formatted transaction receipt.
   */
  async triggerAccess(recordId: string): Promise<Record<string, any>> {
    try {
      const tx = await this.contract.triggerAccess(recordId);
      const receipt = await tx.wait();
      return this.eventParser.formatTransactionReceipt(receipt);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Adds a provider to the registry.
   * @param provider The address of the provider to add.
   * @returns A promise that resolves to the formatted transaction receipt.
   */
  async addProvider(provider: string): Promise<Record<string, any>> {
    try {
      const tx = await this.contract.addProvider(provider);
      const receipt = await tx.wait();
      return this.eventParser.formatTransactionReceipt(receipt);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Removes a provider from the registry.
   * @param provider The address of the provider to remove.
   * @returns A promise that resolves to the formatted transaction receipt.
   */
  async removeProvider(provider: string): Promise<Record<string, any>> {
    try {
      const tx = await this.contract.removeProvider(provider);
      const receipt = await tx.wait();
      return this.eventParser.formatTransactionReceipt(receipt);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Checks if a provider is authorized for a record.
   * @param provider The address of the provider.
   * @param recordId The ID of the record.
   * @returns A promise that resolves to a boolean indicating if the provider is authorized.
   */
  async isAuthorizedProvider(provider: string, recordId: string): Promise<boolean> {
    try {
      return await this.contract.isAuthorizedProvider(provider, recordId);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Updates the compensation contract address.
   * @param compensationAddress The new compensation contract address.
   * @returns A promise that resolves to the formatted transaction receipt.
   */
  async updateCompensationAddress(compensationAddress: string): Promise<Record<string, any>> {
    try {
      const tx = await this.contract.updateCompensationAddress(compensationAddress);
      const receipt = await tx.wait();
      return this.eventParser.formatTransactionReceipt(receipt);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Updates the DID Auth contract address.
   * @param didAuthAddress The new DID Auth contract address.
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
   * Verifies a record.
   * @param recordId The ID of the record to verify.
   * @returns A promise that resolves to the formatted transaction receipt.
   */
  async verifyRecord(recordId: string): Promise<Record<string, any>> {
    try {
      const tx = await this.contract.verifyRecord(recordId);
      const receipt = await tx.wait();
      return this.eventParser.formatTransactionReceipt(receipt);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Checks if a record is verified.
   * @param recordId The ID of the record.
   * @returns A promise that resolves to a boolean indicating if the record is verified.
   */
  async isRecordVerified(recordId: string): Promise<boolean> {
    try {
      return await this.contract.isRecordVerified(recordId);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Checks access for a specific record.
   * @param recordId The ID of the record.
   * @param consumerAddress The address of the consumer.
   * @returns A promise that resolves to an object containing access details.
   */
  async checkAccess(
    recordId: string,
    consumerAddress: string
  ): Promise<{
    hasAccess: boolean;
    expiration: number;
    accessLevel: AccessLevel;
    isRevoked: boolean;
  }> {
    try {
      const result = await this.contract.checkAccess(recordId, consumerAddress);
      return {
        hasAccess: result[0],
        expiration: Number(result[1]),
        accessLevel: Number(result[2]),
        isRevoked: result[3],
      };
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Gets the producer's metadata.
   * @param producer The address of the producer.
   * @returns A promise that resolves to the producer's metadata.
   */
  async getProducerMetadata(producer: string): Promise<{
    did: string;
    consent: ConsentStatus;
    entries: number;
    isActive: boolean;
    lastUpdated: number;
    nonce: number;
  }> {
    try {
      const result = await this.contract.getProducerMetadata(producer);
      return {
        did: result[0],
        consent: result[1],
        entries: result[2],
        isActive: result[3],
        lastUpdated: result[4].toNumber(),
        nonce: result[5].toNumber(),
      };
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Gets a producer's records.
   * @param producer The address of the producer.
   * @returns A promise that resolves to an array of record IDs.
   */
  async getProducerRecords(producer: string): Promise<string[]> {
    try {
      return await this.contract.getProducerRecords(producer);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Gets information about a record.
   * @param recordId The ID of the record.
   * @returns A promise that resolves to the record information.
   */
  async getRecordInfo(recordId: string): Promise<{
    producer: string;
    metadata: {
      resourceType: ResourceType;
      recordId: string;
      producer: string;
      sharedCount: number;
      updatedAt: number;
      dataSize: number;
      contentHash: string;
      cid: string;
    };
  }> {
    try {
      const result = await this.contract.getRecordInfo(recordId);
      return {
        producer: result[0],
        metadata: {
          resourceType: result[1][0],
          recordId: result[1][1],
          producer: result[1][2],
          sharedCount: result[1][3].toNumber(),
          updatedAt: result[1][4].toNumber(),
          dataSize: result[1][5].toNumber(),
          contentHash: result[1][6],
          cid: result[1][7],
        },
      };
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Gets the producer of a record.
   * @param recordId The ID of the record.
   * @returns A promise that resolves to the producer's address.
   */
  async getRecordProducer(recordId: string): Promise<string> {
    try {
      return await this.contract.getRecordProducer(recordId);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Gets the total number of records.
   * @returns A promise that resolves to the total number of records.
   */
  async getTotalRecords(): Promise<number> {
    try {
      return (await this.contract.getTotalRecords()).toNumber();
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  // TODO:

  /**
   * get producer record status
   */

  async getProducerRecordStatus(producer: string): Promise<boolean> {
    try {
      return await this.contract.getProducerRecordStatus(producer);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * getProducerRecordInfo
   */

  /**
   * Gets the compensation contract address.
   * @returns A promise that resolves to the compensation contract address.
   */
  async getCompensationAddress(): Promise<string> {
    try {
      return await this.contract.getCompensationAddress();
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

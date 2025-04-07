import { InvocationContext } from '@azure/functions';
import { Contract, LogDescription } from 'ethers';

import { DATA_REGISTRY_CONTRACT_ADDRESS } from '../../constants';
import { stringifyBigInt } from '../../helpers/bigIntStringify';
import { ContractHandlerFactory, ContractType } from '../../helpers/ContractHandlerFactory';
import DataRegistry from '../../helpers/data-registry';
import { BaseEventParser } from '../../helpers/event-parser/BaseEventParser';
import { provider } from '../../helpers/provider';
import { BlockchainRecordType } from '../../types';
import {
  BlockchainSyncState,
  getBlockchainSyncState,
  getLastProcessedBlockNumber,
  initializeBlockchainEventTables,
  storeBlockchainEvent,
  updateBlockchainSyncState,
  getBlockchainEventsByName,
  getBlockchainEventsByBlockRange,
  getLatestBlockchainEvents,
  getBlockchainEventsByTransactionHash,
  getBlockchainEventsWithParsedArgs,
} from '../db/BlockchainEventService';

/**
 * Service class for syncing and managing blockchain events.
 * This class provides methods for tracking, syncing, and querying blockchain events
 * with support for error handling, retry logic, and performance optimizations.
 * It can work with different contract types using the event-parser system.
 */
export class BlockchainSyncService {
  private readonly MAX_BLOCKS_PER_SYNC: number;
  private readonly MAX_RETRY_ATTEMPTS: number;
  private readonly RETRY_DELAY_MS: number;
  private readonly contractAddress: string;
  private readonly contractType: ContractType;
  private readonly contract: Contract;
  private readonly eventParser: BaseEventParser;

  /**
   * Creates a new instance of the BlockchainSyncService.
   * @param contractType The type of contract to sync events from.
   * @param contractAddress The address of the contract to sync events from.
   * @param maxBlocksPerSync Maximum number of blocks to process in a single sync operation.
   * @param maxRetryAttempts Maximum number of retry attempts for failed operations.
   * @param retryDelayMs Delay in milliseconds between retry attempts.
   */
  constructor(
    contractType: ContractType = ContractType.DATA_REGISTRY,
    contractAddress: string = DATA_REGISTRY_CONTRACT_ADDRESS,
    maxBlocksPerSync: number = 100,
    maxRetryAttempts: number = 3,
    retryDelayMs: number = 2000
  ) {
    this.contractAddress = contractAddress;
    this.contractType = contractType;
    this.MAX_BLOCKS_PER_SYNC = maxBlocksPerSync;
    this.MAX_RETRY_ATTEMPTS = maxRetryAttempts;
    this.RETRY_DELAY_MS = retryDelayMs;

    // Initialize contract and event parser
    this.contract = DataRegistry;
    this.eventParser = ContractHandlerFactory.createEventParser(this.contractType, this.contract);
  }

  /**
   * Initializes the blockchain sync service by creating necessary tables and initial state.
   * @returns Promise that resolves when initialization is complete.
   * @throws Will throw an error if initialization fails.
   */
  async initialize(): Promise<void> {
    try {
      await initializeBlockchainEventTables();
      console.log('Blockchain sync service initialized successfully');
    } catch (error) {
      console.error('Error initializing blockchain sync service:', error);
      throw error;
    }
  }

  /**
   * Syncs blockchain events from the last processed block to the latest block.
   * @param context The invocation context for logging.
   * @returns Promise that resolves with the sync result.
   * @throws Will throw an error if syncing fails.
   */
  async syncEvents(context: InvocationContext): Promise<BlockchainSyncState> {
    try {
      context.log('Starting blockchain event sync process');

      // Update sync state to indicate syncing is in progress
      await updateBlockchainSyncState({ syncStatus: 'SYNCING' });

      // Get the last processed block
      let lastProcessedBlock = await getLastProcessedBlockNumber();

      // Ensure lastProcessedBlock is a valid number
      if (isNaN(lastProcessedBlock)) {
        context.log('Last processed block is NaN, defaulting to 0');
        lastProcessedBlock = 0;
        // Update the sync state with the corrected value
        await updateBlockchainSyncState({ lastProcessedBlock: '0' });
      }

      context.log(`Last processed block: ${lastProcessedBlock}`);

      // Get the latest block number
      const latestBlock = await provider.getBlockNumber();
      context.log(`Latest block: ${latestBlock}`);

      // If we're already up to date, return early
      if (lastProcessedBlock >= latestBlock) {
        context.log('Already up to date with the latest block');
        await updateBlockchainSyncState({
          syncStatus: 'SYNCED',
          lastProcessedBlock: latestBlock.toString(),
        });
        return await getBlockchainSyncState();
      }

      // Calculate the range of blocks to process
      // Limit the number of blocks to process in a single sync to avoid timeouts
      const fromBlock = lastProcessedBlock + 1;
      const toBlock = Math.min(latestBlock, lastProcessedBlock + this.MAX_BLOCKS_PER_SYNC);

      context.log(`Processing blocks from ${fromBlock} to ${toBlock}`);

      // Get logs for the specified block range
      const logs = await this.getLogsWithRetry(fromBlock, toBlock);

      if (logs.length === 0) {
        context.log(`No events found in blocks ${fromBlock} to ${toBlock}`);

        // Update the sync state even if no events were found
        await updateBlockchainSyncState({
          lastProcessedBlock: toBlock.toString(),
          syncStatus: toBlock >= latestBlock ? 'SYNCED' : 'SYNCING',
        });

        return await getBlockchainSyncState();
      }

      context.log(`Found ${logs.length} events in blocks ${fromBlock} to ${toBlock}`);

      // Process and store the logs
      const processedEvents = await this.processBlockchainLogs(logs, context);

      // Get the highest block number from the processed events
      const highestProcessedBlock = Math.max(
        ...processedEvents.map(event => parseInt(event.blockNumber)),
        lastProcessedBlock
      );

      // If we processed events but didn't reach the target block,
      // update to the highest block we actually processed
      const finalBlockNumber =
        processedEvents.length > 0 ? Math.max(highestProcessedBlock, toBlock) : toBlock;

      // Update the sync state
      await updateBlockchainSyncState({
        lastProcessedBlock: finalBlockNumber.toString(),
        totalEventsProcessed:
          ((await getBlockchainSyncState()).totalEventsProcessed || 0) + processedEvents.length,
        syncStatus: finalBlockNumber >= latestBlock ? 'SYNCED' : 'SYNCING',
        lastSyncedEventName:
          processedEvents.length > 0
            ? processedEvents[processedEvents.length - 1].eName
            : undefined,
        lastSyncedTransactionHash:
          processedEvents.length > 0
            ? processedEvents[processedEvents.length - 1].transactionHash
            : undefined,
        lastProcessedBlockHash:
          processedEvents.length > 0
            ? processedEvents[processedEvents.length - 1].blockHash
            : undefined,
      });

      context.log(
        `Successfully processed ${processedEvents.length} events up to block ${finalBlockNumber}`
      );

      return await getBlockchainSyncState();
    } catch (error) {
      context.error(`Error syncing blockchain events: ${error}`);

      // Update sync state to indicate an error occurred
      await updateBlockchainSyncState({
        syncStatus: 'ERROR',
        errorMessage: error.message || 'Unknown error during blockchain sync',
      });

      throw error;
    }
  }

  /**
   * Gets logs from the blockchain with retry logic.
   * @param fromBlock The starting block number.
   * @param toBlock The ending block number.
   * @returns Promise that resolves with the logs.
   * @throws Will throw an error if getting logs fails after all retry attempts.
   */
  private async getLogsWithRetry(fromBlock: number, toBlock: number): Promise<any[]> {
    // Validate block numbers to prevent NaN errors
    if (isNaN(fromBlock) || isNaN(toBlock)) {
      console.error(`Invalid block range: fromBlock=${fromBlock}, toBlock=${toBlock}`);
      throw new Error('Invalid block range: fromBlock or toBlock is NaN');
    }

    let retryCount = 0;

    while (retryCount < this.MAX_RETRY_ATTEMPTS) {
      try {
        return await provider.getLogs({
          fromBlock,
          toBlock,
          address: this.contractAddress,
        });
      } catch (error) {
        retryCount++;
        console.error(
          `Error getting logs (attempt ${retryCount}/${this.MAX_RETRY_ATTEMPTS}):`,
          error
        );

        if (retryCount >= this.MAX_RETRY_ATTEMPTS) {
          throw error;
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY_MS));
      }
    }

    return [];
  }

  /**
   * Processes blockchain logs and stores them in the database.
   * Uses the appropriate event parser based on the contract type.
   * @param logs The logs to process.
   * @param context The invocation context for logging.
   * @returns Promise that resolves with the processed events.
   */
  private async processBlockchainLogs(
    logs: any[],
    context: InvocationContext
  ): Promise<BlockchainRecordType[]> {
    const processedEvents: BlockchainRecordType[] = [];

    for (const log of logs) {
      try {
        // Parse the log using the contract's interface
        const desc = (await this.contract.interface.parseLog(log)) as LogDescription;

        // Use the event parser to get additional context and formatting
        const parsedEventData = this.eventParser.decodeKnownEvent(desc.name, log.data, log.topics);

        const event: BlockchainRecordType = {
          partitionKey: this.contractType,
          rowKey: log.transactionHash,
          blockNumber: log.blockNumber.toString(),
          blockHash: log.blockHash,
          transactionHash: log.transactionHash,
          transactionIndex: log.transactionIndex.toString(),
          eAddress: log.address,
          eData: JSON.stringify(log.data),
          topics: JSON.stringify(log.topics),
          args: JSON.stringify(stringifyBigInt(parsedEventData)),
          eSignature: desc.signature,
          eName: desc.name,
          eTopic: JSON.stringify(desc.topic),
          eTimestamp: new Date().toISOString(),
        };

        await storeBlockchainEvent(event);
        processedEvents.push(event);

        context.log(`Processed event: ${event.eName} in transaction ${event.transactionHash}`);
      } catch (error) {
        context.error(`Error processing log: ${error}`);
        // Continue processing other logs even if one fails
      }
    }

    return processedEvents;
  }

  /**
   * Performs a full sync of blockchain events from a specific block.
   * @param startBlock The block to start syncing from.
   * @param context The invocation context for logging.
   * @returns Promise that resolves when the sync is complete.
   * @throws Will throw an error if the full sync fails.
   */
  async performFullSync(startBlock: number, context: InvocationContext): Promise<void> {
    try {
      context.log(`Starting full sync from block ${startBlock}`);

      // Update sync state to indicate syncing is in progress
      await updateBlockchainSyncState({
        syncStatus: 'SYNCING',
        lastProcessedBlock: (startBlock - 1).toString(),
      });

      // Continue syncing until we're up to date
      let syncState = await getBlockchainSyncState();

      while (syncState.syncStatus === 'SYNCING') {
        syncState = await this.syncEvents(context);

        // If we're still syncing, wait a bit before continuing
        if (syncState.syncStatus === 'SYNCING') {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      context.log('Full sync completed successfully');
    } catch (error) {
      context.error(`Error performing full sync: ${error}`);
      throw error;
    }
  }

  /**
   * Resets the blockchain sync state to a specific block.
   * @param blockNumber The block number to reset to.
   * @returns Promise that resolves when the reset is complete.
   */
  async resetSyncState(blockNumber: number): Promise<void> {
    await updateBlockchainSyncState({
      lastProcessedBlock: blockNumber.toString(),
      syncStatus: 'SYNCED',
      errorMessage: undefined,
    });

    console.log(`Reset sync state to block ${blockNumber}`);
  }

  /**
   * Gets the current blockchain sync state.
   * @returns Promise that resolves with the current blockchain sync state.
   */
  async getSyncState(): Promise<BlockchainSyncState> {
    return await getBlockchainSyncState();
  }

  /**
   * Gets the last processed block number.
   * @returns Promise that resolves with the last processed block number.
   */
  async getLastProcessedBlock(): Promise<number> {
    return await getLastProcessedBlockNumber();
  }

  /**
   * Gets blockchain events by event name.
   * @param eventName The name of the event to filter by.
   * @param limit The maximum number of events to return.
   * @returns Promise that resolves with the matching events.
   */
  async getEventsByName(eventName: string, limit: number = 100): Promise<BlockchainRecordType[]> {
    return await getBlockchainEventsByName(eventName, limit);
  }

  /**
   * Gets blockchain events by block number range.
   * @param fromBlock The starting block number.
   * @param toBlock The ending block number.
   * @param limit The maximum number of events to return.
   * @returns Promise that resolves with the matching events.
   */
  async getEventsByBlockRange(
    fromBlock: number,
    toBlock: number,
    limit: number = 100
  ): Promise<BlockchainRecordType[]> {
    return await getBlockchainEventsByBlockRange(fromBlock, toBlock, limit);
  }

  /**
   * Gets the latest blockchain events.
   * @param limit The maximum number of events to return.
   * @returns Promise that resolves with the latest events.
   */
  async getLatestEvents(limit: number = 10): Promise<BlockchainRecordType[]> {
    return await getLatestBlockchainEvents(limit);
  }

  /**
   * Gets blockchain events by transaction hash.
   * @param transactionHash The transaction hash to filter by.
   * @returns Promise that resolves with the matching events.
   */
  async getEventsByTransactionHash(transactionHash: string): Promise<BlockchainRecordType[]> {
    return await getBlockchainEventsByTransactionHash(transactionHash);
  }

  /**
   * Gets blockchain events with parsed arguments for easy frontend consumption.
   * @param limit The maximum number of events to return.
   * @returns Promise that resolves with the events with parsed arguments.
   */
  async getEventsWithParsedArgs(limit: number = 10): Promise<any[]> {
    return await getBlockchainEventsWithParsedArgs(limit);
  }

  /**
   * Gets the contract type being used by this service.
   * @returns The contract type.
   */
  getContractType(): ContractType {
    return this.contractType;
  }

  /**
   * Gets the contract address being used by this service.
   * @returns The contract address.
   */
  getContractAddress(): string {
    return this.contractAddress;
  }

  /**
   * Gets the event parser being used by this service.
   * @returns The event parser.
   */
  getEventParser(): BaseEventParser {
    return this.eventParser;
  }
}

import { InvocationContext } from '@azure/functions';
import { LogDescription } from 'ethers';

import { DATA_REGISTRY_CONTRACT_ADDRESS } from '../../constants';
import {
  BlockchainSyncState,
  getBlockchainSyncState,
  getLastProcessedBlockNumber,
  initializeBlockchainEventTables,
  storeBlockchainEvent,
  updateBlockchainSyncState,
} from '../../services/db/BlockchainEventService';
import { stringifyBigInt } from '../../helpers/bigIntStringify';
import DataRegistry from '../../helpers/data-registry';
import { provider } from '../../helpers/provider';
import { BlockchainRecordType } from '../../types';

// Constants for sync configuration
const MAX_BLOCKS_PER_SYNC = parseInt(process.env.MAX_BLOCKS_PER_SYNC || '100');
const MAX_RETRY_ATTEMPTS = parseInt(process.env.MAX_RETRY_ATTEMPTS || '3');
const RETRY_DELAY_MS = parseInt(process.env.RETRY_DELAY_MS || '2000');

/**
 * Initializes the blockchain sync service
 * @returns Promise that resolves when initialization is complete
 */
export const initializeBlockchainSync = async (): Promise<void> => {
  try {
    await initializeBlockchainEventTables();
    console.log('Blockchain sync service initialized successfully');
  } catch (error) {
    console.error('Error initializing blockchain sync service:', error);
    throw error;
  }
};

/**
 * Syncs blockchain events from the last processed block to the latest block
 * @param context The invocation context
 * @returns Promise that resolves with the sync result
 */
export const syncBlockchainEvents = async (
  context: InvocationContext
): Promise<BlockchainSyncState> => {
  try {
    context.log('Starting blockchain event sync process');

    // Update sync state to indicate syncing is in progress
    await updateBlockchainSyncState({ syncStatus: 'SYNCING' });

    // Get the last processed block
    const lastProcessedBlock = await getLastProcessedBlockNumber();
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
    const toBlock = Math.min(latestBlock, lastProcessedBlock + MAX_BLOCKS_PER_SYNC);

    context.log(`Processing blocks from ${fromBlock} to ${toBlock}`);

    // Get logs for the specified block range
    const logs = await getLogsWithRetry(fromBlock, toBlock);

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
    const processedEvents = await processBlockchainLogs(logs, context);

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
        (await getBlockchainSyncState()).totalEventsProcessed + processedEvents.length,
      syncStatus: finalBlockNumber >= latestBlock ? 'SYNCED' : 'SYNCING',
      lastSyncedEventName:
        processedEvents.length > 0 ? processedEvents[processedEvents.length - 1].eName : undefined,
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
};

/**
 * Gets logs from the blockchain with retry logic
 * @param fromBlock The starting block number
 * @param toBlock The ending block number
 * @returns Promise that resolves with the logs
 */
const getLogsWithRetry = async (fromBlock: number, toBlock: number): Promise<any[]> => {
  let retryCount = 0;

  while (retryCount < MAX_RETRY_ATTEMPTS) {
    try {
      return await provider.getLogs({
        fromBlock,
        toBlock,
        address: DATA_REGISTRY_CONTRACT_ADDRESS,
      });
    } catch (error) {
      retryCount++;
      console.error(`Error getting logs (attempt ${retryCount}/${MAX_RETRY_ATTEMPTS}):`, error);

      if (retryCount >= MAX_RETRY_ATTEMPTS) {
        throw error;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }

  return [];
};

/**
 * Processes blockchain logs and stores them in the database
 * @param logs The logs to process
 * @param context The invocation context
 * @returns Promise that resolves with the processed events
 */
const processBlockchainLogs = async (
  logs: any[],
  context: InvocationContext
): Promise<BlockchainRecordType[]> => {
  const processedEvents: BlockchainRecordType[] = [];

  for (const log of logs) {
    try {
      const desc = (await DataRegistry.interface.parseLog(log)) as LogDescription;

      const event: BlockchainRecordType = {
        partitionKey: 'BlockchainEvents',
        rowKey: log.transactionHash,
        blockNumber: log.blockNumber.toString(),
        blockHash: log.blockHash,
        transactionHash: log.transactionHash,
        transactionIndex: log.transactionIndex.toString(),
        eAddress: log.address,
        eData: JSON.stringify(log.data),
        topics: JSON.stringify(log.topics),
        args: JSON.stringify(stringifyBigInt(desc.args)),
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
};

/**
 * Performs a full sync of blockchain events from a specific block
 * @param startBlock The block to start syncing from
 * @param context The invocation context
 * @returns Promise that resolves when the sync is complete
 */
export const performFullSync = async (
  startBlock: number,
  context: InvocationContext
): Promise<void> => {
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
      syncState = await syncBlockchainEvents(context);

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
};

/**
 * Resets the blockchain sync state to a specific block
 * @param blockNumber The block number to reset to
 * @returns Promise that resolves when the reset is complete
 */
export const resetSyncState = async (blockNumber: number): Promise<void> => {
  await updateBlockchainSyncState({
    lastProcessedBlock: blockNumber.toString(),
    syncStatus: 'SYNCED',
    errorMessage: undefined,
  });

  console.log(`Reset sync state to block ${blockNumber}`);
};

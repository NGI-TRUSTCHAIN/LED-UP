import { randomUUID } from 'crypto';

import { createTableClient, getEntity, updateEntity } from './AzureTableService';
import poolPromise from './connect';
import { BlockchainRecordType } from '../../types';

// Constants for table storage
const BLOCKCHAIN_EVENTS_TABLE = process.env.DB_NAME || 'BlockchainEvents';
const SYNC_STATE_TABLE = process.env.SYNC_STATE_TABLE || 'BlockchainSyncState';
const DEFAULT_PARTITION_KEY = process.env.DEFAULT_PARTITION_KEY || 'BlockchainSync';
const SYNC_STATE_ROW_KEY = process.env.SYNC_STATE_ROW_KEY || 'CurrentState';

/**
 * Interface representing the blockchain sync state
 */
export interface BlockchainSyncState {
  partitionKey: string;
  rowKey: string;
  lastProcessedBlock: string;
  lastProcessedBlockHash: string;
  lastProcessedTimestamp: string;
  lastSyncedEventName?: string;
  lastSyncedTransactionHash?: string;
  syncStatus: 'SYNCING' | 'SYNCED' | 'ERROR';
  errorMessage?: string;
  totalEventsProcessed: number;
}

/**
 * Creates the necessary tables for blockchain event tracking if they don't exist
 * @returns Promise that resolves when tables are created
 */
export const initializeBlockchainEventTables = async (): Promise<void> => {
  try {
    // Create tables for blockchain events and sync state
    await createTableClient(BLOCKCHAIN_EVENTS_TABLE);
    const syncStateTableClient = await createTableClient(SYNC_STATE_TABLE);

    console.log('Blockchain event tables initialized successfully');

    // Initialize sync state if it doesn't exist
    try {
      const syncState = await getBlockchainSyncState();

      // Check if the lastProcessedBlock is valid
      if (!syncState.lastProcessedBlock || isNaN(parseInt(syncState.lastProcessedBlock))) {
        console.warn('Existing sync state has invalid lastProcessedBlock, resetting to 0');
        await updateBlockchainSyncState({
          lastProcessedBlock: '0',
          lastProcessedTimestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      // If sync state doesn't exist, create it with default values
      const initialSyncState: BlockchainSyncState = {
        partitionKey: DEFAULT_PARTITION_KEY,
        rowKey: SYNC_STATE_ROW_KEY,
        lastProcessedBlock: '0',
        lastProcessedBlockHash: '',
        lastProcessedTimestamp: new Date().toISOString(),
        syncStatus: 'SYNCED',
        totalEventsProcessed: 0,
      };

      await syncStateTableClient.createEntity(initialSyncState);
      console.log('Initial blockchain sync state created');
    }
  } catch (error) {
    console.error('Error initializing blockchain event tables:', error);
    throw error;
  }
};

/**
 * Stores a blockchain event in both Azure Table Storage and SQL Database
 * @param event The blockchain event to store
 * @returns Promise that resolves with the stored event
 */
export const storeBlockchainEvent = async (
  event: BlockchainRecordType
): Promise<BlockchainRecordType> => {
  try {
    if (!event.id) {
      event.id = randomUUID();
    }

    // Store in Azure Table Storage
    const tableClient = await createTableClient(BLOCKCHAIN_EVENTS_TABLE);
    const tableEntity = {
      partitionKey: event.partitionKey || DEFAULT_PARTITION_KEY,
      rowKey: event.id,
      ...event,
      timestamp: event.eTimestamp,
    };

    await tableClient.createEntity(tableEntity);

    // Store in SQL Database for relational queries
    await storeEventInSqlDatabase(event);

    return event;
  } catch (error) {
    console.error('Error storing blockchain event:', error);
    throw error;
  }
};

/**
 * Stores a blockchain event in SQL Database
 * @param event The blockchain event to store
 * @returns Promise that resolves when the event is stored
 */
const storeEventInSqlDatabase = async (event: BlockchainRecordType): Promise<void> => {
  try {
    const sqlString = `
      INSERT INTO dbo.DataRegistryEvents (
        id, transactionHash, blockHash, blockNumber, 
        eAddress, eData, topics, args, 
        eSignature, eName, eTopic, eTimestamp
      )
      VALUES (
        @id, @transactionHash, @blockHash, @blockNumber, 
        @eAddress, @eData, @topics, @args, 
        @eSignature, @eName, @eTopic, @eTimestamp
      )
    `;

    const pool = await poolPromise;
    const request = pool.request();
    request.input('id', event.id);
    request.input('transactionHash', event.transactionHash);
    request.input('blockHash', event.blockHash);
    request.input('blockNumber', event.blockNumber);
    request.input('eAddress', event.eAddress);
    request.input('eData', event.eData);
    request.input('topics', event.topics);
    request.input('args', event.args);
    request.input('eSignature', event.eSignature);
    request.input('eName', event.eName);
    request.input('eTopic', event.eTopic);
    request.input('eTimestamp', event.eTimestamp);

    await request.query(sqlString);
  } catch (error) {
    console.error('Error storing event in SQL database:', error);
    throw error;
  }
};

/**
 * Updates the blockchain sync state with the latest processed block information
 * @param syncState The updated blockchain sync state
 * @returns Promise that resolves when the sync state is updated
 */
export const updateBlockchainSyncState = async (
  syncState: Partial<BlockchainSyncState>
): Promise<void> => {
  try {
    const currentState = await getBlockchainSyncState();

    // Ensure totalEventsProcessed is initialized
    if (currentState.totalEventsProcessed === undefined) {
      currentState.totalEventsProcessed = 0;
    }

    const updatedState: BlockchainSyncState = {
      ...currentState,
      ...syncState,
      lastProcessedTimestamp: new Date().toISOString(),
    };

    await updateEntity(SYNC_STATE_TABLE, updatedState);
  } catch (error) {
    console.error('Error updating blockchain sync state:', error);
    throw error;
  }
};

/**
 * Gets the current blockchain sync state
 * @returns Promise that resolves with the current blockchain sync state
 */
export const getBlockchainSyncState = async (): Promise<BlockchainSyncState> => {
  try {
    const syncState = (await getEntity(
      SYNC_STATE_TABLE,
      DEFAULT_PARTITION_KEY,
      SYNC_STATE_ROW_KEY
    )) as BlockchainSyncState;

    // Ensure totalEventsProcessed is initialized
    if (syncState.totalEventsProcessed === undefined) {
      syncState.totalEventsProcessed = 0;

      // Update the entity in the database to persist this change
      await updateEntity(SYNC_STATE_TABLE, syncState);
    }

    return syncState;
  } catch (error) {
    console.error('Error getting blockchain sync state:', error);
    throw error;
  }
};

/**
 * Gets the last processed block number from the blockchain sync state
 * @returns Promise that resolves with the last processed block number
 */
export const getLastProcessedBlockNumber = async (): Promise<number> => {
  try {
    const syncState = await getBlockchainSyncState();
    const blockNumber = parseInt(syncState.lastProcessedBlock);

    // Check if the parsed value is NaN and return 0 as a default
    if (isNaN(blockNumber)) {
      console.warn('Last processed block number is NaN, defaulting to 0');
      return 0;
    }

    return blockNumber;
  } catch (error) {
    console.error('Error getting last processed block number:', error);
    return 0;
  }
};

/**
 * Gets blockchain events by event name
 * @param eventName The name of the event to filter by
 * @param limit The maximum number of events to return
 * @returns Promise that resolves with the matching events
 */
export const getBlockchainEventsByName = async (
  eventName: string,
  limit: number = 100
): Promise<BlockchainRecordType[]> => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('eventName', eventName)
      .input('limit', limit)
      .query(
        'SELECT TOP (@limit) * FROM dbo.DataRegistryEvents WHERE eName = @eventName ORDER BY eTimestamp DESC'
      );

    return result.recordset;
  } catch (error) {
    console.error(`Error getting blockchain events by name ${eventName}:`, error);
    throw error;
  }
};

/**
 * Gets blockchain events by block number range
 * @param fromBlock The starting block number
 * @param toBlock The ending block number
 * @param limit The maximum number of events to return
 * @returns Promise that resolves with the matching events
 */
export const getBlockchainEventsByBlockRange = async (
  fromBlock: number,
  toBlock: number,
  limit: number = 100
): Promise<BlockchainRecordType[]> => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('fromBlock', fromBlock.toString())
      .input('toBlock', toBlock.toString())
      .input('limit', limit).query(`
        SELECT TOP (@limit) * 
        FROM dbo.DataRegistryEvents 
        WHERE CAST(blockNumber AS INT) BETWEEN CAST(@fromBlock AS INT) AND CAST(@toBlock AS INT) 
        ORDER BY CAST(blockNumber AS INT) DESC, eTimestamp DESC
      `);

    return result.recordset;
  } catch (error) {
    console.error(`Error getting blockchain events by block range ${fromBlock}-${toBlock}:`, error);
    throw error;
  }
};

/**
 * Gets the latest blockchain events
 * @param limit The maximum number of events to return
 * @returns Promise that resolves with the latest events
 */
export const getLatestBlockchainEvents = async (
  limit: number = 10
): Promise<BlockchainRecordType[]> => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('limit', limit)
      .query(
        'SELECT TOP (@limit) * FROM dbo.DataRegistryEvents ORDER BY CAST(blockNumber AS INT) DESC, eTimestamp DESC'
      );

    return result.recordset;
  } catch (error) {
    console.error('Error getting latest blockchain events:', error);
    throw error;
  }
};

/**
 * Gets blockchain events by transaction hash
 * @param transactionHash The transaction hash to filter by
 * @returns Promise that resolves with the matching events
 */
export const getBlockchainEventsByTransactionHash = async (
  transactionHash: string
): Promise<BlockchainRecordType[]> => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('transactionHash', transactionHash)
      .query('SELECT * FROM dbo.DataRegistryEvents WHERE transactionHash = @transactionHash');

    return result.recordset;
  } catch (error) {
    console.error(`Error getting blockchain events by transaction hash ${transactionHash}:`, error);
    throw error;
  }
};

/**
 * Gets blockchain events with parsed arguments for easy frontend consumption
 * @param limit The maximum number of events to return
 * @returns Promise that resolves with the events with parsed arguments
 */
export const getBlockchainEventsWithParsedArgs = async (limit: number = 10): Promise<any[]> => {
  try {
    const events = await getLatestBlockchainEvents(limit);

    return events.map(event => {
      try {
        // Parse JSON strings to objects
        const parsedEvent = {
          ...event,
          args: JSON.parse(event.args),
          topics: JSON.parse(event.topics),
          eData: JSON.parse(event.eData),
          eTopic: JSON.parse(event.eTopic),
        };

        return parsedEvent;
      } catch (error) {
        console.error(`Error parsing event data for event ${event.id}:`, error);
        return event;
      }
    });
  } catch (error) {
    console.error('Error getting blockchain events with parsed args:', error);
    throw error;
  }
};

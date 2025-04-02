import { createPublicClient, http, Log, parseAbiItem } from 'viem';
import { hardhat } from 'viem/chains';
import { DataRegistryABI } from '@/abi/data-registry.abi';
import { AccessLevel, ResourceType } from '../types';

/**
 * Configuration for the Data Registry contract
 */
type ContractConfig = {
  contractAddress: `0x${string}`;
  chainId: number;
  rpcUrl: string;
};

// Default configuration - should be overridden in production
const defaultConfig: ContractConfig = {
  contractAddress: (process.env.DATA_REGISTRY_CONTRACT_ADDRESS || '0x0') as `0x${string}`,
  chainId: 31337,
  rpcUrl: process.env.RPC_URL || 'http://localhost:8545',
};

/**
 * Create a public client for reading from the blockchain
 */
const getPublicClient = () => {
  return createPublicClient({
    chain: hardhat,
    transport: http(defaultConfig.rpcUrl),
  });
};

/**
 * Access event types in the Data Registry
 */
export enum AccessEventType {
  Granted = 'AccessGranted',
  Revoked = 'AccessRevoked',
  Triggered = 'AccessTriggered',
}

/**
 * Record event types in the Data Registry
 */
export enum RecordEventType {
  Registered = 'RecordRegistered',
  Updated = 'RecordUpdated',
  Verified = 'RecordVerified',
  StatusChanged = 'RecordStatusChanged',
}

/**
 * Consent event types in the Data Registry
 */
export enum ConsentEventType {
  StatusChanged = 'ConsentStatusChanged',
}

/**
 * Provider event types in the Data Registry
 */
export enum ProviderEventType {
  Added = 'ProviderAdded',
  Removed = 'ProviderRemoved',
  Authorized = 'ProviderAuthorized',
}

/**
 * Access event data
 */
export interface AccessEvent {
  recordId: string;
  consumer: `0x${string}`;
  consumerDid?: string;
  expiration?: number;
  accessLevel?: AccessLevel;
  revoker?: `0x${string}`;
  blockNumber: number;
  timestamp: number;
  transactionHash: `0x${string}`;
  eventType: AccessEventType;
}

/**
 * Record event data
 */
export interface RecordEvent {
  recordId: string;
  producer?: `0x${string}`;
  did?: string;
  cid?: string;
  contentHash?: `0x${string}`;
  resourceType?: ResourceType;
  status?: number;
  updater?: `0x${string}`;
  verifier?: `0x${string}`;
  blockNumber: number;
  timestamp: number;
  transactionHash: `0x${string}`;
  eventType: RecordEventType;
}

/**
 * Get access events for a specific record
 * @param recordId - The ID of the record
 * @returns Array of access events
 */
export async function getAccessEventsForRecord(recordId: string): Promise<AccessEvent[]> {
  try {
    const publicClient = getPublicClient();

    // Create event filters for each access event type
    const accessGrantedFilter = await publicClient.createEventFilter({
      address: defaultConfig.contractAddress,
      event: parseAbiItem(
        'event AccessGranted(string indexed recordId, address indexed consumer, string consumerDid, uint40 expiration, uint8 accessLevel)'
      ),
      args: {
        recordId: recordId,
      },
      fromBlock: 'earliest',
    });

    const accessRevokedFilter = await publicClient.createEventFilter({
      address: defaultConfig.contractAddress,
      event: parseAbiItem(
        'event AccessRevoked(string indexed recordId, address indexed consumer, string consumerDid, address indexed revoker)'
      ),
      args: {
        recordId: recordId,
      },
      fromBlock: 'earliest',
    });

    const accessTriggeredFilter = await publicClient.createEventFilter({
      address: defaultConfig.contractAddress,
      event: parseAbiItem(
        'event AccessTriggered(string indexed recordId, address indexed consumer, string consumerDid, uint8 accessLevel)'
      ),
      args: {
        recordId: recordId,
      },
      fromBlock: 'earliest',
    });

    // Get logs for each event type
    const accessGrantedLogs = await publicClient.getFilterLogs({ filter: accessGrantedFilter });
    const accessRevokedLogs = await publicClient.getFilterLogs({ filter: accessRevokedFilter });
    const accessTriggeredLogs = await publicClient.getFilterLogs({ filter: accessTriggeredFilter });

    // Process and combine results
    const events: AccessEvent[] = [
      ...accessGrantedLogs.map((log) => ({
        recordId,
        consumer: log.args.consumer as `0x${string}`,
        consumerDid: log.args.consumerDid as string | undefined,
        expiration: log.args.expiration ? Number(log.args.expiration) : undefined,
        accessLevel: log.args.accessLevel !== undefined ? (Number(log.args.accessLevel) as AccessLevel) : undefined,
        blockNumber: Number(log.blockNumber),
        timestamp: 0, // Will be filled later
        transactionHash: log.transactionHash,
        eventType: AccessEventType.Granted,
      })),
      ...accessRevokedLogs.map((log) => ({
        recordId,
        consumer: log.args.consumer as `0x${string}`,
        consumerDid: log.args.consumerDid as string | undefined,
        revoker: log.args.revoker as `0x${string}` | undefined,
        blockNumber: Number(log.blockNumber),
        timestamp: 0, // Will be filled later
        transactionHash: log.transactionHash,
        eventType: AccessEventType.Revoked,
      })),
      ...accessTriggeredLogs.map((log) => ({
        recordId,
        consumer: log.args.consumer as `0x${string}`,
        consumerDid: log.args.consumerDid as string | undefined,
        accessLevel: log.args.accessLevel !== undefined ? (Number(log.args.accessLevel) as AccessLevel) : undefined,
        blockNumber: Number(log.blockNumber),
        timestamp: 0, // Will be filled later
        transactionHash: log.transactionHash,
        eventType: AccessEventType.Triggered,
      })),
    ];

    // Get timestamps for each event
    const timestamps = await Promise.all(
      events.map(async (event) => {
        const block = await publicClient.getBlock({
          blockNumber: BigInt(event.blockNumber),
        });
        return Number(block.timestamp);
      })
    );

    // Attach timestamps to events
    events.forEach((event, i) => {
      event.timestamp = timestamps[i];
    });

    // Sort events by timestamp (newest first)
    return events.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Error getting access events for record:', error);
    throw new Error('Failed to get access events');
  }
}

/**
 * Get record events for a specific record
 * @param recordId - The ID of the record
 * @returns Array of record events
 */
export async function getRecordEvents(recordId: string): Promise<RecordEvent[]> {
  try {
    const publicClient = getPublicClient();

    // Create event filters for each record event type
    const recordRegisteredFilter = await publicClient.createEventFilter({
      address: defaultConfig.contractAddress,
      event: parseAbiItem(
        'event RecordRegistered(string indexed recordId, string did, string cid, bytes32 contentHash, address indexed provider)'
      ),
      args: {
        recordId: recordId,
      },
      fromBlock: 'earliest',
    });

    const recordUpdatedFilter = await publicClient.createEventFilter({
      address: defaultConfig.contractAddress,
      event: parseAbiItem(
        'event RecordUpdated(string indexed recordId, string cid, bytes32 contentHash, address indexed provider)'
      ),
      args: {
        recordId: recordId,
      },
      fromBlock: 'earliest',
    });

    const recordVerifiedFilter = await publicClient.createEventFilter({
      address: defaultConfig.contractAddress,
      event: parseAbiItem('event RecordVerified(string indexed recordId, address indexed verifier)'),
      args: {
        recordId: recordId,
      },
      fromBlock: 'earliest',
    });

    const recordStatusChangedFilter = await publicClient.createEventFilter({
      address: defaultConfig.contractAddress,
      event: parseAbiItem('event RecordStatusChanged(string indexed recordId, uint8 status, address indexed updater)'),
      args: {
        recordId: recordId,
      },
      fromBlock: 'earliest',
    });

    // Get logs for each event type
    const registeredLogs = await publicClient.getFilterLogs({ filter: recordRegisteredFilter });
    const updatedLogs = await publicClient.getFilterLogs({ filter: recordUpdatedFilter });
    const verifiedLogs = await publicClient.getFilterLogs({ filter: recordVerifiedFilter });
    const statusChangedLogs = await publicClient.getFilterLogs({ filter: recordStatusChangedFilter });

    // Process and combine results
    const events: RecordEvent[] = [
      ...registeredLogs.map((log) => ({
        recordId,
        producer: log.args.provider as `0x${string}` | undefined,
        did: log.args.did as string | undefined,
        cid: log.args.cid as string | undefined,
        contentHash: log.args.contentHash as `0x${string}` | undefined,
        blockNumber: Number(log.blockNumber),
        timestamp: 0, // Will be filled later
        transactionHash: log.transactionHash,
        eventType: RecordEventType.Registered,
      })),
      ...updatedLogs.map((log) => ({
        recordId,
        producer: log.args.provider as `0x${string}` | undefined,
        cid: log.args.cid as string | undefined,
        contentHash: log.args.contentHash as `0x${string}` | undefined,
        blockNumber: Number(log.blockNumber),
        timestamp: 0, // Will be filled later
        transactionHash: log.transactionHash,
        eventType: RecordEventType.Updated,
      })),
      ...verifiedLogs.map((log) => ({
        recordId,
        verifier: log.args.verifier as `0x${string}` | undefined,
        blockNumber: Number(log.blockNumber),
        timestamp: 0, // Will be filled later
        transactionHash: log.transactionHash,
        eventType: RecordEventType.Verified,
      })),
      ...statusChangedLogs.map((log) => ({
        recordId,
        status: log.args.status !== undefined ? Number(log.args.status) : undefined,
        updater: log.args.updater as `0x${string}` | undefined,
        blockNumber: Number(log.blockNumber),
        timestamp: 0, // Will be filled later
        transactionHash: log.transactionHash,
        eventType: RecordEventType.StatusChanged,
      })),
    ];

    // Get timestamps for each event
    const timestamps = await Promise.all(
      events.map(async (event) => {
        const block = await publicClient.getBlock({
          blockNumber: BigInt(event.blockNumber),
        });
        return Number(block.timestamp);
      })
    );

    // Attach timestamps to events
    events.forEach((event, i) => {
      event.timestamp = timestamps[i];
    });

    // Sort events by timestamp (newest first)
    return events.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Error getting record events:', error);
    throw new Error('Failed to get record events');
  }
}

/**
 * Get all records for a consumer from events
 * @param consumerAddress - The address of the consumer
 * @returns Array of recordIds the consumer has access to
 */
export async function getConsumerRecordsFromEvents(consumerAddress: `0x${string}`): Promise<string[]> {
  try {
    const publicClient = getPublicClient();

    // Get access granted events for this consumer
    const accessGrantedFilter = await publicClient.createEventFilter({
      address: defaultConfig.contractAddress,
      event: parseAbiItem(
        'event AccessGranted(string indexed recordId, address indexed consumer, string consumerDid, uint40 expiration, uint8 accessLevel)'
      ),
      args: {
        consumer: consumerAddress,
      },
      fromBlock: 'earliest',
    });

    // Get access revoked events for this consumer
    const accessRevokedFilter = await publicClient.createEventFilter({
      address: defaultConfig.contractAddress,
      event: parseAbiItem(
        'event AccessRevoked(string indexed recordId, address indexed consumer, string consumerDid, address indexed revoker)'
      ),
      args: {
        consumer: consumerAddress,
      },
      fromBlock: 'earliest',
    });

    const accessGrantedLogs = await publicClient.getFilterLogs({ filter: accessGrantedFilter });
    const accessRevokedLogs = await publicClient.getFilterLogs({ filter: accessRevokedFilter });

    // Extract record IDs and track access state
    const recordAccessMap = new Map<string, boolean>(); // recordId -> hasAccess

    // Process granted events
    accessGrantedLogs.forEach((log) => {
      const recordId = log.args.recordId as string;
      recordAccessMap.set(recordId, true);
    });

    // Process revoked events
    accessRevokedLogs.forEach((log) => {
      const recordId = log.args.recordId as string;
      recordAccessMap.set(recordId, false);
    });

    // Return only records with active access
    return [...recordAccessMap.entries()].filter(([_, hasAccess]) => hasAccess).map(([recordId, _]) => recordId);
  } catch (error) {
    console.error('Error getting consumer records from events:', error);
    throw new Error('Failed to get consumer records');
  }
}

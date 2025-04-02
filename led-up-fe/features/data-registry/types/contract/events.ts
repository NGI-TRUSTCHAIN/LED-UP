import { type Log, decodeEventLog, type PublicClient, type Address } from 'viem';
import { DataRegistryABI } from '@/abi/data-registry.abi';
import { RecordStatus, ConsentStatus, AccessLevel, ResourceType } from '../index';

/**
 * Event names from DataRegistry contract
 */
export enum DataRegistryEventName {
  RecordRegistered = 'RecordRegistered',
  RecordUpdated = 'RecordUpdated',
  RecordStatusChanged = 'RecordStatusChanged',
  ConsentStatusChanged = 'ConsentStatusChanged',
  AccessGranted = 'AccessGranted',
  AccessRevoked = 'AccessRevoked',
  RecordVerified = 'RecordVerified',
  DidAuthUpdated = 'DidAuthUpdated',
  CompensationUpdated = 'CompensationUpdated',
  ConsumerAuthorized = 'ConsumerAuthorized',
  ProviderAuthorized = 'ProviderAuthorized',
  AccessTriggered = 'AccessTriggered',
  ProviderAdded = 'ProviderAdded',
  ProviderRemoved = 'ProviderRemoved',
}

/**
 * Common event data interface
 */
export interface DataRegistryEventData {
  eventName: DataRegistryEventName;
  args: Record<string, any>;
  description: string;
  blockNumber?: bigint;
  transactionHash?: string;
  logIndex?: number;
  timestamp?: number;
}

/**
 * Event emitted when a record is registered
 */
export interface RecordRegisteredEvent {
  recordId: string;
  producer: Address;
  did: string;
  cid: string;
  contentHash: `0x${string}`;
  resourceType: ResourceType;
  dataSize: number;
  timestamp: number;
}

/**
 * Event emitted when a record is updated
 */
export interface RecordUpdatedEvent {
  recordId: string;
  producer: Address;
  cid: string;
  contentHash: `0x${string}`;
  dataSize: number;
  timestamp: number;
}

/**
 * Event emitted when a record's status changes
 */
export interface RecordStatusChangedEvent {
  recordId: string;
  producer: Address;
  status: RecordStatus;
  updater: Address;
  timestamp: number;
}

/**
 * Event emitted when a producer's consent status changes
 */
export interface ConsentStatusChangedEvent {
  producer: Address;
  status: ConsentStatus;
  updater: Address;
  timestamp: number;
}

/**
 * Event emitted when access is granted to a record
 */
export interface AccessGrantedEvent {
  recordId: string;
  producer: Address;
  consumer: Address;
  consumerDid: string;
  expiration: number;
  accessLevel: AccessLevel;
  timestamp: number;
}

/**
 * Event emitted when access is revoked from a record
 */
export interface AccessRevokedEvent {
  recordId: string;
  producer: Address;
  consumer: Address;
  consumerDid: string;
  revoker: Address;
  timestamp: number;
}

/**
 * Event emitted when a record is verified
 */
export interface RecordVerifiedEvent {
  recordId: string;
  producer: Address;
  verifier: Address;
  timestamp: number;
}

/**
 * Event emitted when a consumer is authorized
 */
export interface ConsumerAuthorizedEvent {
  recordId: string;
  producer: Address;
  consumer: Address;
  accessLevel: AccessLevel;
  expiration: number;
  timestamp: number;
}

/**
 * Event emitted when a provider is authorized
 */
export interface ProviderAuthorizedEvent {
  recordId: string;
  producer: Address;
  provider: Address;
  accessLevel: AccessLevel;
  timestamp: number;
}

/**
 * Event emitted when access is triggered
 */
export interface AccessTriggeredEvent {
  recordId: string;
  producer: Address;
  consumer: Address;
  consumerDid: string;
  accessLevel: AccessLevel;
  timestamp: number;
}

/**
 * Event emitted when a producer is registered
 */
export interface ProducerRegisteredEvent {
  producer: Address;
  did: string;
  status: RecordStatus;
  consent: ConsentStatus;
  timestamp: number;
}

/**
 * Event emitted when a producer's status changes
 */
export interface ProducerStatusChangedEvent {
  producer: Address;
  status: RecordStatus;
  updater: Address;
  timestamp: number;
}

/**
 * Event emitted when a producer's metadata is updated
 */
export interface ProducerMetadataUpdatedEvent {
  producer: Address;
  did: string;
  version: number;
  timestamp: number;
}

/**
 * Event emitted when a record's metadata is updated
 */
export interface RecordMetadataUpdatedEvent {
  recordId: string;
  producer: Address;
  cid: string;
  contentHash: `0x${string}`;
  dataSize: number;
  timestamp: number;
}

/**
 * Event emitted when a record is shared
 */
export interface RecordSharedEvent {
  recordId: string;
  producer: Address;
  consumer: Address;
  accessLevel: AccessLevel;
  expiration: number;
  timestamp: number;
}

/**
 * Event emitted when a record's sharing is revoked
 */
export interface RecordSharingRevokedEvent {
  recordId: string;
  producer: Address;
  consumer: Address;
  revoker: Address;
  timestamp: number;
}

/**
 * Event emitted when a record is deleted
 */
export interface RecordDeletedEvent {
  recordId: string;
  producer: Address;
  deleter: Address;
  timestamp: number;
}

/**
 * Event emitted when a producer is deleted
 */
export interface ProducerDeletedEvent {
  producer: Address;
  deleter: Address;
  timestamp: number;
}

/**
 * Generic type for DataRegistry events
 */
export type DataRegistryEvent = DataRegistryEventData;

/**
 * Formats event arguments to handle BigInt values
 * @param args The event arguments
 * @returns Formatted event arguments
 */
function formatEventArgs(args: Record<string, any>): Record<string, any> {
  const formatted: Record<string, any> = {};

  for (const [key, value] of Object.entries(args)) {
    if (typeof value === 'bigint') {
      formatted[key] = value.toString();
    } else if (Array.isArray(value)) {
      formatted[key] = value.map((item) => (typeof item === 'bigint' ? item.toString() : item));
    } else if (value && typeof value === 'object') {
      formatted[key] = formatEventArgs(value);
    } else {
      formatted[key] = value;
    }
  }

  return formatted;
}

/**
 * Get a user-friendly description for a DataRegistry event
 */
function getEventDescription(eventName: DataRegistryEventName, args: Record<string, any>): string {
  switch (eventName) {
    case DataRegistryEventName.RecordRegistered:
      return `Record ${args.recordId} registered by provider ${args.producer}`;

    case DataRegistryEventName.RecordUpdated:
      return `Record ${args.recordId} updated by provider ${args.producer}`;

    case DataRegistryEventName.RecordStatusChanged:
      return `Record ${args.recordId} status changed to ${RecordStatus[Number(args.status)]} by ${args.updater}`;

    case DataRegistryEventName.ConsentStatusChanged:
      return `Provider ${args.producer} consent status changed to ${ConsentStatus[Number(args.status)]} by ${
        args.updater
      }`;

    case DataRegistryEventName.AccessGranted:
      return `Access granted to ${args.consumer} for record ${args.recordId} with access level ${
        AccessLevel[Number(args.accessLevel)]
      }`;

    case DataRegistryEventName.AccessRevoked:
      return `Access revoked for ${args.consumer} on record ${args.recordId} by ${args.revoker}`;

    case DataRegistryEventName.RecordVerified:
      return `Record ${args.recordId} verified by ${args.verifier}`;

    case DataRegistryEventName.DidAuthUpdated:
      return `DID Auth address updated from ${args.oldAddress} to ${args.newAddress}`;

    case DataRegistryEventName.CompensationUpdated:
      return `Compensation address updated from ${args.oldAddress} to ${args.newAddress}`;

    case DataRegistryEventName.ConsumerAuthorized:
      return `Consumer ${args.consumer} authorized for record ${args.recordId} with access level ${
        AccessLevel[Number(args.accessLevel)]
      }`;

    case DataRegistryEventName.ProviderAuthorized:
      return `Provider ${args.producer} authorized for record ${args.recordId} with access level ${
        AccessLevel[Number(args.accessLevel)]
      }`;

    case DataRegistryEventName.AccessTriggered:
      return `Access triggered by ${args.consumer} for record ${args.recordId}`;

    case DataRegistryEventName.ProviderAdded:
      return `Provider ${args.producer} added`;

    case DataRegistryEventName.ProviderRemoved:
      return `Provider ${args.producer} removed`;

    default:
      return `Event: ${eventName}`;
  }
}

/**
 * Parses a transaction log to extract DataRegistry events
 * @param log The transaction log to parse
 * @returns The parsed event or null if not a DataRegistry event
 */
export function parseDataRegistryEvent(log: Log): DataRegistryEvent | null {
  try {
    // Use any to bypass TypeScript strict checks
    const decodedLog = decodeEventLog({
      abi: DataRegistryABI as any,
      data: log.data,
      topics: log.topics,
    }) as any;

    const eventName = decodedLog.eventName;

    // Check if the event name is one we're tracking
    if (!eventName || !Object.values(DataRegistryEventName).includes(eventName)) {
      return null;
    }

    const formattedArgs = formatEventArgs(decodedLog.args || {});

    return {
      eventName: eventName,
      args: formattedArgs,
      description: getEventDescription(eventName, formattedArgs),
      blockNumber: log.blockNumber ?? undefined,
      transactionHash: log.transactionHash ?? undefined,
      logIndex: log.logIndex ?? undefined,
    };
  } catch (error) {
    console.error('Error parsing event:', error);
    return null;
  }
}

/**
 * Fetches all events of a specific type for a given address
 * @param client The Viem public client
 * @param contractAddress The address of the DataRegistry contract
 * @param eventName The name of the event to fetch
 * @param options Additional options like fromBlock, toBlock, filters
 * @returns Array of parsed events
 */
export async function getDataRegistryEvents(
  client: PublicClient,
  contractAddress: `0x${string}`,
  eventName: DataRegistryEventName,
  options: {
    fromBlock?: bigint | 'latest' | 'earliest' | 'pending' | 'safe' | 'finalized';
    toBlock?: bigint | 'latest' | 'earliest' | 'pending' | 'safe' | 'finalized';
    filters?: Record<string, any>;
  } = {}
): Promise<DataRegistryEvent[]> {
  try {
    // Find matching event in ABI
    const eventAbi = DataRegistryABI.find((item) => item.type === 'event' && item.name === eventName);

    if (!eventAbi) {
      console.error(`Event ${eventName} not found in ABI`);
      return [];
    }

    // Use any to bypass strict TypeScript checking
    const logs = await client.getLogs({
      address: contractAddress,
      event: eventAbi as any,
      fromBlock: options.fromBlock,
      toBlock: options.toBlock,
      args: options.filters as any,
    });

    return logs.map(parseDataRegistryEvent).filter((event): event is DataRegistryEvent => event !== null);
  } catch (error) {
    console.error(`Error fetching ${eventName} events:`, error);
    return [];
  }
}

/**
 * Utility function to get all RecordRegistered events
 */
export async function getRecordRegisteredEvents(
  client: PublicClient,
  contractAddress: `0x${string}`,
  options: {
    fromBlock?: bigint | 'latest' | 'earliest' | 'pending' | 'safe' | 'finalized';
    toBlock?: bigint | 'latest' | 'earliest' | 'pending' | 'safe' | 'finalized';
    recordId?: string;
    producer?: `0x${string}`;
  } = {}
): Promise<DataRegistryEvent[]> {
  const filters: Record<string, any> = {};

  if (options.recordId) filters.recordId = options.recordId;
  if (options.producer) filters.producer = options.producer;

  return getDataRegistryEvents(client, contractAddress, DataRegistryEventName.RecordRegistered, {
    fromBlock: options.fromBlock,
    toBlock: options.toBlock,
    filters,
  });
}

/**
 * Utility function to get all AccessGranted events
 */
export async function getAccessGrantedEvents(
  client: PublicClient,
  contractAddress: `0x${string}`,
  options: {
    fromBlock?: bigint | 'latest' | 'earliest' | 'pending' | 'safe' | 'finalized';
    toBlock?: bigint | 'latest' | 'earliest' | 'pending' | 'safe' | 'finalized';
    recordId?: string;
    consumer?: `0x${string}`;
  } = {}
): Promise<DataRegistryEvent[]> {
  const filters: Record<string, any> = {};

  if (options.recordId) filters.recordId = options.recordId;
  if (options.consumer) filters.consumer = options.consumer;

  return getDataRegistryEvents(client, contractAddress, DataRegistryEventName.AccessGranted, {
    fromBlock: options.fromBlock,
    toBlock: options.toBlock,
    filters,
  });
}

/**
 * Type guard to check if an event is of a specific type
 */
export function isEventType(event: DataRegistryEvent, eventName: DataRegistryEventName): boolean {
  return event.eventName === eventName;
}

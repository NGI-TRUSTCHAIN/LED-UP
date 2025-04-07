'use server';

import { Address, createPublicClient, http } from 'viem';
import { hardhat, mainnet } from 'viem/chains';
import { DataRegistryABI } from '@/abi/data-registry.abi';
import { AccessLevel, ConsentStatus, ResourceType } from '../types';
import {
  CheckAccessResponse,
  ProducerMetadataResponse,
  RecordInfoResponse,
  ProducerRecordsResponse,
  ResourceMetadata,
  parseDataRegistryError,
  AccessLevel as ContractAccessLevel,
  RecordConsumerResponse,
  ConsumerRecordResponse,
  AccessHistoryEvent,
} from '../types/contract';

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
 * Check if a producer exists in the data registry
 * @param producer - The address of the producer
 * @returns A boolean indicating if the producer exists
 */
export async function producerExists(producer: string): Promise<boolean> {
  if (!producer) {
    throw new Error('Producer address is required');
  }

  try {
    const publicClient = getPublicClient();
    const metadata = (await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DataRegistryABI,
      functionName: 'getProducerMetadata',
      args: [producer],
    })) as [string, number, number, boolean, number, number];

    // If the did is non-empty, the producer exists
    return metadata[0].length > 0;
  } catch (error) {
    console.error('Error checking if producer exists:', error);
    const parsedError = parseDataRegistryError(error);
    if (parsedError) {
      throw new Error(parsedError.message);
    }
    throw new Error('Failed to check if producer exists');
  }
}

/**
 * Get the DID associated with a producer
 * @param producer - The address of the producer
 * @returns The DID of the producer
 */
export async function getProducerDid(producer: string): Promise<string> {
  if (!producer) {
    throw new Error('Producer address is required');
  }

  try {
    const publicClient = getPublicClient();
    const metadata = (await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DataRegistryABI,
      functionName: 'getProducerMetadata',
      args: [producer],
    })) as [string, number, number, boolean, number, number];

    return metadata[0]; // did
  } catch (error) {
    console.error('Error getting producer DID:', error);
    const parsedError = parseDataRegistryError(error);
    if (parsedError) {
      throw new Error(parsedError.message);
    }
    throw new Error('Failed to get producer DID');
  }
}

/**
 * Get all records for a specific producer
 * @param producer - The address of the producer
 * @returns Array of record IDs and metadata
 */
export async function getProducerRecords(producer: string): Promise<ProducerRecordsResponse> {
  if (!producer) {
    throw new Error('Producer address is required');
  }

  try {
    const publicClient = getPublicClient();

    // Get producer metadata first
    const metadata = (await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DataRegistryABI,
      functionName: 'getProducerMetadata',
      args: [producer],
    })) as [string, number, number, boolean, number, number, number];

    // Get record IDs
    const recordIds = (await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DataRegistryABI,
      functionName: 'getProducerRecords',
      args: [producer],
    })) as string[];

    // Get record info for each record
    const healthRecords = await Promise.all(
      recordIds.map(async (recordId) => {
        try {
          const result = (await publicClient.readContract({
            address: defaultConfig.contractAddress,
            abi: DataRegistryABI,
            functionName: 'getRecordInfo',
            args: [recordId],
          })) as [Address, ResourceMetadata];

          const [producer, metadata] = result;

          const isVerified = (await publicClient.readContract({
            address: defaultConfig.contractAddress,
            abi: DataRegistryABI,
            functionName: 'isRecordVerified',
            args: [recordId],
          })) as boolean;

          return {
            recordId: metadata.recordId,
            producer: producer as `0x${string}`,
            resourceType: metadata.resourceType as ResourceType,
            cid: metadata.cid,
            contentHash: metadata.contentHash as `0x${string}`,
            dataSize: Number(metadata.dataSize),
            sharedCount: Number(metadata.sharedCount),
            updatedAt: Number(metadata.updatedAt),
            isVerified,
          };
        } catch (error) {
          console.error(`Error fetching record info for ${recordId}:`, error);
          return null;
        }
      })
    );

    const [did, consent, entries, isActive, lastUpdated, nonce, version] = metadata;

    return {
      recordIds,
      healthRecords: healthRecords.filter((r): r is NonNullable<typeof r> => r !== null),
      metadata: {
        did,
        consent: consent as ConsentStatus,
        entries: Number(entries),
        isActive,
        lastUpdated: Number(lastUpdated),
        nonce: Number(nonce),
        version: Number(version),
      },
      total: recordIds.length,
    };
  } catch (error) {
    console.error('Error getting producer records:', error);
    const parsedError = parseDataRegistryError(error);
    if (parsedError) {
      throw new Error(parsedError.message);
    }
    throw new Error('Failed to get producer records');
  }
}

/**
 * Get information about a specific record
 * @param recordId - The string ID of the record
 * @returns Record information including producer and metadata
 */
export async function getRecordInfo(recordId: string): Promise<RecordInfoResponse> {
  if (!recordId) {
    throw new Error('Record ID is required');
  }

  try {
    const publicClient = getPublicClient();
    const result = (await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DataRegistryABI,
      functionName: 'getRecordInfo',
      args: [recordId],
    })) as [boolean, ResourceMetadata];

    const [isVerified, metadata] = result;

    // Get the producer metadata to fill in the rest of the response
    const producerMetadata = await getProducerMetadata(metadata.producer);

    return {
      producer: metadata.producer as `0x${string}`,
      isVerified,
      metadata: {
        ...metadata,
        producer: metadata.producer,
      },
      // Include required fields from ProducerMetadataResponse
      did: producerMetadata.did,
      consent: producerMetadata.consent,
      entries: producerMetadata.entries,
      isActive: producerMetadata.isActive,
      lastUpdated: producerMetadata.lastUpdated,
      nonce: producerMetadata.nonce,
      version: 1,
    };
  } catch (error) {
    console.error('Error getting record info:', error);
    const parsedError = parseDataRegistryError(error);
    if (parsedError) {
      throw new Error(parsedError.message);
    }
    throw new Error('Failed to get record info');
  }
}

/**
 * Check if a consumer has access to a record
 * @param recordId - The string ID of the record
 * @param consumerAddress - The address of the consumer
 * @returns Access information including hasAccess, expiration, accessLevel, and isRevoked
 */
export async function checkAccess(recordId: string, consumerAddress: string): Promise<CheckAccessResponse> {
  if (!recordId) {
    throw new Error('Record ID is required');
  }

  if (!consumerAddress) {
    throw new Error('Consumer address is required');
  }

  try {
    const publicClient = getPublicClient();
    const result = (await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DataRegistryABI,
      functionName: 'checkAccess',
      args: [recordId, consumerAddress],
    })) as [boolean, number, number, boolean];

    return {
      hasAccess: result[0],
      expiration: result[1],
      accessLevel: result[2] as ContractAccessLevel,
      isRevoked: result[3],
    };
  } catch (error) {
    console.error('Error checking access:', error);
    const parsedError = parseDataRegistryError(error);
    if (parsedError) {
      throw new Error(parsedError.message);
    }
    throw new Error('Failed to check access');
  }
}

/**
 * Check if a consumer is authorized to access a record
 * @param recordId - The string ID of the record
 * @param consumerAddress - The address of the consumer
 * @returns A boolean indicating if the consumer is authorized
 */
export async function isConsumerAuthorized(recordId: string, consumerAddress: string): Promise<boolean> {
  try {
    const { hasAccess, isRevoked } = await checkAccess(recordId, consumerAddress);
    return hasAccess && !isRevoked;
  } catch (error) {
    console.error('Error checking if consumer is authorized:', error);
    const parsedError = parseDataRegistryError(error);
    if (parsedError) {
      throw new Error(parsedError.message);
    }
    throw new Error('Failed to check if consumer is authorized');
  }
}

/**
 * Get the total number of records
 * @returns The total number of records
 */
export async function getTotalRecords(): Promise<number> {
  try {
    const publicClient = getPublicClient();
    const total = await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DataRegistryABI,
      functionName: 'getTotalRecords',
      args: [],
    });

    return Number(total);
  } catch (error) {
    console.error('Error getting total records:', error);
    const parsedError = parseDataRegistryError(error);
    if (parsedError) {
      throw new Error(parsedError.message);
    }
    throw new Error('Failed to get total records');
  }
}

/**
 * Check if a record is verified
 * @param recordId - The string ID of the record
 * @returns A boolean indicating if the record is verified
 */
export async function isRecordVerified(recordId: string): Promise<boolean> {
  if (!recordId) {
    throw new Error('Record ID is required');
  }

  try {
    const publicClient = getPublicClient();
    const result = await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DataRegistryABI,
      functionName: 'isRecordVerified',
      args: [recordId],
    });
    return Boolean(result);
  } catch (error) {
    console.error('Error checking if record is verified:', error);
    const parsedError = parseDataRegistryError(error);
    if (parsedError) {
      throw new Error(parsedError.message);
    }
    throw new Error('Failed to check if record is verified');
  }
}

/**
 * Check if a provider is authorized for a record
 * @param provider - The address of the provider
 * @param recordId - The string ID of the record
 * @returns A boolean indicating if the provider is authorized
 */
export async function isAuthorizedProvider(provider: string, recordId: string): Promise<boolean> {
  if (!provider || !recordId) {
    throw new Error('Provider address and record ID are required');
  }

  try {
    const publicClient = getPublicClient();
    const result = await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DataRegistryABI,
      functionName: 'isAuthorizedProvider',
      args: [provider, recordId],
    });
    return Boolean(result);
  } catch (error) {
    console.error('Error checking if provider is authorized:', error);
    const parsedError = parseDataRegistryError(error);
    if (parsedError) {
      throw new Error(parsedError.message);
    }
    throw new Error('Failed to check if provider is authorized');
  }
}

/**
 * Get the pause state of the contract
 * @returns A boolean indicating if the contract is paused
 */
export async function getPauseState(): Promise<boolean> {
  try {
    const publicClient = getPublicClient();
    const result = await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DataRegistryABI,
      functionName: 'paused',
      args: [],
    });
    return Boolean(result);
  } catch (error) {
    console.error('Error getting pause state:', error);
    const parsedError = parseDataRegistryError(error);
    if (parsedError) {
      throw new Error(parsedError.message);
    }
    throw new Error('Failed to get pause state');
  }
}

/**
 * Get producer metadata
 * @param producer - The address of the producer
 * @returns Producer metadata
 */
export async function getProducerMetadata(producer: string): Promise<ProducerMetadataResponse> {
  if (!producer) {
    throw new Error('Producer address is required');
  }

  try {
    const publicClient = getPublicClient();
    const result = (await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DataRegistryABI,
      functionName: 'getProducerMetadata',
      args: [producer],
    })) as [string, number, number, boolean, number, number];

    return {
      did: result[0],
      consent: result[1] as ConsentStatus,
      entries: result[2],
      isActive: result[3],
      lastUpdated: result[4],
      nonce: result[5],
      version: 1,
    };
  } catch (error) {
    console.error('Error getting producer metadata:', error);
    const parsedError = parseDataRegistryError(error);
    if (parsedError) {
      throw new Error(parsedError.message);
    }
    throw new Error('Failed to get producer metadata');
  }
}

// TODO: Add actions for the Data Registry contract
export async function getActiveShares(producer: string): Promise<number> {
  if (!producer) {
    throw new Error('Producer address is required');
  }

  try {
    const publicClient = getPublicClient();

    const result = await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DataRegistryABI,
      functionName: 'getActiveShares',
      args: [producer],
    });

    return Number(result);
  } catch (error) {
    console.error('Error getting active shares:', error);
    const parsedError = parseDataRegistryError(error);
    if (parsedError) {
      throw new Error(parsedError.message);
    }
    throw new Error('Failed to get active shares');
  }
}

/**
 * Get a list of all consumers who have access to a record
 * @param recordId - The ID of the record
 * @returns Array of consumer addresses with their access details
 */
export async function getRecordConsumers(recordId: string): Promise<RecordConsumerResponse[]> {
  if (!recordId) {
    throw new Error('Record ID is required');
  }

  try {
    const publicClient = getPublicClient();

    // Since getRecordConsumers is not directly exposed in the ABI, we'll use events to find consumers
    // This is not as efficient as a direct call but works with the current ABI
    const accessGrantedFilter = await publicClient.createEventFilter({
      address: defaultConfig.contractAddress,
      event: {
        name: 'AccessGranted',
        type: 'event',
        inputs: [
          { indexed: true, name: 'recordId', type: 'string' },
          { indexed: true, name: 'consumer', type: 'address' },
          { indexed: false, name: 'consumerDid', type: 'string' },
          { indexed: false, name: 'expiration', type: 'uint40' },
          { indexed: false, name: 'accessLevel', type: 'uint8' },
        ],
      },
      args: {
        recordId: recordId,
      },
      fromBlock: 'earliest',
    });

    const accessRevokedFilter = await publicClient.createEventFilter({
      address: defaultConfig.contractAddress,
      event: {
        name: 'AccessRevoked',
        type: 'event',
        inputs: [
          { indexed: true, name: 'recordId', type: 'string' },
          { indexed: true, name: 'consumer', type: 'address' },
          { indexed: false, name: 'consumerDid', type: 'string' },
          { indexed: true, name: 'revoker', type: 'address' },
        ],
      },
      args: {
        recordId: recordId,
      },
      fromBlock: 'earliest',
    });

    const accessGrantedLogs = await publicClient.getFilterLogs({ filter: accessGrantedFilter });
    const accessRevokedLogs = await publicClient.getFilterLogs({ filter: accessRevokedFilter });

    // Create a map of consumers for this record
    const consumerMap = new Map<
      string,
      {
        consumerAddress: `0x${string}`;
        accessLevel: AccessLevel;
        expiration: number;
        isRevoked: boolean;
      }
    >();

    // Process access grants - add consumers
    for (const log of accessGrantedLogs) {
      const consumer = log.args.consumer as `0x${string}`;
      const expiration = Number(log.args.expiration || 0);
      const accessLevelValue = Number(log.args.accessLevel || 0);

      // Map to our AccessLevel enum
      let mappedAccessLevel: AccessLevel;
      switch (accessLevelValue) {
        case 0:
          mappedAccessLevel = AccessLevel.None;
          break;
        case 1:
          mappedAccessLevel = AccessLevel.Read;
          break;
        case 2:
          mappedAccessLevel = AccessLevel.Write;
          break;
        default:
          mappedAccessLevel = AccessLevel.None;
      }

      consumerMap.set(consumer, {
        consumerAddress: consumer,
        accessLevel: mappedAccessLevel,
        expiration,
        isRevoked: false,
      });
    }

    // Process revocations - mark as revoked
    for (const log of accessRevokedLogs) {
      const consumer = log.args.consumer as `0x${string}`;
      if (consumerMap.has(consumer)) {
        const currentData = consumerMap.get(consumer)!;
        consumerMap.set(consumer, {
          ...currentData,
          isRevoked: true,
        });
      }
    }

    // For any consumers we found through events, double-check their current status
    const consumers = [...consumerMap.values()];
    const verifiedConsumers = await Promise.all(
      consumers.map(async (consumer) => {
        try {
          // Verify the current status
          const { hasAccess, expiration, accessLevel, isRevoked } = await checkAccess(
            recordId,
            consumer.consumerAddress
          );

          // Map to our AccessLevel enum
          let mappedAccessLevel: AccessLevel;
          switch (Number(accessLevel)) {
            case 0:
              mappedAccessLevel = AccessLevel.None;
              break;
            case 1:
              mappedAccessLevel = AccessLevel.Read;
              break;
            case 2:
              mappedAccessLevel = AccessLevel.Write;
              break;
            default:
              mappedAccessLevel = AccessLevel.None;
          }

          return {
            consumerAddress: consumer.consumerAddress,
            accessLevel: mappedAccessLevel,
            expiration: Number(expiration),
            isRevoked,
          };
        } catch (error) {
          console.error(`Error verifying access for consumer ${consumer.consumerAddress}:`, error);
          return consumer; // Return original data if verification fails
        }
      })
    );

    return verifiedConsumers;
  } catch (error) {
    console.error('Error getting record consumers:', error);
    const parsedError = parseDataRegistryError(error);
    if (parsedError) {
      throw new Error(parsedError.message);
    }
    throw new Error('Failed to get record consumers');
  }
}

/**
 * Get the access history for a record
 * @param recordId - The ID of the record
 * @returns Array of access events
 */
export async function getRecordAccessHistory(recordId: string): Promise<AccessHistoryEvent[]> {
  if (!recordId) {
    throw new Error('Record ID is required');
  }

  try {
    const publicClient = getPublicClient();

    // We'll need to fetch events from the blockchain
    // This is a simplified implementation that adapts to viem's event logging
    const accessGrantedFilter = await publicClient.createEventFilter({
      address: defaultConfig.contractAddress,
      event: {
        name: 'AccessGranted',
        type: 'event',
        inputs: [
          { indexed: true, name: 'recordId', type: 'string' },
          { indexed: true, name: 'consumer', type: 'address' },
          { indexed: false, name: 'consumerDid', type: 'string' },
          { indexed: false, name: 'expiration', type: 'uint40' },
          { indexed: false, name: 'accessLevel', type: 'uint8' },
        ],
      },
      args: {
        recordId: recordId,
      },
      fromBlock: 'earliest',
    });

    const accessRevokedFilter = await publicClient.createEventFilter({
      address: defaultConfig.contractAddress,
      event: {
        name: 'AccessRevoked',
        type: 'event',
        inputs: [
          { indexed: true, name: 'recordId', type: 'string' },
          { indexed: true, name: 'consumer', type: 'address' },
          { indexed: false, name: 'consumerDid', type: 'string' },
          { indexed: true, name: 'revoker', type: 'address' },
        ],
      },
      args: {
        recordId: recordId,
      },
      fromBlock: 'earliest',
    });

    const accessTriggeredFilter = await publicClient.createEventFilter({
      address: defaultConfig.contractAddress,
      event: {
        name: 'AccessTriggered',
        type: 'event',
        inputs: [
          { indexed: true, name: 'recordId', type: 'string' },
          { indexed: true, name: 'consumer', type: 'address' },
          { indexed: false, name: 'consumerDid', type: 'string' },
          { indexed: false, name: 'accessLevel', type: 'uint8' },
        ],
      },
      args: {
        recordId: recordId,
      },
      fromBlock: 'earliest',
    });

    const accessGrantedLogs = await publicClient.getFilterLogs({ filter: accessGrantedFilter });
    const accessRevokedLogs = await publicClient.getFilterLogs({ filter: accessRevokedFilter });
    const accessTriggeredLogs = await publicClient.getFilterLogs({ filter: accessTriggeredFilter });

    // Combine and format all events
    const history = [
      ...accessGrantedLogs.map((log) => ({
        consumer: log.args.consumer as `0x${string}`,
        timestamp: Number(log.blockNumber),
        actionType: 'granted' as const,
        blockNumber: Number(log.blockNumber),
        transactionHash: log.transactionHash,
      })),
      ...accessRevokedLogs.map((log) => ({
        consumer: log.args.consumer as `0x${string}`,
        timestamp: Number(log.blockNumber),
        actionType: 'revoked' as const,
        blockNumber: Number(log.blockNumber),
        transactionHash: log.transactionHash,
      })),
      ...accessTriggeredLogs.map((log) => ({
        consumer: log.args.consumer as `0x${string}`,
        timestamp: Number(log.blockNumber),
        actionType: 'triggered' as const,
        blockNumber: Number(log.blockNumber),
        transactionHash: log.transactionHash,
      })),
    ].sort((a, b) => b.timestamp - a.timestamp);

    return history;
  } catch (error) {
    console.error('Error getting record access history:', error);
    const parsedError = parseDataRegistryError(error);
    if (parsedError) {
      throw new Error(parsedError.message);
    }
    throw new Error('Failed to get record access history');
  }
}

/**
 * Get all records shared with a consumer
 * @param consumerAddress - The address of the consumer
 * @returns Array of records the consumer has access to
 */
export async function getConsumerRecords(consumerAddress: string): Promise<ConsumerRecordResponse[]> {
  if (!consumerAddress) {
    throw new Error('Consumer address is required');
  }

  try {
    const publicClient = getPublicClient();

    // Since getConsumerRecords is not directly exposed in the ABI, we'll use events to find records
    const accessGrantedFilter = await publicClient.createEventFilter({
      address: defaultConfig.contractAddress,
      event: {
        name: 'AccessGranted',
        type: 'event',
        inputs: [
          { indexed: true, name: 'recordId', type: 'string' },
          { indexed: true, name: 'consumer', type: 'address' },
          { indexed: false, name: 'consumerDid', type: 'string' },
          { indexed: false, name: 'expiration', type: 'uint40' },
          { indexed: false, name: 'accessLevel', type: 'uint8' },
        ],
      },
      args: {
        consumer: consumerAddress as `0x${string}`,
      },
      fromBlock: 'earliest',
    });

    const accessGrantedLogs = await publicClient.getFilterLogs({ filter: accessGrantedFilter });

    // Extract all record IDs this consumer has been granted access to
    const recordIds = [...new Set(accessGrantedLogs.map((log) => log.args.recordId as string))];

    // Get details for each record
    const recordDetails = await Promise.all(
      recordIds.map(async (recordId) => {
        try {
          const recordInfo = await getRecordInfo(recordId);
          const { hasAccess, expiration, accessLevel, isRevoked } = await checkAccess(recordId, consumerAddress);

          // Map contract access level to our enum
          let mappedAccessLevel: AccessLevel;
          switch (Number(accessLevel)) {
            case 0:
              mappedAccessLevel = AccessLevel.None;
              break;
            case 1:
              mappedAccessLevel = AccessLevel.Read;
              break;
            case 2:
              mappedAccessLevel = AccessLevel.Write;
              break;
            default:
              mappedAccessLevel = AccessLevel.None;
          }

          return {
            recordId,
            producer: recordInfo.producer,
            resourceType: recordInfo.metadata.resourceType as ResourceType,
            accessLevel: mappedAccessLevel,
            expiration: Number(expiration),
            isRevoked,
          };
        } catch (error) {
          console.error(`Error getting details for record ${recordId}:`, error);
          return null;
        }
      })
    );

    // Filter out any null entries from errors and return only records with active access
    return recordDetails.filter((record): record is NonNullable<typeof record> => record !== null && !record.isRevoked);
  } catch (error) {
    console.error('Error getting consumer records:', error);
    const parsedError = parseDataRegistryError(error);
    if (parsedError) {
      throw new Error(parsedError.message);
    }
    throw new Error('Failed to get consumer records');
  }
}

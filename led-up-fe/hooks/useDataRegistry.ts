import { useState, useCallback, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, usePublicClient } from 'wagmi';
import { parseAbi, type Address } from 'viem';

import { DataRegistryErrorHandler } from '../helpers/error-handler/DataRegistryErrorHandler';
import { DataRegistryEventParser } from '../helpers/event-parser/DataRegistryEventParser';
import { ParsedContractError } from '../helpers/error-handler/BaseErrorHandler';
import { ParsedContractEvent } from '../helpers/event-parser/BaseEventParser';

// Define the DataRegistry contract ABI
const dataRegistryAbi = parseAbi([
  // Producer management
  'function registerProducer(uint8 _status, uint8 _consent) external',
  'function updateProducerStatus(address _producer, uint8 _status) external',
  'function updateProducerConsent(address _producer, uint8 _consent) external',

  // Record management
  'function registerRecord(string _recordId, string _cid, bytes32 _hash) external',
  'function updateRecord(address _producer, string _recordId, string _cid, bytes32 _hash) external',
  'function removeRecord(address _producer, string _recordId) external',

  // Consumer authorization
  'function authorizeConsumer(string _recordId, string _consumerDid) external',
  'function deauthorizeConsumer(string _recordId, string _consumerDid) external',

  // View functions
  'function getRecord(address _producer, string _recordId) external view returns (string cid, bytes32 hash, uint256 timestamp, bool isActive)',
  'function getProducerRecords(address _producer) external view returns (string[] memory)',
  'function isConsumerAuthorized(string _recordId, string _consumerDid) external view returns (bool)',

  // Events
  'event ProducerRegistered(address indexed producer, string indexed ownerDid)',
  'event DataRegistered(string indexed recordId, string ownerDid, string cid, bytes32 hash)',
  'event DataUpdated(address indexed producer, string indexed recordId, string cid, bytes32 hash)',
  'event DataRemoved(address indexed producer, string indexed recordId)',
  'event ConsumerAuthorized(string indexed recordId, string indexed ownerDid, string indexed consumerDid)',
  'event ConsumerDeauthorized(string indexed recordId, string consumerDid)',
  'event DataShared(address indexed producer, address indexed consumer, string recordId, string cid)',
]);

// Define the RecordStatus and ConsentStatus enums
export enum RecordStatus {
  INACTIVE = 0,
  ACTIVE = 1,
  SUSPENDED = 2,
}

export enum ConsentStatus {
  NOT_GRANTED = 0,
  GRANTED = 1,
  REVOKED = 2,
}

// Define the interface for the hook options
interface UseDataRegistryOptions {
  contractAddress: Address;
}

// Define the interface for the hook return value
interface UseDataRegistryReturn {
  // State
  isLoading: boolean;
  error: ParsedContractError | null;
  events: ParsedContractEvent[];

  // Actions
  registerProducer: (status: RecordStatus, consent: ConsentStatus) => Promise<void>;
  registerRecord: (recordId: string, cid: string, hash: string) => Promise<void>;
  updateRecord: (producer: Address, recordId: string, cid: string, hash: string) => Promise<void>;
  removeRecord: (producer: Address, recordId: string) => Promise<void>;
  authorizeConsumer: (recordId: string, consumerDid: string) => Promise<void>;
  deauthorizeConsumer: (recordId: string, consumerDid: string) => Promise<void>;
  getRecord: (producer: Address, recordId: string) => Promise<any>;

  // Utilities
  resetState: () => void;
}

/**
 * Hook for interacting with the DataRegistry contract
 * @param options Options for the hook
 * @returns Functions and state for interacting with the DataRegistry contract
 */
export function useDataRegistry({ contractAddress }: UseDataRegistryOptions): UseDataRegistryReturn {
  // Initialize state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ParsedContractError | null>(null);
  const [events, setEvents] = useState<ParsedContractEvent[]>([]);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);

  // Initialize helpers
  const errorHandler = new DataRegistryErrorHandler(dataRegistryAbi);
  const eventParser = new DataRegistryEventParser(dataRegistryAbi);

  // Get the public client for additional operations
  const publicClient = usePublicClient();

  // Set up contract write
  const { writeContractAsync } = useWriteContract();

  // Set up transaction receipt watching
  const { data: txReceipt } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Set up contract read
  const { data: readData, queryKey } = useReadContract();

  // Parse events when transaction receipt is available
  const parseEventsFromReceipt = useCallback(
    async (receipt: any) => {
      try {
        if (!receipt || !publicClient) return [];

        // Get the block to retrieve the timestamp
        const block = await publicClient.getBlock({ blockNumber: receipt.blockNumber });
        const blockTimestamp = Number(block.timestamp);

        // Parse events from the receipt
        const parsedEvents = eventParser.parseEvents(receipt, blockTimestamp);
        setEvents(parsedEvents);

        return parsedEvents;
      } catch (err) {
        console.error('Error parsing events:', err);
        return [];
      }
    },
    [eventParser, publicClient]
  );

  // Reset the state
  const resetState = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setEvents([]);
    setTxHash(undefined);
  }, []);

  // Handle contract errors
  const handleContractError = useCallback(
    (err: any) => {
      const parsedError = errorHandler.parseError(err);
      setError(parsedError);
      setIsLoading(false);
      return parsedError;
    },
    [errorHandler]
  );

  // Register a producer
  const registerProducer = useCallback(
    async (status: RecordStatus, consent: ConsentStatus) => {
      try {
        setIsLoading(true);
        setError(null);

        const hash = await writeContractAsync({
          address: contractAddress,
          abi: dataRegistryAbi,
          functionName: 'registerProducer',
          args: [status, consent],
        });

        setTxHash(hash);
      } catch (err) {
        handleContractError(err);
        throw err;
      }
    },
    [contractAddress, writeContractAsync, handleContractError]
  );

  // Register a record
  const registerRecord = useCallback(
    async (recordId: string, cid: string, hash: string) => {
      try {
        setIsLoading(true);
        setError(null);

        const txHash = await writeContractAsync({
          address: contractAddress,
          abi: dataRegistryAbi,
          functionName: 'registerRecord',
          args: [recordId, cid, hash as `0x${string}`],
        });

        setTxHash(txHash);
      } catch (err) {
        handleContractError(err);
        throw err;
      }
    },
    [contractAddress, writeContractAsync, handleContractError]
  );

  // Update a record
  const updateRecord = useCallback(
    async (producer: Address, recordId: string, cid: string, hash: string) => {
      try {
        setIsLoading(true);
        setError(null);

        const txHash = await writeContractAsync({
          address: contractAddress,
          abi: dataRegistryAbi,
          functionName: 'updateRecord',
          args: [producer, recordId, cid, hash as `0x${string}`],
        });

        setTxHash(txHash);
      } catch (err) {
        handleContractError(err);
        throw err;
      }
    },
    [contractAddress, writeContractAsync, handleContractError]
  );

  // Remove a record
  const removeRecord = useCallback(
    async (producer: Address, recordId: string) => {
      try {
        setIsLoading(true);
        setError(null);

        const txHash = await writeContractAsync({
          address: contractAddress,
          abi: dataRegistryAbi,
          functionName: 'removeRecord',
          args: [producer, recordId],
        });

        setTxHash(txHash);
      } catch (err) {
        handleContractError(err);
        throw err;
      }
    },
    [contractAddress, writeContractAsync, handleContractError]
  );

  // Authorize a consumer
  const authorizeConsumer = useCallback(
    async (recordId: string, consumerDid: string) => {
      try {
        setIsLoading(true);
        setError(null);

        const txHash = await writeContractAsync({
          address: contractAddress,
          abi: dataRegistryAbi,
          functionName: 'authorizeConsumer',
          args: [recordId, consumerDid],
        });

        setTxHash(txHash);
      } catch (err) {
        handleContractError(err);
        throw err;
      }
    },
    [contractAddress, writeContractAsync, handleContractError]
  );

  // Deauthorize a consumer
  const deauthorizeConsumer = useCallback(
    async (recordId: string, consumerDid: string) => {
      try {
        setIsLoading(true);
        setError(null);

        const txHash = await writeContractAsync({
          address: contractAddress,
          abi: dataRegistryAbi,
          functionName: 'deauthorizeConsumer',
          args: [recordId, consumerDid],
        });

        setTxHash(txHash);
      } catch (err) {
        handleContractError(err);
        throw err;
      }
    },
    [contractAddress, writeContractAsync, handleContractError]
  );

  // Get a record
  const getRecord = useCallback(
    async (producer: Address, recordId: string) => {
      try {
        // Use the public client directly for read operations
        const data = await publicClient?.readContract({
          address: contractAddress,
          abi: dataRegistryAbi,
          functionName: 'getRecord',
          args: [producer, recordId],
        });

        return data;
      } catch (err) {
        handleContractError(err);
        throw err;
      }
    },
    [contractAddress, publicClient, handleContractError]
  );

  // Process transaction receipt when available
  useEffect(() => {
    if (txReceipt && isLoading) {
      parseEventsFromReceipt(txReceipt);
      setIsLoading(false);
    }
  }, [txReceipt, isLoading, parseEventsFromReceipt]);

  return {
    // State
    isLoading,
    error,
    events,

    // Actions
    registerProducer,
    registerRecord,
    updateRecord,
    removeRecord,
    authorizeConsumer,
    deauthorizeConsumer,
    getRecord,

    // Utilities
    resetState,
  };
}

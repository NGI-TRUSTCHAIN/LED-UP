'use client';

import { useQuery, useMutation, useQueryClient, type UseQueryResult, UseQueryOptions } from '@tanstack/react-query';
import {
  DataRegistryEvents,
  AccessGrantedEvent,
  AccessRevokedEvent,
  AccessTriggeredEvent,
  RecordVerifiedEvent,
  RecordRegisteredEvent,
  ProviderAuthorizedEvent,
  ConsumerAuthorizedEvent,
} from '@/lib/events/DataRegistryEvents';
import { ParsedEvent } from '@/lib/events/types';
import { useEffect, useRef } from 'react';
import { Address } from 'viem';
import { useAuth } from '@/features/auth/contexts/auth-provider';
import { useContractAddress } from '@/hooks/use-contract-address';
import { SharedRecord } from '../components/types';

// Default configuration for RPC URL
const defaultRpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'http://localhost:8545';

/**
 * Query keys for events
 */
export const EVENTS_QUERY_KEYS = {
  all: ['dataRegistryEvents'] as const,
  accessGranted: (address?: string, fromBlock?: bigint, toBlock?: bigint | 'latest') =>
    [
      ...EVENTS_QUERY_KEYS.all,
      'accessGranted',
      address,
      fromBlock?.toString(),
      toBlock === 'latest' ? 'latest' : toBlock?.toString(),
    ] as const,
  accessRevoked: (address?: string, fromBlock?: bigint, toBlock?: bigint | 'latest') =>
    [
      ...EVENTS_QUERY_KEYS.all,
      'accessRevoked',
      address,
      fromBlock?.toString(),
      toBlock === 'latest' ? 'latest' : toBlock?.toString(),
    ] as const,
  accessTriggered: (address?: string, fromBlock?: bigint, toBlock?: bigint | 'latest') =>
    [
      ...EVENTS_QUERY_KEYS.all,
      'accessTriggered',
      address,
      fromBlock?.toString(),
      toBlock === 'latest' ? 'latest' : toBlock?.toString(),
    ] as const,
  recordVerified: (address?: string, fromBlock?: bigint, toBlock?: bigint | 'latest') =>
    [
      ...EVENTS_QUERY_KEYS.all,
      'recordVerified',
      address,
      fromBlock?.toString(),
      toBlock === 'latest' ? 'latest' : toBlock?.toString(),
    ] as const,
  recordRegistered: (address?: string, fromBlock?: bigint, toBlock?: bigint | 'latest') =>
    [
      ...EVENTS_QUERY_KEYS.all,
      'recordRegistered',
      address,
      fromBlock?.toString(),
      toBlock === 'latest' ? 'latest' : toBlock?.toString(),
    ] as const,
  providerAuthorized: (address?: string, fromBlock?: bigint, toBlock?: bigint | 'latest') =>
    [
      ...EVENTS_QUERY_KEYS.all,
      'providerAuthorized',
      address,
      fromBlock?.toString(),
      toBlock === 'latest' ? 'latest' : toBlock?.toString(),
    ] as const,
  consumerAuthorized: (address?: string, fromBlock?: bigint, toBlock?: bigint | 'latest') =>
    [
      ...EVENTS_QUERY_KEYS.all,
      'consumerAuthorized',
      address,
      fromBlock?.toString(),
      toBlock === 'latest' ? 'latest' : toBlock?.toString(),
    ] as const,
  sharedWithMe: (consumerAddress?: string, contractAddress?: string) =>
    [...EVENTS_QUERY_KEYS.all, 'sharedWithMe', consumerAddress, contractAddress] as const,
  recordsByProducer: (producerAddress?: string, contractAddress?: string) =>
    [...EVENTS_QUERY_KEYS.all, 'recordsByProducer', producerAddress, contractAddress] as const,
  providersForRecord: (recordId?: string, contractAddress?: string) =>
    [...EVENTS_QUERY_KEYS.all, 'providersForRecord', recordId, contractAddress] as const,
} as const;

/**
 * Hook to get a shared DataRegistryEvents instance
 */
export function useDataRegistryEvents(rpcUrl: string = defaultRpcUrl) {
  const eventsRef = useRef<DataRegistryEvents | null>(null);
  const prevRpcUrlRef = useRef<string>(rpcUrl);

  useEffect(() => {
    // Check if the RPC URL has changed
    if (!eventsRef.current || rpcUrl !== prevRpcUrlRef.current) {
      // Update the stored URL and recreate
      if (eventsRef.current) {
        console.log('RPC URL changed, recreating events instance');
        eventsRef.current.unsubscribeAll();
      }
      console.log(`Creating DataRegistryEvents with RPC URL: ${rpcUrl}`);
      eventsRef.current = new DataRegistryEvents(rpcUrl);
      prevRpcUrlRef.current = rpcUrl;
    }
  }, [rpcUrl]);

  if (!eventsRef.current) {
    eventsRef.current = new DataRegistryEvents(rpcUrl);
    prevRpcUrlRef.current = rpcUrl;
  }

  return eventsRef.current;
}

/**
 * Hook for querying AccessGranted events
 */
export function useAccessGrantedEvents(
  contractAddress?: Address,
  fromBlock?: bigint,
  toBlock: bigint | 'latest' = 'latest',
  options?: { enabled?: boolean; refetchInterval?: number }
): UseQueryResult<ParsedEvent<AccessGrantedEvent>[]> {
  const events = useDataRegistryEvents();

  return useQuery({
    queryKey: EVENTS_QUERY_KEYS.accessGranted(contractAddress, fromBlock, toBlock),
    queryFn: async () => {
      if (!contractAddress) {
        return [];
      }

      return await events.queryAccessGrantedEvents(contractAddress, fromBlock ?? 0n, toBlock);
    },
    enabled: !!contractAddress && (options?.enabled ?? true),
    refetchInterval: options?.refetchInterval,
  });
}

/**
 * Hook for querying AccessRevoked events
 */
export function useAccessRevokedEvents(
  contractAddress?: Address,
  fromBlock?: bigint,
  toBlock: bigint | 'latest' = 'latest',
  options?: { enabled?: boolean; refetchInterval?: number }
): UseQueryResult<ParsedEvent<AccessRevokedEvent>[]> {
  const events = useDataRegistryEvents();

  return useQuery({
    queryKey: EVENTS_QUERY_KEYS.accessRevoked(contractAddress, fromBlock, toBlock),
    queryFn: async () => {
      if (!contractAddress) {
        return [];
      }

      return await events.queryAccessRevokedEvents(contractAddress, fromBlock ?? 0n, toBlock);
    },
    enabled: !!contractAddress && (options?.enabled ?? true),
    refetchInterval: options?.refetchInterval,
  });
}

/**
 * Hook for querying AccessTriggered events
 */
export function useAccessTriggeredEvents(
  contractAddress?: Address,
  fromBlock?: bigint,
  toBlock: bigint | 'latest' = 'latest',
  options?: { enabled?: boolean; refetchInterval?: number }
): UseQueryResult<ParsedEvent<AccessTriggeredEvent>[]> {
  const events = useDataRegistryEvents();

  return useQuery({
    queryKey: EVENTS_QUERY_KEYS.accessTriggered(contractAddress, fromBlock, toBlock),
    queryFn: async () => {
      if (!contractAddress) {
        return [];
      }

      return await events.queryAccessTriggeredEvents(contractAddress, fromBlock ?? 0n, toBlock);
    },
    enabled: !!contractAddress && (options?.enabled ?? true),
    refetchInterval: options?.refetchInterval,
  });
}

/**
 * Hook for querying RecordVerified events
 */
export function useRecordVerifiedEvents(
  contractAddress?: Address,
  fromBlock?: bigint,
  toBlock: bigint | 'latest' = 'latest',
  options?: { enabled?: boolean; refetchInterval?: number }
): UseQueryResult<ParsedEvent<RecordVerifiedEvent>[]> {
  const events = useDataRegistryEvents();

  return useQuery({
    queryKey: EVENTS_QUERY_KEYS.recordVerified(contractAddress, fromBlock, toBlock),
    queryFn: async () => {
      if (!contractAddress) {
        return [];
      }

      return await events.queryRecordVerifiedEvents(contractAddress, fromBlock ?? 0n, toBlock);
    },
    enabled: !!contractAddress && (options?.enabled ?? true),
    refetchInterval: options?.refetchInterval,
  });
}

/**
 * Hook for querying RecordRegistered events
 */
export function useRecordRegisteredEvents(
  contractAddress?: Address,
  fromBlock?: bigint,
  toBlock: bigint | 'latest' = 'latest',
  options?: { enabled?: boolean; refetchInterval?: number }
): UseQueryResult<ParsedEvent<RecordRegisteredEvent>[]> {
  const events = useDataRegistryEvents();

  return useQuery({
    queryKey: EVENTS_QUERY_KEYS.recordRegistered(contractAddress, fromBlock, toBlock),
    queryFn: async () => {
      if (!contractAddress) {
        return [];
      }

      return await events.queryRecordRegisteredEvents(contractAddress, fromBlock ?? 0n, toBlock);
    },
    enabled: !!contractAddress && (options?.enabled ?? true),
    refetchInterval: options?.refetchInterval,
  });
}

/**
 * Hook for querying ProviderAuthorized events
 */
export function useProviderAuthorizedEvents(
  contractAddress?: Address,
  fromBlock?: bigint,
  toBlock: bigint | 'latest' = 'latest',
  options?: { enabled?: boolean; refetchInterval?: number }
): UseQueryResult<ParsedEvent<ProviderAuthorizedEvent>[]> {
  const events = useDataRegistryEvents();

  return useQuery({
    queryKey: EVENTS_QUERY_KEYS.providerAuthorized(contractAddress, fromBlock, toBlock),
    queryFn: async () => {
      if (!contractAddress) {
        return [];
      }

      return await events.queryProviderAuthorizedEvents(contractAddress, fromBlock ?? 0n, toBlock);
    },
    enabled: !!contractAddress && (options?.enabled ?? true),
    refetchInterval: options?.refetchInterval,
  });
}

/**
 * Hook for querying ConsumerAuthorized events
 */
export function useConsumerAuthorizedEvents(
  contractAddress?: Address,
  fromBlock?: bigint,
  toBlock: bigint | 'latest' = 'latest',
  options?: { enabled?: boolean; refetchInterval?: number }
): UseQueryResult<ParsedEvent<ConsumerAuthorizedEvent>[]> {
  const events = useDataRegistryEvents();

  return useQuery({
    queryKey: EVENTS_QUERY_KEYS.consumerAuthorized(contractAddress, fromBlock, toBlock),
    queryFn: async () => {
      if (!contractAddress) {
        return [];
      }

      return await events.queryConsumerAuthorizedEvents(contractAddress, fromBlock ?? 0n, toBlock);
    },
    enabled: !!contractAddress && (options?.enabled ?? true),
    refetchInterval: options?.refetchInterval,
  });
}

// Type for the options parameter in useSharedWithMeRecords
interface UseSharedWithMeRecordsOptions extends Omit<UseQueryOptions<SharedRecord[], Error>, 'queryKey' | 'queryFn'> {
  refetchInterval?: number;
}

/**
 * Custom hook to fetch records shared with the current user
 */
export const useSharedWithMeRecords = (options?: UseSharedWithMeRecordsOptions) => {
  const { address, isAuthenticated } = useAuth();
  const { dataRegistryAddress } = useContractAddress();
  const queryClient = useQueryClient();
  const events = useDataRegistryEvents(); // Use the shared instance

  // Set up subscription to events
  useEffect(() => {
    if (!dataRegistryAddress || !address || !isAuthenticated) return;

    // Define callback for event notifications
    const handleAccessGrantedEvent = (event: ParsedEvent<AccessGrantedEvent>) => {
      if (event.args.consumer === address) {
        queryClient.invalidateQueries({ queryKey: ['shared-records', address] });
      }
    };

    const handleAccessRevokedEvent = (event: ParsedEvent<AccessRevokedEvent>) => {
      if (event.args.consumer === address) {
        queryClient.invalidateQueries({ queryKey: ['shared-records', address] });
      }
    };

    // Set up listeners for both event types
    events.listenToAccessGranted(
      dataRegistryAddress as Address,
      handleAccessGrantedEvent,
      options?.refetchInterval || 60000
    );

    events.listenToAccessRevoked(
      dataRegistryAddress as Address,
      handleAccessRevokedEvent,
      options?.refetchInterval || 60000
    );

    return () => {
      events.unsubscribe(dataRegistryAddress as Address);
    };
  }, [events, dataRegistryAddress, address, isAuthenticated, queryClient, options?.refetchInterval]);

  // Process events into records
  const processEvents = (
    grantedEvents: ParsedEvent<AccessGrantedEvent>[],
    revokedEvents: ParsedEvent<AccessRevokedEvent>[],
    userAddress: Address
  ): SharedRecord[] => {
    const revokedMap = new Map<string, Address>();

    revokedEvents.forEach((event) => {
      if (event.args.consumer === userAddress) {
        revokedMap.set(event.args.recordId, event.args.revoker);
      }
    });

    return grantedEvents
      .filter((event) => event.args.consumer === userAddress)
      .map((event) => {
        // Calculate a default timestamp based on expiration if not available
        const estimatedTimestamp = Number(event.args.expiration) - 30 * 24 * 60 * 60; // 30 days before expiration

        return {
          recordId: event.args.recordId,
          consumerDid: event.args.consumerDid,
          expiration: event.args.expiration,
          accessLevel: event.args.accessLevel,
          isRevoked: revokedMap.has(event.args.recordId),
          revokedBy: revokedMap.get(event.args.recordId),
          grantedAt: new Date(estimatedTimestamp * 1000),
        };
      });
  };

  // Main query to fetch shared records
  return useQuery<SharedRecord[], Error>({
    queryKey: ['shared-records', address],
    queryFn: async () => {
      if (!events || !dataRegistryAddress || !address) {
        throw new Error('Missing required parameters');
      }

      const [grantedEvents, revokedEvents] = await Promise.all([
        events.queryAccessGrantedEvents(dataRegistryAddress as Address, 0n, 'latest'),
        events.queryAccessRevokedEvents(dataRegistryAddress as Address, 0n, 'latest'),
      ]);

      return processEvents(grantedEvents, revokedEvents, address as Address);
    },
    enabled: !!events && !!dataRegistryAddress && !!address && !!isAuthenticated && options?.enabled !== false,
    ...options,
  });
};

/**
 * Custom hook to revoke access to a record
 */
export const useRevokeAccess = () => {
  const { dataRegistryAddress } = useContractAddress();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ recordId }: { recordId: string }) => {
      if (!dataRegistryAddress) {
        throw new Error('DataRegistry address not found');
      }

      // Simulate contract call for now
      console.log(`Revoking access to record ${recordId} on contract ${dataRegistryAddress}`);

      // Mock delay to simulate blockchain transaction
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return { success: true };
    },
    onSuccess: () => {
      // Invalidate shared records query to refresh the data
      queryClient.invalidateQueries({ queryKey: ['shared-records'] });
    },
  });
};

/**
 * Custom hook to trigger access to a record
 */
export const useTriggerAccess = () => {
  const { dataRegistryAddress } = useContractAddress();

  return useMutation({
    mutationFn: async ({ recordId }: { recordId: string }) => {
      if (!dataRegistryAddress) {
        throw new Error('DataRegistry address not found');
      }

      // Simulate contract call for now
      console.log(`Triggering access to record ${recordId} on contract ${dataRegistryAddress}`);

      // Mock delay to simulate blockchain transaction
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Return mock data
      return {
        id: recordId,
        type: 'Health Record',
        data: {
          patient: {
            id: 'patient-123',
            name: 'John Doe',
            birthDate: '1980-01-01',
          },
          observations: [
            {
              id: 'obs-1',
              date: '2023-01-15',
              type: 'Blood Pressure',
              value: '120/80',
              unit: 'mmHg',
            },
            {
              id: 'obs-2',
              date: '2023-01-15',
              type: 'Heart Rate',
              value: '72',
              unit: 'bpm',
            },
          ],
        },
      };
    },
  });
};

/**
 * Custom hook that provides records registered by a specific producer
 */
export function useRecordsByProducerEvents(
  producerAddress?: Address,
  contractAddress?: Address,
  options?: {
    fromBlock?: bigint;
    toBlock?: bigint | 'latest';
    refetchInterval?: number;
    enabled?: boolean;
  }
) {
  const fromBlock = options?.fromBlock ?? 0n;
  const toBlock = options?.toBlock ?? 'latest';

  const { data: registeredEvents, isLoading } = useRecordRegisteredEvents(contractAddress, fromBlock, toBlock, {
    enabled: !!producerAddress && !!contractAddress && (options?.enabled ?? true),
    refetchInterval: options?.refetchInterval,
  });

  const processedRecords = useQuery({
    queryKey: EVENTS_QUERY_KEYS.recordsByProducer(producerAddress, contractAddress),
    queryFn: () => {
      if (!registeredEvents || !producerAddress) {
        return [];
      }

      // Filter events for the specific producer
      return registeredEvents
        .filter((event) => event.args.provider === producerAddress)
        .map((event) => ({
          recordId: event.args.recordId,
          did: event.args.did,
          cid: event.args.cid,
          contentHash: event.args.contentHash,
          provider: event.args.provider,
          registeredAt: new Date(Number(event.blockNumber || 0n) * 1000),
          blockNumber: event.blockNumber || 0n,
        }));
    },
    enabled: !!registeredEvents && !!producerAddress && (options?.enabled ?? true),
  });

  return {
    ...processedRecords,
    isLoading: isLoading || processedRecords.isLoading,
  };
}

/**
 * Hook to get all providers authorized for a specific record
 */
export function useProvidersForRecord(
  recordId?: string,
  contractAddress?: Address,
  options?: {
    fromBlock?: bigint;
    toBlock?: bigint | 'latest';
    refetchInterval?: number;
    enabled?: boolean;
  }
) {
  const fromBlock = options?.fromBlock ?? 0n;
  const toBlock = options?.toBlock ?? 'latest';

  const { data: providerEvents, isLoading } = useProviderAuthorizedEvents(contractAddress, fromBlock, toBlock, {
    enabled: !!recordId && !!contractAddress && (options?.enabled ?? true),
    refetchInterval: options?.refetchInterval,
  });

  const providersData = useQuery({
    queryKey: EVENTS_QUERY_KEYS.providersForRecord(recordId, contractAddress),
    queryFn: () => {
      if (!providerEvents || !recordId) {
        return [];
      }

      // Filter events for the specific record
      return providerEvents
        .filter((event) => event.args.recordId === recordId)
        .map((event) => ({
          recordId: event.args.recordId,
          provider: event.args.provider,
          accessLevel: event.args.accessLevel,
          timestamp: event.args.timestamp,
          authorizedAt: new Date(Number(event.blockNumber || 0n) * 1000),
        }));
    },
    enabled: !!providerEvents && !!recordId && (options?.enabled ?? true),
  });

  return {
    ...providersData,
    isLoading: isLoading || providersData.isLoading,
  };
}

/**
 * Hook to subscribe to real-time AccessGranted events
 */
export function useAccessGrantedSubscription(
  contractAddress?: Address,
  callback?: (event: ParsedEvent<AccessGrantedEvent>) => void,
  pollingInterval = 15000
) {
  const events = useDataRegistryEvents();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!contractAddress || !callback) return;

    // Set up the event subscription
    const setupSubscription = async () => {
      await events.listenToAccessGranted(
        contractAddress,
        (event) => {
          // Call the callback with the event
          callback(event);

          // Invalidate relevant queries
          queryClient.invalidateQueries({
            queryKey: EVENTS_QUERY_KEYS.accessGranted(contractAddress),
          });
          queryClient.invalidateQueries({
            queryKey: EVENTS_QUERY_KEYS.sharedWithMe(),
          });
        },
        pollingInterval
      );
    };

    setupSubscription();

    // Clean up subscription
    return () => {
      events.unsubscribe(contractAddress);
    };
  }, [contractAddress, callback, events, pollingInterval, queryClient]);
}

/**
 * Hook to subscribe to real-time AccessRevoked events
 */
export function useAccessRevokedSubscription(
  contractAddress?: Address,
  callback?: (event: ParsedEvent<AccessRevokedEvent>) => void,
  pollingInterval = 15000
) {
  const events = useDataRegistryEvents();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!contractAddress || !callback) return;

    // Set up the event subscription
    const setupSubscription = async () => {
      await events.listenToAccessRevoked(
        contractAddress,
        (event) => {
          // Call the callback with the event
          callback(event);

          // Invalidate relevant queries
          queryClient.invalidateQueries({
            queryKey: EVENTS_QUERY_KEYS.accessRevoked(contractAddress),
          });
          queryClient.invalidateQueries({
            queryKey: EVENTS_QUERY_KEYS.sharedWithMe(),
          });
        },
        pollingInterval
      );
    };

    setupSubscription();

    // Clean up subscription
    return () => {
      events.unsubscribe(contractAddress);
    };
  }, [contractAddress, callback, events, pollingInterval, queryClient]);
}

/**
 * Hook to subscribe to real-time RecordRegistered events
 */
export function useRecordRegisteredSubscription(
  contractAddress?: Address,
  callback?: (event: ParsedEvent<RecordRegisteredEvent>) => void,
  pollingInterval = 15000
) {
  const events = useDataRegistryEvents();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!contractAddress || !callback) return;

    // Set up the event subscription
    const setupSubscription = async () => {
      await events.listenToRecordRegistered(
        contractAddress,
        (event) => {
          // Call the callback with the event
          callback(event);

          // Invalidate relevant queries
          queryClient.invalidateQueries({
            queryKey: EVENTS_QUERY_KEYS.recordRegistered(contractAddress),
          });
          queryClient.invalidateQueries({
            queryKey: EVENTS_QUERY_KEYS.recordsByProducer(),
          });
        },
        pollingInterval
      );
    };

    setupSubscription();

    // Clean up subscription
    return () => {
      events.unsubscribe(contractAddress);
    };
  }, [contractAddress, callback, events, pollingInterval, queryClient]);
}

/**
 * Hook to subscribe to real-time ConsumerAuthorized events
 */
export function useConsumerAuthorizedSubscription(
  contractAddress?: Address,
  callback?: (event: ParsedEvent<ConsumerAuthorizedEvent>) => void,
  pollingInterval = 15000
) {
  const events = useDataRegistryEvents();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!contractAddress || !callback) return;

    // Set up the event subscription
    const setupSubscription = async () => {
      await events.listenToConsumerAuthorized(
        contractAddress,
        (event) => {
          // Call the callback with the event
          callback(event);

          // Invalidate relevant queries
          queryClient.invalidateQueries({
            queryKey: EVENTS_QUERY_KEYS.consumerAuthorized(contractAddress),
          });
        },
        pollingInterval
      );
    };

    setupSubscription();

    // Clean up subscription
    return () => {
      events.unsubscribe(contractAddress);
    };
  }, [contractAddress, callback, events, pollingInterval, queryClient]);
}

// Type for consumer authorized records
interface ConsumerAuthorizedRecord {
  recordId: string;
  consumer: Address;
  accessLevel: number;
  expiration: bigint;
  authorizedAt: Date;
}

// Type for the options parameter in useConsumerAuthorizedRecords
interface UseConsumerAuthorizedRecordsOptions
  extends Omit<UseQueryOptions<ConsumerAuthorizedRecord[], Error>, 'queryKey' | 'queryFn'> {
  refetchInterval?: number;
}

/**
 * Custom hook to fetch records authorized for a specific consumer
 */
export const useConsumerAuthorizedRecords = (
  consumerAddress?: Address,
  options?: UseConsumerAuthorizedRecordsOptions
) => {
  const { dataRegistryAddress } = useContractAddress();
  const events = useDataRegistryEvents();

  // Process events into records
  const processEvents = (authorizedEvents: ParsedEvent<ConsumerAuthorizedEvent>[]): ConsumerAuthorizedRecord[] => {
    return authorizedEvents
      .filter((event) => event.args.consumer === consumerAddress)
      .map((event) => ({
        recordId: event.args.recordId,
        consumer: event.args.consumer,
        accessLevel: event.args.accessLevel,
        expiration: event.args.expiration,
        authorizedAt: event.timestamp ? new Date(event.timestamp * 1000) : new Date(),
      }));
  };

  // Main query to fetch authorized records
  return useQuery<ConsumerAuthorizedRecord[], Error>({
    queryKey: ['consumer-authorized-records', consumerAddress, dataRegistryAddress],
    queryFn: async () => {
      if (!events || !dataRegistryAddress || !consumerAddress) {
        throw new Error('Missing required parameters');
      }

      const authorizedEvents = await events.queryConsumerAuthorizedEvents(dataRegistryAddress as Address, 0n, 'latest');

      return processEvents(authorizedEvents);
    },
    enabled: !!events && !!dataRegistryAddress && !!consumerAddress && options?.enabled !== false,
    ...options,
  });
};

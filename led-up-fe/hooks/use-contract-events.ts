'use client';

import { useQuery } from '@tanstack/react-query';
import { createPublicClient, http, PublicClient, AbiParameter } from 'viem';
import { mainnet } from 'viem/chains';
import { useState } from 'react';

export interface EventQueryConfig {
  contractAddress: `0x${string}`;
  chainId: number;
  rpcUrl: string;
  fromBlock?: bigint;
  toBlock?: bigint | 'latest';
  enabled?: boolean;
}

export interface EventFilterOptions<TArgs = any> {
  eventName: string;
  eventInputs: readonly AbiParameter[];
  filterPredicate?: (log: any) => boolean;
}

export interface PaginationOptions {
  pageSize: number;
  pageIndex: number;
}

export interface EventData<TEventArgs = any> {
  transactionHash: `0x${string}`;
  blockNumber: number;
  timestamp?: number; // Optional as we might not always have the timestamp
  args: TEventArgs;
  [key: string]: any; // Allow for additional properties
}

export interface UseContractEventsResult<TEventArgs = any> {
  events: EventData<TEventArgs>[];
  isLoading: boolean;
  error: Error | null;
  totalEvents: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  pageCount: number;
  setPageIndex: (pageIndex: number) => void;
  setPageSize: (pageSize: number) => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  refetch: () => Promise<any>;
}

/**
 * Custom hook for fetching and paginating contract events
 * @param config Contract configuration
 * @param eventFilter Event filter options
 * @param paginationOptions Pagination options
 * @returns Events, loading state, error, and pagination controls
 */
export function useContractEvents<TEventArgs = any>(
  config: EventQueryConfig,
  eventFilter: EventFilterOptions<TEventArgs>,
  paginationOptions?: Partial<PaginationOptions>
): UseContractEventsResult<TEventArgs> {
  const { contractAddress, chainId, rpcUrl, fromBlock = BigInt(0), toBlock = 'latest', enabled = true } = config;

  const { eventName, eventInputs, filterPredicate } = eventFilter;

  // Initialize pagination state
  const [pageSize, setPageSize] = useState(paginationOptions?.pageSize || 10);
  const [pageIndex, setPageIndex] = useState(paginationOptions?.pageIndex || 0);

  // Fetch contract events
  const {
    data: queryResult,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      'contractEvents',
      contractAddress,
      chainId,
      eventName,
      fromBlock ? fromBlock.toString() : '0', // Convert BigInt to string
      toBlock === 'latest' ? 'latest' : toBlock ? toBlock.toString() : 'latest', // Handle 'latest' or BigInt
      pageIndex,
      pageSize,
    ],
    queryFn: async () => {
      if (!contractAddress || !chainId || !rpcUrl) {
        throw new Error('Required configuration parameters are missing');
      }

      // Create public client
      const publicClient = createPublicClient({
        chain: {
          ...mainnet,
          id: chainId,
        },
        transport: http(rpcUrl),
      });

      // Get all events first to determine total count
      const allLogs = await fetchLogs(publicClient, contractAddress, eventName, eventInputs, fromBlock, toBlock);

      // Apply custom filter if provided
      const filteredLogs = filterPredicate ? allLogs.filter(filterPredicate) : allLogs;

      // Apply pagination
      const paginatedLogs = paginateLogs(filteredLogs, pageIndex, pageSize);

      // Transform logs to a more detailed format
      const transformedLogs = await transformLogs(publicClient, paginatedLogs);

      return {
        events: transformedLogs,
        totalEvents: filteredLogs.length,
      };
    },
    enabled: enabled && !!contractAddress && !!chainId && !!rpcUrl,
  });

  // Pagination helpers
  const totalEvents = queryResult?.totalEvents || 0;
  const pageCount = Math.ceil(totalEvents / pageSize);
  const hasNextPage = pageIndex < pageCount - 1;
  const hasPreviousPage = pageIndex > 0;

  const goToNextPage = () => {
    if (hasNextPage) {
      setPageIndex(pageIndex + 1);
    }
  };

  const goToPreviousPage = () => {
    if (hasPreviousPage) {
      setPageIndex(pageIndex - 1);
    }
  };

  return {
    events: queryResult?.events || [],
    isLoading,
    error: error as Error | null,
    totalEvents,
    hasNextPage,
    hasPreviousPage,
    pageCount,
    setPageIndex,
    setPageSize,
    goToNextPage,
    goToPreviousPage,
    refetch,
  };
}

/**
 * Fetch logs from the blockchain
 */
async function fetchLogs<TEventArgs = any>(
  publicClient: PublicClient,
  contractAddress: `0x${string}`,
  eventName: string,
  eventInputs: readonly AbiParameter[],
  fromBlock: bigint,
  toBlock: bigint | 'latest'
): Promise<any[]> {
  try {
    return await publicClient.getLogs({
      address: contractAddress,
      event: {
        type: 'event',
        name: eventName,
        inputs: eventInputs,
      },
      fromBlock,
      toBlock,
    });
  } catch (error) {
    console.error(`Error fetching ${eventName} events:`, error);
    throw error;
  }
}

/**
 * Apply pagination to logs
 */
function paginateLogs<T>(logs: T[], pageIndex: number, pageSize: number): T[] {
  const startIndex = pageIndex * pageSize;
  const endIndex = startIndex + pageSize;
  return logs.slice(startIndex, endIndex);
}

/**
 * Transform blockchain logs to a more useful format
 */
async function transformLogs<TEventArgs = any>(
  publicClient: PublicClient,
  logs: any[]
): Promise<EventData<TEventArgs>[]> {
  // Create a map to batch block timestamp requests
  const blockNumbers = [...new Set(logs.map((log) => log.blockNumber))];
  const blockTimestamps: Record<string, number> = {};

  // Fetch block timestamps in parallel
  await Promise.all(
    blockNumbers.map(async (blockNumber) => {
      try {
        const block = await publicClient.getBlock({ blockNumber });
        blockTimestamps[blockNumber.toString()] = Number(block.timestamp);
      } catch (error) {
        console.warn(`Failed to fetch timestamp for block ${blockNumber}:`, error);
      }
    })
  );

  // Transform logs with timestamps
  return logs.map((log) => {
    const blockNumber = Number(log.blockNumber);
    const timestamp = blockTimestamps[log.blockNumber.toString()];

    return {
      transactionHash: log.transactionHash,
      blockNumber,
      timestamp,
      logIndex: log.logIndex,
      args: log.args || {},
      // Add more fields as needed
    };
  });
}

/**
 * Hook to get contract events with automatic mock data for development
 */
export function useContractEventsWithMocks<TEventArgs = any, TMockData = any>(
  config: EventQueryConfig,
  eventFilter: EventFilterOptions<TEventArgs>,
  paginationOptions?: Partial<PaginationOptions>,
  mockOptions?: {
    generateMockData: (count: number) => TMockData[];
    mockCount?: number;
  }
): UseContractEventsResult<TEventArgs | TMockData> {
  const result = useContractEvents<TEventArgs>(config, eventFilter, paginationOptions);

  // If we're in development and have no events, generate mock data
  if (
    process.env.NODE_ENV === 'development' &&
    result.events.length === 0 &&
    !result.isLoading &&
    mockOptions?.generateMockData
  ) {
    const mockCount = mockOptions.mockCount || 10;
    const mockData = mockOptions.generateMockData(mockCount);

    return {
      ...result,
      events: mockData as any,
      totalEvents: mockCount,
      pageCount: Math.ceil(mockCount / (paginationOptions?.pageSize || 10)),
      hasNextPage: (paginationOptions?.pageIndex || 0) < Math.ceil(mockCount / (paginationOptions?.pageSize || 10)) - 1,
    };
  }

  return result;
}

'use client';

import { useMemo, useEffect } from 'react';
import { type Address } from 'viem';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';

/**
 * Hook to access the Viem public client
 * @returns The Viem public client
 */
export function useViemPublicClient() {
  const publicClient = usePublicClient();

  useEffect(() => {
    if (!publicClient) return;

    // Check if we're using a WebSocket transport
    const isWebSocket = publicClient.transport.type === 'webSocket';
    if (!isWebSocket) return;

    // Set up a heartbeat to keep the connection alive
    const intervalId = setInterval(() => {
      publicClient.getBlockNumber().catch((err) => {
        console.warn('WebSocket heartbeat failed:', err);
      });
    }, 30000); // Every 30 seconds

    return () => {
      clearInterval(intervalId);
    };
  }, [publicClient]);

  return publicClient;
}

/**
 * Hook to access the Viem wallet client
 * @param chainId Optional chain ID to use
 * @returns The Viem wallet client and account address
 */
export function useViemWalletClient({ chainId }: { chainId?: number } = {}) {
  const { data: walletClient } = useWalletClient({ chainId });
  const { address } = useAccount();

  return useMemo(
    () => ({
      walletClient,
      address: address as Address | undefined,
    }),
    [walletClient, address]
  );
}

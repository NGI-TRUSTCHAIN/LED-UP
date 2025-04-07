'use client';

import { BrowserProvider, JsonRpcSigner } from 'ethers';
import { useMemo } from 'react';
import type { Account, Chain, Client, Transport } from 'viem';
import { type Config, useConnectorClient } from 'wagmi';

/**
 * Converts a Viem client to an ethers.js signer
 * @param client The Viem client
 * @returns An ethers.js signer
 */
export function clientToSigner(client: Client<Transport, Chain, Account>): JsonRpcSigner {
  const { account, chain, transport } = client;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  const provider = new BrowserProvider(transport, network);
  const signer = new JsonRpcSigner(provider, account.address);
  return signer;
}

/**
 * Hook to convert a Viem Wallet Client to an ethers.js Signer
 * @param chainId Optional chain ID to use
 * @returns An ethers.js signer or undefined if not available
 */
export function useEthersSigner({ chainId }: { chainId?: number } = {}) {
  const { data: client } = useConnectorClient<Config>({ chainId });
  return useMemo(() => (client ? clientToSigner(client) : undefined), [client]);
}

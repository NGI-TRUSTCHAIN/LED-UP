'use client';

import { useCallback } from 'react';
import { useWalletClient } from 'wagmi';
import { ethers } from 'ethers';

/**
 * Hook to get an ethers.js signer from the connected wallet
 * @returns An object containing the signer and a loading state
 */
export function useWalletSigner() {
  const { data: walletClient, isLoading } = useWalletClient();

  /**
   * Get an ethers.js signer from the wallet client
   * @returns An ethers.js signer or null if not available
   */
  const getSigner = useCallback(async () => {
    if (!walletClient) return null;

    // Create an ethers provider from the wallet client
    const provider = new ethers.BrowserProvider(walletClient.transport);

    // Get the signer from the provider
    const signer = await provider.getSigner();

    return signer;
  }, [walletClient]);

  return {
    getSigner,
    isLoading,
  };
}

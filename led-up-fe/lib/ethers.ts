'use client';

import { ethers } from 'ethers';
import { useWalletClient, usePublicClient } from 'wagmi';
import { useState, useEffect } from 'react';

/**
 * Get contract addresses from environment variables
 * @returns An object containing contract addresses
 */
export function getContractAddresses() {
  return {
    DID_REGISTRY_ADDRESS: process.env.NEXT_PUBLIC_DID_REGISTRY_ADDRESS || '',
    DID_AUTH_ADDRESS: process.env.NEXT_PUBLIC_DID_AUTH_ADDRESS || '',
    DID_ACCESS_CONTROL_ADDRESS: process.env.NEXT_PUBLIC_DID_ACCESS_CONTROL_ADDRESS || '',
    DATA_REGISTRY_ADDRESS: process.env.NEXT_PUBLIC_DATA_REGISTRY_ADDRESS || '',
  };
}

/**
 * Hook to get an ethers provider using Wagmi
 * @returns An ethers provider
 */
export function useEthersProvider() {
  const publicClient = usePublicClient();

  return {
    provider: new ethers.JsonRpcProvider(publicClient?.transport?.url || 'http://localhost:8545'),
  };
}

/**
 * Hook to get an ethers signer using Wagmi
 * @returns An ethers signer
 */
export function useEthersSigner() {
  const { data: walletClient } = useWalletClient();
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getSigner = async () => {
      if (!walletClient) {
        setSigner(null);
        setIsLoading(false);
        return;
      }

      try {
        // Create a signer from the wallet client
        const provider = new ethers.BrowserProvider(window.ethereum);
        const newSigner = await provider.getSigner(walletClient.account.address);
        setSigner(newSigner);
      } catch (error) {
        console.error('Error getting signer:', error);
        setSigner(null);
      } finally {
        setIsLoading(false);
      }
    };

    getSigner();
  }, [walletClient]);

  return {
    signer,
    isLoading,
    address: walletClient?.account.address,
  };
}

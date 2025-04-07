'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { Address, Abi, PublicClient, WalletClient } from 'viem';

import { DidRegistryServiceViem } from '@/services/DidRegistryServiceViem';
import { ServiceBaseViem } from '@/services/ServiceBaseViem';
import { ContractType } from '@/helpers/ContractHandlerFactory';
// Import other Viem-based services as they are created
// import { DidAccessControlServiceViem } from '@/services/DidAccessControlServiceViem';
// import { DidAuthServiceViem } from '@/services/DidAuthServiceViem';
// ...

import { useViemPublicClient, useViemWalletClient } from './use-viem-clients';

// Import ABIs
import {
  DidRegistryABI,
  DidAccessControlABI,
  DidAuthABI,
  DidIssuerABI,
  DidVerifierABI,
  DataRegistryABI,
  CompensationABI,
  ConsentManagementABI as ConsentABI,
  ERC20ABI as TokenABI,
} from '@/abi';

/**
 * Hook to access blockchain services using Viem
 * @returns An object containing the loading state, connection status, and blockchain services
 */
export const useBlockchainServicesViem = () => {
  const { isConnected } = useAccount();
  const publicClient = useViemPublicClient();
  const { walletClient, address } = useViemWalletClient();

  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<{
    didRegistryService: DidRegistryServiceViem | null;
    // Add other services as they are created
    // didAccessControlService: DidAccessControlServiceViem | null;
    // didAuthService: DidAuthServiceViem | null;
    // ...
  }>({
    didRegistryService: null,
    // didAccessControlService: null,
    // didAuthService: null,
    // ...
  });

  useEffect(() => {
    const initializeServices = async () => {
      try {
        // Get contract address from environment variable
        const didRegistryAddress = process.env.NEXT_PUBLIC_DID_REGISTRY_CONTRACT_ADDRESS || '';

        // Ensure we have a public client for read operations
        if (!publicClient) {
          console.error('Public client is required but not available');
          setLoading(false);
          return;
        }

        try {
          // Validate ABI before creating service
          if (!DidRegistryABI || (!Array.isArray(DidRegistryABI) && !('abi' in DidRegistryABI))) {
            console.error('Invalid DID Registry ABI:', DidRegistryABI);
            throw new Error('Invalid DID Registry ABI');
          }

          // Create the DID Registry service
          const didRegistryService = new DidRegistryServiceViem(
            didRegistryAddress as Address,
            DidRegistryABI as unknown as Abi,
            publicClient,
            walletClient,
            address
          );

          setServices({
            didRegistryService,
            // didAccessControlService,
            // didAuthService,
            // ...
          });
        } catch (error) {
          console.error('Error creating DID Registry service:', error);
          console.error('Error details:', {
            name: error instanceof Error ? error.name : 'Unknown',
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : 'No stack trace',
          });

          setServices({
            didRegistryService: null,
            // didAccessControlService: null,
            // didAuthService: null,
            // ...
          });
        }
      } catch (error) {
        console.error('Error initializing blockchain services:', error);
        setServices({
          didRegistryService: null,
          // didAccessControlService: null,
          // didAuthService: null,
          // ...
        });
      } finally {
        setLoading(false);
      }
    };

    // Only initialize if we have a public client
    if (publicClient) {
      initializeServices();
    } else {
      console.warn('Public client not available, skipping service initialization');
      setLoading(false);
    }
  }, [isConnected, publicClient, walletClient, address]);

  // Add a separate effect to update existing services when wallet connection changes
  useEffect(() => {
    // Only update if services exist and any of the clients or account changed
    if (services.didRegistryService && (publicClient || walletClient || address)) {
      services.didRegistryService.updateClients(publicClient, walletClient, address);
    }
  }, [publicClient, walletClient, address, services.didRegistryService]);

  return {
    loading,
    isConnected,
    ...services,
  };
};

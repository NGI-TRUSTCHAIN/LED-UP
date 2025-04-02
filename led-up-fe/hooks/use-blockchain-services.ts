'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

import { DidRegistryService } from '@/services/DidRegistryService';
import { DidAccessControlService } from '@/services/DidAccessControlService';
import { DidAuthService } from '@/services/DidAuthService';
import { DidIssuerService } from '@/services/DidIssuerService';
import { DidVerifierService } from '@/services/DidVerifierService';
import { DataRegistryService } from '@/services/DataRegistryService';
import { CompensationService } from '@/services/CompensationService';
import { ConsentService } from '@/services/ConsentService';
import { TokenService } from '@/services/TokenService';
import { ZKPService } from '@/services/ZKPService';

import { useSonner } from './use-sonner';

import { useEthersSigner } from './use-ethers-signer';

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
 * Hook to access blockchain services
 * @returns An object containing the loading state, connection status, and blockchain services
 */
export const useBlockchainServices = () => {
  const { isConnected } = useAccount();
  const signer = useEthersSigner();
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<{
    didRegistryService: DidRegistryService | null;
    didAccessControlService: DidAccessControlService | null;
    didAuthService: DidAuthService | null;
    didIssuerService: DidIssuerService | null;
    didVerifierService: DidVerifierService | null;
    dataRegistryService: DataRegistryService | null;
    compensationService: CompensationService | null;
    consentService: ConsentService | null;
    tokenService: TokenService | null;
    // zkpService: ZKPService | null;
  }>({
    didRegistryService: null,
    didAccessControlService: null,
    didAuthService: null,
    didIssuerService: null,
    didVerifierService: null,
    dataRegistryService: null,
    compensationService: null,
    consentService: null,
    tokenService: null,
    // zkpService: null,
  });

  const { toast } = useSonner();

  useEffect(() => {
    const initializeServices = async () => {
      if (!isConnected) {
        toast.error('Connection Error', {
          description: 'Please connect your wallet to continue',
          action: {
            label: 'Try Again',
            onClick: () => {
              window.location.reload();
            },
          },
        });
        setLoading(false);
        return;
      }

      if (!signer) {
        toast.error('Signer Error', {
          description: 'Please connect your wallet to continue',
        });
        setLoading(false);
        return;
      }

      try {
        // Get contract addresses from environment variables
        const didRegistryAddress = process.env.NEXT_PUBLIC_DID_REGISTRY_CONTRACT_ADDRESS || '';
        const didAccessControlAddress = process.env.NEXT_PUBLIC_DID_ACCESS_CONTROL_CONTRACT_ADDRESS || '';
        const didAuthAddress = process.env.NEXT_PUBLIC_DID_AUTH_CONTRACT_ADDRESS || '';
        const didIssuerAddress = process.env.NEXT_PUBLIC_DID_ISSUER_CONTRACT_ADDRESS || '';
        const didVerifierAddress = process.env.NEXT_PUBLIC_DID_VERIFIER_CONTRACT_ADDRESS || '';
        const dataRegistryAddress = process.env.NEXT_PUBLIC_DATA_REGISTRY_CONTRACT_ADDRESS || '';
        const compensationAddress = process.env.NEXT_PUBLIC_COMPENSATION_CONTRACT_ADDRESS || '';
        const consentAddress = process.env.NEXT_PUBLIC_CONSENT_MANAGEMENT_CONTRACT_ADDRESS || '';
        const tokenAddress = process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS || '';
        const zkpAddress = process.env.NEXT_PUBLIC_ZKP_CONTRACT_ADDRESS || '';

        // Verify signer is valid before creating services
        if (!signer.provider) {
          toast.error('Signer Error', {
            description: 'Please connect your wallet to continue',
          });
          setLoading(false);
          return;
        }

        // Log signer address for debugging
        try {
          const signerAddress = await signer.getAddress();
        } catch (error) {
          toast.error('Signer Error', {
            description: 'Please connect your wallet to continue',
          });
          setLoading(false);
          return;
        }

        // Create service instance
        const didRegistryService = new DidRegistryService(didRegistryAddress, DidRegistryABI, signer);
        const didAccessControlService = new DidAccessControlService(
          didAccessControlAddress,
          DidAccessControlABI,
          signer
        );
        const didAuthService = new DidAuthService(didAuthAddress, DidAuthABI, signer);
        const didIssuerService = new DidIssuerService(didIssuerAddress, DidIssuerABI, signer);
        const didVerifierService = new DidVerifierService(didVerifierAddress, DidVerifierABI, signer);
        const dataRegistryService = new DataRegistryService(dataRegistryAddress, DataRegistryABI, signer);
        const compensationService = new CompensationService(compensationAddress, CompensationABI, signer);
        const consentService = new ConsentService(consentAddress, ConsentABI, signer);
        const tokenService = new TokenService(tokenAddress, TokenABI, signer);
        // const zkpService = new ZKPService(zkpAddress, ZKPABI, signer);

        setServices({
          didRegistryService,
          didAccessControlService,
          didAuthService,
          didIssuerService,
          didVerifierService,
          dataRegistryService,
          compensationService,
          consentService,
          tokenService,
          // zkpService,
        });
      } catch (error) {
        toast.error('Error initializing blockchain services:', {
          description: 'Please try again',
        });
        // Log more detailed error information
        if (error instanceof Error) {
          console.error('Error name:', error.name);
          console.error('Error message:', error.message);
          console.error('Error stack:', error.stack);
        }
      } finally {
        setLoading(false);
      }
    };

    initializeServices();
  }, [isConnected, signer]);

  return {
    loading,
    isConnected,
    ...services,
  };
};

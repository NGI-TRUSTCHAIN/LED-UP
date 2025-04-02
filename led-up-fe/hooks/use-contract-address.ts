'use client';
import { useMemo } from 'react';

// In a production environment, these would be environment variables or configuration
const CONTRACT_ADDRESSES = {
  dataRegistry: process.env.NEXT_PUBLIC_DATA_REGISTRY_CONTRACT_ADDRESS as string,
  didRegistry: process.env.NEXT_PUBLIC_DID_REGISTRY_CONTRACT_ADDRESS as string,
  compensation: process.env.NEXT_PUBLIC_COMPENSATION_CONTRACT_ADDRESS as string,
  didAuth: process.env.NEXT_PUBLIC_DID_AUTH_CONTRACT_ADDRESS as string,
  didVerifier: process.env.NEXT_PUBLIC_DID_VERIFIER_CONTRACT_ADDRESS as string,
  didIssuer: process.env.NEXT_PUBLIC_DID_ISSUER_CONTRACT_ADDRESS as string,
};

export function useContractAddress() {
  return useMemo(
    () => ({
      dataRegistryAddress: CONTRACT_ADDRESSES.dataRegistry,
      didRegistryAddress: CONTRACT_ADDRESSES.didRegistry,
      compensationAddress: CONTRACT_ADDRESSES.compensation,
      didAuthAddress: CONTRACT_ADDRESSES.didAuth,
      didVerifierAddress: CONTRACT_ADDRESSES.didVerifier,
      didIssuerAddress: CONTRACT_ADDRESSES.didIssuer,
    }),
    []
  );
}

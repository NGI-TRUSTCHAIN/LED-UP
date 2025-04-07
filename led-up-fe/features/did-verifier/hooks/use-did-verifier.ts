'use client';

/**
 * @file DID Verifier Hooks
 * @description React Query hooks for the DID Verifier contract
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as actions from '../actions';

/**
 * Query keys for the DID Verifier contract
 */
export const didVerifierKeys = {
  all: ['did-verifier'] as const,
  issuerTrust: (credentialType: string, issuer: string) =>
    [...didVerifierKeys.all, 'issuer-trust', credentialType, issuer] as const,
  verifyCredential: (credentialType: string, issuer: string, subject: string) =>
    [...didVerifierKeys.all, 'verify-credential', credentialType, issuer, subject] as const,
};

/**
 * Hook to check if an issuer is trusted for a specific credential type
 * @param credentialType - The type of credential
 * @param issuer - The issuer address
 */
export function useIsIssuerTrusted(credentialType: string, issuer: `0x${string}`) {
  return useQuery({
    queryKey: didVerifierKeys.issuerTrust(credentialType, issuer),
    queryFn: () => actions.isIssuerTrusted(credentialType, issuer),
    enabled: !!credentialType && !!issuer,
  });
}

/**
 * Hook to verify a credential
 * @param credentialType - The type of credential
 * @param issuer - The issuer address
 * @param subject - The subject of the credential
 */
export function useVerifyCredential(credentialType: string, issuer: `0x${string}`, subject: string) {
  return useQuery({
    queryKey: didVerifierKeys.verifyCredential(credentialType, issuer, subject),
    queryFn: () => actions.verifyCredential(credentialType, issuer, subject),
    enabled: !!credentialType && !!issuer && !!subject,
  });
}

/**
 * Hook to set the trust status of an issuer for a specific credential type
 */
export function useSetIssuerTrustStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      credentialType,
      issuer,
      trusted,
      privateKey,
    }: {
      credentialType: string;
      issuer: `0x${string}`;
      trusted: boolean;
      privateKey: string;
    }) => actions.setIssuerTrustStatus(credentialType, issuer, trusted, privateKey),
    onSuccess: (_, variables) => {
      // Invalidate the relevant query
      queryClient.invalidateQueries({
        queryKey: didVerifierKeys.issuerTrust(variables.credentialType, variables.issuer),
      });
    },
  });
}

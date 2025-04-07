'use client';

/**
 * @file DID Issuer Hooks
 * @description This file contains all React Query hooks for the DID Issuer contract.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as didIssuerActions from '@/features/did-issuer/actions';

/**
 * Query keys for the DID Issuer contract
 */
export const DID_ISSUER_KEYS = {
  all: ['did-issuer'] as const,
  credentialValid: (credentialId: string) => [...DID_ISSUER_KEYS.all, 'credentialValid', credentialId] as const,
};

// Query hooks

/**
 * Hook to check if a credential is valid
 * @param credentialId The credential ID to check
 * @returns Query result with the credential validity status
 */
export function useIsCredentialValid(credentialId?: string) {
  return useQuery({
    queryKey: DID_ISSUER_KEYS.credentialValid(credentialId || ''),
    queryFn: () => didIssuerActions.isCredentialValid(credentialId as string),
    enabled: !!credentialId,
  });
}

// Mutation hooks

/**
 * Hook to issue a credential
 * @returns Mutation result for issuing a credential
 */
export function useIssueCredential() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      credentialType,
      subject,
      credentialId,
      privateKey,
    }: {
      credentialType: string;
      subject: string;
      credentialId: string;
      privateKey: string;
    }) => {
      if (!privateKey) {
        throw new Error('Private key is required');
      }
      return didIssuerActions.issueCredential(credentialType, subject, credentialId, privateKey);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: DID_ISSUER_KEYS.credentialValid(variables.credentialId) });
    },
  });
}

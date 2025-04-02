'use client';

/**
 * @file Consent Management Hooks
 * @description React Query hooks for the Consent Management contract
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as actions from '../actions';

/**
 * Query keys for the Consent Management contract
 */
export const consentManagementKeys = {
  all: ['consent-management'] as const,
  validConsent: (producerDid: string, providerDid: string) =>
    [...consentManagementKeys.all, 'valid-consent', producerDid, providerDid] as const,
  consentDetails: (producerDid: string, providerDid: string) =>
    [...consentManagementKeys.all, 'consent-details', producerDid, providerDid] as const,
  authority: () => [...consentManagementKeys.all, 'authority'] as const,
};

/**
 * Hook to check if a producer has given valid consent to a provider
 * @param producerDid - The DID of the producer
 * @param providerDid - The DID of the provider
 */
export function useHasValidConsent(producerDid: string, providerDid: string) {
  return useQuery({
    queryKey: consentManagementKeys.validConsent(producerDid, providerDid),
    queryFn: () => actions.hasValidConsent(producerDid, providerDid),
    enabled: !!producerDid && !!providerDid,
  });
}

/**
 * Hook to query consent details between a producer and provider
 * @param producerDid - The DID of the producer
 * @param providerDid - The DID of the provider
 */
export function useQueryConsent(producerDid: string, providerDid: string) {
  return useQuery({
    queryKey: consentManagementKeys.consentDetails(producerDid, providerDid),
    queryFn: () => actions.queryConsent(producerDid, providerDid),
    enabled: !!producerDid && !!providerDid,
  });
}

/**
 * Hook to get the authority address for the contract
 */
export function useAuthority() {
  return useQuery({
    queryKey: consentManagementKeys.authority(),
    queryFn: () => actions.getAuthority(),
  });
}

/**
 * Hook to grant consent to a provider
 */
export function useGrantConsent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      providerDid,
      purpose,
      expiryTime,
      privateKey,
    }: {
      providerDid: string;
      purpose: string;
      expiryTime: bigint;
      privateKey: string;
    }) => actions.grantConsent(providerDid, purpose, expiryTime, privateKey),
    onSuccess: (_, variables) => {
      // Get the producer DID from the account that signed the transaction
      // This is a simplification - in a real app, you'd need to derive the producerDid from the account
      const producerDid = 'current-user-did'; // This should be dynamically determined

      // Invalidate the relevant queries
      queryClient.invalidateQueries({
        queryKey: consentManagementKeys.validConsent(producerDid, variables.providerDid),
      });
      queryClient.invalidateQueries({
        queryKey: consentManagementKeys.consentDetails(producerDid, variables.providerDid),
      });
    },
  });
}

/**
 * Hook to revoke consent from a provider
 */
export function useRevokeConsent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ providerDid, reason, privateKey }: { providerDid: string; reason: string; privateKey: string }) =>
      actions.revokeConsent(providerDid, reason, privateKey),
    onSuccess: (_, variables) => {
      // Get the producer DID from the account that signed the transaction
      // This is a simplification - in a real app, you'd need to derive the producerDid from the account
      const producerDid = 'current-user-did'; // This should be dynamically determined

      // Invalidate the relevant queries
      queryClient.invalidateQueries({
        queryKey: consentManagementKeys.validConsent(producerDid, variables.providerDid),
      });
      queryClient.invalidateQueries({
        queryKey: consentManagementKeys.consentDetails(producerDid, variables.providerDid),
      });
    },
  });
}

/**
 * Hook to set the authority address for the contract
 */
export function useSetAuthority() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ newAuthority, privateKey }: { newAuthority: `0x${string}`; privateKey: string }) =>
      actions.setAuthority(newAuthority, privateKey),
    onSuccess: () => {
      // Invalidate the authority query
      queryClient.invalidateQueries({
        queryKey: consentManagementKeys.authority(),
      });
    },
  });
}

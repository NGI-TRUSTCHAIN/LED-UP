'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as didAuthActions from '@/features/did-auth/actions';
import { Role } from '@/features/did-auth/actions/mutation';

/**
 * Hook to authenticate a DID for a specific role
 * @param did - The DID to authenticate
 * @param role - The role to authenticate for
 */
export function useAuthenticate(did?: string, role?: string) {
  return useQuery({
    queryKey: ['didAuth', 'authenticate', did, role],
    queryFn: () => didAuthActions.authenticate(did!, role!),
    enabled: !!did && !!role,
  });
}

/**
 * Hook to get the DID for an address
 * @param address - The address to get the DID for
 */
export function useGetDid(address?: string) {
  return useQuery({
    queryKey: ['didAuth', 'getDid', address],
    queryFn: () => didAuthActions.getDid(address!),
    enabled: !!address,
  });
}

/**
 * Hook to get the required credential for a role
 * @param role - The role to get the required credential for
 */
export function useRequiredCredentialForRole(role?: string) {
  return useQuery({
    queryKey: ['didAuth', 'getRequiredCredentialForRole', role],
    queryFn: () => didAuthActions.getRequiredCredentialForRole(role!),
    enabled: !!role,
  });
}

/**
 * Hook to check if a DID has the required roles and credentials
 * @param did - The DID to check
 * @param roles - The roles to check
 * @param credentialIds - The credential IDs to check
 */
export function useHasRequiredRolesAndCredentials(did?: string, roles?: string[], credentialIds?: string[]) {
  return useQuery({
    queryKey: ['didAuth', 'hasRequiredRolesAndCredentials', did, roles, credentialIds],
    queryFn: () => didAuthActions.hasRequiredRolesAndCredentials(did!, roles!, credentialIds!),
    enabled: !!did && !!roles && !!credentialIds,
  });
}

/**
 * Hook to verify a credential for an action
 * @param did - The DID to verify
 * @param credentialType - The credential type to verify
 * @param credentialId - The credential ID to verify
 */
export function useVerifyCredentialForAction(did?: string, credentialType?: string, credentialId?: string) {
  return useQuery({
    queryKey: ['didAuth', 'verifyCredentialForAction', did, credentialType, credentialId],
    queryFn: () => didAuthActions.verifyCredentialForAction(did!, credentialType!, credentialId!),
    enabled: !!did && !!credentialType && !!credentialId,
  });
}

/**
 * Hook to get the consumer credential type
 */
export function useConsumerCredential() {
  return useQuery({
    queryKey: ['didAuth', 'getConsumerCredential'],
    queryFn: () => didAuthActions.getConsumerCredential(),
  });
}

/**
 * Hook to get the consumer role
 */
export function useConsumerRole() {
  return useQuery({
    queryKey: ['didAuth', 'getConsumerRole'],
    queryFn: () => didAuthActions.getConsumerRole(),
  });
}

/**
 * Hook to get the producer credential type
 */
export function useProducerCredential() {
  return useQuery({
    queryKey: ['didAuth', 'getProducerCredential'],
    queryFn: () => didAuthActions.getProducerCredential(),
  });
}

/**
 * Hook to get the producer role
 */
export function useProducerRole() {
  return useQuery({
    queryKey: ['didAuth', 'getProducerRole'],
    queryFn: () => didAuthActions.getProducerRole(),
  });
}

/**
 * Hook to get the service provider credential type
 */
export function useServiceProviderCredential() {
  return useQuery({
    queryKey: ['didAuth', 'getServiceProviderCredential'],
    queryFn: () => didAuthActions.getServiceProviderCredential(),
  });
}

/**
 * Hook to get the service provider role
 */
export function useServiceProviderRole() {
  return useQuery({
    queryKey: ['didAuth', 'getServiceProviderRole'],
    queryFn: () => didAuthActions.getServiceProviderRole(),
  });
}

/**
 * Hook to get the access control contract address
 */
export function useAccessControlAddress() {
  return useQuery({
    queryKey: ['didAuth', 'getAccessControlAddress'],
    queryFn: () => didAuthActions.getAccessControlAddress(),
  });
}

/**
 * Hook to get the DID issuer contract address
 */
export function useDidIssuerAddress() {
  return useQuery({
    queryKey: ['didAuth', 'getDidIssuerAddress'],
    queryFn: () => didAuthActions.getDidIssuerAddress(),
  });
}

/**
 * Hook to get the DID registry contract address
 */
export function useDidRegistryAddress() {
  return useQuery({
    queryKey: ['didAuth', 'getDidRegistryAddress'],
    queryFn: () => didAuthActions.getDidRegistryAddress(),
  });
}

/**
 * Hook to get the DID verifier contract address
 */
export function useDidVerifierAddress() {
  return useQuery({
    queryKey: ['didAuth', 'getDidVerifierAddress'],
    queryFn: () => didAuthActions.getDidVerifierAddress(),
  });
}

/**
 * Hook to get the caller's DID
 */
export function useCallerDid() {
  return useQuery({
    queryKey: ['didAuth', 'getCallerDid'],
    queryFn: () => didAuthActions.getCallerDid(),
  });
}

/**
 * Hook to resolve a DID to its controller address
 * @param did - The DID to resolve
 */
export function useResolveDid(did?: string) {
  return useQuery({
    queryKey: ['didAuth', 'resolveDid', did],
    queryFn: () => didAuthActions.resolveDid(did!),
    enabled: !!did,
  });
}

/**
 * Hook to check if a DID has a specific role
 * @param did - The DID to check
 * @param role - The role to check
 */
export function useHasDidRole(did?: string, role?: string) {
  return useQuery({
    queryKey: ['didAuth', 'hasDidRole', did, role],
    queryFn: () => didAuthActions.hasDidRole(did!, role!),
    enabled: !!did && !!role,
  });
}

/**
 * Hook to check if an account has a specific role
 * @param role - The role to check
 * @param account - The account to check
 */
export function useHasRole(role?: string, account?: `0x${string}`) {
  return useQuery({
    queryKey: ['didAuth', 'hasRole', role, account],
    queryFn: () => didAuthActions.hasRole(role!, account!),
    enabled: !!role && !!account,
  });
}

/**
 * Hook to check if an issuer is trusted for a credential type
 * @param credentialType - The credential type to check
 * @param issuer - The issuer address to check
 */
export function useIsTrustedIssuer(credentialType?: string, issuer?: `0x${string}`) {
  return useQuery({
    queryKey: ['didAuth', 'isTrustedIssuer', credentialType, issuer],
    queryFn: () => didAuthActions.isTrustedIssuer(credentialType!, issuer!),
    enabled: !!credentialType && !!issuer,
  });
}

/**
 * Hook to grant a role to a DID
 */
export function useGrantDidRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ did, role }: { did: string; role: Role }) => didAuthActions.grantDidRole(did, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['didAuth'] });
    },
  });
}

/**
 * Hook to revoke a role from a DID
 */
export function useRevokeDidRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ did, role }: { did: string; role: string }) => didAuthActions.revokeDidRole(did, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['didAuth'] });
    },
  });
}

/**
 * Hook to set a trusted issuer for a credential type
 */
export function useSetTrustedIssuer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      credentialType,
      issuer,
      trusted,
    }: {
      credentialType: string;
      issuer: `0x${string}`;
      trusted: boolean;
    }) => didAuthActions.setTrustedIssuer(credentialType, issuer, trusted),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['didAuth'] });
    },
  });
}

/**
 * Hook to set the credential requirement for a role
 */
export function useSetRoleRequirement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ role, requirement }: { role: string; requirement: string }) =>
      didAuthActions.setRoleRequirement(role, requirement),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['didAuth'] });
    },
  });
}

/**
 * Hook to issue a credential to a DID
 */
export function useIssueCredential() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      credentialType,
      did,
      credentialId,
    }: {
      credentialType: string;
      did: string;
      credentialId: string;
    }) => didAuthActions.issueCredential(credentialType, did, credentialId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['didAuth'] });
    },
  });
}

/**
 * Hook to get all roles assigned to a DID
 * @param did - The DID to get roles for
 */
export function useUserRoles(did?: string) {
  return useQuery<`0x${string}`[], Error>({
    queryKey: ['didAuth', 'getUserRoles', did],
    queryFn: () => didAuthActions.getUserRoles(did!),
    enabled: !!did,
  });
}

/**
 * Hook to get all roles assigned to an address
 * @param address - The address to get roles for
 */
export function useUserRolesByAddress(address?: `0x${string}`) {
  return useQuery<`0x${string}`[], Error>({
    queryKey: ['didAuth', 'getUserRolesByAddress', address],
    queryFn: () => didAuthActions.getUserRolesByAddress(address!),
    enabled: !!address,
  });
}

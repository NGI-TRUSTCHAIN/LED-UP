'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import {
  // Query functions
  getAdminRole,
  getDefaultAdminRole,
  getOperatorRole,
  getDidRegistryAddress,
  getRoleAdmin,
  getRoleRequirement,
  hasDidRole,
  hasRole,
  supportsInterface,

  // Mutation functions
  grantDidRole,
  grantRole,
  renounceRole,
  revokeDidRole,
  revokeRole,
  setRoleRequirement,
  processTransactionResponse,
} from '../actions';

// Query hook types
type UseHasDidRoleParams = { did?: string; role?: `0x${string}` };
type UseHasRoleParams = { role?: `0x${string}`; account?: `0x${string}` };
type UseRoleAdminParams = { role?: `0x${string}` };
type UseRoleRequirementParams = { role?: `0x${string}` };
type UseSupportsInterfaceParams = { interfaceId?: `0x${string}` };

// Mutation hook types
type GrantDidRoleParams = { did: string; role: `0x${string}`; privateKey: string };
type GrantRoleParams = { role: `0x${string}`; account: `0x${string}`; privateKey: string };
type RenounceRoleParams = { role: `0x${string}`; callerConfirmation: `0x${string}`; privateKey: string };
type RevokeDidRoleParams = { did: string; role: `0x${string}`; privateKey: string };
type RevokeRoleParams = { role: `0x${string}`; account: `0x${string}`; privateKey: string };
type SetRoleRequirementParams = { role: `0x${string}`; requirement: string; privateKey: string };
type ProcessTransactionResponseParams = { txHash: `0x${string}`; path?: string };

// Query Hooks

/**
 * Hook to get the ADMIN role
 */
export function useAdminRole() {
  return useQuery({
    queryKey: ['didAccessControl', 'adminRole'],
    queryFn: () => getAdminRole(),
  });
}

/**
 * Hook to get the DEFAULT_ADMIN_ROLE
 */
export function useDefaultAdminRole() {
  return useQuery({
    queryKey: ['didAccessControl', 'defaultAdminRole'],
    queryFn: () => getDefaultAdminRole(),
  });
}

/**
 * Hook to get the OPERATOR role
 */
export function useOperatorRole() {
  return useQuery({
    queryKey: ['didAccessControl', 'operatorRole'],
    queryFn: () => getOperatorRole(),
  });
}

/**
 * Hook to get the DID Registry contract address
 */
export function useDidRegistryAddress() {
  return useQuery({
    queryKey: ['didAccessControl', 'didRegistryAddress'],
    queryFn: () => getDidRegistryAddress(),
  });
}

/**
 * Hook to get the admin role for a role
 */
export function useRoleAdmin({ role }: UseRoleAdminParams = {}) {
  return useQuery({
    queryKey: ['didAccessControl', 'roleAdmin', role],
    queryFn: () => (role ? getRoleAdmin(role) : Promise.resolve(undefined)),
    enabled: !!role,
  });
}

/**
 * Hook to get the requirement for a role
 */
export function useRoleRequirement({ role }: UseRoleRequirementParams = {}) {
  return useQuery({
    queryKey: ['didAccessControl', 'roleRequirement', role],
    queryFn: () => (role ? getRoleRequirement(role) : Promise.resolve(undefined)),
    enabled: !!role,
  });
}

/**
 * Hook to check if a DID has a role
 */
export function useHasDidRole({ did, role }: UseHasDidRoleParams = {}) {
  return useQuery({
    queryKey: ['didAccessControl', 'hasDidRole', did, role],
    queryFn: () => (did && role ? hasDidRole(did, role) : Promise.resolve(undefined)),
    enabled: !!did && !!role,
  });
}

/**
 * Hook to check if an account has a role
 */
export function useHasRole({ role, account }: UseHasRoleParams = {}) {
  return useQuery({
    queryKey: ['didAccessControl', 'hasRole', role, account],
    queryFn: () => (role && account ? hasRole(role, account) : Promise.resolve(undefined)),
    enabled: !!role && !!account,
  });
}

/**
 * Hook to check if the contract supports an interface
 */
export function useSupportsInterface({ interfaceId }: UseSupportsInterfaceParams = {}) {
  return useQuery({
    queryKey: ['didAccessControl', 'supportsInterface', interfaceId],
    queryFn: () => (interfaceId ? supportsInterface(interfaceId) : Promise.resolve(undefined)),
    enabled: !!interfaceId,
  });
}

// Mutation Hooks

/**
 * Hook to grant a role to a DID
 */
export function useGrantDidRole() {
  return useMutation({
    mutationFn: ({ did, role, privateKey }: GrantDidRoleParams) => grantDidRole(did, role, privateKey),
  });
}

/**
 * Hook to grant a role to an account
 */
export function useGrantRole() {
  return useMutation({
    mutationFn: ({ role, account, privateKey }: GrantRoleParams) => grantRole(role, account, privateKey),
  });
}

/**
 * Hook to renounce a role
 */
export function useRenounceRole() {
  return useMutation({
    mutationFn: ({ role, callerConfirmation, privateKey }: RenounceRoleParams) =>
      renounceRole(role, callerConfirmation, privateKey),
  });
}

/**
 * Hook to revoke a role from a DID
 */
export function useRevokeDidRole() {
  return useMutation({
    mutationFn: ({ did, role, privateKey }: RevokeDidRoleParams) => revokeDidRole(did, role, privateKey),
  });
}

/**
 * Hook to revoke a role from an account
 */
export function useRevokeRole() {
  return useMutation({
    mutationFn: ({ role, account, privateKey }: RevokeRoleParams) => revokeRole(role, account, privateKey),
  });
}

/**
 * Hook to set a requirement for a role
 */
export function useSetRoleRequirement() {
  return useMutation({
    mutationFn: ({ role, requirement, privateKey }: SetRoleRequirementParams) =>
      setRoleRequirement(role, requirement, privateKey),
  });
}

/**
 * Hook to process a transaction response
 */
export function useProcessTransactionResponse() {
  return useMutation({
    mutationFn: ({ txHash, path }: ProcessTransactionResponseParams) => processTransactionResponse(txHash, path),
  });
}

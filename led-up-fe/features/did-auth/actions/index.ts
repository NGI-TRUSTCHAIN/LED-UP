/**
 * DID Auth Actions
 *
 * This file exports all the query and mutation functions for the DID Auth contract.
 * These functions are used with React Query to fetch and mutate data from the DID Auth contract.
 */

export {
  authenticate,
  getDid,
  getRequiredCredentialForRole,
  hasRequiredRolesAndCredentials,
  verifyCredentialForAction,
  getConsumerCredential,
  getConsumerRole,
  getProducerCredential,
  getProducerRole,
  getServiceProviderCredential,
  getServiceProviderRole,
  getAccessControlAddress,
  getDidIssuerAddress,
  getDidRegistryAddress,
  getDidVerifierAddress,
  getCallerDid,
  resolveDid,
  hasDidRole,
  hasRole,
  isTrustedIssuer,
  getUserRoles,
  getUserRolesByAddress,
} from './query';

export {
  processTransactionReceipt,
  grantDidRole,
  revokeDidRole,
  setTrustedIssuer,
  setRoleRequirement,
  issueCredential,
} from './mutation';

/**
 * Data Registry Feature
 *
 * This module provides hooks, utilities, and types for interacting with the LED-UP Data Registry smart contract.
 */

// Export server actions
export * from './actions';

// Export contract interaction utilities
export {
  getContractAbi,
  getErrorHandler,
  prepareContractWriteRequest,
  withContractWrite,
  withContractRead,
  isContractPaused,
  validateContractConditions,
} from '../../utils/contract-interaction';

// Export hook factories
export { createContractMutation, createSimpleContractMutation } from '../../hooks/use-contract-mutation';

export {
  createContractQuery,
  createSimpleContractQuery,
  createSimpleContractQueryWithoutParams,
} from '../../hooks/use-contract-query';

// Export record registration service
export { recordRegistrationService } from './services/record-registration-service';

// Export core types and enums from the main types file
export { ContractName, ResourceType, RecordStatus, ConsentStatus, AccessLevel } from './types';

// Export type interfaces from the main types file
export type {
  ContractInteractionOptions,
  ContractWriteRequest,
  ContractWriteResponse,
  ContractReadResponse,
  TransactionResult,
  ProducerMetadata,
  RecordMetadata,
  ResourceMetadata,
  AccessPermission,
  HealthRecord,
} from './types';

// Export contract-specific types
export type {
  ProducerMetadataResponse,
  RecordInfoResponse,
  ProducerRecordsResponse,
  CheckAccessResponse,
  RegisterProducerInput,
  RegisterRecordInput,
  UpdateRecordInput,
  ShareDataInput,
  ShareToProviderInput,
  RevokeAccessInput,
} from './types/contract';

// Export actions
export * from './actions/mutation';
export * from './actions/query';

// Export utilities
export * from './utils/events';

// Export helpers
export { getStatusLabel, getConsentLabel } from './helpers/status-labels';

// Export configuration
export { API_ENDPOINTS, PAGINATION, CACHE } from './config';

// Export FHIR types
export * from './types/fhir';

// Export the new contract handler factory
export { ContractHandlerFactory, ContractType } from './ContractHandlerFactory';

// Export the new error handling system
export * from './error-handler/index';

// Export the new event parsing system
export * from './event-parser/index';

// Export BigInt utilities
export {
  formatTokenAmount,
  parseTokenAmount,
  formatCurrency,
  weiToGwei,
  weiToEth,
  calculateGasCost,
  formatBigIntForDisplay,
} from './bigint-utils';

// Export existing helpers
export * from './get-signer';
export * from './provider';
export * from './update-query';
export * from './view-query';
export * from './sign';
export * from './did-auth-manager';
export * from './did-resolver';
export * from './base-blockchain-manager';
export * from './auth-middleware';
export * from './decodeError';
export * from './bigIntStringify';

// Legacy functions (deprecated, use the new system instead)
// Re-export with new names to avoid conflicts

// Export default exports with named exports
import compensation from './compensation';
import dataRegistry from './data-registry';
import erc20 from './erc20';
import {
  parseContractError,
  CommonErrorTypes,
  getUserFriendlyErrorMessage,
  handleContractError,
  isContractErrorType,
} from './error-handler';
import {
  parseTransactionEvents,
  listenForEvents,
  formatEventValue,
  formatBigInt,
  formatTransactionReceipt,
  formatLog,
  serializeBigInt,
  deserializeBigInt,
} from './event-parser';
import getBalance from './get-balance';

export { dataRegistry, compensation, getBalance, erc20 };

export {
  parseContractError as legacyParseContractError,
  CommonErrorTypes as LegacyCommonErrorTypes,
  getUserFriendlyErrorMessage as legacyGetUserFriendlyErrorMessage,
  handleContractError as legacyHandleContractError,
  isContractErrorType as legacyIsContractErrorType,
};

export {
  parseTransactionEvents as legacyParseTransactionEvents,
  listenForEvents as legacyListenForEvents,
  formatEventValue as legacyFormatEventValue,
  formatBigInt as legacyFormatEventBigInt,
  formatTransactionReceipt as legacyFormatTransactionReceipt,
  formatLog as legacyFormatLog,
  serializeBigInt as legacySerializeBigInt,
  deserializeBigInt as legacyDeserializeBigInt,
};

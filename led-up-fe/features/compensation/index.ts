/**
 * @file Compensation Feature
 * @description This file exports all hooks and components for the Compensation feature.
 */

// Export everything from hooks (React query hooks)
export * from './hooks';

// Export types for contracts and models
export * from './types';

// Export utility functions
export * from './utils';

// Actions need to be exported explicitly due to conflicts
// with hook names in query.ts
export {
  // Query actions (direct contract calls)
  verifyPayment,
  getProducerBalance,
  getServiceFee,
  getServiceFeeBalance,
  getMinimumWithdrawAmount,
  getUnitPrice,
  isPaused,
  getOwner,
  getTokenAddress,
  getDidAuthAddress,
  producerExists,
  getConsumerDid,
  getProducerDid,
  getPaymentTokenAddress,
  getPaymentDetails,
  // Events
  getPaymentProcessedEvents,
} from './actions/query';

export {
  // Mutation actions (transaction preparation)
  prepareProcessPayment,
  prepareWithdrawProducerBalance,
  prepareWithdrawServiceFee,
  prepareRemoveProducer,
  prepareChangeServiceFee,
  prepareChangeUnitPrice,
  prepareSetMinimumWithdrawAmount,
  prepareChangeTokenAddress,
  preparePauseService,
  prepareUnpauseService,
  prepareUpdateDidAuthAddress,
  revalidateAfterTransaction,
} from './actions/mutation';

// Export components
export * from './components';

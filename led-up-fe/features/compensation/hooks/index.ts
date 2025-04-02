/**
 * @file Compensation Hooks - Barrel export file
 * @description Export all hooks related to Compensation for easy importing
 */

export {
  // Query hooks
  useVerifyPayment,
  useProducerBalance,
  useServiceFee,
  useServiceFeeBalance,
  useMinimumWithdrawAmount,
  useUnitPrice,
  useIsPaused,
  useOwner,
  useTokenAddress,
  useDidAuthAddress,
  useProducerExists,
  usePaymentDetails,

  // Mutation hooks
  useProcessPayment,
  useWithdrawProducerBalance,
  useWithdrawServiceFee,
  useRemoveProducer,
  useChangeServiceFee,
  useChangeUnitPrice,
  useSetMinimumWithdrawAmount,
  useChangeTokenAddress,
  usePauseService,
  useUnpauseService,
  useUpdateDidAuthAddress,

  // Event hooks
  usePaymentHistory,

  // Constants and utilities
  compensationKeys,
} from './use-compensation';

// Re-export types that might be needed
export type { TransactionResponse } from './use-compensation';

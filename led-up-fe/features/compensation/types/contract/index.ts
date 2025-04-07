/**
 * Type definitions for the Compensation1 contract interaction
 */

// =========== Input Types =========== //

/**
 * Input parameters for processing payment
 */
export interface ProcessPaymentInput {
  producer: `0x${string}`;
  recordId: string;
  dataSize: bigint;
  consumerDid: string;
}

/**
 * Input parameters for processing payment without dataSize (calculated from metadata)
 */
export interface ProcessPaymentRequest {
  producer: `0x${string}`;
  recordId: string;
  consumerDid: string;
}

/**
 * Input parameters for withdrawing producer balance
 */
export interface WithdrawProducerBalanceInput {
  amount: bigint;
}

/**
 * Input parameters for withdrawing service fees
 */
export interface WithdrawServiceFeeInput {
  amount: bigint;
}

/**
 * Input parameters for removing a producer
 */
export interface RemoveProducerInput {
  producer: `0x${string}`;
}

/**
 * Input parameters for changing service fee
 */
export interface ChangeServiceFeeInput {
  newFee: number;
}

/**
 * Input parameters for changing unit price
 */
export interface ChangeUnitPriceInput {
  newPrice: bigint;
}

/**
 * Input parameters for setting minimum withdraw amount
 */
export interface SetMinimumWithdrawAmountInput {
  newAmount: bigint;
}

/**
 * Input parameters for changing token address
 */
export interface ChangeTokenAddressInput {
  newTokenAddress: `0x${string}`;
}

// =========== Response Types =========== //

/**
 * Response from verifying payment
 */
export interface VerifyPaymentResponse {
  isPaid: boolean;
}

/**
 * Producer balance information - the contract's getProducerBalance returns a single uint256
 */
export type ProducerBalanceResponse = bigint;

/**
 * Payment record information
 */
export interface PaymentRecord {
  recordId: string;
  producer: `0x${string}`;
  consumer: `0x${string}`;
  amount: bigint;
  timestamp: bigint;
}

// =========== Event Types =========== //

/**
 * Payment processed event
 */
export interface PaymentProcessedEvent {
  recordId: string;
  producer: `0x${string}`;
  consumer: `0x${string}`;
  amount: bigint;
}

/**
 * Funds withdrawn event
 */
export interface FundsWithdrawnEvent {
  producer: `0x${string}`;
  amount: bigint;
}

/**
 * Service fee withdrawn event
 */
export interface ServiceFeeWithdrawnEvent {
  amount: bigint;
}

/**
 * Service fee changed event
 */
export interface ServiceFeeChangedEvent {
  oldFee: number;
  newFee: number;
}

/**
 * Unit price changed event
 */
export interface UnitPriceChangedEvent {
  oldPrice: bigint;
  newPrice: bigint;
}

/**
 * Minimum withdraw amount changed event
 */
export interface MinimumWithdrawAmountChangedEvent {
  oldAmount: bigint;
  newAmount: bigint;
}

/**
 * Token address changed event
 */
export interface TokenAddressChangedEvent {
  oldToken: `0x${string}`;
  newToken: `0x${string}`;
}

// Export error and event handling
export * from './errors';
export * from './events';

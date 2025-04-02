import { z } from 'zod';

/**
 * Schema for validating payment transaction details
 */
export const PaymentTransactionSchema = z.object({
  transactionHash: z.string().startsWith('0x'),
  blockNumber: z.number().int().positive(),
  from: z.string().startsWith('0x'),
  to: z.string().startsWith('0x'),
  amount: z.bigint().positive(),
  recordsCount: z.number().int().nonnegative(),
  success: z.boolean(),
  timestamp: z.number().int().positive(),
});

/**
 * Schema for withdrawal amount validation
 */
export const WithdrawalAmountSchema = z.object({
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine((val) => !isNaN(Number(val)), {
      message: 'Amount must be a valid number',
    })
    .refine((val) => Number(val) > 0, {
      message: 'Amount must be greater than 0',
    })
    .transform((val) => val.trim()),
});

/**
 * Schema for service fee percentage validation
 */
export const ServiceFeeSchema = z.object({
  fee: z
    .string()
    .min(1, 'Service fee is required')
    .refine((val) => !isNaN(Number(val)), {
      message: 'Service fee must be a valid number',
    })
    .refine((val) => Number(val) >= 0 && Number(val) <= 100, {
      message: 'Service fee must be between 0 and 100 percent',
    })
    .transform((val) => val.trim()),
});

/**
 * Schema for unit price validation
 */
export const UnitPriceSchema = z.object({
  price: z
    .string()
    .min(1, 'Unit price is required')
    .refine((val) => !isNaN(Number(val)), {
      message: 'Unit price must be a valid number',
    })
    .refine((val) => Number(val) > 0, {
      message: 'Unit price must be greater than 0',
    })
    .transform((val) => val.trim()),
});

/**
 * Schema for minimum withdrawal amount validation
 */
export const MinWithdrawalAmountSchema = z.object({
  amount: z
    .string()
    .min(1, 'Minimum withdrawal amount is required')
    .refine((val) => !isNaN(Number(val)), {
      message: 'Minimum withdrawal amount must be a valid number',
    })
    .refine((val) => Number(val) >= 0, {
      message: 'Minimum withdrawal amount must be a non-negative number',
    })
    .transform((val) => val.trim()),
});

/**
 * Schema for contract address validation
 */
export const ContractAddressSchema = z.object({
  address: z
    .string()
    .min(1, 'Contract address is required')
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address format')
    .transform((val) => val.trim().toLowerCase()),
});

/**
 * Schema for Ethereum address validation
 */
export const EthAddressSchema = z.object({
  address: z
    .string()
    .min(1, 'Address is required')
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address format')
    .transform((val) => val.trim().toLowerCase()),
});

/**
 * Schema for token payment validation
 */
export const TokenPaymentSchema = z.object({
  producer: z.string().startsWith('0x'),
  recordId: z.string().min(1, 'Record ID is required'),
  dataSize: z.number().int().positive(),
  consumerDid: z.string().min(1, 'Consumer DID is required'),
});

/**
 * Schema for contract configuration
 */
export const ContractConfigSchema = z.object({
  contractAddress: z.string().startsWith('0x'),
  chainId: z.coerce.number().int().positive(),
  rpcUrl: z.string().url('Must be a valid URL'),
  privateKey: z.string().optional(),
});

/**
 * Type definitions based on the schemas for use in the application
 */
export type PaymentTransaction = z.infer<typeof PaymentTransactionSchema>;
export type WithdrawalAmount = z.infer<typeof WithdrawalAmountSchema>;
export type ServiceFee = z.infer<typeof ServiceFeeSchema>;
export type UnitPrice = z.infer<typeof UnitPriceSchema>;
export type MinWithdrawalAmount = z.infer<typeof MinWithdrawalAmountSchema>;
export type ContractAddress = z.infer<typeof ContractAddressSchema>;
export type EthAddress = z.infer<typeof EthAddressSchema>;
export type TokenPayment = z.infer<typeof TokenPaymentSchema>;
export type ContractConfig = z.infer<typeof ContractConfigSchema>;

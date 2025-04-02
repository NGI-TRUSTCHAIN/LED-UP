import { z } from 'zod';

/**
 * Schema for validating payment form data
 */
export const PaymentFormSchema = z.object({
  recordId: z.string().min(1, 'Record ID is required').trim(),

  producerAddress: z
    .string()
    .min(1, 'Producer address is required')
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address format')
    .transform((val) => val.toLowerCase()),

  dataSize: z
    .string()
    .min(1, 'Data size is required')
    .refine((val) => !isNaN(Number(val)), {
      message: 'Data size must be a valid number',
    })
    .refine((val) => Number(val) > 0, {
      message: 'Data size must be greater than 0',
    })
    .transform((val) => Number(val)),
});

/**
 * Schema for token approval form
 */
export const TokenApprovalSchema = z.object({
  spenderAddress: z
    .string()
    .min(1, 'Spender address is required')
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address format')
    .transform((val) => val.toLowerCase()),

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
 * Type definitions based on the schemas
 */
export type PaymentFormData = z.infer<typeof PaymentFormSchema>;
export type TokenApprovalData = z.infer<typeof TokenApprovalSchema>;

import { z } from 'zod';

/**
 * Schema for validating pause state change
 */
export const changePauseStateSchema = z.object({
  pause: z.preprocess(
    (val) => val === 'true' || val === true,
    z.boolean({
      required_error: 'Pause state is required',
      invalid_type_error: 'Pause state must be a boolean',
    })
  ),
});

/**
 * Schema for validating ownership transfer
 */
export const transferOwnershipSchema = z.object({
  newOwner: z
    .string()
    .min(1, 'New owner address is required')
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
});

/**
 * Schema for validating renounce ownership
 * This is an empty schema since renounceOwnership doesn't take any parameters
 */
export const renounceOwnershipSchema = z.object({});

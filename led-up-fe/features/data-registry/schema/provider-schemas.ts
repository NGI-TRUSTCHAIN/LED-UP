import { z } from 'zod';

/**
 * Schema for validating provider metadata update
 */
export const updateProviderMetadataSchema = z.object({
  url: z.string().url('Invalid URL format'),
  hash: z.string().min(1, 'Hash is required'),
});

/**
 * Schema for validating provider record schema update
 */
export const updateProviderRecordSchemaSchema = z.object({
  url: z.string().url('Invalid URL format'),
  hash: z.string().min(1, 'Hash is required'),
});

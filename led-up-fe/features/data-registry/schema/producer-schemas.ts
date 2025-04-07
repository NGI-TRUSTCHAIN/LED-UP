import { z } from 'zod';
import { ConsentStatus, RecordStatus } from '../types';

/**
 * Schema for validating producer registration in the DataRegistry contract
 */
export const registerProducerContractSchema = z.object({
  status: z.preprocess(
    (val) => (typeof val === 'string' ? parseInt(val, 10) : val),
    z.nativeEnum(RecordStatus, {
      errorMap: () => ({ message: 'Invalid record status' }),
    })
  ),
  consent: z.preprocess(
    (val) => (typeof val === 'string' ? parseInt(val, 10) : val),
    z.nativeEnum(ConsentStatus, {
      errorMap: () => ({ message: 'Invalid consent status' }),
    })
  ),
});

/**
 * Schema for validating producer record registration data
 */
export const registerProducerRecordSchema = z.object({
  ownerDid: z
    .string()
    .min(1, 'Owner DID is required')
    .regex(/^did:ledup:[a-zA-Z0-9]+:[a-zA-Z0-9]+$/, 'Invalid DID format'),
  producer: z
    .string()
    .min(1, 'Producer address is required')
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
  consent: z.preprocess(
    (val) => (typeof val === 'string' ? parseInt(val, 10) : val),
    z.nativeEnum(ConsentStatus, {
      errorMap: () => ({ message: 'Invalid consent status' }),
    })
  ),
  data: z.preprocess(
    (val) => (typeof val === 'string' ? JSON.parse(val) : val),
    z
      .object({
        id: z.string().min(1, 'Record ID is required'),
        resourceType: z.string().min(1, 'Resource type is required'),
        // Add any other required fields for the data object
      })
      .passthrough() // Allow additional properties
  ),
});

/**
 * Schema for validating producer record update data
 */
export const updateProducerRecordSchema = z.object({
  recordId: z.string().min(1, 'Record ID is required'),
  producer: z
    .string()
    .min(1, 'Producer address is required')
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
  resourceType: z.string().min(1, 'Resource type is required'),
  status: z.preprocess(
    (val) => (typeof val === 'string' ? parseInt(val, 10) : val),
    z.nativeEnum(RecordStatus, {
      errorMap: () => ({ message: 'Invalid record status' }),
    })
  ),
  consent: z.preprocess(
    (val) => (typeof val === 'string' ? parseInt(val, 10) : val),
    z.nativeEnum(ConsentStatus, {
      errorMap: () => ({ message: 'Invalid consent status' }),
    })
  ),
  updaterDid: z
    .string()
    .min(1, 'Updater DID is required')
    .regex(/^did:ledup:[a-zA-Z0-9]+:[a-zA-Z0-9]+$/, 'Invalid DID format'),
  data: z.preprocess(
    (val) => (typeof val === 'string' ? JSON.parse(val) : val),
    z
      .object({
        id: z.string().min(1, 'Record ID is required'),
        resourceType: z.string().min(1, 'Resource type is required'),
        // Add any other required fields for the data object
      })
      .passthrough() // Allow additional properties
  ),
});

/**
 * Schema for validating producer record metadata update
 */
export const updateProducerRecordMetadataSchema = z.object({
  producer: z
    .string()
    .min(1, 'Producer address is required')
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
  recordId: z.string().min(1, 'Record ID is required'),
  url: z.string().url('Invalid URL format'),
  cid: z.string().min(1, 'CID is required'),
  hash: z.string().min(1, 'Hash is required'),
});

/**
 * Schema for validating producer record status update
 */
export const updateProducerRecordStatusSchema = z.object({
  producer: z
    .string()
    .min(1, 'Producer address is required')
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
  status: z.preprocess(
    (val) => (typeof val === 'string' ? parseInt(val, 10) : val),
    z.nativeEnum(RecordStatus, {
      errorMap: () => ({ message: 'Invalid record status' }),
    })
  ),
});

/**
 * Schema for validating producer consent update
 */
export const updateProducerConsentSchema = z.object({
  producer: z
    .string()
    .min(1, 'Producer address is required')
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
  status: z.preprocess(
    (val) => (typeof val === 'string' ? parseInt(val, 10) : val),
    z.nativeEnum(ConsentStatus, {
      errorMap: () => ({ message: 'Invalid consent status' }),
    })
  ),
});

/**
 * Schema for validating data sharing
 */
export const shareDataSchema = z.object({
  recordId: z.string().min(1, 'Record ID is required'),
  consumerDid: z
    .string()
    .min(1, 'Consumer DID is required')
    .regex(/^did:ledup:[a-zA-Z0-9]+:[a-zA-Z0-9]+$/, 'Invalid DID format'),
  ownerDid: z
    .string()
    .min(1, 'Owner DID is required')
    .regex(/^did:ledup:[a-zA-Z0-9]+:[a-zA-Z0-9]+$/, 'Invalid DID format'),
});

/**
 * Schema for validating data verification
 */
export const verifyDataSchema = z.object({
  recordId: z.string().min(1, 'Record ID is required'),
  verifierDid: z
    .string()
    .min(1, 'Verifier DID is required')
    .regex(/^did:ledup:[a-zA-Z0-9]+:[a-zA-Z0-9]+$/, 'Invalid DID format'),
});

/**
 * Schema for validating producer record removal
 */
export const removeProducerRecordSchema = z.object({
  producer: z
    .string()
    .min(1, 'Producer address is required')
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
});

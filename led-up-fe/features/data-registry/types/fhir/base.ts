import { z } from 'zod';
import { FHIRMetaSchema } from './common';

export const FHIRResourceSchema = z.object({
  /** Type of resource */
  resourceType: z.string(),

  /** Logical id of this artifact */
  id: z.string(),

  /** Metadata about the resource */
  meta: FHIRMetaSchema.optional(),

  /** Language of the resource content */
  language: z.string().optional(),

  /** Text summary of the resource */
  text: z.record(z.any()).optional(),
});

export type FHIRResource = z.infer<typeof FHIRResourceSchema>;

export const ResourceMetadataSchema = z.object({
  /** Version identifier */
  version_id: z.string(),

  /** Last update timestamp */
  last_updated: z.string().datetime(),

  /** Source system identifier */
  source_system: z.string(),

  /** Healthcare organization identifier for multi-tenancy */
  tenant_id: z.string(),

  /** Environment identifier */
  environment: z.string(),

  /** FHIR specification version */
  fhir_version: z.string(),

  /** Processing status */
  processing_status: z.string(),

  /** Validation status */
  validation_status: z.string(),

  /** Error details if any */
  error_details: z.string().optional(),
});

export type ResourceMetadata = z.infer<typeof ResourceMetadataSchema>;

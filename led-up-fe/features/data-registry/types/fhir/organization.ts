import { z } from 'zod';
import { FHIRIdentifierSchema, FHIRCodeableConceptSchema } from './common';
import { FHIRContactPointSchema, FHIRAddressSchema, FHIRHumanNameSchema } from './patient';

const Reference = (resourceType: string) =>
  z.object({
    reference: z.string().regex(new RegExp(`^${resourceType}/[a-zA-Z0-9\-]+$`)), // Reference to another resource
    display: z.string().optional(), // Display text for reference
  });

export const OrganizationSchema = z.object({
  resourceType: z.literal('Organization'), // Resource type must be 'Organization'
  identifier: z.array(FHIRIdentifierSchema).optional(), // Organization identifiers
  active: z.boolean().optional(), // Whether the organization is active
  type: z.array(FHIRCodeableConceptSchema).optional(), // Types of organization (e.g., hospital, clinic)
  name: z.string().optional(), // Name of the organization
  alias: z.array(z.string()).optional(), // Alternative names
  telecom: z.array(FHIRContactPointSchema).optional(), // Contact details (phone, email, etc.)
  address: z.array(FHIRAddressSchema).optional(), // Organization addresses
  partOf: Reference('Organization').optional(), // Parent organization reference
  contact: z
    .array(
      z.object({
        purpose: FHIRCodeableConceptSchema.optional(), // Type of contact (billing, HR, etc.)
        name: FHIRHumanNameSchema.optional(), // Contact person's name
        telecom: z.array(FHIRContactPointSchema).optional(), // Contact details (email, phone)
        address: FHIRAddressSchema.optional(), // Contact address
      })
    )
    .optional(),
  endpoint: z.array(Reference('Endpoint')).optional(), // Endpoints for communication with the organization
});

export type Organization = z.infer<typeof OrganizationSchema>;

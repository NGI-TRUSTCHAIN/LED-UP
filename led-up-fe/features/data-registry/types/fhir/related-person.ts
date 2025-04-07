import { z } from 'zod';
import { FHIRIdentifierSchema, FHIRCodeableConceptSchema, FHIRPeriodSchema } from './common';
import { FHIRHumanNameSchema, FHIRContactPointSchema, FHIRAddressSchema, FHIRAttachmentSchema } from './patient';

export const RelatedPersonSchema = z.object({
  resourceType: z.literal('RelatedPerson'),
  identifier: z.array(FHIRIdentifierSchema).optional(), // List of identifiers
  active: z.boolean().optional(), // Active status of the record
  patient: z.object({
    reference: z.string().regex(/^Patient\/[a-zA-Z0-9\-]+$/), // Reference to the related patient
  }), // Reference to the patient this person is related to
  relationship: z.array(FHIRCodeableConceptSchema).optional(), // Nature of the relationship
  name: z.array(FHIRHumanNameSchema).optional(), // List of names associated with the person
  telecom: z.array(FHIRContactPointSchema).optional(), // Contact details
  gender: z.enum(['male', 'female', 'other', 'unknown']).optional(), // Gender
  birthDate: z.string().optional(), // Date of birth
  address: z.array(FHIRAddressSchema).optional(), // Address information
  photo: z.array(FHIRAttachmentSchema).optional(), // Images of the person
  period: FHIRPeriodSchema.optional(), // Period when the relationship is valid
  communication: z
    .array(
      z.object({
        language: FHIRCodeableConceptSchema, // Language for communication
        preferred: z.boolean().optional(), // Preferred language flag
      })
    )
    .optional(), // Communication preferences
});

export type RelatedPerson = z.infer<typeof RelatedPersonSchema>;

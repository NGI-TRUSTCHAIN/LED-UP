import { z } from 'zod';
import { FHIRIdentifierSchema, FHIRCodeableConceptSchema, FHIRReferenceSchema, FHIRRatioSchema } from './common';

export const MedicationSchema = z.object({
  resourceType: z.literal('Medication'),
  identifier: z.array(FHIRIdentifierSchema).optional(),
  code: FHIRCodeableConceptSchema.optional(),
  status: z.string().optional(),
  manufacturer: FHIRReferenceSchema.optional(),
  form: FHIRCodeableConceptSchema.optional(),
  amount: FHIRRatioSchema.optional(),
  ingredient: z
    .array(
      z.object({
        itemCodeableConcept: FHIRCodeableConceptSchema.optional(),
        itemReference: FHIRReferenceSchema.optional(),
        isActive: z.boolean().optional(),
        strength: FHIRRatioSchema.optional(),
      })
    )
    .optional(),
  batch: z
    .object({
      lotNumber: z.string().optional(),
      expirationDate: z.string().optional(),
    })
    .optional(),
});

export type Medication = z.infer<typeof MedicationSchema>;

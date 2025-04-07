import { z } from 'zod';
import { FHIRCodeableConceptSchema, FHIRReferenceSchema, FHIRDosageSchema, FHIRAnnotationSchema } from './common';

// MedicationStatement model
export const MedicationStatementSchema = z
  .object({
    resourceType: z.literal('MedicationStatement'),
    id: z.string(),
    meta: z.record(z.unknown()).optional(),
    identifier: z.array(z.object({ value: z.string() })).optional(),
    basedOn: z.array(FHIRReferenceSchema).optional(),
    partOf: z.array(FHIRReferenceSchema).optional(),
    status: z.enum([
      'active',
      'completed',
      'entered-in-error',
      'intended',
      'stopped',
      'on-hold',
      'unknown',
      'not-taken',
    ]),
    statusReason: z.array(FHIRCodeableConceptSchema).optional(),
    category: FHIRCodeableConceptSchema.optional(),
    medicationCodeableConcept: FHIRCodeableConceptSchema,
    subject: FHIRReferenceSchema,
    context: FHIRReferenceSchema.optional(),
    effectiveDateTime: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'EffectiveDateTime must be a valid date',
      })
      .optional(),
    dateAsserted: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'DateAsserted must be a valid date',
      })
      .optional(),
    informationSource: FHIRReferenceSchema.optional(),
    derivedFrom: z.array(FHIRReferenceSchema).optional(),
    reasonCode: z.array(FHIRCodeableConceptSchema).optional(),
    note: z.array(FHIRAnnotationSchema).optional(),
    dosage: z.array(FHIRDosageSchema).optional(),
  })
  .refine(
    (data) => {
      // Ensuring the status value is valid
      const validStatuses = [
        'active',
        'completed',
        'entered-in-error',
        'intended',
        'stopped',
        'on-hold',
        'unknown',
        'not-taken',
      ];
      if (!validStatuses.includes(data.status)) {
        throw new Error(`Invalid status value. Must be one of: ${validStatuses.join(', ')}`);
      }
      return true;
    },
    {
      message: 'MedicationStatement validation failed',
    }
  );

export type MedicationStatement = z.infer<typeof MedicationStatementSchema>;

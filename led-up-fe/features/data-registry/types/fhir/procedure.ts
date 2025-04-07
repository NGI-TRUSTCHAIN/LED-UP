import { z } from 'zod';
import {
  FHIRCodeableConceptSchema,
  FHIRReferenceSchema,
  FHIRIdentifierSchema,
  FHIRAnnotationSchema,
  FHIRCodingSchema,
} from './common';
// Enum for status validation
export const ProcedureStatusSchema = z.enum([
  'preparation',
  'in-progress',
  'not-done',
  'on-hold',
  'stopped',
  'completed',
  'entered-in-error',
  'unknown',
]);
export type ProcedureStatus = z.infer<typeof ProcedureStatusSchema>;

// Modified CodeableConcept schema with defaults for required fields
export const ProcedureCodeableConceptSchema = z.object({
  coding: z.array(
    z.object({
      system: z.string().default('http://snomed.info/sct'), // Default to SNOMED CT
      code: z.string(),
      display: z.string().optional(),
    })
  ),
  text: z.string().optional(),
});

// Procedure schema definition
export const ProcedureSchema = z
  .object({
    resourceType: z.literal('Procedure'),
    identifier: z.array(FHIRIdentifierSchema).optional(),
    status: ProcedureStatusSchema,
    statusReason: FHIRCodeableConceptSchema.optional(),
    category: ProcedureCodeableConceptSchema.optional(),
    code: ProcedureCodeableConceptSchema,
    subject: FHIRReferenceSchema,
    encounter: FHIRReferenceSchema.optional(),
    performedDateTime: z.string().optional(), // Assuming this is ISO 8601 formatted date string
    recorder: FHIRReferenceSchema.optional(),
    performer: z
      .array(
        z.object({
          actor: FHIRReferenceSchema,
          role: FHIRCodeableConceptSchema.optional(),
        })
      )
      .optional(),
    location: FHIRReferenceSchema.optional(),
    outcome: ProcedureCodeableConceptSchema.optional(),
    complication: z.array(ProcedureCodeableConceptSchema).optional(),
    followUp: z.array(ProcedureCodeableConceptSchema).optional(),
    note: z.array(FHIRAnnotationSchema).optional(),
  })
  .refine(
    (data) => {
      // Additional validations for status if needed
      const validStatuses = [
        'preparation',
        'in-progress',
        'not-done',
        'on-hold',
        'stopped',
        'completed',
        'entered-in-error',
        'unknown',
      ];
      if (!validStatuses.includes(data.status)) {
        throw new Error(`Invalid status value. Must be one of: ${validStatuses.join(', ')}`);
      }
      return true;
    },
    {
      message: 'Invalid status value.',
    }
  );

export type Procedure = z.infer<typeof ProcedureSchema>;

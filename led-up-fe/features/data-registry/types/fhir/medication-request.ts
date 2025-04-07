import { z } from 'zod';
import { FHIRCodeableConceptSchema, FHIRReferenceSchema } from './common';

// DosageInstruction model
export const DosageInstructionSchema = z.object({
  text: z.string().optional(),
  timing: z.record(z.unknown()).optional(),
  route: FHIRCodeableConceptSchema.optional(),
  doseAndRate: z.array(z.record(z.unknown())).optional(),
});

export type DosageInstruction = z.infer<typeof DosageInstructionSchema>;

// MedicationRequest model
export const MedicationRequestSchema = z
  .object({
    resourceType: z.literal('MedicationRequest'),
    status: z.enum(['active', 'on-hold', 'cancelled', 'completed', 'entered-in-error', 'stopped', 'draft', 'unknown']),
    intent: z.enum([
      'proposal',
      'plan',
      'order',
      'original-order',
      'reflex-order',
      'filler-order',
      'instance-order',
      'option',
    ]),
    medicationCodeableConcept: FHIRCodeableConceptSchema,
    subject: FHIRReferenceSchema,
    encounter: FHIRReferenceSchema.optional(),
    authoredOn: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'AuthoredOn must be a valid date',
      })
      .optional(),
    requester: FHIRReferenceSchema.optional(),
    reasonCode: z.array(FHIRCodeableConceptSchema).optional(),
    reasonReference: z.array(FHIRReferenceSchema).optional(),
    note: z.array(z.record(z.unknown())).optional(),
    dosageInstruction: z.array(DosageInstructionSchema).optional(),
  })
  .refine(
    (data) => {
      // Ensuring the status and intent values are valid
      const validStatuses = [
        'active',
        'on-hold',
        'cancelled',
        'completed',
        'entered-in-error',
        'stopped',
        'draft',
        'unknown',
      ];
      if (!validStatuses.includes(data.status)) {
        throw new Error(`Invalid status value. Must be one of: ${validStatuses.join(', ')}`);
      }

      const validIntents = [
        'proposal',
        'plan',
        'order',
        'original-order',
        'reflex-order',
        'filler-order',
        'instance-order',
        'option',
      ];
      if (!validIntents.includes(data.intent)) {
        throw new Error(`Invalid intent value. Must be one of: ${validIntents.join(', ')}`);
      }

      return true;
    },
    {
      message: 'MedicationRequest validation failed',
    }
  );

export type MedicationRequest = z.infer<typeof MedicationRequestSchema>;

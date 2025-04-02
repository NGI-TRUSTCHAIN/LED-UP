import { z } from 'zod';
import { FHIRCodeableConceptSchema, FHIRReferenceSchema, FHIRIdentifierSchema, FHIRPeriodSchema } from './common';

// EncounterClass model
export const EncounterClass = z.object({
  system: z.string().optional(),
  code: z.string(),
  display: z.string().optional(),
});
export type EncounterClass = z.infer<typeof EncounterClass>;

// EncounterParticipant model
export const EncounterParticipant = z.object({
  type: z.array(FHIRCodeableConceptSchema).optional(),
  individual: FHIRReferenceSchema.optional(),
  period: FHIRPeriodSchema.optional(),
});
export type EncounterParticipant = z.infer<typeof EncounterParticipant>;
// Encounter model
export const EncounterSchema = z
  .object({
    resourceType: z.literal('Encounter'),
    identifier: z.array(FHIRIdentifierSchema).optional(),
    status: z.enum([
      'planned',
      'arrived',
      'triaged',
      'in-progress',
      'onleave',
      'finished',
      'cancelled',
      'entered-in-error',
      'unknown',
    ]),
    class_: EncounterClass, // Alias 'class' to 'class_'
    type: z.array(FHIRCodeableConceptSchema).optional(),
    subject: FHIRReferenceSchema,
    participant: z.array(EncounterParticipant).optional(),
    period: FHIRPeriodSchema.optional(),
    reasonCode: z.array(FHIRCodeableConceptSchema).optional(),
    diagnosis: z.array(z.record(z.unknown())).optional(),
  })
  .refine(
    (data) => {
      // You can add custom validation logic here if needed
      return true;
    },
    {
      message: 'Encounter validation failed',
    }
  );

export type Encounter = z.infer<typeof EncounterSchema>;

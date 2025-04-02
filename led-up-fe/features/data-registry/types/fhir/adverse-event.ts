import { z } from 'zod';
import { FHIRCodeableConceptSchema, FHIRReferenceSchema } from './common';

// SuspectEntity model
export const SuspectEntitySchema = z.object({
  instance: FHIRReferenceSchema,
  causalityAssessment: FHIRCodeableConceptSchema.optional(),
});

export type SuspectEntity = z.infer<typeof SuspectEntitySchema>;

// AdverseEvent model
export const AdverseEventSchema = z.object({
  resourceType: z.literal('AdverseEvent'),
  id: z.string(),
  status: z.enum(['in-progress', 'completed', 'entered-in-error', 'unknown']),
  actuality: z.enum(['actual', 'potential']),
  category: z.array(FHIRCodeableConceptSchema).optional(),
  event: FHIRCodeableConceptSchema,
  subject: FHIRReferenceSchema,
  date: z.string().optional(), // ISO string for datetime
  severity: FHIRCodeableConceptSchema.optional(),
  suspectEntity: z.array(SuspectEntitySchema).optional(),
});

export type AdverseEvent = z.infer<typeof AdverseEventSchema>;

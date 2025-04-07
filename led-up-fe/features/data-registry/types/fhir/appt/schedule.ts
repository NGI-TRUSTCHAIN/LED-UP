import { z } from 'zod';
import { FHIRIdentifierSchema, FHIRReferenceSchema, FHIRCodeableConceptSchema, FHIRPeriodSchema } from '../common';

export const ScheduleSchema = z.object({
  resourceType: z.literal('Schedule'),
  identifier: z.array(FHIRIdentifierSchema).optional(),
  active: z.boolean(),
  serviceCategory: z.array(FHIRCodeableConceptSchema).optional(),
  serviceType: z.array(FHIRCodeableConceptSchema).optional(),
  specialty: z.array(FHIRCodeableConceptSchema).optional(),
  actor: z
    .array(
      z.union([
        FHIRReferenceSchema,
        FHIRReferenceSchema,
        FHIRReferenceSchema,
        FHIRReferenceSchema,
        FHIRReferenceSchema,
        FHIRReferenceSchema,
        FHIRReferenceSchema,
      ])
    )
    .optional(),
  planningHorizon: FHIRPeriodSchema.optional(),
  comment: z.string().optional(),
});

export type Schedule = z.infer<typeof ScheduleSchema>;

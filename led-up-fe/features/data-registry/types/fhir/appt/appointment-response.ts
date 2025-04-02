import { z } from 'zod';
import { FHIRIdentifierSchema, FHIRReferenceSchema, FHIRCodeableConceptSchema } from '../common';

export const AppointmentResponseSchema = z.object({
  resourceType: z.literal('AppointmentResponse'),
  identifier: z.array(FHIRIdentifierSchema).optional(),
  appointment: FHIRReferenceSchema.optional(),
  start: z.string().optional(),
  end: z.string().optional(),
  participantType: z.array(FHIRCodeableConceptSchema).optional(),
  actor: z
    .union([
      FHIRReferenceSchema,
      FHIRReferenceSchema,
      FHIRReferenceSchema,
      FHIRReferenceSchema,
      FHIRReferenceSchema,
      FHIRReferenceSchema,
      FHIRReferenceSchema,
    ])
    .optional(),
  participantStatus: z.enum(['accepted', 'declined', 'tentative', 'needs-action']),
  comment: z.string().optional(),
});

export type AppointmentResponse = z.infer<typeof AppointmentResponseSchema>;

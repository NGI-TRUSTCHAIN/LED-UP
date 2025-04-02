import { z } from 'zod';
import {
  FHIRCodeableConceptSchema,
  FHIRAnnotationSchema,
  FHIRReferenceSchema,
  FHIRPeriodSchema,
  FHIRIdentifierSchema,
} from './common';

// CarePlanActivity model
export const CarePlanActivitySchema = z.object({
  outcomeCodeableConcept: z.array(FHIRCodeableConceptSchema).optional(),
  outcomeReference: z.array(FHIRReferenceSchema).optional(),
  progress: z.array(FHIRAnnotationSchema).optional(),
  reference: FHIRReferenceSchema.optional(),
  detail: z.record(z.unknown()).optional(),
});

export type CarePlanActivity = z.infer<typeof CarePlanActivitySchema>;

// CarePlan model
export const CarePlanSchema = z
  .object({
    resourceType: z.literal('CarePlan'),
    identifier: z.array(FHIRIdentifierSchema).optional(),
    basedOn: z.array(FHIRReferenceSchema).optional(),
    replaces: z.array(FHIRReferenceSchema).optional(),
    partOf: z.array(FHIRReferenceSchema).optional(),
    status: z.enum(['draft', 'active', 'on-hold', 'revoked', 'completed', 'entered-in-error', 'unknown']),
    intent: z.enum(['proposal', 'plan', 'order', 'option']),
    category: z.array(FHIRCodeableConceptSchema).optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    subject: FHIRReferenceSchema,
    encounter: FHIRReferenceSchema.optional(),
    period: FHIRPeriodSchema.optional(),
    created: z.string().optional(), // ISO date string
    author: FHIRReferenceSchema.optional(),
    contributor: z.array(FHIRReferenceSchema).optional(),
    careTeam: z.array(FHIRReferenceSchema).optional(),
    addresses: z.array(FHIRReferenceSchema).optional(),
    supportingInfo: z.array(FHIRReferenceSchema).optional(),
    goal: z.array(FHIRReferenceSchema).optional(),
    activity: z.array(CarePlanActivitySchema).optional(),
    note: z.array(FHIRAnnotationSchema).optional(),
  })
  .refine(
    (data) => {
      // Validate status field
      const validStatuses = ['draft', 'active', 'on-hold', 'revoked', 'completed', 'entered-in-error', 'unknown'];
      if (!validStatuses.includes(data.status)) {
        return false;
      }
      return true;
    },
    {
      message:
        'Invalid status value. Must be one of: draft, active, on-hold, revoked, completed, entered-in-error, unknown',
      path: ['status'],
    }
  );

export type CarePlan = z.infer<typeof CarePlanSchema>;

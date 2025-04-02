import { z } from 'zod';
import {
  FHIRCodeableConceptSchema,
  FHIRReferenceSchema,
  FHIRQuantitySchema,
  FHIRRangeSchema,
  FHIRRatioSchema,
} from './common';

// Observation model
export const ObservationSchema = z
  .object({
    resourceType: z.literal('Observation'),
    identifier: z.array(z.object({ value: z.string() })).optional(),
    status: z.enum([
      'registered',
      'preliminary',
      'final',
      'amended',
      'corrected',
      'cancelled',
      'entered-in-error',
      'unknown',
    ]),
    category: z.array(FHIRCodeableConceptSchema).optional(),
    code: FHIRCodeableConceptSchema,
    subject: FHIRReferenceSchema.optional(),
    encounter: FHIRReferenceSchema.optional(),
    effectiveDateTime: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'EffectiveDateTime must be a valid date',
      })
      .optional(),
    effectivePeriod: z.record(z.unknown()).optional(),
    issued: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'Issued must be a valid date',
      })
      .optional(),
    performer: z.array(FHIRReferenceSchema).optional(),
    valueQuantity: FHIRQuantitySchema.optional(),
    valueCodeableConcept: FHIRCodeableConceptSchema.optional(),
    valueString: z.string().optional(),
    valueRange: FHIRRangeSchema.optional(),
    valueRatio: FHIRRatioSchema.optional(),
    interpretation: z.array(FHIRCodeableConceptSchema).optional(),
    note: z.array(z.record(z.unknown())).optional(),
    bodySite: FHIRCodeableConceptSchema.optional(),
    method: FHIRCodeableConceptSchema.optional(),
    component: z.array(z.record(z.unknown())).optional(),
  })
  .refine(
    (data) => {
      // Ensuring the status value is valid
      const validStatuses = [
        'registered',
        'preliminary',
        'final',
        'amended',
        'corrected',
        'cancelled',
        'entered-in-error',
        'unknown',
      ];
      if (!validStatuses.includes(data.status)) {
        throw new Error(`Invalid status value. Must be one of: ${validStatuses.join(', ')}`);
      }
      return true;
    },
    {
      message: 'Observation validation failed',
    }
  );

export type Observation = z.infer<typeof ObservationSchema>;

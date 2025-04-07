import { z } from 'zod';
import { FHIRCodeableConceptSchema, FHIRReferenceSchema, FHIRAnnotationSchema, FHIRIdentifierSchema } from './common';

// AllergyReaction model
export const AllergyReactionSchema = z.object({
  substance: FHIRCodeableConceptSchema.optional(),
  manifestation: z.array(FHIRCodeableConceptSchema),
  severity: z.enum(['mild', 'moderate', 'severe']).optional(),
  exposureRoute: FHIRCodeableConceptSchema.optional(),
  onset: z.string().optional(), // ISO date string
  note: z.array(FHIRAnnotationSchema).optional(),
});

export type AllergyReaction = z.infer<typeof AllergyReactionSchema>;

// AllergyIntolerance model
export const AllergyIntoleranceSchema = z
  .object({
    resourceType: z.literal('AllergyIntolerance'),
    id: z.string(),
    identifier: z.array(FHIRIdentifierSchema).optional(),
    clinicalStatus: FHIRCodeableConceptSchema,
    verificationStatus: FHIRCodeableConceptSchema,
    type: z.enum(['allergy', 'intolerance']).optional(),
    category: z.array(z.enum(['food', 'medication', 'environment', 'biologic'])),
    criticality: z.enum(['low', 'high', 'unable-to-assess']).optional(),
    code: FHIRCodeableConceptSchema,
    patient: FHIRReferenceSchema,
    encounter: FHIRReferenceSchema.optional(),
    onsetDateTime: z.string().optional(), // ISO date string
    recordedDate: z.string().optional(), // ISO date string
    recorder: FHIRReferenceSchema.optional(),
    asserter: FHIRReferenceSchema.optional(),
    lastOccurrence: z.string().optional(), // ISO date string
    note: z.array(FHIRAnnotationSchema).optional(),
    reaction: z.array(AllergyReactionSchema).optional(),
  })
  .refine(
    (data) => {
      // Validate category values
      const validCategories = ['food', 'medication', 'environment', 'biologic'];
      if (!data.category.every((cat) => validCategories.includes(cat))) {
        return false;
      }

      // Validate clinical status
      const validStatuses = ['active', 'inactive', 'resolved'];
      const statusCode = data.clinicalStatus?.coding?.[0]?.code;
      if (statusCode && !validStatuses.includes(statusCode)) {
        return false;
      }

      return true;
    },
    {
      message: 'Invalid category or clinical status',
      path: ['category', 'clinicalStatus'],
    }
  );

export type AllergyIntolerance = z.infer<typeof AllergyIntoleranceSchema>;

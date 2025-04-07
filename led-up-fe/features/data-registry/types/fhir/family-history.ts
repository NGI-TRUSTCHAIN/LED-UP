import { z } from 'zod';
import { FHIRCodeableConceptSchema, FHIRReferenceSchema } from './common';

// FamilyHistoryCondition model
export const FamilyHistoryCondition = z.object({
  code: FHIRCodeableConceptSchema,
  outcome: FHIRCodeableConceptSchema.optional(),
  onsetAge: z.record(z.unknown()).optional(),
  onsetRange: z.record(z.unknown()).optional(),
  onsetPeriod: z.record(z.unknown()).optional(),
  onsetString: z.string().optional(),
  note: z.array(z.record(z.unknown())).optional(),
});

// FamilyMemberHistory model
export const FamilyMemberHistorySchema = z
  .object({
    resourceType: z.literal('FamilyMemberHistory'),
    status: z.enum(['partial', 'completed', 'entered-in-error', 'health-unknown']),
    subject: FHIRReferenceSchema,
    date: z.string().optional(), // ISO date string
    relationship: FHIRCodeableConceptSchema,
    sex: FHIRCodeableConceptSchema.optional(),
    born: z.record(z.unknown()).optional(),
    age: z.record(z.unknown()).optional(),
    deceased: z.record(z.unknown()).optional(),
    condition: z.array(FamilyHistoryCondition).optional(),
  })
  .refine(
    (data) => {
      // You can add custom validation logic here if needed
      return true;
    },
    {
      message: 'FamilyMemberHistory validation failed',
    }
  );

export type FamilyMemberHistory = z.infer<typeof FamilyMemberHistorySchema>;

import { z } from 'zod';
import { FHIRCodeableConceptSchema, FHIRReferenceSchema, FHIRIdentifierSchema } from './common';

// Condition model
export const ConditionSchema = z
  .object({
    id: z.string().optional(),
    resourceType: z.literal('Condition'),
    identifier: z.array(FHIRIdentifierSchema).optional(),
    clinicalStatus: FHIRCodeableConceptSchema,
    verificationStatus: FHIRCodeableConceptSchema,
    category: z.array(FHIRCodeableConceptSchema).optional(),
    severity: FHIRCodeableConceptSchema.optional(),
    code: FHIRCodeableConceptSchema,
    bodySite: z.array(FHIRCodeableConceptSchema).optional(),
    subject: FHIRReferenceSchema,
    encounter: FHIRReferenceSchema.optional(),
    onsetDateTime: z.string().optional(), // ISO date string
    abatementDateTime: z.string().optional(), // ISO date string
    recordedDate: z.string().optional(), // ISO date string
    recorder: FHIRReferenceSchema.optional(),
    asserter: FHIRReferenceSchema.optional(),
    stage: z.array(z.record(z.unknown())).optional(),
    evidence: z.array(z.record(z.unknown())).optional(),
    note: z.array(z.record(z.unknown())).optional(),
  })
  .refine(
    (data) => {
      // Validate clinicalStatus code
      const validClinicalStatuses = ['active', 'recurrence', 'relapse', 'inactive', 'remission', 'resolved'];
      const clinicalStatusCode = data.clinicalStatus?.coding?.[0]?.code;
      if (clinicalStatusCode && !validClinicalStatuses.includes(clinicalStatusCode)) {
        return false;
      }

      // Validate verificationStatus code
      const validVerificationStatuses = [
        'unconfirmed',
        'provisional',
        'differential',
        'confirmed',
        'refuted',
        'entered-in-error',
      ];
      const verificationStatusCode = data.verificationStatus?.coding?.[0]?.code;
      if (verificationStatusCode && !validVerificationStatuses.includes(verificationStatusCode)) {
        return false;
      }

      return true;
    },
    {
      message: 'Invalid clinicalStatus or verificationStatus code.',
      path: ['clinicalStatus', 'verificationStatus'],
    }
  );

export type Condition = z.infer<typeof ConditionSchema>;

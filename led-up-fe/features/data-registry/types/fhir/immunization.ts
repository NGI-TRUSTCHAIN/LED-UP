import { z } from 'zod';
import { FHIRCodeableConceptSchema, FHIRIdentifierSchema, FHIRReferenceSchema } from './common';

// ImmunizationPerformer model
export const ImmunizationPerformerSchema = z.object({
  function: FHIRCodeableConceptSchema.optional(),
  actor: FHIRReferenceSchema,
});

export type ImmunizationPerformer = z.infer<typeof ImmunizationPerformerSchema>;

// ImmunizationProtocolApplied model
export const ImmunizationProtocolAppliedSchema = z.object({
  series: z.string().optional(),
  doseNumber: z.string().optional(),
  seriesDoses: z.string().optional(),
  targetDisease: z.array(FHIRCodeableConceptSchema).optional(),
});

export type ImmunizationProtocolApplied = z.infer<typeof ImmunizationProtocolAppliedSchema>;

// Immunization model
export const ImmunizationSchema = z
  .object({
    resourceType: z.literal('Immunization'),
    identifier: z.array(FHIRIdentifierSchema).optional(),
    status: z.enum(['completed', 'entered-in-error', 'not-done']),
    statusReason: FHIRCodeableConceptSchema.optional(),
    vaccineCode: FHIRCodeableConceptSchema,
    patient: FHIRReferenceSchema,
    occurrence: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Occurrence must be a valid date',
    }),
    recorded: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'Recorded must be a valid date',
      })
      .optional(),
    primarySource: z.boolean(),
    location: FHIRReferenceSchema.optional(),
    manufacturer: FHIRReferenceSchema.optional(),
    lotNumber: z.string().optional(),
    expirationDate: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'Expiration date must be a valid date',
      })
      .optional(),
    site: FHIRCodeableConceptSchema.optional(),
    route: FHIRCodeableConceptSchema.optional(),
    doseQuantity: z.record(z.unknown()).optional(),
    performer: z.array(ImmunizationPerformerSchema).optional(),
    note: z.array(z.record(z.unknown())).optional(),
    protocolApplied: z.array(ImmunizationProtocolAppliedSchema).optional(),
  })
  .refine(
    (data) => {
      const validStatuses = ['completed', 'entered-in-error', 'not-done'];
      if (!validStatuses.includes(data.status)) {
        throw new Error(`Invalid status value. Must be one of: ${validStatuses.join(', ')}`);
      }
      return true;
    },
    {
      message: 'Immunization validation failed',
    }
  );

export type Immunization = z.infer<typeof ImmunizationSchema>;

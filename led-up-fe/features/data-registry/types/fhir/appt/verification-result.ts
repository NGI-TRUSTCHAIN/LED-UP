import { z } from 'zod';
import { FHIRCodeableConceptSchema, FHIRReferenceSchema, FHIRIdentifierSchema, FHIRPeriodSchema } from '../common';

export const SignatureSchema = z
  .object({
    type: z
      .array(
        z.object({
          system: z.string(),
          code: z.string(),
          display: z.string(),
        })
      )
      .optional(),
    when: z.string().optional(),
    who: z
      .object({
        reference: z.string(),
        display: z.string(),
      })
      .optional(),
    onBehalfOf: z
      .object({
        reference: z.string(),
        display: z.string(),
      })
      .optional(),
    targetFormat: z.string().optional(),
    sigFormat: z.string().optional(),
    data: z.string().optional(),
  })
  .optional();

export type Signature = z.infer<typeof SignatureSchema>;

export const TimingSchema = z
  .object({
    event: z.array(z.string()),
    repeat: z
      .object({
        frequency: z.number(),
        period: z.number(),
        periodUnit: z.enum(['s', 'min', 'h', 'd', 'wk', 'mo', 'a']),
      })
      .optional(),
    code: FHIRCodeableConceptSchema.optional(),
  })
  .optional();

export type Timing = z.infer<typeof TimingSchema>;

export const VerificationResultSchema = z.object({
  resourceType: z.literal('VerificationResult'),
  target: z.array(FHIRReferenceSchema).optional(),
  targetLocation: z.array(z.string()).optional(),
  need: FHIRCodeableConceptSchema.optional(),
  status: z.enum(['attested', 'validated', 'in-process', 'req-revalid', 'val-fail', 'reval-fail']),
  statusDate: z.string().optional(),
  validationType: FHIRCodeableConceptSchema.optional(),
  validationProcess: z.array(FHIRCodeableConceptSchema).optional(),
  frequency: TimingSchema.optional(),
  lastPerformed: z.string().optional(),
  nextScheduled: z.string().optional(),
  failureAction: FHIRCodeableConceptSchema.optional(),
  primarySource: z
    .array(
      z.object({
        who: FHIRReferenceSchema.or(FHIRReferenceSchema).or(FHIRReferenceSchema).optional(),
        type: z.array(FHIRCodeableConceptSchema).optional(),
        communicationMethod: z.array(FHIRCodeableConceptSchema).optional(),
        validationStatus: FHIRCodeableConceptSchema.optional(),
        validationDate: z.string().optional(),
        canPushUpdates: FHIRCodeableConceptSchema.optional(),
        pushTypeAvailable: z.array(FHIRCodeableConceptSchema).optional(),
      })
    )
    .optional(),
  attestation: z
    .object({
      who: FHIRReferenceSchema.or(FHIRReferenceSchema).or(FHIRReferenceSchema),
      onBehalfOf: FHIRReferenceSchema.or(FHIRReferenceSchema).or(FHIRReferenceSchema).optional(),
      communicationMethod: FHIRCodeableConceptSchema.optional(),
      date: z.string(),
      sourceIdentityCertificate: z.string().optional(),
      proxyIdentityCertificate: z.string().optional(),
      proxySignature: SignatureSchema.optional(),
      sourceSignature: SignatureSchema.optional(),
    })
    .optional(),
  validator: z
    .array(
      z.object({
        organization: FHIRReferenceSchema,
        identityCertificate: z.string().optional(),
        attestationSignature: SignatureSchema.optional(),
      })
    )
    .optional(),
});

export type VerificationResult = z.infer<typeof VerificationResultSchema>;

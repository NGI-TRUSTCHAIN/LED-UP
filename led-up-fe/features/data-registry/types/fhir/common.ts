import { object, z } from 'zod';

// Equivalent of Python's TypeAlias
export type FHIRResourceType =
  | 'Patient'
  | 'Practitioner'
  | 'PractitionerRole'
  | 'Organization'
  | 'Encounter'
  | 'Condition'
  | 'Procedure'
  | 'Observation'
  | 'MedicationRequest'
  | 'MedicationStatement'
  | 'DiagnosticReport'
  | 'CarePlan'
  | 'AllergyIntolerance'
  | 'Immunization'
  | 'Claim'
  | 'Basic'
  | 'DocumentReference';

// Storage Layer Enum
export const StorageLayer = z.enum(['bronze', 'silver', 'gold', 'quarantine']);
export type StorageLayer = z.infer<typeof StorageLayer>;

// FHIR Version Enum
export const FHIRVersion = z.enum(['4.0.1', '5.0.0']);
export type FHIRVersion = z.infer<typeof FHIRVersion>;

// FHIR Resource Data (generic object with key-value pairs)
export const FHIRResourceData = z.record(z.unknown());
export type FHIRResourceData = z.infer<typeof FHIRResourceData>;

// FHIR Coding Model
export const FHIRCodingSchema = z.object({
  system: z.string(),
  version: z.string().optional(),
  code: z.string(),
  display: z.string().optional(),
  userSelected: z.boolean().optional(),
});

export type FHIRCoding = z.infer<typeof FHIRCodingSchema>;

// FHIR CodeableConcept Model
export const FHIRCodeableConceptSchema = z.object({
  coding: z.array(FHIRCodingSchema),
  text: z.string().optional(),
});

export type FHIRCodeableConcept = z.infer<typeof FHIRCodeableConceptSchema>;
// FHIR Identifier Model
export const FHIRIdentifierSchema = z.object({
  use: z.string().optional(),
  type: FHIRCodeableConceptSchema.optional(),
  system: z.string().optional(),
  value: z.string(),
  period: z.record(z.unknown()).optional(),
});

export type FHIRIdentifier = z.infer<typeof FHIRIdentifierSchema>;

// export const FHIRReferenceSchema = (resourceType: string) =>
//   z.object({
//     reference: z.string().startsWith(`${resourceType}/`),
//     type: z.literal(resourceType),
//     identifier: FHIRIdentifierSchema.optional(),
//     display: z.string().optional(),
//   });

// export type FHIRReference = z.infer<ReturnType<typeof FHIRReferenceSchema>>;

// FHIR Reference Model
export const FHIRReferenceSchema = z.object({
  reference: z.string(),
  type: z.string().optional(),
  identifier: FHIRIdentifierSchema.optional(),
  display: z.string().optional(),
});

export type FHIRReference = z.infer<typeof FHIRReferenceSchema>;

// FHIR Annotation Model
export const FHIRAnnotationSchema = z.object({
  authorReference: FHIRReferenceSchema.optional(),
  authorString: z.string().optional(),
  time: z.date().optional(),
  text: z.string(),
});

export type FHIRAnnotation = z.infer<typeof FHIRAnnotationSchema>;

// FHIR Age Model
export const FHIRAgeSchema = z
  .object({
    value: z.number(),
    unit: z.string(),
    system: z.string().default('http://unitsofmeasure.org'),
    code: z.string(),
  })
  .refine((data) => ['a', 'mo', 'wk', 'd'].includes(data.code), {
    message: 'Invalid code for age unit',
  });

export type FHIRAge = z.infer<typeof FHIRAgeSchema>;

// FHIR Quantity Model
export const FHIRQuantitySchema = z.object({
  value: z.number(),
  comparator: z.string().optional(),
  unit: z.string(),
  system: z.string().optional(),
  code: z.string().optional(),
});

export type FHIRQuantity = z.infer<typeof FHIRQuantitySchema>;

export const FHIRRangeSchema = z.object({
  low: FHIRAgeSchema.optional(),
  high: FHIRAgeSchema.optional(),
});

export type FHIRRange = z.infer<typeof FHIRRangeSchema>;

export const FHIRPeriodSchema = z.object({
  start: z.string().optional(), // ISO date
  end: z.string().optional(),
});

export type FHIRPeriod = z.infer<typeof FHIRPeriodSchema>;

export const FHIRDosageSchema = z
  .object({
    sequence: z.number().optional(),
    text: z.string().optional(),
    timing: z.record(z.unknown()).optional(),
    asNeeded: z.union([z.boolean(), FHIRCodeableConceptSchema]).optional(),
    site: FHIRCodeableConceptSchema.optional(),
    route: FHIRCodeableConceptSchema.optional(),
    method: FHIRCodeableConceptSchema.optional(),
    doseAndRate: z.array(z.record(z.unknown())).optional(),
    maxDosePerPeriod: z.record(z.unknown()).optional(),
    maxDosePerAdministration: z.record(z.unknown()).optional(),
    maxDosePerLifetime: z.record(z.unknown()).optional(),
  })
  .refine((data) => data.text || Object.keys(data).some((key) => key !== 'text'), {
    message: 'Either text or structured dosage information must be present',
  });

export type FHIRDosage = z.infer<typeof FHIRDosageSchema>;

// FHIR Ratio Model
export const FHIRRatioSchema = z
  .object({
    numerator: z.record(z.unknown()).optional(),
    denominator: z.record(z.unknown()).optional(),
  })
  .refine((data) => !data.numerator !== !data.denominator, {
    message: 'Both numerator and denominator must be present if either is specified',
  });

export type FHIRRatio = z.infer<typeof FHIRRatioSchema>;

// FHIR Meta Model
export const FHIRMetaSchema = z.object({
  versionId: z.string(),
  lastUpdated: z.string(),
  profile: z.array(z.string()).optional(),
  security: z.array(z.record(z.unknown())).optional(),
  tag: z.array(z.record(z.unknown())).optional(),
});

export type FHIRMeta = z.infer<typeof FHIRMetaSchema>;
// Domain Resource Model
export const DomainResourceSchema = z
  .object({
    resourceType: z.string(),
    id: z.string(),
    meta: FHIRMetaSchema.optional(),
    language: z.string().optional(),
    text: z.record(z.unknown()).optional(),
  })
  .refine((data) => {
    if (data.meta && typeof data.meta !== 'object') {
      throw new Error('Invalid meta field');
    }
    return true;
  });

export type DomainResource = z.infer<typeof DomainResourceSchema>;

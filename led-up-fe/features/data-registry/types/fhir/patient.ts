import { z } from 'zod';
import { FHIRPeriodSchema, FHIRCodeableConceptSchema, FHIRReferenceSchema, FHIRIdentifierSchema } from './common';

export const FHIRHumanNameSchema = z.object({
  use: z.string().optional(),
  family: z.string().optional(),
  given: z.array(z.string()).optional(),
  prefix: z.array(z.string()).optional(),
  suffix: z.array(z.string()).optional(),
});

export type FHIRHumanName = z.infer<typeof FHIRHumanNameSchema>;

// Patient Name Schema
export const PatientNameSchema = FHIRHumanNameSchema;

export type PatientName = z.infer<typeof PatientNameSchema>;

export const FHIRContactPointSchema = z.object({
  system: z.string(),
  value: z.string(),
  use: z.string().optional(),
  rank: z.number().optional(),
  period: FHIRPeriodSchema.optional(),
});

export type FHIRContactPoint = z.infer<typeof FHIRContactPointSchema>;

export const ContactPointSchema = FHIRContactPointSchema;

export type ContactPoint = z.infer<typeof ContactPointSchema>;

// Patient Address Schema
export const FHIRAddressSchema = z.object({
  use: z.string().optional(),
  type: z.string().optional(),
  line: z.array(z.string()).optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
});

export type FHIRAddress = z.infer<typeof FHIRAddressSchema>;

export const FHIRAttachmentSchema = z.object({
  contentType: z.string().optional(), // MIME type of the content
  language: z.string().optional(), // Language of the content
  data: z.string().optional(), // Data as a base64 string
  url: z.string().optional(), // URL where the attachment is hosted
  size: z.number().optional(), // Size of the attachment in bytes
});

export type FHIRAttachment = z.infer<typeof FHIRAttachmentSchema>;

// Gender validation
export const GenderSchema = z.enum(['male', 'female', 'other', 'unknown']);
export type Gender = z.infer<typeof GenderSchema>;

// Age Group calculation function
const calculateAgeGroup = (birthDate: string): string => {
  const birthDt = new Date(birthDate);
  const age = Math.floor((Date.now() - birthDt.getTime()) / (1000 * 3600 * 24 * 365)); // Calculate age
  if (age < 18) return 'pediatric';
  if (age < 65) return 'adult';
  return 'elderly';
};

// Patient Schema
export const PatientSchema = z
  .object({
    resourceType: z.literal('Patient'),
    identifier: z.array(FHIRIdentifierSchema),
    active: z.boolean().default(true),
    name: z.array(PatientNameSchema),
    telecom: z.array(ContactPointSchema).optional(),
    gender: GenderSchema,
    birthDate: z.string().optional(),
    deceasedBoolean: z.boolean().optional(),
    deceasedDateTime: z.string().optional(),
    address: z.array(FHIRAddressSchema).optional(),
    maritalStatus: FHIRCodeableConceptSchema.optional(),
    multipleBirthBoolean: z.boolean().optional(),
    multipleBirthInteger: z.number().optional(),
    photo: z.array(FHIRAttachmentSchema).optional(),
    contact: z.array(FHIRContactPointSchema).optional(),
    communication: z.array(z.unknown()).optional(),
    generalPractitioner: z.array(FHIRReferenceSchema).optional(),
    managingOrganization: FHIRReferenceSchema.optional(),
    link: z.array(z.unknown()).optional(),
    // Age group and age calculation
    age: z.number().optional(),
    age_group: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.birthDate) {
        const ageGroup = calculateAgeGroup(data.birthDate);
        data.age_group = ageGroup;
        data.age = Math.floor((Date.now() - new Date(data.birthDate).getTime()) / (1000 * 3600 * 24 * 365));
      }
      return true;
    },
    {
      message: 'Failed to calculate age group or age based on birthDate',
    }
  );

export type Patient = z.infer<typeof PatientSchema>;

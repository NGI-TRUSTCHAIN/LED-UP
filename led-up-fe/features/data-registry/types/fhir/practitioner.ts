import { z } from 'zod';
import { FHIRIdentifierSchema } from './common';
import { GenderSchema } from './patient';

// Example definitions for complex types
const Identifier = z.object({
  use: z.string().optional(), // The usage of the identifier (e.g., official, secondary)
  system: z.string().optional(), // The system for the identifier (e.g., URL)
  value: z.string(), // The value of the identifier
  period: z
    .object({
      start: z.string().optional(), // Start date for the identifier
      end: z.string().optional(), // End date for the identifier
    })
    .optional(),
  assigner: z
    .object({
      display: z.string(), // Name of the assigning authority
    })
    .optional(),
});

const CodeableConcept = z.object({
  coding: z.array(
    z.object({
      system: z.string().optional(), // The system of the code
      code: z.string(), // The code itself
      display: z.string().optional(), // Display name for the code
    })
  ),
  text: z.string().optional(), // Human-readable text of the code
});

const HumanName = z.object({
  use: z.string().optional(), // e.g., official, nickname
  text: z.string(), // Full name text
  family: z.string().optional(), // Last name
  given: z.array(z.string()), // First and middle names
});

const ContactPoint = z.object({
  system: z.string(), // Phone, email, etc.
  value: z.string(), // Contact value (e.g., phone number, email address)
  use: z.string().optional(), // e.g., home, work, mobile
  rank: z.number().optional(), // A rank for the contact method (e.g., 1 = primary)
});

const Address = z.object({
  use: z.string().optional(), // e.g., home, work
  type: z.string().optional(), // e.g., postal, physical
  text: z.string().optional(), // Full address as a string
  line: z.array(z.string()).optional(), // Address line(s)
  city: z.string().optional(), // City name
  district: z.string().optional(), // District name
  state: z.string().optional(), // State name
  postalCode: z.string().optional(), // Postal code
  country: z.string().optional(), // Country name
});

const Attachment = z.object({
  contentType: z.string().optional(), // MIME type of the content
  language: z.string().optional(), // Language of the content
  data: z.string().optional(), // Data as a base64 string
  url: z.string().optional(), // URL where the attachment is hosted
  size: z.number().optional(), // Size of the attachment in bytes
});

const Period = z.object({
  start: z.string().optional(), // Start time of the period
  end: z.string().optional(), // End time of the period
});

// Practitioner schema
export const PractitionerSchema = z.object({
  resourceType: z.literal('Practitioner'),
  identifier: z.array(FHIRIdentifierSchema).optional(), // List of identifiers for the practitioner
  active: z.boolean().optional(), // Active status of the record
  name: z.array(HumanName).optional(), // List of names associated with the practitioner
  telecom: z.array(ContactPoint).optional(), // Contact details for the practitioner
  address: z.array(Address).optional(), // Addresses for the practitioner
  gender: GenderSchema.optional(), // Gender
  birthDate: z.string().optional(), // Date of birth
  photo: z.array(Attachment).optional(), // Images of the practitioner
  qualification: z
    .array(
      z.object({
        identifier: z.array(Identifier).optional(), // Identifiers for the qualification
        code: CodeableConcept, // Coded representation of the qualification
        period: Period.optional(), // Period of validity
        issuer: z
          .object({
            reference: z.string().regex(/^Organization\/[a-zA-Z0-9\-]+$/), // Reference to an Organization that issued the qualification
            display: z.string().optional(), // Display name of the issuer
          })
          .optional(), // Issuer of the qualification
      })
    )
    .optional(), // Qualifications of the practitioner
  communication: z.array(CodeableConcept).optional(), // Languages the practitioner can use in communication
});

export type Practitioner = z.infer<typeof PractitionerSchema>;

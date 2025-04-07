import { z } from 'zod';
import { FHIRReferenceSchema, FHIRCodeableConceptSchema, FHIRIdentifierSchema } from './common';
import { FHIRAttachmentSchema } from './patient';

const Reference = (resourceType: string) =>
  z.object({
    reference: z.string(), // The reference string (e.g., a URL or ID referencing another resource)
    display: z.string().optional(), // A human-readable display name for the reference
    type: z.literal(resourceType), // The type of resource being referenced (e.g., "Patient", "CarePlan", etc.)
  });

// DiagnosticReport schema definition
export const DiagnosticReportSchema = z.object({
  resourceType: z.literal('DiagnosticReport'),
  identifier: z.array(FHIRIdentifierSchema), // Business identifier for the report
  basedOn: z.array(
    Reference('CarePlan')
      .or(Reference('ImmunizationRecommendation'))
      .or(Reference('MedicationRequest'))
      .or(Reference('NutritionOrder'))
      .or(Reference('ServiceRequest'))
  ), // What was requested
  status: z.enum(['registered', 'partial', 'preliminary', 'final']), // Report status
  category: z.array(FHIRCodeableConceptSchema), // Service category
  code: FHIRCodeableConceptSchema, // Name/Code for this diagnostic report
  subject: Reference('Patient').or(Reference('Group')).or(Reference('Device')).or(Reference('Location')), // The subject of the report
  encounter: Reference('Encounter').optional(), // Health care event when test ordered
  effectiveDateTime: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid dateTime' })
    .optional(), // Effective dateTime for the report
  effectivePeriod: z
    .object({
      start: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid start date' }), // Period start date
      end: z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid end date' })
        .optional(), // Period end date
    })
    .optional(), // Period for the report
  issued: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid instant' }), // DateTime this version was made
  performer: z.array(
    Reference('Practitioner').or(Reference('PractitionerRole')).or(Reference('Organization')).or(Reference('CareTeam'))
  ), // Responsible Diagnostic Service
  resultsInterpreter: z.array(
    Reference('Practitioner').or(Reference('PractitionerRole')).or(Reference('Organization')).or(Reference('CareTeam'))
  ), // Primary result interpreter
  specimen: z.array(Reference('Specimen')).optional(), // Specimens this report is based on
  result: z.array(Reference('Observation')).optional(), // Observations
  imagingStudy: z.array(Reference('ImagingStudy')).optional(), // Reference to full details of imaging associated with the diagnostic report
  media: z
    .array(
      z.object({
        comment: z.string().optional(), // Comment about the image
        link: Reference('Media'), // Reference to the image source
      })
    )
    .optional(), // Key images associated with the report
  conclusion: z.string().optional(), // Clinical conclusion (interpretation) of test results
  conclusionCode: z.array(FHIRCodeableConceptSchema).optional(), // Codes for the clinical conclusion of test results
  presentedForm: z.array(FHIRAttachmentSchema).optional(), // Entire report as issued
});

export type DiagnosticReport = z.infer<typeof DiagnosticReportSchema>;

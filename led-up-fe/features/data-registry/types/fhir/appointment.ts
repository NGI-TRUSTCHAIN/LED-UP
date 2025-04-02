/**
 * 
 * Task 2
Appointment 3
AppointmentResponse 3
Schedule 3
Slot 3
VerificationResult 0
 */

import { z } from 'zod';
import { FHIRCodeableConceptSchema, FHIRReferenceSchema, FHIRIdentifierSchema, FHIRPeriodSchema } from './common';

// Enum for status validation
export const AppointmentStatusSchema = z.enum([
  'proposed',
  'pending',
  'booked',
  'arrived',
  'fulfilled',
  'cancelled',
  'noshow',
  'entered-in-error',
  'checked-in',
  'waitlist',
]);
export type AppointmentStatus = z.infer<typeof AppointmentStatusSchema>;

// Enum for required status of participant
export const ParticipantRequiredStatusSchema = z.enum(['required', 'optional', 'information-only']);
export type ParticipantRequiredStatus = z.infer<typeof ParticipantRequiredStatusSchema>;

// Enum for participant status
export const ParticipantStatusSchema = z.enum(['accepted', 'declined', 'tentative', 'needs-action']);
export type ParticipantStatus = z.infer<typeof ParticipantStatusSchema>;

// Appointment schema definition
export const AppointmentSchema = z
  .object({
    resourceType: z.literal('Appointment'),
    identifier: z.array(FHIRIdentifierSchema).optional(),
    status: AppointmentStatusSchema,
    cancelationReason: FHIRCodeableConceptSchema.optional(),
    serviceCategory: z.array(FHIRCodeableConceptSchema).optional(),
    serviceType: z.array(FHIRCodeableConceptSchema).optional(),
    specialty: z.array(FHIRCodeableConceptSchema).optional(),
    appointmentType: FHIRCodeableConceptSchema.optional(),
    reasonCode: z.array(FHIRCodeableConceptSchema).optional(),
    reasonReference: z.array(FHIRReferenceSchema).optional(), // Reference to Condition, Procedure, or other reasons
    priority: z.number().int().optional(), // Unsigned int, represented as integer here
    description: z.string().optional(),
    supportingInformation: z.array(FHIRReferenceSchema).optional(), // Reference to additional information
    start: z.string(), // Instant, assuming ISO 8601 string format
    end: z.string(), // Instant, assuming ISO 8601 string format
    minutesDuration: z.number().int().positive().optional(),
    slot: z.array(FHIRReferenceSchema).optional(), // References to Slot resources
    created: z.string().optional(), // DateTime of creation
    comment: z.string().optional(),
    patientInstruction: z.string().optional(),
    basedOn: z.array(FHIRReferenceSchema).optional(), // Reference to ServiceRequest
    participant: z
      .array(
        z.object({
          type: z.array(FHIRCodeableConceptSchema),
          actor: FHIRReferenceSchema, // References to Patient, Practitioner, HealthcareService, etc.
          required: ParticipantRequiredStatusSchema,
          status: ParticipantStatusSchema,
          period: FHIRPeriodSchema.optional(),
        })
      )
      .optional(),
    requestedPeriod: z.array(FHIRPeriodSchema).optional(),
  })
  .refine(
    (data) => {
      // Additional custom validation can be added here if needed
      return true;
    },
    {
      message: 'Appointment validation failed',
    }
  );

export type Appointment = z.infer<typeof AppointmentSchema>;

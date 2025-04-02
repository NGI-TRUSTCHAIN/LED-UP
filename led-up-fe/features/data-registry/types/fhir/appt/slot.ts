import { z } from 'zod';
import { FHIRCodeableConceptSchema } from '../common';

// Reference to other resources like Schedule
const Reference = (resourceType: string) =>
  z.object({
    reference: z.string(), // The reference string (e.g., a URL or ID referencing another resource)
    display: z.string().optional(), // A human-readable display name for the reference
    type: z.literal(resourceType), // The type of resource being referenced (e.g., "Schedule", "Practitioner", etc.)
  });

export const SlotSchema = z.object({
  resourceType: z.literal('Slot'),
  identifier: z.array(z.object({ value: z.string() })), // External Ids for this item
  serviceCategory: z.array(FHIRCodeableConceptSchema), // A broad categorization of the service to be performed
  serviceType: z.array(FHIRCodeableConceptSchema), // The type of appointments that can be booked into this slot
  specialty: z.array(FHIRCodeableConceptSchema), // The specialty of a practitioner that would be required
  appointmentType: FHIRCodeableConceptSchema.optional(), // The style of appointment or patient that may be booked
  schedule: Reference('Schedule'), // The schedule resource that this slot defines
  status: z.enum(['busy', 'free', 'busy-unavailable', 'busy-tentative', 'entered-in-error']), // Slot status
  start: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid start date' }), // Date/Time that the slot starts
  end: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid end date' }), // Date/Time that the slot ends
  overbooked: z.boolean(), // This slot has already been overbooked
  comment: z.string().optional(), // Comments on the slot with extended information
});

export type Slot = z.infer<typeof SlotSchema>;

import { z } from 'zod';
import { FHIRIdentifierSchema, FHIRCodeableConceptSchema, FHIRCodingSchema, FHIRReferenceSchema } from './common';
import { FHIRContactPointSchema, FHIRAddressSchema } from './patient';

export const PositionSchema = z.object({
  longitude: z.number(),
  latitude: z.number(),
  altitude: z.number().optional(),
});

export type Position = z.infer<typeof PositionSchema>;

export const HoursOfOperationSchema = z.object({
  daysOfWeek: z.array(z.string()).optional(),
  allDay: z.boolean().optional(),
  openingTime: z.string().optional(),
  closingTime: z.string().optional(),
});

export type HoursOfOperation = z.infer<typeof HoursOfOperationSchema>;

export const LocationSchema = z.object({
  resourceType: z.literal('Location'),
  identifier: z.array(FHIRIdentifierSchema).optional(),
  status: z.string(),
  operationalStatus: FHIRCodingSchema.optional(),
  name: z.string().optional(),
  alias: z.array(z.string()).optional(),
  description: z.string().optional(),
  mode: z.string().optional(),
  type: z.array(FHIRCodeableConceptSchema).optional(),
  telecom: z.array(FHIRContactPointSchema).optional(),
  address: FHIRAddressSchema.optional(),
  physicalType: FHIRCodeableConceptSchema.optional(),
  position: PositionSchema.optional(),
  managingOrganization: FHIRReferenceSchema.optional(),
  partOf: FHIRReferenceSchema.optional(),
  hoursOfOperation: z.array(HoursOfOperationSchema).optional(),
  availabilityExceptions: z.string().optional(),
  endpoint: z.array(FHIRReferenceSchema).optional(),
});

export type Location = z.infer<typeof LocationSchema>;

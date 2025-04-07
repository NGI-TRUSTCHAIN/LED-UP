import { z } from 'zod';
import { FHIRPeriodSchema, FHIRReferenceSchema, FHIRCodeableConceptSchema, FHIRIdentifierSchema } from './common';

// Social History specific schemas
export const EconomicStatusSchema = z.enum(['Low', 'LowerMiddle', 'Middle', 'UpperMiddle', 'High']);
export const EducationLevelSchema = z.enum([
  'NoFormalEducation',
  'PrimaryEducation',
  'SecondaryEducation',
  'VocationalTraining',
  'AssociateDegree',
  'BachelorDegree',
  'GraduateDegree',
]);
export const PhysicalActivitySchema = z.enum(['Sedentary', 'Light', 'Moderate', 'Active', 'VigorouslyActive']);
export const DietAndNutritionSchema = z.enum(['Poor', 'Average', 'Good', 'Excellent']);
export const SubstanceUseSchema = z.array(z.enum(['None', 'Alcohol', 'Tobacco', 'RecreationalDrugs']));
export const StressAndCopingSchema = z.enum(['Low', 'Moderate', 'High']);

// FHIRExtension model
export const FHIRExtensionSchema = z.object({
  url: z.string(),
  valueString: z.string().optional(),
  valueInteger: z.number().int().optional(),
  valueBoolean: z.boolean().optional(),
  valueCode: z.string().optional(),
  valueDateTime: z.string().optional(), // ISO date string
  valuePeriod: FHIRPeriodSchema.optional(),
  valueReference: FHIRReferenceSchema.optional(),
});

export type FHIRExtension = z.infer<typeof FHIRExtensionSchema>;

// Basic model
export const BasicSchema = z
  .object({
    resourceType: z.literal('Basic'),
    identifier: z.array(FHIRIdentifierSchema).optional(),
    code: FHIRCodeableConceptSchema,
    subject: FHIRReferenceSchema.optional(),
    created: z.string().optional(), // ISO date string
    author: FHIRReferenceSchema.optional(),
    extension: z.array(FHIRExtensionSchema).optional(),
  })
  .refine(
    (data) => {
      // Validate code field
      if (data.code && !data.code.coding?.some((coding) => coding.system && coding.code)) {
        return false;
      }

      // Validate extension values
      if (data.extension) {
        for (const extension of data.extension) {
          const valueCount = Object.keys(extension).filter((k) => k.startsWith('value')).length;
          if (valueCount !== 1) {
            return false;
          }
        }
      }

      return true;
    },
    {
      message: 'Validation failed for code or extension values.',
      path: ['code', 'extension'],
    }
  );

export type Basic = z.infer<typeof BasicSchema>;

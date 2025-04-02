import { z } from 'zod';
import { FHIRCodeableConceptSchema, FHIRReferenceSchema, FHIRIdentifierSchema, FHIRPeriodSchema } from '../common';

const TaskSchema = z.object({
  resourceType: z.literal('Task'),
  identifier: z.array(FHIRIdentifierSchema),
  instantiatesCanonical: z
    .object({
      reference: z.string().optional(),
      display: z.string().optional(),
    })
    .optional(),
  instantiatesUri: z.string().optional(),
  basedOn: z.array(FHIRReferenceSchema).optional(),
  groupIdentifier: FHIRIdentifierSchema.optional(),
  partOf: z.array(FHIRReferenceSchema).optional(),
  status: z.enum([
    'draft',
    'requested',
    'received',
    'accepted',
    'in-progress',
    'completed',
    'cancelled',
    'suspended',
    'rejected',
    'failed',
  ]),
  statusReason: FHIRCodeableConceptSchema.optional(),
  businessStatus: FHIRCodeableConceptSchema.optional(),
  intent: z.enum([
    'unknown',
    'proposal',
    'plan',
    'order',
    'original-order',
    'reflex-order',
    'filler-order',
    'instance-order',
    'option',
  ]),
  priority: z.enum(['routine', 'urgent', 'asap', 'stat']),
  code: FHIRCodeableConceptSchema.optional(),
  description: z.string().optional(),
  focus: FHIRReferenceSchema.optional(),
  for: FHIRReferenceSchema.optional(),
  encounter: FHIRReferenceSchema.optional(),
  executionPeriod: FHIRPeriodSchema.optional(),
  authoredOn: z.string().optional(),
  lastModified: z.string().optional(),
  requester: FHIRReferenceSchema.optional(),
  performerType: z.array(FHIRCodeableConceptSchema).optional(),
  owner: FHIRReferenceSchema.optional(),
  location: FHIRReferenceSchema.optional(),
  reasonCode: FHIRCodeableConceptSchema.optional(),
  reasonReference: FHIRReferenceSchema.optional(),
  insurance: z.array(FHIRReferenceSchema).optional(),
  note: z
    .array(
      z.object({
        authorReference: FHIRReferenceSchema.optional(),
        authorString: z.string().optional(),
        time: z.string().optional(),
        text: z.string(),
      })
    )
    .optional(),
  relevantHistory: z.array(FHIRReferenceSchema).optional(),
  restriction: z
    .object({
      repetitions: z.number().positive().optional(),
      period: FHIRPeriodSchema.optional(),
      recipient: z.array(FHIRReferenceSchema).optional(),
    })
    .optional(),
  input: z.array(
    z.object({
      type: FHIRCodeableConceptSchema,
      valueBase64Binary: z.string().optional(),
      valueBoolean: z.boolean().optional(),
      valueCanonical: z.string().optional(),
      valueCode: z.string().optional(),
      valueDate: z.string().optional(),
      valueDateTime: z.string().optional(),
      valueDecimal: z.number().optional(),
      valueId: z.string().optional(),
      valueInstant: z.string().optional(),
      valueInteger: z.number().optional(),
      valueMarkdown: z.string().optional(),
      valueOid: z.string().optional(),
      valuePositiveInt: z.number().positive().optional(),
      valueString: z.string().optional(),
      valueTime: z.string().optional(),
      valueUnsignedInt: z.number().positive().optional(),
      valueUri: z.string().optional(),
      valueUrl: z.string().optional(),
      valueUuid: z.string().optional(),
      valueAddress: z
        .object({
          line: z.array(z.string()).optional(),
          city: z.string().optional(),
          state: z.string().optional(),
          postalCode: z.string().optional(),
          country: z.string().optional(),
        })
        .optional(),
      valueAge: z
        .object({
          value: z.number().optional(),
          unit: z.string().optional(),
        })
        .optional(),
      valueAnnotation: z
        .object({
          authorReference: FHIRReferenceSchema.optional(),
          authorString: z.string().optional(),
          time: z.string().optional(),
          text: z.string(),
        })
        .optional(),
      valueAttachment: z
        .object({
          contentType: z.string().optional(),
          language: z.string().optional(),
          data: z.string().optional(),
          url: z.string().optional(),
          size: z.number().positive().optional(),
          hash: z.string().optional(),
          title: z.string().optional(),
          creation: z.string().optional(),
        })
        .optional(),
      valueCodeableConcept: FHIRCodeableConceptSchema.optional(),
      valueCoding: z
        .object({
          system: z.string().optional(),
          code: z.string().optional(),
          display: z.string().optional(),
        })
        .optional(),
      valueContactPoint: z
        .object({
          system: z.enum(['phone', 'fax', 'email', 'pager', 'other']),
          value: z.string(),
          use: z.enum(['home', 'work', 'temp', 'old', 'mobile']),
          rank: z.number().positive().optional(),
        })
        .optional(),
      valueCount: z
        .object({
          value: z.number().optional(),
          comparator: z.string().optional(),
          unit: z.string().optional(),
          system: z.string().optional(),
          code: z.string().optional(),
        })
        .optional(),
      valueDistance: z
        .object({
          value: z.number().optional(),
          unit: z.string().optional(),
          system: z.string().optional(),
          code: z.string().optional(),
        })
        .optional(),
      valueDuration: z
        .object({
          value: z.number().optional(),
          unit: z.string().optional(),
          system: z.string().optional(),
          code: z.string().optional(),
        })
        .optional(),
      valueHumanName: z
        .object({
          use: z.string().optional(),
          text: z.string().optional(),
          family: z.string().optional(),
          given: z.array(z.string()).optional(),
          prefix: z.array(z.string()).optional(),
          suffix: z.array(z.string()).optional(),
        })
        .optional(),
      valueIdentifier: FHIRIdentifierSchema.optional(),
      valueMoney: z
        .object({
          value: z.number().optional(),
          currency: z.string().optional(),
        })
        .optional(),
      valuePeriod: FHIRPeriodSchema.optional(),
      valueQuantity: z
        .object({
          value: z.number().optional(),
          comparator: z.string().optional(),
          unit: z.string().optional(),
          system: z.string().optional(),
          code: z.string().optional(),
        })
        .optional(),
      valueRange: z
        .object({
          low: z
            .object({
              value: z.number().optional(),
              unit: z.string().optional(),
              system: z.string().optional(),
              code: z.string().optional(),
            })
            .optional(),
          high: z
            .object({
              value: z.number().optional(),
              unit: z.string().optional(),
              system: z.string().optional(),
              code: z.string().optional(),
            })
            .optional(),
        })
        .optional(),
      valueRatio: z
        .object({
          numerator: z
            .object({
              value: z.number().optional(),
              unit: z.string().optional(),
              system: z.string().optional(),
              code: z.string().optional(),
            })
            .optional(),
          denominator: z
            .object({
              value: z.number().optional(),
              unit: z.string().optional(),
              system: z.string().optional(),
              code: z.string().optional(),
            })
            .optional(),
        })
        .optional(),
      valueReference: FHIRReferenceSchema.optional(),
      valueSampledData: z
        .object({
          origin: z
            .object({
              value: z.number().optional(),
              unit: z.string().optional(),
              system: z.string().optional(),
              code: z.string().optional(),
            })
            .optional(),
          data: z.string().optional(),
          encoding: z.enum(['base64', 'raw', 'gzip']).optional(),
          device: z.string().optional(),
        })
        .optional(),
      valueSignature: z
        .object({
          type: z
            .array(
              z.object({
                system: z.string(),
                code: z.string(),
              })
            )
            .optional(),
          when: z.string(),
          who: FHIRReferenceSchema.optional(),
          contentType: z.string().optional(),
          blob: z.string(),
        })
        .optional(),
      valueTiming: z
        .object({
          event: z.array(z.string()).optional(),
          repeat: z
            .object({
              frequency: z.number().optional(),
              period: z.number().optional(),
              periodUnit: z.enum(['s', 'min', 'h', 'd', 'wk', 'mo', 'a']),
            })
            .optional(),
          code: FHIRCodeableConceptSchema.optional(),
        })
        .optional(),
      valueContactDetail: z
        .object({
          name: z.string().optional(),
          telecom: z
            .array(
              z.object({
                system: z.enum(['phone', 'fax', 'email', 'pager', 'other']),
                value: z.string(),
              })
            )
            .optional(),
        })
        .optional(),
      valueContributor: z
        .object({
          type: z.enum(['author', 'editor', 'reviewer', 'endorser']),
          name: z.string(),
          email: z.string().optional(),
        })
        .optional(),
      valueDataRequirement: z
        .object({
          type: z.string().optional(),
          profile: z.array(z.string()).optional(),
        })
        .optional(),
      valueExpression: z
        .object({
          description: z.string(),
          language: z.string(),
          expression: z.string(),
        })
        .optional(),
      valueParameterDefinition: z
        .object({
          name: z.string(),
          use: z.enum(['in', 'out']),
          type: z.string(),
          min: z.number().positive().optional(),
          max: z.string().optional(),
        })
        .optional(),
      valueRelatedArtifact: z
        .object({
          type: z.enum(['documentation', 'justification', 'citation']),
          url: z.string(),
          title: z.string().optional(),
          publisher: z.string().optional(),
        })
        .optional(),
      valueTriggerDefinition: z
        .object({
          type: z.string(),
          name: z.string(),
          timing: z
            .object({
              event: z.array(z.string()),
              repeat: z.object({
                frequency: z.number(),
                period: z.number(),
                periodUnit: z.enum(['s', 'min', 'h', 'd', 'wk', 'mo', 'a']),
              }),
            })
            .optional(),
        })
        .optional(),
      valueUsageContext: z
        .object({
          code: FHIRCodeableConceptSchema,
          valueCodeableConcept: FHIRCodeableConceptSchema.optional(),
          valueQuantity: z
            .object({
              value: z.number().optional(),
              unit: z.string().optional(),
              system: z.string().optional(),
              code: z.string().optional(),
            })
            .optional(),
          valueRange: z
            .object({
              low: z
                .object({
                  value: z.number().optional(),
                  unit: z.string().optional(),
                })
                .optional(),
              high: z
                .object({
                  value: z.number().optional(),
                  unit: z.string().optional(),
                })
                .optional(),
            })
            .optional(),
          valueReference: FHIRReferenceSchema.optional(),
        })
        .optional(),
      valueDosage: z
        .object({
          text: z.string().optional(),
          route: FHIRCodeableConceptSchema.optional(),
          method: FHIRCodeableConceptSchema.optional(),
          dose: z
            .object({
              value: z.number().optional(),
              unit: z.string().optional(),
            })
            .optional(),
        })
        .optional(),
      valueMeta: z
        .object({
          versionId: z.string().optional(),
          lastUpdated: z.string().optional(),
          source: z.string().optional(),
          profile: z.array(z.string()).optional(),
          security: z.array(z.string()).optional(),
        })
        .optional(),
    })
  ),
  output: z.array(
    z.object({
      type: FHIRCodeableConceptSchema,
      valueBase64Binary: z.string().optional(),
      valueBoolean: z.boolean().optional(),
      valueCanonical: z.string().optional(),
      valueCode: z.string().optional(),
      valueDate: z.string().optional(),
      valueDateTime: z.string().optional(),
      valueDecimal: z.number().optional(),
      valueId: z.string().optional(),
      valueInstant: z.string().optional(),
      valueInteger: z.number().optional(),
      valueMarkdown: z.string().optional(),
      valueOid: z.string().optional(),
      valuePositiveInt: z.number().positive().optional(),
      valueString: z.string().optional(),
      valueTime: z.string().optional(),
      valueUnsignedInt: z.number().positive().optional(),
      valueUri: z.string().optional(),
      valueUrl: z.string().optional(),
      valueUuid: z.string().optional(),
      valueAddress: z
        .object({
          line: z.array(z.string()).optional(),
          city: z.string().optional(),
          state: z.string().optional(),
          postalCode: z.string().optional(),
          country: z.string().optional(),
        })
        .optional(),
      valueAge: z
        .object({
          value: z.number().optional(),
          unit: z.string().optional(),
        })
        .optional(),
      valueAnnotation: z
        .object({
          authorReference: FHIRReferenceSchema.optional(),
          authorString: z.string().optional(),
          time: z.string().optional(),
          text: z.string(),
        })
        .optional(),
      valueAttachment: z
        .object({
          contentType: z.string().optional(),
          language: z.string().optional(),
          data: z.string().optional(),
          url: z.string().optional(),
          size: z.number().positive().optional(),
          hash: z.string().optional(),
          title: z.string().optional(),
          creation: z.string().optional(),
        })
        .optional(),
      valueCodeableConcept: FHIRCodeableConceptSchema.optional(),
      valueCoding: z
        .object({
          system: z.string().optional(),
          code: z.string().optional(),
          display: z.string().optional(),
        })
        .optional(),
      valueContactPoint: z
        .object({
          system: z.enum(['phone', 'fax', 'email', 'pager', 'other']),
          value: z.string(),
          use: z.enum(['home', 'work', 'temp', 'old', 'mobile']),
          rank: z.number().positive().optional(),
        })
        .optional(),
      valueCount: z
        .object({
          value: z.number().optional(),
          comparator: z.string().optional(),
          unit: z.string().optional(),
          system: z.string().optional(),
          code: z.string().optional(),
        })
        .optional(),
      valueDistance: z
        .object({
          value: z.number().optional(),
          unit: z.string().optional(),
          system: z.string().optional(),
          code: z.string().optional(),
        })
        .optional(),
      valueDuration: z
        .object({
          value: z.number().optional(),
          unit: z.string().optional(),
          system: z.string().optional(),
          code: z.string().optional(),
        })
        .optional(),
      valueHumanName: z
        .object({
          use: z.string().optional(),
          text: z.string().optional(),
          family: z.string().optional(),
          given: z.array(z.string()).optional(),
          prefix: z.array(z.string()).optional(),
          suffix: z.array(z.string()).optional(),
        })
        .optional(),
      valueIdentifier: FHIRIdentifierSchema.optional(),
      valueMoney: z
        .object({
          value: z.number().optional(),
          currency: z.string().optional(),
        })
        .optional(),
      valuePeriod: FHIRPeriodSchema.optional(),
      valueQuantity: z
        .object({
          value: z.number().optional(),
          comparator: z.string().optional(),
          unit: z.string().optional(),
          system: z.string().optional(),
          code: z.string().optional(),
        })
        .optional(),
      valueRange: z
        .object({
          low: z
            .object({
              value: z.number().optional(),
              unit: z.string().optional(),
              system: z.string().optional(),
              code: z.string().optional(),
            })
            .optional(),
          high: z
            .object({
              value: z.number().optional(),
              unit: z.string().optional(),
              system: z.string().optional(),
              code: z.string().optional(),
            })
            .optional(),
        })
        .optional(),
      valueRatio: z
        .object({
          numerator: z
            .object({
              value: z.number().optional(),
              unit: z.string().optional(),
              system: z.string().optional(),
              code: z.string().optional(),
            })
            .optional(),
          denominator: z
            .object({
              value: z.number().optional(),
              unit: z.string().optional(),
              system: z.string().optional(),
              code: z.string().optional(),
            })
            .optional(),
        })
        .optional(),
      valueReference: FHIRReferenceSchema.optional(),
      valueSampledData: z
        .object({
          origin: z
            .object({
              value: z.number().optional(),
              unit: z.string().optional(),
              system: z.string().optional(),
              code: z.string().optional(),
            })
            .optional(),
          data: z.string().optional(),
          encoding: z.enum(['base64', 'raw', 'gzip']).optional(),
          device: z.string().optional(),
        })
        .optional(),
      valueSignature: z
        .object({
          type: z
            .array(
              z.object({
                system: z.string(),
                code: z.string(),
              })
            )
            .optional(),
          when: z.string(),
          who: FHIRReferenceSchema.optional(),
          contentType: z.string().optional(),
          blob: z.string(),
        })
        .optional(),
      valueTiming: z
        .object({
          event: z.array(z.string()).optional(),
          repeat: z
            .object({
              frequency: z.number().optional(),
              period: z.number().optional(),
              periodUnit: z.enum(['s', 'min', 'h', 'd', 'wk', 'mo', 'a']),
            })
            .optional(),
          code: FHIRCodeableConceptSchema.optional(),
        })
        .optional(),
      valueContactDetail: z
        .object({
          name: z.string().optional(),
          telecom: z
            .array(
              z.object({
                system: z.enum(['phone', 'fax', 'email', 'pager', 'other']),
                value: z.string(),
              })
            )
            .optional(),
        })
        .optional(),
      valueContributor: z
        .object({
          type: z.enum(['author', 'editor', 'reviewer', 'endorser']),
          name: z.string(),
          email: z.string().optional(),
        })
        .optional(),
      valueDataRequirement: z
        .object({
          type: z.string().optional(),
          profile: z.array(z.string()).optional(),
        })
        .optional(),
      valueExpression: z
        .object({
          description: z.string(),
          language: z.string(),
          expression: z.string(),
        })
        .optional(),
      valueParameterDefinition: z
        .object({
          name: z.string(),
          use: z.enum(['in', 'out']),
          type: z.string(),
          min: z.number().positive().optional(),
          max: z.string().optional(),
        })
        .optional(),
      valueRelatedArtifact: z
        .object({
          type: z.enum(['documentation', 'justification', 'citation']),
          url: z.string(),
          title: z.string().optional(),
          publisher: z.string().optional(),
        })
        .optional(),
      valueTriggerDefinition: z
        .object({
          type: z.string(),
          name: z.string(),
          timing: z
            .object({
              event: z.array(z.string()),
              repeat: z.object({
                frequency: z.number(),
                period: z.number(),
                periodUnit: z.enum(['s', 'min', 'h', 'd', 'wk', 'mo', 'a']),
              }),
            })
            .optional(),
        })
        .optional(),
      valueUsageContext: z
        .object({
          code: FHIRCodeableConceptSchema,
          valueCodeableConcept: FHIRCodeableConceptSchema.optional(),
          valueQuantity: z
            .object({
              value: z.number().optional(),
              unit: z.string().optional(),
              system: z.string().optional(),
              code: z.string().optional(),
            })
            .optional(),
          valueRange: z
            .object({
              low: z
                .object({
                  value: z.number().optional(),
                  unit: z.string().optional(),
                })
                .optional(),
              high: z
                .object({
                  value: z.number().optional(),
                  unit: z.string().optional(),
                })
                .optional(),
            })
            .optional(),
          valueReference: FHIRReferenceSchema.optional(),
        })
        .optional(),
      valueDosage: z
        .object({
          text: z.string().optional(),
          route: FHIRCodeableConceptSchema.optional(),
          method: FHIRCodeableConceptSchema.optional(),
          dose: z
            .object({
              value: z.number().optional(),
              unit: z.string().optional(),
            })
            .optional(),
        })
        .optional(),
      valueMeta: z
        .object({
          versionId: z.string().optional(),
          lastUpdated: z.string().optional(),
          source: z.string().optional(),
          profile: z.array(z.string()).optional(),
          security: z.array(z.string()).optional(),
        })
        .optional(),
    })
  ),
});

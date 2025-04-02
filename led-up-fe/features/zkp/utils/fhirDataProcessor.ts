/**
 * FHIR Data Processor
 *
 * Utilities for extracting, processing, and preparing FHIR resources for zero-knowledge proof verification.
 * This module handles the conversion of FHIR resources to field elements and hashing for ZKP circuits.
 */

// Define types for FHIR resources and field mappings
export interface FHIRResourceMapping {
  [key: string]: { [key: string]: string };
}

export interface FieldExtractorOptions {
  resourceType: string;
  fieldMapping: FHIRResourceMapping;
  includeMetadata?: boolean;
}

export interface ProcessedFHIRData {
  resourceType: number;
  fieldElements: number[];
  hash: [string, string];
  metadata: {
    resourceTypeStr: string;
    id: string;
    lastUpdated?: string;
    extractedFields: { [key: string]: any };
  };
}

/**
 * Maps FHIR resource types to their common fields for extraction
 */
export const RESOURCE_FIELD_MAPPING: FHIRResourceMapping = {
  '0': {
    // Patient
    1: 'identifier',
    2: 'name',
    3: 'birthDate',
    4: 'gender',
    5: 'address',
    6: 'telecom',
    7: 'active',
  },
  '1': {
    // Observation
    1: 'identifier',
    2: 'status',
    3: 'code',
    4: 'subject',
    5: 'effectiveDateTime',
    6: 'valueQuantity',
    7: 'interpretation',
  },
  '2': {
    // MedicationRequest
    1: 'identifier',
    2: 'status',
    3: 'intent',
    4: 'medicationCodeableConcept',
    5: 'subject',
    6: 'authoredOn',
    7: 'dosageInstruction',
  },
  '3': {
    // Condition
    1: 'identifier',
    2: 'clinicalStatus',
    3: 'verificationStatus',
    4: 'code',
    5: 'subject',
    6: 'onsetDateTime',
    7: 'severity',
  },
  '4': {
    // Procedure
    1: 'identifier',
    2: 'status',
    3: 'code',
    4: 'subject',
    5: 'performedDateTime',
    6: 'performer',
    7: 'reasonCode',
  },
  '5': {
    // Encounter
    1: 'identifier',
    2: 'status',
    3: 'class',
    4: 'type',
    5: 'subject',
    6: 'period',
    7: 'reasonCode',
  },
  '6': {
    // DiagnosticReport
    1: 'identifier',
    2: 'status',
    3: 'code',
    4: 'subject',
    5: 'effectiveDateTime',
    6: 'result',
    7: 'conclusion',
  },
  '7': {
    // CarePlan
    1: 'identifier',
    2: 'status',
    3: 'intent',
    4: 'subject',
    5: 'period',
    6: 'activity',
    7: 'goal',
  },
  '8': {
    // Immunization
    1: 'identifier',
    2: 'status',
    3: 'vaccineCode',
    4: 'patient',
    5: 'occurrenceDateTime',
    6: 'site',
    7: 'doseQuantity',
  },
  // Add more resource types as needed
};

/**
 * Deep get a value from an object based on a path string
 * @param obj The object to extract from
 * @param path The path in dot notation (e.g., 'name.0.given.0')
 * @returns The value at the path or undefined if not found
 */
export function getValueByPath(obj: any, path: string): any {
  const keys = path.split('.');
  let result = obj;

  for (const key of keys) {
    if (result === null || result === undefined) {
      return undefined;
    }

    // Handle array indices
    if (/^\d+$/.test(key) && Array.isArray(result)) {
      result = result[parseInt(key, 10)];
    } else {
      result = result[key];
    }
  }

  return result;
}

/**
 * Extract a specific field from a FHIR resource
 * @param resource The FHIR resource object
 * @param fieldPath The path to the field
 * @returns The extracted value or undefined
 */
export function extractField(resource: any, fieldPath: string): any {
  try {
    // Handle special compound fields
    if (fieldPath === 'identifier') {
      const identifiers = resource.identifier || [];
      // Try to find a primary identifier
      const primary = identifiers.find((id: any) => id.use === 'official' || id.use === 'usual');
      return primary ? primary.value : identifiers[0]?.value;
    }

    if (fieldPath === 'name') {
      const names = resource.name || [];
      // Try to find official name
      const official = names.find((name: any) => name.use === 'official');
      const name = official || names[0];
      if (name) {
        // Construct full name
        const given = Array.isArray(name.given) ? name.given.join(' ') : name.given || '';
        const family = name.family || '';
        return given && family ? `${given} ${family}` : given || family;
      }
      return undefined;
    }

    if (fieldPath === 'address') {
      const addresses = resource.address || [];
      const primary = addresses.find((addr: any) => addr.use === 'home' || addr.use === 'work');
      const address = primary || addresses[0];
      if (address) {
        // Construct address string
        const line = Array.isArray(address.line) ? address.line.join(', ') : address.line || '';
        const city = address.city || '';
        const state = address.state || '';
        const postalCode = address.postalCode || '';
        return [line, city, state, postalCode].filter(Boolean).join(', ');
      }
      return undefined;
    }

    // For simple fields, get directly
    return getValueByPath(resource, fieldPath);
  } catch (error) {
    console.error(`Error extracting field ${fieldPath}:`, error);
    return undefined;
  }
}

/**
 * Convert a value to a numeric representation suitable for ZKP circuits
 * @param value The value to convert
 * @returns A numeric representation of the value
 */
export function valueToNumber(value: any): number {
  if (value === null || value === undefined) {
    return 0;
  }

  if (typeof value === 'boolean') {
    return value ? 1 : 0;
  }

  if (typeof value === 'number') {
    return Math.floor(value);
  }

  if (typeof value === 'string') {
    // For strings, use a simple hash function
    return stringToHash(value);
  }

  if (typeof value === 'object') {
    // For objects, stringify and hash
    return stringToHash(JSON.stringify(value));
  }

  return 0;
}

/**
 * Simple string hash function
 * @param str The string to hash
 * @returns A numeric hash value
 */
export function stringToHash(str: string): number {
  let hash = 0;
  if (str.length === 0) return hash;

  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  return Math.abs(hash);
}

/**
 * Hash FHIR data using Web Crypto API (SHA-256)
 * @param data The string data to hash
 * @returns Promise resolving to a tuple of two hash parts (for ZKP compatibility)
 */
export async function hashFHIRData(data: string): Promise<[string, string]> {
  try {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);

    // Convert hash to hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

    // For zkSNARK compatibility, we're returning two 128-bit parts of the hash
    const part1 = hashHex.substring(0, 32);
    const part2 = hashHex.substring(32);

    return [part1, part2];
  } catch (error) {
    console.error('Error hashing FHIR data:', error);
    return ['0', '0'];
  }
}

/**
 * Process a FHIR resource for ZKP verification
 * @param resourceTypeId The resource type ID (0 for Patient, 1 for Observation, etc.)
 * @param resourceData The FHIR resource data
 * @param options Additional processing options
 * @returns Promise resolving to the processed data
 */
export async function processFHIRResource(
  resourceTypeId: string,
  resourceData: any,
  options: Partial<FieldExtractorOptions> = {}
): Promise<ProcessedFHIRData> {
  // Initialize field elements array (8 elements: resource type + 7 fields)
  const fieldElements = Array(8).fill(0);

  // Set resource type (1-based in ZoKrates)
  const resourceTypeNum = parseInt(resourceTypeId) + 1;
  fieldElements[0] = resourceTypeNum;

  // Get mapping for this resource type
  const mapping = options.fieldMapping || RESOURCE_FIELD_MAPPING;
  const resourceMapping = mapping[resourceTypeId];

  const extractedFields: { [key: string]: any } = {};

  if (resourceMapping) {
    // Extract each field according to the mapping
    for (let i = 1; i <= 7; i++) {
      if (resourceMapping[i]) {
        const fieldPath = resourceMapping[i];
        const value = extractField(resourceData, fieldPath);

        if (value !== undefined) {
          fieldElements[i] = valueToNumber(value);
          extractedFields[fieldPath] = value;
        }
      }
    }
  }

  // Hash the entire resource
  const hash = await hashFHIRData(JSON.stringify(resourceData));

  return {
    resourceType: resourceTypeNum,
    fieldElements,
    hash,
    metadata: {
      resourceTypeStr: resourceData.resourceType || '',
      id: resourceData.id || '',
      lastUpdated: resourceData.meta?.lastUpdated,
      extractedFields,
    },
  };
}

/**
 * Generate a disclosure mask for selective disclosure
 * @param fields Array of field indices to disclose (1-7)
 * @returns Binary array where 1 means disclosed and 0 means hidden
 */
export function generateDisclosureMask(fields: number[]): number[] {
  const mask = Array(8).fill(0);

  // Always disclose resource type
  mask[0] = 1;

  // Set disclosed fields
  for (const field of fields) {
    if (field >= 1 && field <= 7) {
      mask[field] = 1;
    }
  }

  return mask;
}

/**
 * Apply a disclosure mask to field elements
 * @param fieldElements Original field elements array
 * @param mask Disclosure mask (1 = disclose, 0 = hide)
 * @returns Field elements with hidden fields set to 0
 */
export function applyDisclosureMask(fieldElements: number[], mask: number[]): number[] {
  return fieldElements.map((value, index) => {
    return mask[index] === 1 ? value : 0;
  });
}

/**
 * Get human-readable field names for a resource type
 * @param resourceTypeId The resource type ID
 * @returns Object mapping field indices to readable names
 */
export function getFieldLabels(resourceTypeId: string): { [key: number]: string } {
  const mapping = RESOURCE_FIELD_MAPPING[resourceTypeId];
  if (!mapping) return {};

  const labels: { [key: number]: string } = {};

  for (const [index, field] of Object.entries(mapping)) {
    // Capitalize first letter of each word
    labels[parseInt(index)] = field
      .split('.')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  return labels;
}

/**
 * Generate template FHIR resource for a given type
 * @param resourceTypeId The resource type ID
 * @returns A template FHIR resource object
 */
export function generateTemplateResource(resourceTypeId: string): any {
  switch (resourceTypeId) {
    case '0': // Patient
      return {
        resourceType: 'Patient',
        id: 'example',
        active: true,
        name: [
          {
            use: 'official',
            family: 'Smith',
            given: ['John'],
          },
        ],
        gender: 'male',
        birthDate: '1970-01-01',
        address: [
          {
            use: 'home',
            line: ['123 Main St'],
            city: 'Anytown',
            state: 'CA',
            postalCode: '12345',
            country: 'USA',
          },
        ],
        telecom: [
          {
            system: 'phone',
            value: '555-123-4567',
            use: 'home',
          },
        ],
      };

    case '1': // Observation
      return {
        resourceType: 'Observation',
        id: 'example',
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'vital-signs',
                display: 'Vital Signs',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: '8867-4',
              display: 'Heart rate',
            },
          ],
        },
        subject: {
          reference: 'Patient/example',
        },
        effectiveDateTime: '2023-01-01T12:00:00Z',
        valueQuantity: {
          value: 80,
          unit: 'beats/minute',
          system: 'http://unitsofmeasure.org',
          code: '/min',
        },
      };

    case '2': // MedicationRequest
      return {
        resourceType: 'MedicationRequest',
        id: 'example',
        status: 'active',
        intent: 'order',
        medicationCodeableConcept: {
          coding: [
            {
              system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
              code: '1049502',
              display: 'Acetaminophen 325 MG Oral Tablet',
            },
          ],
        },
        subject: {
          reference: 'Patient/example',
        },
        authoredOn: '2023-01-10T15:00:00Z',
        requester: {
          reference: 'Practitioner/example',
        },
        dosageInstruction: [
          {
            text: 'Take 2 tablets by mouth every 4-6 hours as needed for pain',
            timing: {
              repeat: {
                frequency: 1,
                period: 4,
                periodUnit: 'h',
              },
            },
            doseAndRate: [
              {
                doseQuantity: {
                  value: 2,
                  unit: 'tablet',
                },
              },
            ],
          },
        ],
      };

    case '3': // Condition
      return {
        resourceType: 'Condition',
        id: 'example',
        clinicalStatus: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
              code: 'active',
            },
          ],
        },
        verificationStatus: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status',
              code: 'confirmed',
            },
          ],
        },
        code: {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '73211009',
              display: 'Diabetes mellitus',
            },
          ],
        },
        subject: {
          reference: 'Patient/example',
        },
        onsetDateTime: '2022-06-15',
        recordedDate: '2022-06-20',
        severity: {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '24484000',
              display: 'Severe',
            },
          ],
        },
      };

    default:
      // Default empty resource
      return {
        resourceType: 'Patient',
        id: 'example',
      };
  }
}

/**
 * Default resource templates as JSON strings
 */
export const RESOURCE_TEMPLATES: { [key: string]: string } = {
  '0': JSON.stringify(generateTemplateResource('0'), null, 2),
  '1': JSON.stringify(generateTemplateResource('1'), null, 2),
  '2': JSON.stringify(generateTemplateResource('2'), null, 2),
  '3': JSON.stringify(generateTemplateResource('3'), null, 2),
  // Add more templates as needed
};

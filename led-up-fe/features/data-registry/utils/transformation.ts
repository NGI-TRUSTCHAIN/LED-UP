// Import and export named types and functions from current file
import { type Address } from 'viem';
import {
  type ProducerMetadataResponse,
  ResourceMetadata,
  type CheckAccessResponse,
  AccessLevel,
  ConsentStatus,
  RecordStatus,
  ResourceType,
} from '../types/contract/index';

// Define the correct RecordInfoResponse interface to match the contract
interface RecordInfoResponse {
  producer: Address;
  metadata: ResourceMetadata;
}

/**
 * Maximum safe integer in JavaScript (2^53 - 1)
 */
const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER;

/**
 * Converts a BigInt to a number safely
 * @param value The BigInt value to convert
 * @returns The converted number or the original BigInt if too large
 */
export function safeConvertBigIntToNumber(value: bigint | number): number {
  if (typeof value === 'number') return value;

  return value <= MAX_SAFE_INTEGER ? Number(value) : Number.MAX_SAFE_INTEGER;
}

/**
 * Converts an enum value from a numeric representation to its TypeScript enum equivalent
 * @param value The numeric enum value
 * @param enumType The enum type to convert to
 * @returns The corresponding enum value
 */
export function convertToEnum<T extends Record<string, any>>(value: number, enumType: T): T[keyof T] {
  const keys = Object.keys(enumType).filter((key) => isNaN(Number(key)));
  if (value >= 0 && value < keys.length) {
    return enumType[keys[value]] as T[keyof T];
  }

  // Default to the first enum value
  return enumType[keys[0]] as T[keyof T];
}

/**
 * Normalizes a ProducerMetadataResponse from the contract
 * @param response The raw response from the contract
 * @returns A normalized producer metadata object with proper types
 */
export function normalizeProducerMetadata(response: any): ProducerMetadataResponse {
  return {
    did: response.did,
    consent: convertToEnum(Number(response.consent), ConsentStatus),
    entries: safeConvertBigIntToNumber(response.entries),
    isActive: Boolean(response.isActive),
    lastUpdated: safeConvertBigIntToNumber(response.lastUpdated),
    nonce: safeConvertBigIntToNumber(response.nonce),
    version: safeConvertBigIntToNumber(response.version),
  };
}

/**
 * Normalizes a RecordInfoResponse from the contract
 * @param response The raw response from the contract
 * @returns A normalized record info object with proper types
 */
export function normalizeRecordInfo(response: any): RecordInfoResponse {
  return {
    producer: response.producer as Address,
    metadata: {
      recordId: response.metadata.recordId as string,
      cid: response.metadata.cid as string,
      contentHash: response.metadata.contentHash as `0x${string}`,
      dataSize: safeConvertBigIntToNumber(response.metadata.dataSize),
      sharedCount: safeConvertBigIntToNumber(response.metadata.sharedCount),
      updatedAt: safeConvertBigIntToNumber(response.metadata.updatedAt),
      resourceType: convertToEnum(Number(response.metadata.resourceType), ResourceType),
      producer: response.metadata.producer as Address,
    },
  };
}

/**
 * Normalizes a CheckAccessResponse from the contract
 * @param response The raw response from the contract
 * @returns A normalized check access response object with proper types
 */
export function normalizeCheckAccess(response: any): CheckAccessResponse {
  return {
    hasAccess: Boolean(response.hasAccess),
    expiration: safeConvertBigIntToNumber(response.expiration),
    accessLevel: convertToEnum(Number(response.accessLevel), AccessLevel),
    isRevoked: Boolean(response.isRevoked),
  };
}

/**
 * Formats a bytes32 record ID to a user-friendly string
 * @param recordId The bytes32 record ID from the contract
 * @returns A shortened user-friendly record ID
 */
export function formatRecordId(recordId: `0x${string}`): string {
  if (!recordId || recordId === '0x') return 'N/A';

  // Get the first 6 and last 4 characters of the hex string (without 0x prefix)
  const hexWithoutPrefix = recordId.slice(2);
  const shortHex = `${hexWithoutPrefix.slice(0, 6)}...${hexWithoutPrefix.slice(-4)}`;

  return `0x${shortHex}`;
}

export function getResourceTypeEnum(resourceType: string): ResourceType {
  // Normalize the input string
  const normalizedType = resourceType?.trim();
  if (!normalizedType) {
    console.warn('Empty resource type provided');
    return ResourceType.Other;
  }

  // Create a case-insensitive map of resource types
  const resourceTypeMap: Record<string, ResourceType> = {
    patient: ResourceType.Patient,
    observation: ResourceType.Observation,
    condition: ResourceType.Condition,
    procedure: ResourceType.Procedure,
    encounter: ResourceType.Encounter,
    medication: ResourceType.Medication,
    medicationstatement: ResourceType.MedicationStatement,
    medicationrequest: ResourceType.MedicationRequest,
    diagnosticreport: ResourceType.DiagnosticReport,
    immunization: ResourceType.Immunization,
    allergyintolerance: ResourceType.AllergyIntolerance,
    careplan: ResourceType.CarePlan,
    careteam: ResourceType.CareTeam,
    basic: ResourceType.Basic,
    other: ResourceType.Other,
  };

  // Try to match the normalized type (case-insensitive)
  const matchedType = resourceTypeMap[normalizedType.toLowerCase()];

  if (matchedType === undefined) {
    console.warn(`Unknown resource type: ${resourceType}, defaulting to Other`);
    return ResourceType.Other;
  }

  return matchedType;
}

/**
 * Returns a user-friendly string representation of a resource type
 * @param resourceType The ResourceType enum value
 * @returns A formatted string representation
 */
export function getResourceTypeName(resourceType: ResourceType): string {
  const resourceTypeMap: Record<number, string> = {
    [ResourceType.Patient]: 'Patient',
    [ResourceType.Observation]: 'Observation',
    [ResourceType.Condition]: 'Condition',
    [ResourceType.Procedure]: 'Procedure',
    [ResourceType.Encounter]: 'Encounter',
    [ResourceType.Medication]: 'Medication',
    [ResourceType.MedicationStatement]: 'Medication Statement',
    [ResourceType.MedicationRequest]: 'Medication Request',
    [ResourceType.DiagnosticReport]: 'Diagnostic Report',
    [ResourceType.Immunization]: 'Immunization',
    [ResourceType.AllergyIntolerance]: 'Allergy Intolerance',
    [ResourceType.CarePlan]: 'Care Plan',
    [ResourceType.CareTeam]: 'Care Team',
    [ResourceType.Basic]: 'Basic',
    [ResourceType.Other]: 'Other',
  };

  return resourceTypeMap[resourceType] || 'Unknown';
}

/**
 * Returns a user-friendly string representation of a record status
 * @param status The RecordStatus enum value
 * @returns A formatted string representation
 */
export function getRecordStatusName(status: RecordStatus): string {
  const statusMap: Record<number, string> = {
    [RecordStatus.Inactive]: 'Inactive',
    [RecordStatus.Active]: 'Active',
    [RecordStatus.Suspended]: 'Suspended',
    [RecordStatus.Deleted]: 'Deleted',
  };

  return statusMap[status] || 'Unknown';
}

/**
 * Returns a user-friendly string representation of a consent status
 * @param status The ConsentStatus enum value
 * @returns A formatted string representation
 */
export function getConsentStatusName(status: ConsentStatus): string {
  const statusMap: Record<number, string> = {
    [ConsentStatus.NotSet]: 'Not Set',
    [ConsentStatus.Allowed]: 'Allowed',
    [ConsentStatus.Denied]: 'Denied',
  };

  return statusMap[status] || 'Unknown';
}

/**
 * Returns a user-friendly string representation of an access level
 * @param level The AccessLevel enum value
 * @returns A formatted string representation
 */
export function getAccessLevelName(level: AccessLevel): string {
  const levelMap: Record<number, string> = {
    [AccessLevel.Read]: 'Read',
    [AccessLevel.Write]: 'Write',
  };

  return levelMap[level] || 'Unknown';
}

import { ConsentStatus, RecordStatus } from '../types';

/**
 * Converts a numeric status to a human-readable label
 * @param status The numeric status
 * @returns A human-readable label
 */
export function getStatusLabel(status: RecordStatus): string {
  switch (status) {
    case RecordStatus.UNKNOWN:
      return 'Unknown';
    case RecordStatus.ACTIVE:
      return 'Active';
    case RecordStatus.INACTIVE:
      return 'Inactive';
    case RecordStatus.SUSPENDED:
      return 'Suspended';
    default:
      return 'Unknown';
  }
}

/**
 * Converts a numeric consent status to a human-readable label
 * @param consent The numeric consent status
 * @returns A human-readable label
 */
export function getConsentLabel(consent: ConsentStatus): string {
  switch (consent) {
    case ConsentStatus.PENDING:
      return 'Pending';
    case ConsentStatus.ALLOWED:
      return 'Allowed';
    case ConsentStatus.DENIED:
      return 'Denied';
    default:
      return 'Unknown';
  }
}

/**
 * Gets the appropriate status options based on the current status
 * @param currentStatus The current status
 * @returns An array of valid status options
 */
export function getValidStatusTransitions(currentStatus: RecordStatus): RecordStatus[] {
  switch (currentStatus) {
    case RecordStatus.UNKNOWN:
      return [RecordStatus.ACTIVE, RecordStatus.INACTIVE];
    case RecordStatus.ACTIVE:
      return [RecordStatus.INACTIVE, RecordStatus.SUSPENDED];
    case RecordStatus.INACTIVE:
      return [RecordStatus.ACTIVE, RecordStatus.SUSPENDED];
    case RecordStatus.SUSPENDED:
      return [RecordStatus.ACTIVE, RecordStatus.INACTIVE];
    default:
      return [RecordStatus.UNKNOWN, RecordStatus.ACTIVE, RecordStatus.INACTIVE, RecordStatus.SUSPENDED];
  }
}

/**
 * Gets the appropriate consent options based on the current consent
 * @param currentConsent The current consent status
 * @returns An array of valid consent options
 */
export function getValidConsentTransitions(currentConsent: ConsentStatus): ConsentStatus[] {
  switch (currentConsent) {
    case ConsentStatus.PENDING:
      return [ConsentStatus.ALLOWED, ConsentStatus.DENIED];
    case ConsentStatus.ALLOWED:
      return [ConsentStatus.DENIED, ConsentStatus.PENDING];
    case ConsentStatus.DENIED:
      return [ConsentStatus.ALLOWED, ConsentStatus.PENDING];
    default:
      return [ConsentStatus.PENDING, ConsentStatus.ALLOWED, ConsentStatus.DENIED];
  }
}

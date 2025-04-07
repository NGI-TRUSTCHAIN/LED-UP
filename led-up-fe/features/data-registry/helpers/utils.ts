/**
 * Enum representing the consent status of a record.
 */
export enum ConsentStatus {
  Allowed = 0, // Consent is granted
  Denied = 1, // Consent is denied
  Pending = 2, // Consent is pending
}

/**
 * Enum representing the status of a record.
 */
export enum RecordStatus {
  ACTIVE = 0, // Record is active
  INACTIVE = 1, // Record is inactive
  SUSPENDED = 2, // Record is suspended
  ERROR = 3, // Record has encountered an error
  UNKNOWN = 4, // Record status is unknown
}

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
    case ConsentStatus.Pending:
      return 'Pending';
    case ConsentStatus.Allowed:
      return 'Allowed';
    case ConsentStatus.Denied:
      return 'Denied';
    default:
      return 'Unknown';
  }
}

/**
 * Formats an Ethereum address for display
 * @param address The Ethereum address
 * @param start The number of characters to show at the start
 * @param end The number of characters to show at the end
 * @returns A formatted address
 */
export function formatAddress(address: string, start = 6, end = 4): string {
  if (!address) return '';
  if (address.length <= start + end) return address;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

/**
 * Formats a timestamp for display
 * @param timestamp The timestamp in seconds
 * @returns A formatted date string
 */
export function formatTimestamp(timestamp: number): string {
  if (!timestamp) return '';
  const date = new Date(timestamp * 1000);
  return date.toLocaleString();
}

/**
 * Validates an Ethereum address
 * @param address The Ethereum address to validate
 * @returns True if the address is valid, false otherwise
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validates a DID
 * @param did The DID to validate
 * @returns True if the DID is valid, false otherwise
 */
export function isValidDid(did: string): boolean {
  return /^did:ledup:[a-zA-Z0-9]+:[a-zA-Z0-9]+$/.test(did);
}

/**
 * Extracts the role from a DID
 * @param did The DID to extract the role from
 * @returns The role or null if the DID is invalid
 */
export function getRoleFromDid(did: string): string | null {
  if (!isValidDid(did)) return null;
  const parts = did.split(':');
  return parts[2] || null;
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
    case ConsentStatus.Pending:
      return [ConsentStatus.Allowed, ConsentStatus.Denied];
    case ConsentStatus.Allowed:
      return [ConsentStatus.Denied, ConsentStatus.Pending];
    case ConsentStatus.Denied:
      return [ConsentStatus.Allowed, ConsentStatus.Pending];
    default:
      return [ConsentStatus.Pending, ConsentStatus.Allowed, ConsentStatus.Denied];
  }
}

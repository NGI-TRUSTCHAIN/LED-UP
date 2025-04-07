// User types
export type UserType = 'consumer' | 'producer';

// DID Document structure
export interface DIDDocument {
  subject: string;
  lastUpdated: number;
  active: boolean;
  publicKey: string;
  document: string;
}

// Registration form data
export interface RegistrationFormData {
  did?: string;
  document?: string;
  publicKey?: string;
  role?: string;
  consent?: number;
  status?: number;
}

// Server response types
export interface RegistrationResponse {
  success: boolean;
  data?: any;
  error?: string | null;
  message?: string | null;
}

// Record status enum
export enum RecordStatus {
  INACTIVE = 0,
  ACTIVE = 1,
  SUSPENDED = 2,
  DELETED = 3,
}

// Consent status enum
export enum ConsentStatus {
  DENIED = 0,
  GRANTED = 1,
  PENDING = 2,
  REVOKED = 3,
}

// Producer registration parameters
export interface ProducerRegistrationParams {
  ownerDid: string;
  producer: string;
  status: RecordStatus;
  consent: ConsentStatus;
}

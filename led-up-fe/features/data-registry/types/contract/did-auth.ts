import { Address } from 'viem';

export interface DidAuthContract {
  // Constants
  ADMIN_ROLE(): Promise<`0x${string}`>;
  CONSUMER_ROLE(): Promise<`0x${string}`>;
  PRODUCER_ROLE(): Promise<`0x${string}`>;
  PROVIDER_ROLE(): Promise<`0x${string}`>;
  ISSUER_ROLE(): Promise<`0x${string}`>;
  VERIFIER_ROLE(): Promise<`0x${string}`>;
  OPERATOR_ROLE(): Promise<`0x${string}`>;
  DEFAULT_ADMIN_ROLE(): Promise<`0x${string}`>;

  // Credential Types
  PRODUCER_CREDENTIAL(): Promise<string>;
  CONSUMER_CREDENTIAL(): Promise<string>;
  PROVIDER_CREDENTIAL(): Promise<string>;

  // View Functions
  authenticate(did: string, role: `0x${string}`): Promise<boolean>;
  getCallerDid(): Promise<string>;
  getDidFromAddress(addr: Address): Promise<string>;
  getRequiredCredentialForRole(role: `0x${string}`): Promise<string>;
  getRoleRequirement(role: `0x${string}`): Promise<string>;
  hasDidRole(did: string, role: `0x${string}`): Promise<boolean>;
  hasRole(role: `0x${string}`, account: Address): Promise<boolean>;
  hasRequiredRolesAndCredentials(did: string, roles: `0x${string}`[], credentialIds: `0x${string}`[]): Promise<boolean>;
  isTrustedIssuer(credentialType: string, issuer: Address): Promise<boolean>;
  resolveDid(did: string): Promise<Address>;
  verifyCredentialForAction(did: string, credentialType: string, credentialId: `0x${string}`): Promise<boolean>;

  // Write Functions
  grantDidRole(did: string, role: `0x${string}`): Promise<void>;
  revokeDidRole(did: string, role: `0x${string}`): Promise<void>;
  issueCredential(credentialType: string, did: string, credentialId: `0x${string}`): Promise<void>;
  setRoleRequirement(role: `0x${string}`, requirement: string): Promise<void>;
  setTrustedIssuer(credentialType: string, issuer: Address, trusted: boolean): Promise<void>;
}

// Contract Events
export type AuthenticationSuccessfulEvent = {
  did: string;
  role: `0x${string}`;
  timestamp: bigint;
};

export type AuthenticationFailedEvent = {
  did: string;
  role: `0x${string}`;
  timestamp: bigint;
};

export type CredentialVerifiedEvent = {
  did: string;
  credentialType: string;
  credentialId: `0x${string}`;
  timestamp: bigint;
};

export type CredentialVerificationFailedEvent = {
  did: string;
  credentialType: string;
  credentialId: `0x${string}`;
  timestamp: bigint;
};

export type RoleGrantedEvent = {
  did: string;
  role: `0x${string}`;
  timestamp: bigint;
};

export type RoleRevokedEvent = {
  did: string;
  role: `0x${string}`;
  timestamp: bigint;
};

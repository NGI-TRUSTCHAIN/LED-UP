import { AddressLike } from 'ethers';

/**
 * Represents metadata for an entity.
 */
export interface Metadata {
  /** The URL of the metadata. */
  url: string;
  /** The hash of the metadata for integrity verification. */
  hash: string; // bytes32 in Solidity is represented as a string in TypeScript
}

/**
 * Represents the metadata of a record.
 */
export interface RecordMetadata {
  /** The content identifier of the metadata (e.g., IPFS CID). */
  cid: string;
  /** The FHIR URL of the metadata. */
  url: string;
  /** The hash of the encrypted metadata stored in the CID URL. */
  hash: string;
}

/**
 * Represents a schema that references metadata.
 */
export interface Schema {
  /** The metadata that defines the schema. */
  schemaRef: Metadata;
}

/**
 * Defines possible statuses of a record.
 */
export enum RecordStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  ERROR = 'ERROR',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Defines possible consent statuses.
 */
export enum ConsentStatus {
  ALLOWED = 'Allowed',
  DENIED = 'Denied',
  PENDING = 'Pending',
}

/**
 * Represents a record of patient data.
 */
export interface PatientRecord {
  /** The signature of the patient for verification purposes. */
  signature: string; // bytes in Solidity is represented as a string in TypeScript
  /** The type of resource represented by the record. */
  resourceType: string;
  /** Metadata associated with the record. */
  metadata: RecordMetadata;
}

/**
 * Represents information about a specific record.
 */
export interface RecordInfo {
  /** The address of the producer associated with the record. */
  producer: string; // address in Solidity is represented as a string in TypeScript
  /** The status of the record. */
  status: RecordStatus;
  /** The consent status related to the record. */
  consent: ConsentStatus;
  /** A unique identifier for the record to prevent replay attacks. */
  nonce: number;
}

/**
 * Represents a producer's records.
 */
export interface ProducerRecord {
  /** The address of the producer. */
  producer: string;
  /** The current status of the producer's records. */
  status: RecordStatus;
  /** The consent status of the producer. */
  consent: ConsentStatus;
  /** A mapping of record identifiers to their respective records. */
  records: Record<string, PatientRecord>;
  /** A unique identifier for the producer's records to prevent replay attacks. */
  nonce: number;
  /** An array of record identifiers. */
  recordIds: string[];
}

/**
 * Represents an ERC20 token interface.
 */
export type IERC20 = AddressLike;

/**
 * Represents payment details.
 */
export interface Payment {
  /** The amount associated with the payment. */
  amount: number;
  /** The payment status. */
  isPayed: boolean;
}

/**
 * Represents DID Authentication AddressParam.
 */
export type DidAuth = AddressLike;

/**
 * Represents the main contract state.
 */
export interface CompensationContractState {
  /** The ERC20 token used in the contract. */
  token: IERC20;
  /** The payable address for the Levea wallet. */
  leveaWallet: string;
  /** The service fee percentage. */
  serviceFeePercent: number;
  /** The minimum withdrawable amount. */
  minimumWithdrawAmount: number;
  /** The unit price of the token. */
  unitPrice: number;
  /** The service fee balance. */
  serviceFeeBalance: number;
  /** Mapping of producer balances. */
  producerBalances: Record<string, number>;
  /** Mapping of record IDs to payment details. */
  payments: Record<string, Payment>;
  /** DID Authentication instance. */
  didAuth: DidAuth;
  /** Mapping of producer addresses to their DIDs. */
  producerDids: Record<string, string>;
  /** Mapping of consumer addresses to their DIDs. */
  consumerDids: Record<string, string>;
}

// /**
//  * Data Registry Contract State
//  */
// /**
//  * Represents the main contract state.
//  */
// export interface DataRegistryContractState {
//   /**
//    * The ERC20 token used in the contract.
//    */
//   token: IERC20;

//   /**
//    * The payable address for the Levea wallet.
//    */
//   leveaWallet: AddressLike;

//   /**
//    * The service fee percentage.
//    */
//   recordCount: number;

//   /**
//    * The service fee balance.
//    */
//   serviceFeeBalance: number;

//   /**
//    * Mapping of producer balances.
//    * Keys are producer addresses, and values represent their balance.
//    */
//   producerBalances: Record<string, number>;

//   /**
//    * Mapping of record IDs to payment details.
//    */
//   payments: Record<string, Payment>;

//   /**
//    * DID Authentication instance.
//    */
//   didAuth: DidAuth;

//   /**
//    * Compensation details.
//    */
//   compensation: AddressLike;

//   /**
//    * Mapping of producer addresses to their Decentralized Identifiers (DIDs).
//    */
//   producerDids: Record<string, string>;

//   /**
//    * Mapping of consumer addresses to their Decentralized Identifiers (DIDs).
//    */
//   consumerDids: Record<string, string>;

//   /**
//    * Metadata associated with the provider.
//    */
//   providerMetadata: Metadata;

//   /**
//    * Metadata associated with the record schema.
//    */
//   recordSchema: Metadata;

//   /**
//    * Mapping of producer addresses to their records.
//    * Each producer address is linked to a `DataRecordCore` instance.
//    */
//   records: Record<string, DataRecordCore>;

//   /**
//    * Mapping of producer addresses to their associated record IDs.
//    * Each producer may have multiple record IDs.
//    */
//   ids: Record<string, string[]>;

//   /**
//    * Mapping of producer addresses to their health records.
//    * The first key is the producer address, and the second key is the record ID.
//    */
//   healthRecords: Record<string, Record<string, HealthRecord>>;

//   /**
//    * Mapping of record IDs to authorized consumers.
//    * Each record ID is associated with a mapping of consumer addresses to authorization status.
//    */
//   authorizedConsumers: Record<string, Record<string, boolean>>;

//   /**
//    * Mapping of Decentralized Identifiers (DIDs) to Ethereum addresses.
//    */
//   didToAddress: Record<string, string>;
// }

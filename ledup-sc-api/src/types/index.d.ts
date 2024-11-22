/**
 * Represents metadata associated with a resource.
 */
export type Metadata = {
  /**
   * The URL pointing to the resource.
   *
   * @example "https://example.com/resource"
   */
  url: string;

  /**
   * A unique hash representing the resource, often used for integrity verification.
   *
   * @example "abc123def456"
   */
  hash: string;
};

/**
 * Defines the schema reference for a record.
 */
export type RecordSchema = {
  /**
   * Reference to the metadata associated with the schema.
   */
  schemaRef: Metadata;
};

/**
 * Represents metadata specific to a record, extending the basic metadata.
 */
export type RecordMetadata = Metadata & {
  /**
   * A unique identifier for the record, often used in decentralized systems.
   *
   * @example "cid123456789"
   */
  cid: string;
};

/**
 * Represents a registered record.
 */
export type RegRecord = {
  /**
   * The digital signature associated with the record.
   *
   * @example "0xabcdef..."
   */
  signature: string;

  /**
   * The type of resource being recorded.
   *
   * @example "PatientRecord"
   */
  resourceType: string;

  /**
   * Basic metadata associated with the record.
   */
  metadata: Metadata;
};

/**
 * Represents the records associated with a producer.
 */
export type ProducerRecords = {
  /**
   * The status of the records associated with the producer.
   */
  status: number;

  /**
   * The consent status of the records associated with the producer.
   */
  consent: number;

  /**
   * The records associated with the producer.
   */
  records: RegRecord[];

  /**
   * The current count of records (nonce) associated with the producer.
   */
  nonce: number;

  /**
   * The recordIds associated with the producer.
   */
  recordIds: string[];
};

/**
 * Contains information about the record's state and producer.
 */
export type RecordInfo = {
  /**
   * The identifier of the producer of the record.
   *
   * @example "producer123"
   */
  producer: string;

  /**
   * The status of the record represented as a numeric code.
   *
   * @example 1 // for 'active'
   */
  status: number;

  /**
   * The consent status represented as a numeric code.
   *
   * @example 1 // for 'denied'
   */
  consent: number;

  /**
   * A nonce used to ensure the uniqueness of the record.
   *
   * @example 123456
   */
  nonce: number;
};

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
 * Parameter for pausing a process.
 */
export type PauseParam = {
  /**
   * Indicates whether the process should be paused.
   *
   * @example true
   */
  pause: boolean;
};

/**
 * Parameters for registering a producer.
 */
export type ProducerRegistrationParam = {
  /**
   * Unique identifier for the record.
   *
   * @example "record123"
   */
  recordId: string;

  /**
   * Identifier of the producer.
   *
   * @example "producer123"
   */
  producer: string;

  /**
   * Digital signature associated with the registration.
   *
   * @example "0xabcdef..."
   */
  signature: string;

  /**
   * The type of resource being registered.
   *
   * @example "PatientRecord"
   */
  resourceType: string;

  /**
   * The consent status for the registration.
   */
  consent: ConsentStatus;

  /**
   * The status of the record, optional.
   */
  status?: RecordStatus;

  /**
   * Metadata associated with the record.
   */
  metadata: RecordMetadata;
};

/**
 * Represents a payment transaction.
 */
export type Payment = {
  /**
   * The amount of the payment.
   *
   * @example 100.50
   */
  amount: number;

  /**
   * Indicates whether the payment has been made.
   *
   * @example true
   */
  isPayed: boolean;
};

/**
 * Represents the state of the compensation system.
 */
export interface CompensationState {
  /**
   * Address of the token contract.
   */
  token: string;

  /**
   * Address of the Leva wallet.
   */
  leveaWallet: string;

  /**
   * Percentage of service fees charged.
   *
   * @example 5 // representing 5%
   */
  serviceFeePercent: number;

  /**
   * Minimum amount required to withdraw funds.
   *
   * @example 50.00
   */
  minimumWithdrawAmount: number;

  /**
   * Price per unit of the service.
   *
   * @example 10.00
   */
  unitPrice: number;

  /**
   * Total balance of service fees collected.
   *
   * @example 500.00
   */
  serviceFeeBalance: number;

  /**
   * Mapping of producer addresses to their balances.
   */
  producerBalances: Record<string, number>;

  /**
   * Mapping of payment identifiers to payment information.
   */
  payments: Record<string, Payment>;
}

/**
 * Event triggered when a producer is removed.
 */
export interface ProducerRemovedEvent {
  /**
   * The wallet address of the removed producer.
   *
   * @example "0xabcdef..."
   */
  wallet: string;
}

/**
 * Event triggered when a producer is paid.
 */
export interface ProducerPaidEvent {
  /**
   * The address of the producer who was paid.
   *
   * @example "producer123"
   */
  producer: string;

  /**
   * The amount paid to the producer.
   *
   * @example 100.00
   */
  amount: number;

  /**
   * The timestamp of when the payment was processed.
   *
   * @example 1634567890
   */
  timestamp: number;
}

/**
 * Event triggered when a service fee is withdrawn.
 */
export interface ServiceFeeWithdrawnEvent {
  /**
   * The wallet address receiving the withdrawn fee.
   *
   * @example "0xabcdef..."
   */
  wallet: string;

  /**
   * The amount withdrawn.
   *
   * @example 50.00
   */
  amount: number;

  /**
   * The timestamp of the withdrawal.
   *
   * @example 1634567890
   */
  timestamp: number;
}

/**
 * Event triggered when the service fee percentage changes.
 */
export interface ServiceFeeChangedEvent {
  /**
   * The new service fee percentage.
   *
   * @example 7 // representing 7%
   */
  newServiceFee: number;
}

/**
 * Event triggered when a payment is processed.
 */
export interface PaymentProcessedEvent {
  /**
   * The address of the producer receiving the payment.
   *
   * @example "producer123"
   */
  producer: string;

  /**
   * The address of the consumer making the payment.
   *
   * @example "consumer456"
   */
  consumer: string;

  /**
   * The total amount paid.
   *
   * @example 100.00
   */
  amount: number;

  /**
   * The fee charged for processing the payment.
   *
   * @example 2.00
   */
  fee: number;
}

/**
 * Event triggered when the unit price changes.
 */
export interface UnitPriceChangedEvent {
  /**
   * The new unit price.
   *
   * @example 12.50
   */
  newUnitPrice: number;
}

/**
 * Parameters for constructing a compensation contract.
 */
export interface CompensationConstructorParams {
  /**
   * Address of the provider.
   */
  provider: string;

  /**
   * Address of the token contract.
   */
  tokenAddress: string;

  /**
   * Address of the Leva wallet.
   */
  leveaWallet: string;

  /**
   * Percentage of service fees charged.
   *
   * @example 5 // representing 5%
   */
  serviceFeePercent: number;

  /**
   * Price per unit of the service.
   *
   * @example 10.00
   */
  unitPrice: number;
}

/**
 * Parameters for processing a payment.
 */
export interface ProcessPaymentParams {
  /**
   * The address of the producer receiving the payment.
   *
   * @example "producer123"
   */
  producer: string;

  /**
   * The unique identifier for the record associated with the payment.
   *
   * @example "record123"
   */
  recordId: string;

  /**
   * The size of the data being processed for the payment.
   *
   * @example 2048 // size in bytes
   */
  dataSize: number;
}

/**
 * Parameter for passing an address.
 */
export type AddressParam = {
  /**
   * The address of a wallet or contract.
   *
   * @example "0xabcdef..."
   */
  address: string;
};

/**
 * Parameter for passing a value.
 */
export type ValueParam = {
  /**
   * A numeric value, often representing an amount or quantity.
   *
   * @example 100
   */
  value: number;
};

/**
 * Represents a record on the blockchain with various transaction details.
 */
export type BlockchainRecordType = {
  /**
   * The partition key for the record, used for organizing data in a distributed database.
   *
   * @example "partition1"
   */
  partitionKey?: string;

  /**
   * The row key for the record, used in conjunction with the partition key to uniquely identify a record.
   *
   * @example "row123"
   */
  rowKey?: string;

  /**
   * The index of the transaction within its block.
   *
   * @example "0"
   */
  transactionIndex?: string;

  /**
   * A unique identifier for the transaction.
   *
   * @example "tx123456789"
   */
  id?: string;

  /**
   * The hash of the transaction, used for verifying its integrity.
   *
   * @example "0xabcdef123456..."
   */
  transactionHash: string;

  /**
   * The hash of the block that contains this transaction.
   *
   * @example "0x123456abcdef..."
   */
  blockHash: string;

  /**
   * The number of the block that contains this transaction.
   *
   * @example "123456"
   */
  blockNumber: string;

  /**
   * The Ethereum address involved in the transaction.
   *
   * @example "0xabcdef123456..."
   */
  eAddress: string;

  /**
   * Additional data associated with the transaction.
   *
   * @example "Some additional data related to the transaction"
   */
  eData: string;

  /**
   * Topics associated with the transaction, often used for event filtering.
   *
   * @example "topic1,topic2"
   */
  topics: string;

  /**
   * Arguments passed with the transaction, typically encoded as a string.
   *
   * @example "arg1,arg2"
   */
  args: string;

  /**
   * The digital signature of the transaction, used for verification.
   *
   * @example "0xabcdef123456..."
   */
  eSignature: string;

  /**
   * The name of the event or function being executed in the transaction.
   *
   * @example "Transfer"
   */
  eName: string;

  /**
   * The topic associated with the event emitted in the transaction.
   *
   * @example "Transfer(address,address,uint256)"
   */
  eTopic: string;

  /**
   * The timestamp of the transaction in ISO 8601 format.
   *
   * @example "2024-10-10T14:00:00Z"
   */
  eTimestamp: string;
};

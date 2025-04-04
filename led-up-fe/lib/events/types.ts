import { Address, Abi, Log } from 'viem';
import { DataRegistryABI } from '../../utils/abi/data-registry';
import { CompensationABI } from '../../utils/abi/compensation';
import { erc20ABI } from '../../utils/abi/erc20';

/**
 * Custom error types for better error handling
 */
export class EventError extends Error {
  constructor(message: string, public readonly code: EventErrorCode, public readonly cause?: Error) {
    super(message);
    this.name = 'EventError';
  }
}

export enum EventErrorCode {
  CONTRACT_NOT_REGISTERED = 'CONTRACT_NOT_REGISTERED',
  EVENT_LISTEN_FAILED = 'EVENT_LISTEN_FAILED',
  EVENT_QUERY_FAILED = 'EVENT_QUERY_FAILED',
  INVALID_EVENT_NAME = 'INVALID_EVENT_NAME',
  PARSER_ERROR = 'PARSER_ERROR',
}

/**
 * Event filtering options
 */
export type EventFilter = {
  fromBlock?: bigint;
  toBlock?: bigint;
  address?: Address;
  events?: Array<string>;
};

/**
 * Callback type for event handlers
 */
export type EventCallback<T = unknown> = (event: T) => void | Promise<void>;

/**
 * Event subscription handle
 */
export type EventSubscription = {
  unsubscribe: () => void;
};

/**
 * Parsed event data structure
 */
export type ParsedEvent<T = unknown> = {
  eventName: string;
  args: T;
  blockNumber: bigint;
  blockHash: string;
  transactionHash: string;
  logIndex: number;
  address: string;
  timestamp?: number;
};

/**
 * Event listener configuration
 */
export type EventListenerConfig = {
  pollingInterval?: number;
  onError?: (error: EventError) => void;
  onLogs?: (logs: Log[]) => void;
  retryAttempts?: number;
  retryDelay?: number;
};

/**
 * Contract event configuration
 */
export type ContractEventConfig = {
  abi: Abi;
  address: Address;
  eventName?: string;
  filter?: EventFilter;
  listener?: EventListenerConfig;
};

/**
 * Event query parameters
 */
export type EventQueryParams = {
  fromBlock?: bigint;
  toBlock?: bigint;
  eventName?: string;
  address?: Address;
};

/**
 * Event parsing result
 */
export type EventParseResult<T> = {
  success: boolean;
  event?: ParsedEvent<T>;
  error?: EventError;
};

/**
 * Generic contract configuration
 */
export interface ContractConfig {
  name: string;
  address: Address;
  abi: Abi;
  defaultPollingInterval?: number;
}

/**
 * Generic event type for any contract event
 */
export type ContractEvent<T = unknown> = {
  name: string;
  signature: string;
  args: T;
};

/**
 * Contract event registry for storing contract configurations
 */
export interface ContractRegistry {
  [contractId: string]: ContractConfig;
}

/**
 * Contract event mapping for type safety
 */
export type ContractEventMap = {
  [eventName: string]: unknown;
};

// Contract Names
export type ContractName = 'DataRegistry' | 'Compensation' | 'ERC20' | 'DidAuth' | 'DidRegistry';

// Event Types for DataRegistry Contract
export type DataSharedEvent = {
  producer: Address;
  dataConsumer: Address;
  recordId: string;
  url: string;
  cid: string;
  hash: `0x${string}`;
};

export type ProducerRecordAddedEvent = {
  producer: Address;
  recordId: string;
  cid: string;
  url: string;
  hash: `0x${string}`;
};

export type ProducerRecordUpdatedEvent = {
  producer: Address;
  recordId: string;
  url: string;
  cid: string;
  hash: `0x${string}`;
};

export type ProducerConsentUpdatedEvent = {
  producer: Address;
  consent: number;
};

export type ProducerRecordStatusUpdatedEvent = {
  producer: Address;
  status: number;
};

// Event Types for Compensation Contract
export type PaymentProcessedEvent = {
  _producer: Address;
  _consumer: Address;
  amount: bigint;
  fee: bigint;
};

export type ProducerPaidEvent = {
  producer: Address;
  amount: bigint;
  timestamp: bigint;
};

export type ServiceFeeWithdrawnEvent = {
  wallet: Address;
  amount: bigint;
  timestamp: bigint;
};

// Event Types for ERC20 Contract
export type TransferEvent = {
  from: Address;
  to: Address;
  value: bigint;
};

export type ApprovalEvent = {
  owner: Address;
  spender: Address;
  value: bigint;
};

// Contract Event Types
export type ContractEventType = {
  DataRegistry: {
    DataShared: DataSharedEvent;
    ProducerRecordAdded: ProducerRecordAddedEvent;
    ProducerRecordUpdated: ProducerRecordUpdatedEvent;
    ProducerConsentUpdated: ProducerConsentUpdatedEvent;
    ProducerRecordStatusUpdated: ProducerRecordStatusUpdatedEvent;
    ConsumerAuthorized: {
      recordId: string;
      consumer: Address;
      accessLevel: number;
      expiration: bigint;
    };
  };
  Compensation: {
    PaymentProcessed: PaymentProcessedEvent;
    ProducerPaid: ProducerPaidEvent;
    ServiceFeeWithdrawn: ServiceFeeWithdrawnEvent;
  };
  ERC20: {
    Transfer: TransferEvent;
    Approval: ApprovalEvent;
  };
};

// Contract Configuration Types
export type ContractConfigs = {
  [K in ContractName]: ContractConfig;
};

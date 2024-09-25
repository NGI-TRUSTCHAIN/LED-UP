export type Metadata = {
  url: string;
  hash: string;
};

export type RecordSchema = {
  schemaRef: Metadata;
};

export type RecordMetadata = Metadata & {
  cid: string;
};

export type RegRecord = {
  signature: string;
  resourceType: string;
  metadata: Metadata;
};

export type RecordInfo = {
  producer: string;
  status: number;
  consent: number;
  nonce: number;
};

export enum ConsentStatus {
  Allowed = 0,
  Denied = 1,
  Pending = 2,
}

export enum RecordStatus {
  ACTIVE = 0,
  INACTIVE = 1,
  SUSPENDED = 2,
  ERROR = 3,
  UNKNOWN = 4,
}

export type PauseParam = {
  pause: boolean;
};

export type ProducerRegistrationParam = {
  recordId: string;
  producer: string;
  signature: string;
  resourceType: string;
  consent: ConsentStatus;
  status?: RecordStatus;
  metadata: RecordMetadata;
};

// compensation contract types
export type Payment = {
  amount: number;
  isPayed: boolean;
};

export interface CompensationState {
  token: string; // Address of the token contract
  leveaWallet: string; // Address of the levea wallet
  serviceFeePercent: number;
  minimumWithdrawAmount: number;
  unitPrice: number;
  serviceFeeBalance: number;
  producerBalances: Record<string, number>; // Mapping of producer address to balance
  payments: Record<string, Payment>; // M
}
export interface ProducerRemovedEvent {
  wallet: string;
}

export interface ProducerPaidEvent {
  producer: string;
  amount: number;
  timestamp: number;
}

export interface ServiceFeeWithdrawnEvent {
  wallet: string;
  amount: number;
  timestamp: number;
}

export interface ServiceFeeChangedEvent {
  newServiceFee: number;
}

export interface PaymentProcessedEvent {
  producer: string;
  consumer: string;
  amount: number;
  fee: number;
}

export interface UnitPriceChangedEvent {
  newUnitPrice: number;
}
export interface CompensationConstructorParams {
  provider: string; // Address of the provider
  tokenAddress: string; // Address of the token contract
  leveaWallet: string; // Address of the levea wallet
  serviceFeePercent: number;
  unitPrice: number;
}

export interface ProcessPaymentParams {
  producer: string;
  recordId: string;
  dataSize: number;
}

export type AddressParam = {
  address: string;
};

export type ValueParam = {
  value: number;
};

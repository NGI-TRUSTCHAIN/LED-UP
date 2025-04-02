import { Address } from 'viem';

export interface Payment {
  amount: bigint;
  isPayed: boolean;
}

export interface CompensationContract {
  // View Functions
  getServiceFee(): Promise<bigint>;
  getProviderBalance(): Promise<bigint>;
  getProducerBalance(): Promise<bigint>;
  getProducerBalance(producer: Address): Promise<bigint>;
  getMinimumWithdrawAmount(): Promise<bigint>;
  getUnitPrice(): Promise<bigint>;
  getPaymentTokenAddress(): Promise<Address>;
  getProducerDid(producer: Address): Promise<string>;
  getConsumerDid(consumer: Address): Promise<string>;
  producerExist(producer: Address): Promise<boolean>;
  verifyPayment(recordId: string): Promise<boolean>;
  payments(recordId: string): Promise<Payment>;
  serviceFeeBalance(): Promise<bigint>;

  // Write Functions
  processPayment(producer: Address, recordId: string, dataSize: bigint, consumerDid: string): Promise<void>;
  withdrawProducerBalance(amount: bigint): Promise<void>;
  withdrawServiceFee(amount: bigint): Promise<void>;
  removeProducer(producer: Address): Promise<void>;
  changeServiceFee(newServiceFee: bigint): Promise<void>;
  changeUnitPrice(newUnitPrice: bigint): Promise<void>;
  setMinimumWithdrawAmount(amount: bigint): Promise<void>;
  changeTokenAddress(tokenAddress: Address): Promise<void>;
  updateDidAuthAddress(didAuthAddress: Address): Promise<void>;
  pauseService(): Promise<void>;
  unpauseService(): Promise<void>;
}

// Contract Events
export type PaymentProcessedEvent = {
  producer: Address;
  consumer: Address;
  amount: bigint;
  serviceFee: bigint;
};

export type ProducerPaidEvent = {
  producer: Address;
  amount: bigint;
  timestamp: bigint;
};

export type ServiceFeeChangedEvent = {
  initiator: Address;
  oldServiceFee: bigint;
  newServiceFee: bigint;
};

export type ServiceFeeWithdrawnEvent = {
  wallet: Address;
  amount: bigint;
  timestamp: bigint;
};

export type UnitPriceChangedEvent = {
  initiator: Address;
  oldUnitPrice: bigint;
  newUnitPrice: bigint;
};

import { Address, Abi } from 'viem';
import { ContractEventListener } from './ContractEventListener';
import { ContractConfig, EventCallback, ParsedEvent } from './types';
import { CompensationABI } from '../../abi/compensation.abi';

// Event Types
export interface PaymentProcessedEvent {
  _producer: Address;
  _consumer: Address;
  amount: bigint;
  serviceFee: bigint;
}

export interface ProducerPaidEvent {
  producer: Address;
  amount: bigint;
  timestamp: bigint;
}

export interface ProducerRemovedEvent {
  producer: Address;
  timestamp: bigint;
}

export interface ServiceFeeChangedEvent {
  initiator: Address;
  oldServiceFee: bigint;
  newServiceFee: bigint;
}

export interface ServiceFeeWithdrawnEvent {
  wallet: Address;
  amount: bigint;
  timestamp: bigint;
}

export interface UnitPriceChangedEvent {
  initiator: Address;
  oldUnitPrice: bigint;
  newUnitPrice: bigint;
}

export class CompensationEvents {
  private readonly listener: ContractEventListener;
  private readonly contractIds: Map<Address, string> = new Map();

  constructor(rpcUrl: string = 'http://127.0.0.1:8545') {
    this.listener = new ContractEventListener(rpcUrl);
  }

  private getContractConfig(address: Address, pollingInterval?: number): ContractConfig {
    return {
      name: 'Compensation',
      address,
      abi: CompensationABI as unknown as Abi,
      defaultPollingInterval: pollingInterval,
    };
  }

  private ensureContract(address: Address, pollingInterval?: number): string {
    let contractId = this.contractIds.get(address);
    if (!contractId) {
      const config = this.getContractConfig(address, pollingInterval);
      contractId = this.listener.registerContract(config);
      this.contractIds.set(address, contractId);
    }
    return contractId;
  }

  // Payment Events
  public async listenToPaymentProcessed(
    address: Address,
    callback: EventCallback<ParsedEvent<PaymentProcessedEvent>>,
    pollingInterval?: number
  ): Promise<void> {
    const contractId = this.ensureContract(address, pollingInterval);
    await this.listener.listenToEvent(contractId, 'PaymentProcessed', callback);
  }

  public async listenToProducerPaid(
    address: Address,
    callback: EventCallback<ParsedEvent<ProducerPaidEvent>>,
    pollingInterval?: number
  ): Promise<void> {
    const contractId = this.ensureContract(address, pollingInterval);
    await this.listener.listenToEvent(contractId, 'ProducerPaid', callback);
  }

  public async listenToProducerRemoved(
    address: Address,
    callback: EventCallback<ParsedEvent<ProducerRemovedEvent>>,
    pollingInterval?: number
  ): Promise<void> {
    const contractId = this.ensureContract(address, pollingInterval);
    await this.listener.listenToEvent(contractId, 'ProducerRemoved', callback);
  }

  public async listenToServiceFeeChanged(
    address: Address,
    callback: EventCallback<ParsedEvent<ServiceFeeChangedEvent>>,
    pollingInterval?: number
  ): Promise<void> {
    const contractId = this.ensureContract(address, pollingInterval);
    await this.listener.listenToEvent(contractId, 'ServiceFeeChanged', callback);
  }

  public async listenToServiceFeeWithdrawn(
    address: Address,
    callback: EventCallback<ParsedEvent<ServiceFeeWithdrawnEvent>>,
    pollingInterval?: number
  ): Promise<void> {
    const contractId = this.ensureContract(address, pollingInterval);
    await this.listener.listenToEvent(contractId, 'ServiceFeeWithdrawn', callback);
  }

  public async listenToUnitPriceChanged(
    address: Address,
    callback: EventCallback<ParsedEvent<UnitPriceChangedEvent>>,
    pollingInterval?: number
  ): Promise<void> {
    const contractId = this.ensureContract(address, pollingInterval);
    await this.listener.listenToEvent(contractId, 'UnitPriceChanged', callback);
  }

  // Query Methods
  public async queryPaymentProcessedEvents(
    address: Address,
    fromBlock: bigint,
    toBlock: bigint | 'latest'
  ): Promise<ParsedEvent<PaymentProcessedEvent>[]> {
    const contractId = this.ensureContract(address);
    return this.listener.queryEvents(contractId, 'PaymentProcessed', fromBlock, toBlock);
  }

  public async queryProducerPaidEvents(
    address: Address,
    fromBlock: bigint,
    toBlock: bigint | 'latest'
  ): Promise<ParsedEvent<ProducerPaidEvent>[]> {
    const contractId = this.ensureContract(address);
    return this.listener.queryEvents(contractId, 'ProducerPaid', fromBlock, toBlock);
  }

  public async queryProducerRemovedEvents(
    address: Address,
    fromBlock: bigint,
    toBlock: bigint | 'latest'
  ): Promise<ParsedEvent<ProducerRemovedEvent>[]> {
    const contractId = this.ensureContract(address);
    return this.listener.queryEvents(contractId, 'ProducerRemoved', fromBlock, toBlock);
  }

  public async queryServiceFeeChangedEvents(
    address: Address,
    fromBlock: bigint,
    toBlock: bigint | 'latest'
  ): Promise<ParsedEvent<ServiceFeeChangedEvent>[]> {
    const contractId = this.ensureContract(address);
    return this.listener.queryEvents(contractId, 'ServiceFeeChanged', fromBlock, toBlock);
  }

  public async queryServiceFeeWithdrawnEvents(
    address: Address,
    fromBlock: bigint,
    toBlock: bigint | 'latest'
  ): Promise<ParsedEvent<ServiceFeeWithdrawnEvent>[]> {
    const contractId = this.ensureContract(address);
    return this.listener.queryEvents(contractId, 'ServiceFeeWithdrawn', fromBlock, toBlock);
  }

  public async queryUnitPriceChangedEvents(
    address: Address,
    fromBlock: bigint,
    toBlock: bigint | 'latest'
  ): Promise<ParsedEvent<UnitPriceChangedEvent>[]> {
    const contractId = this.ensureContract(address);
    return this.listener.queryEvents(contractId, 'UnitPriceChanged', fromBlock, toBlock);
  }

  // Cleanup Methods
  public unsubscribe(address: Address): void {
    const contractId = this.contractIds.get(address);
    if (contractId) {
      this.listener.unsubscribe(contractId);
      this.contractIds.delete(address);
    }
  }

  public unsubscribeAll(): void {
    this.listener.unsubscribeAll();
    this.contractIds.clear();
  }
}

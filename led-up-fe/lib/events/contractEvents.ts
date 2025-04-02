import { Address } from 'viem';
import { ContractEventListener } from './ContractEventListener';
import { ContractEventType, ParsedEvent, EventCallback, ContractConfig } from './types';
import { DataRegistryEvents, CompensationEvents, ERC20Events, getContractConfig } from './contracts';

export class ContractEventsManager {
  private readonly listener: ContractEventListener;
  private readonly contractIds: Map<string, string> = new Map();

  constructor(rpcUrl: string) {
    this.listener = new ContractEventListener(rpcUrl);
  }

  // DataRegistry Events
  public async listenToDataShared(
    contractAddress: Address,
    callback: EventCallback<ParsedEvent<ContractEventType['DataRegistry']['DataShared']>>,
    pollingInterval?: number
  ): Promise<void> {
    const config = getContractConfig('DataRegistry', contractAddress, pollingInterval);
    const contractId = this.ensureContract(config);
    await this.listener.listenToEvent(contractId, DataRegistryEvents.DataShared, callback);
  }

  public async listenToProducerRecordAdded(
    contractAddress: Address,
    callback: EventCallback<ParsedEvent<ContractEventType['DataRegistry']['ProducerRecordAdded']>>,
    pollingInterval?: number
  ): Promise<void> {
    const config = getContractConfig('DataRegistry', contractAddress, pollingInterval);
    const contractId = this.ensureContract(config);
    await this.listener.listenToEvent(contractId, DataRegistryEvents.ProducerRecordAdded, callback);
  }

  public async queryDataSharedEvents(
    contractAddress: Address,
    fromBlock: bigint,
    toBlock: bigint | 'latest'
  ): Promise<ParsedEvent<ContractEventType['DataRegistry']['DataShared']>[]> {
    const config = getContractConfig('DataRegistry', contractAddress);
    const contractId = this.ensureContract(config);
    return this.listener.queryEvents(contractId, DataRegistryEvents.DataShared, fromBlock, toBlock);
  }

  // Compensation Events
  public async listenToPaymentProcessed(
    contractAddress: Address,
    callback: EventCallback<ParsedEvent<ContractEventType['Compensation']['PaymentProcessed']>>,
    pollingInterval?: number
  ): Promise<void> {
    const config = getContractConfig('Compensation', contractAddress, pollingInterval);
    const contractId = this.ensureContract(config);
    await this.listener.listenToEvent(contractId, CompensationEvents.PaymentProcessed, callback);
  }

  public async listenToProducerPaid(
    contractAddress: Address,
    callback: EventCallback<ParsedEvent<ContractEventType['Compensation']['ProducerPaid']>>,
    pollingInterval?: number
  ): Promise<void> {
    const config = getContractConfig('Compensation', contractAddress, pollingInterval);
    const contractId = this.ensureContract(config);
    await this.listener.listenToEvent(contractId, CompensationEvents.ProducerPaid, callback);
  }

  public async queryPaymentProcessedEvents(
    contractAddress: Address,
    fromBlock: bigint,
    toBlock: bigint | 'latest'
  ): Promise<ParsedEvent<ContractEventType['Compensation']['PaymentProcessed']>[]> {
    const config = getContractConfig('Compensation', contractAddress);
    const contractId = this.ensureContract(config);
    return this.listener.queryEvents(contractId, CompensationEvents.PaymentProcessed, fromBlock, toBlock);
  }

  // ERC20 Events
  public async listenToTransfer(
    contractAddress: Address,
    callback: EventCallback<ParsedEvent<ContractEventType['ERC20']['Transfer']>>,
    pollingInterval?: number
  ): Promise<void> {
    const config = getContractConfig('ERC20', contractAddress, pollingInterval);
    const contractId = this.ensureContract(config);
    await this.listener.listenToEvent(contractId, ERC20Events.Transfer, callback);
  }

  public async listenToApproval(
    contractAddress: Address,
    callback: EventCallback<ParsedEvent<ContractEventType['ERC20']['Approval']>>,
    pollingInterval?: number
  ): Promise<void> {
    const config = getContractConfig('ERC20', contractAddress, pollingInterval);
    const contractId = this.ensureContract(config);
    await this.listener.listenToEvent(contractId, ERC20Events.Approval, callback);
  }

  public async queryTransferEvents(
    contractAddress: Address,
    fromBlock: bigint,
    toBlock: bigint | 'latest'
  ): Promise<ParsedEvent<ContractEventType['ERC20']['Transfer']>[]> {
    const config = getContractConfig('ERC20', contractAddress);
    const contractId = this.ensureContract(config);
    return this.listener.queryEvents(contractId, ERC20Events.Transfer, fromBlock, toBlock);
  }

  // Helper method to ensure contract is registered
  private ensureContract(config: ContractConfig): string {
    const key = `${config.name}_${config.address}`;
    let contractId = this.contractIds.get(key);

    if (!contractId) {
      contractId = this.listener.registerContract(config);
      this.contractIds.set(key, contractId);
    }

    return contractId;
  }

  // Cleanup methods
  public unsubscribe(contractAddress: Address): void {
    for (const [key, contractId] of this.contractIds.entries()) {
      if (key.includes(contractAddress)) {
        this.listener.unsubscribe(contractId);
        this.contractIds.delete(key);
      }
    }
  }

  public unsubscribeAll(): void {
    this.listener.unsubscribeAll();
    this.contractIds.clear();
  }
}

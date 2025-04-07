import { Address, Abi } from 'viem';
import { ContractEventListener } from './ContractEventListener';
import { ContractConfig, EventCallback, ParsedEvent } from './types';
import { ERC20ABI } from '../../abi/erc20.abi';

// Event Types
export interface ApprovalEvent {
  owner: Address;
  spender: Address;
  value: bigint;
}

export interface TransferEvent {
  from: Address;
  to: Address;
  value: bigint;
}

export class ERC20Events {
  private readonly listener: ContractEventListener;
  private readonly contractIds: Map<Address, string> = new Map();

  constructor(rpcUrl: string = 'http://127.0.0.1:8545') {
    this.listener = new ContractEventListener(rpcUrl);
  }

  private getContractConfig(address: Address, pollingInterval?: number): ContractConfig {
    return {
      name: 'ERC20',
      address,
      abi: ERC20ABI as unknown as Abi,
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

  // Event Listeners
  public async listenToApproval(
    address: Address,
    callback: EventCallback<ParsedEvent<ApprovalEvent>>,
    pollingInterval?: number
  ): Promise<void> {
    const contractId = this.ensureContract(address, pollingInterval);
    await this.listener.listenToEvent(contractId, 'Approval', callback);
  }

  public async listenToTransfer(
    address: Address,
    callback: EventCallback<ParsedEvent<TransferEvent>>,
    pollingInterval?: number
  ): Promise<void> {
    const contractId = this.ensureContract(address, pollingInterval);
    await this.listener.listenToEvent(contractId, 'Transfer', callback);
  }

  // Query Methods
  public async queryApprovalEvents(
    address: Address,
    fromBlock: bigint,
    toBlock: bigint | 'latest'
  ): Promise<ParsedEvent<ApprovalEvent>[]> {
    const contractId = this.ensureContract(address);
    return this.listener.queryEvents(contractId, 'Approval', fromBlock, toBlock);
  }

  public async queryTransferEvents(
    address: Address,
    fromBlock: bigint,
    toBlock: bigint | 'latest'
  ): Promise<ParsedEvent<TransferEvent>[]> {
    const contractId = this.ensureContract(address);
    return this.listener.queryEvents(contractId, 'Transfer', fromBlock, toBlock);
  }

  // Filter Methods
  public async queryTransfersByAddress(
    address: Address,
    targetAddress: Address,
    fromBlock: bigint,
    toBlock: bigint | 'latest'
  ): Promise<ParsedEvent<TransferEvent>[]> {
    const events = await this.queryTransferEvents(address, fromBlock, toBlock);
    return events.filter((event) => event.args.from === targetAddress || event.args.to === targetAddress);
  }

  public async queryApprovalsByOwner(
    address: Address,
    owner: Address,
    fromBlock: bigint,
    toBlock: bigint | 'latest'
  ): Promise<ParsedEvent<ApprovalEvent>[]> {
    const events = await this.queryApprovalEvents(address, fromBlock, toBlock);
    return events.filter((event) => event.args.owner === owner);
  }

  public async queryApprovalsBySpender(
    address: Address,
    spender: Address,
    fromBlock: bigint,
    toBlock: bigint | 'latest'
  ): Promise<ParsedEvent<ApprovalEvent>[]> {
    const events = await this.queryApprovalEvents(address, fromBlock, toBlock);
    return events.filter((event) => event.args.spender === spender);
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

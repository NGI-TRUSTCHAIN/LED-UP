import { Address, Abi } from 'viem';
import { ContractEventListener } from './ContractEventListener';
import { ContractConfig, EventCallback, ParsedEvent } from './types';
import { DidRegistryABI } from '../../abi/did-registry.abi';

// Event Types
export interface DIDDeactivatedEvent {
  did: string;
  timestamp: bigint;
}

export interface DIDRegisteredEvent {
  did: string;
  controller: Address;
}

export interface DIDUpdatedEvent {
  did: string;
  timestamp: bigint;
}

export class DidRegistryEvents {
  private readonly listener: ContractEventListener;
  private readonly contractIds: Map<Address, string> = new Map();

  constructor(rpcUrl: string = 'http://127.0.0.1:8545') {
    this.listener = new ContractEventListener(rpcUrl);
  }

  private getContractConfig(address: Address, pollingInterval?: number): ContractConfig {
    return {
      name: 'DidRegistry',
      address,
      abi: DidRegistryABI as unknown as Abi,
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
  public async listenToDidDeactivated(
    address: Address,
    callback: EventCallback<ParsedEvent<DIDDeactivatedEvent>>,
    pollingInterval?: number
  ): Promise<void> {
    const contractId = this.ensureContract(address, pollingInterval);
    await this.listener.listenToEvent(contractId, 'DIDDeactivated', callback);
  }

  public async listenToDidRegistered(
    address: Address,
    callback: EventCallback<ParsedEvent<DIDRegisteredEvent>>,
    pollingInterval?: number
  ): Promise<void> {
    const contractId = this.ensureContract(address, pollingInterval);
    await this.listener.listenToEvent(contractId, 'DIDRegistered', callback);
  }

  public async listenToDidUpdated(
    address: Address,
    callback: EventCallback<ParsedEvent<DIDUpdatedEvent>>,
    pollingInterval?: number
  ): Promise<void> {
    const contractId = this.ensureContract(address, pollingInterval);
    await this.listener.listenToEvent(contractId, 'DIDUpdated', callback);
  }

  // Query Methods
  public async queryDidDeactivatedEvents(
    address: Address,
    fromBlock: bigint,
    toBlock: bigint | 'latest'
  ): Promise<ParsedEvent<DIDDeactivatedEvent>[]> {
    const contractId = this.ensureContract(address);
    return this.listener.queryEvents(contractId, 'DIDDeactivated', fromBlock, toBlock);
  }

  public async queryDidRegisteredEvents(
    address: Address,
    fromBlock: bigint,
    toBlock: bigint | 'latest'
  ): Promise<ParsedEvent<DIDRegisteredEvent>[]> {
    const contractId = this.ensureContract(address);
    return this.listener.queryEvents(contractId, 'DIDRegistered', fromBlock, toBlock);
  }

  public async queryDidUpdatedEvents(
    address: Address,
    fromBlock: bigint,
    toBlock: bigint | 'latest'
  ): Promise<ParsedEvent<DIDUpdatedEvent>[]> {
    const contractId = this.ensureContract(address);
    return this.listener.queryEvents(contractId, 'DIDUpdated', fromBlock, toBlock);
  }

  // Filter Methods
  public async queryEventsByDid(
    address: Address,
    did: string,
    fromBlock: bigint,
    toBlock: bigint | 'latest'
  ): Promise<{
    deactivated: ParsedEvent<DIDDeactivatedEvent>[];
    registered: ParsedEvent<DIDRegisteredEvent>[];
    updated: ParsedEvent<DIDUpdatedEvent>[];
  }> {
    const [deactivatedEvents, registeredEvents, updatedEvents] = await Promise.all([
      this.queryDidDeactivatedEvents(address, fromBlock, toBlock),
      this.queryDidRegisteredEvents(address, fromBlock, toBlock),
      this.queryDidUpdatedEvents(address, fromBlock, toBlock),
    ]);

    return {
      deactivated: deactivatedEvents.filter((event) => event.args.did === did),
      registered: registeredEvents.filter((event) => event.args.did === did),
      updated: updatedEvents.filter((event) => event.args.did === did),
    };
  }

  public async queryDidHistoryByController(
    address: Address,
    controller: Address,
    fromBlock: bigint,
    toBlock: bigint | 'latest'
  ): Promise<ParsedEvent<DIDRegisteredEvent>[]> {
    const events = await this.queryDidRegisteredEvents(address, fromBlock, toBlock);
    return events.filter((event) => event.args.controller === controller);
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

export default DidRegistryEvents;

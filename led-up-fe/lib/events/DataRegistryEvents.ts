import { Address, Abi } from 'viem';
import { ContractEventListener } from './ContractEventListener';
import { ContractConfig, EventCallback, ParsedEvent } from './types';
import { DataRegistryABI } from '../../abi/data-registry.abi';

// Event Types
export interface AccessGrantedEvent {
  recordId: string;
  consumer: Address;
  consumerDid: string;
  expiration: bigint;
  accessLevel: number;
}

export interface AccessRevokedEvent {
  recordId: string;
  consumer: Address;
  consumerDid: string;
  revoker: Address;
}

export interface AccessTriggeredEvent {
  recordId: string;
  consumer: Address;
  consumerDid: string;
  accessLevel: number;
}

export interface CompensationUpdatedEvent {
  oldAddress: Address;
  newAddress: Address;
}

export interface ConsentStatusChangedEvent {
  provider: Address;
  status: number;
  updater: Address;
}

export interface ConsumerAuthorizedEvent {
  consumer: Address;
  recordId: string;
  accessLevel: number;
  expiration: bigint;
}

export interface DidAuthUpdatedEvent {
  oldAddress: Address;
  newAddress: Address;
}

export interface ProviderAddedEvent {
  provider: Address;
}

export interface ProviderAuthorizedEvent {
  provider: Address;
  recordId: string;
  accessLevel: number;
  timestamp: bigint;
}

export interface ProviderRemovedEvent {
  provider: Address;
}

export interface RecordRegisteredEvent {
  recordId: string;
  did: string;
  cid: string;
  contentHash: `0x${string}`;
  provider: Address;
}

export interface RecordStatusChangedEvent {
  recordId: string;
  status: number;
  updater: Address;
}

export interface RecordUpdatedEvent {
  recordId: string;
  cid: string;
  contentHash: `0x${string}`;
  provider: Address;
}

export interface RecordVerifiedEvent {
  recordId: string;
  verifier: Address;
}

export class DataRegistryEvents {
  private readonly listener: ContractEventListener;
  private readonly contractIds: Map<Address, string> = new Map();

  constructor(rpcUrl: string = 'http://127.0.0.1:8545') {
    this.listener = new ContractEventListener(rpcUrl);
  }

  private getContractConfig(address: Address, pollingInterval?: number): ContractConfig {
    return {
      name: 'DataRegistry',
      address,
      abi: DataRegistryABI as unknown as Abi,
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

  // Access Events
  public async listenToAccessGranted(
    address: Address,
    callback: EventCallback<ParsedEvent<AccessGrantedEvent>>,
    pollingInterval?: number
  ): Promise<void> {
    const contractId = this.ensureContract(address, pollingInterval);
    await this.listener.listenToEvent(contractId, 'AccessGranted', callback);
  }

  public async listenToAccessRevoked(
    address: Address,
    callback: EventCallback<ParsedEvent<AccessRevokedEvent>>,
    pollingInterval?: number
  ): Promise<void> {
    const contractId = this.ensureContract(address, pollingInterval);
    await this.listener.listenToEvent(contractId, 'AccessRevoked', callback);
  }

  public async listenToAccessTriggered(
    address: Address,
    callback: EventCallback<ParsedEvent<AccessTriggeredEvent>>,
    pollingInterval?: number
  ): Promise<void> {
    const contractId = this.ensureContract(address, pollingInterval);
    await this.listener.listenToEvent(contractId, 'AccessTriggered', callback);
  }

  // Configuration Events
  public async listenToCompensationUpdated(
    address: Address,
    callback: EventCallback<ParsedEvent<CompensationUpdatedEvent>>,
    pollingInterval?: number
  ): Promise<void> {
    const contractId = this.ensureContract(address, pollingInterval);
    await this.listener.listenToEvent(contractId, 'CompensationUpdated', callback);
  }

  public async listenToDidAuthUpdated(
    address: Address,
    callback: EventCallback<ParsedEvent<DidAuthUpdatedEvent>>,
    pollingInterval?: number
  ): Promise<void> {
    const contractId = this.ensureContract(address, pollingInterval);
    await this.listener.listenToEvent(contractId, 'DidAuthUpdated', callback);
  }

  // Provider Events
  public async listenToProviderAdded(
    address: Address,
    callback: EventCallback<ParsedEvent<ProviderAddedEvent>>,
    pollingInterval?: number
  ): Promise<void> {
    const contractId = this.ensureContract(address, pollingInterval);
    await this.listener.listenToEvent(contractId, 'ProviderAdded', callback);
  }

  public async listenToProviderAuthorized(
    address: Address,
    callback: EventCallback<ParsedEvent<ProviderAuthorizedEvent>>,
    pollingInterval?: number
  ): Promise<void> {
    const contractId = this.ensureContract(address, pollingInterval);
    await this.listener.listenToEvent(contractId, 'ProviderAuthorized', callback);
  }

  public async listenToProviderRemoved(
    address: Address,
    callback: EventCallback<ParsedEvent<ProviderRemovedEvent>>,
    pollingInterval?: number
  ): Promise<void> {
    const contractId = this.ensureContract(address, pollingInterval);
    await this.listener.listenToEvent(contractId, 'ProviderRemoved', callback);
  }

  public async listenToConsentStatusChanged(
    address: Address,
    callback: EventCallback<ParsedEvent<ConsentStatusChangedEvent>>,
    pollingInterval?: number
  ): Promise<void> {
    const contractId = this.ensureContract(address, pollingInterval);
    await this.listener.listenToEvent(contractId, 'ConsentStatusChanged', callback);
  }

  public async listenToConsumerAuthorized(
    address: Address,
    callback: EventCallback<ParsedEvent<ConsumerAuthorizedEvent>>,
    pollingInterval?: number
  ): Promise<void> {
    const contractId = this.ensureContract(address, pollingInterval);
    await this.listener.listenToEvent(contractId, 'ConsumerAuthorized', callback);
  }

  // Record Events
  public async listenToRecordRegistered(
    address: Address,
    callback: EventCallback<ParsedEvent<RecordRegisteredEvent>>,
    pollingInterval?: number
  ): Promise<void> {
    const contractId = this.ensureContract(address, pollingInterval);
    await this.listener.listenToEvent(contractId, 'RecordRegistered', callback);
  }

  public async listenToRecordStatusChanged(
    address: Address,
    callback: EventCallback<ParsedEvent<RecordStatusChangedEvent>>,
    pollingInterval?: number
  ): Promise<void> {
    const contractId = this.ensureContract(address, pollingInterval);
    await this.listener.listenToEvent(contractId, 'RecordStatusChanged', callback);
  }

  public async listenToRecordUpdated(
    address: Address,
    callback: EventCallback<ParsedEvent<RecordUpdatedEvent>>,
    pollingInterval?: number
  ): Promise<void> {
    const contractId = this.ensureContract(address, pollingInterval);
    await this.listener.listenToEvent(contractId, 'RecordUpdated', callback);
  }

  public async listenToRecordVerified(
    address: Address,
    callback: EventCallback<ParsedEvent<RecordVerifiedEvent>>,
    pollingInterval?: number
  ): Promise<void> {
    const contractId = this.ensureContract(address, pollingInterval);
    await this.listener.listenToEvent(contractId, 'RecordVerified', callback);
  }

  // Query Methods - Access Events
  public async queryAccessGrantedEvents(
    address: Address,
    fromBlock: bigint,
    toBlock: bigint | 'latest'
  ): Promise<ParsedEvent<AccessGrantedEvent>[]> {
    try {
      const contractId = this.ensureContract(address);
      console.log(`Querying AccessGranted events from ${fromBlock} to ${toBlock} for contract ${address}`);
      const events = await this.listener.queryEvents<AccessGrantedEvent>(
        contractId,
        'AccessGranted',
        fromBlock,
        toBlock
      );
      console.log(`Found ${events.length} AccessGranted events`);
      return events;
    } catch (error) {
      console.error('Error querying AccessGranted events:', error);
      return [];
    }
  }

  public async queryAccessRevokedEvents(
    address: Address,
    fromBlock: bigint,
    toBlock: bigint | 'latest'
  ): Promise<ParsedEvent<AccessRevokedEvent>[]> {
    try {
      const contractId = this.ensureContract(address);
      console.log(`Querying AccessRevoked events from ${fromBlock} to ${toBlock} for contract ${address}`);
      const events = await this.listener.queryEvents<AccessRevokedEvent>(
        contractId,
        'AccessRevoked',
        fromBlock,
        toBlock
      );
      console.log(`Found ${events.length} AccessRevoked events`);
      return events;
    } catch (error) {
      console.error('Error querying AccessRevoked events:', error);
      return [];
    }
  }

  public async queryAccessTriggeredEvents(
    address: Address,
    fromBlock: bigint,
    toBlock: bigint | 'latest'
  ): Promise<ParsedEvent<AccessTriggeredEvent>[]> {
    const contractId = this.ensureContract(address);
    return this.listener.queryEvents(contractId, 'AccessTriggered', fromBlock, toBlock);
  }

  public async queryConsumerAuthorizedEvents(
    address: Address,
    fromBlock: bigint,
    toBlock: bigint | 'latest'
  ): Promise<ParsedEvent<ConsumerAuthorizedEvent>[]> {
    try {
      const contractId = this.ensureContract(address);
      console.log(`Querying ConsumerAuthorized events from ${fromBlock} to ${toBlock} for contract ${address}`);
      const events = await this.listener.queryEvents<ConsumerAuthorizedEvent>(
        contractId,
        'ConsumerAuthorized',
        fromBlock,
        toBlock
      );
      console.log(`Found ${events.length} ConsumerAuthorized events`);
      return events;
    } catch (error) {
      console.error('Error querying ConsumerAuthorized events:', error);
      return [];
    }
  }

  // Query Methods - Provider Events
  public async queryProviderAddedEvents(
    address: Address,
    fromBlock: bigint,
    toBlock: bigint | 'latest'
  ): Promise<ParsedEvent<ProviderAddedEvent>[]> {
    const contractId = this.ensureContract(address);
    return this.listener.queryEvents(contractId, 'ProviderAdded', fromBlock, toBlock);
  }

  public async queryProviderAuthorizedEvents(
    address: Address,
    fromBlock: bigint,
    toBlock: bigint | 'latest'
  ): Promise<ParsedEvent<ProviderAuthorizedEvent>[]> {
    const contractId = this.ensureContract(address);
    return this.listener.queryEvents(contractId, 'ProviderAuthorized', fromBlock, toBlock);
  }

  public async queryProviderRemovedEvents(
    address: Address,
    fromBlock: bigint,
    toBlock: bigint | 'latest'
  ): Promise<ParsedEvent<ProviderRemovedEvent>[]> {
    const contractId = this.ensureContract(address);
    return this.listener.queryEvents(contractId, 'ProviderRemoved', fromBlock, toBlock);
  }

  // Query Methods - Record Events
  public async queryRecordRegisteredEvents(
    address: Address,
    fromBlock: bigint,
    toBlock: bigint | 'latest'
  ): Promise<ParsedEvent<RecordRegisteredEvent>[]> {
    const contractId = this.ensureContract(address);
    return this.listener.queryEvents(contractId, 'RecordRegistered', fromBlock, toBlock);
  }

  public async queryRecordStatusChangedEvents(
    address: Address,
    fromBlock: bigint,
    toBlock: bigint | 'latest'
  ): Promise<ParsedEvent<RecordStatusChangedEvent>[]> {
    const contractId = this.ensureContract(address);
    return this.listener.queryEvents(contractId, 'RecordStatusChanged', fromBlock, toBlock);
  }

  public async queryRecordUpdatedEvents(
    address: Address,
    fromBlock: bigint,
    toBlock: bigint | 'latest'
  ): Promise<ParsedEvent<RecordUpdatedEvent>[]> {
    const contractId = this.ensureContract(address);
    return this.listener.queryEvents(contractId, 'RecordUpdated', fromBlock, toBlock);
  }

  public async queryRecordVerifiedEvents(
    address: Address,
    fromBlock: bigint,
    toBlock: bigint | 'latest'
  ): Promise<ParsedEvent<RecordVerifiedEvent>[]> {
    const contractId = this.ensureContract(address);
    return this.listener.queryEvents(contractId, 'RecordVerified', fromBlock, toBlock);
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

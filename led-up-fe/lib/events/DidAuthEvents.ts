import { Address, Abi } from 'viem';
import { ContractEventListener } from './ContractEventListener';
import { ContractConfig, EventCallback, ParsedEvent } from './types';
import { DidAuthABI } from '../../abi/did-auth.abi';

// Event Types
export interface AuthenticationFailedEvent {
  did: string;
  role: `0x${string}`; // bytes32
  timestamp: bigint;
}

export interface AuthenticationSuccessfulEvent {
  did: string;
  role: `0x${string}`; // bytes32
  timestamp: bigint;
}

export interface CredentialVerificationFailedEvent {
  did: string;
  credentialType: string;
  credentialId: `0x${string}`; // bytes32
  timestamp: bigint;
}

export interface CredentialVerifiedEvent {
  did: string;
  credentialType: string;
  credentialId: `0x${string}`; // bytes32
  timestamp: bigint;
}

export interface RoleGrantedEvent {
  did: string;
  role: `0x${string}`; // bytes32
  timestamp: bigint;
}

export interface RoleRevokedEvent {
  did: string;
  role: `0x${string}`; // bytes32
  timestamp: bigint;
}

export class DidAuthEvents {
  private readonly listener: ContractEventListener;
  private readonly contractIds: Map<Address, string> = new Map();

  constructor(rpcUrl: string = 'http://127.0.0.1:8545') {
    this.listener = new ContractEventListener(rpcUrl);
  }

  private getContractConfig(address: Address, pollingInterval?: number): ContractConfig {
    return {
      name: 'DidAuth',
      address,
      abi: DidAuthABI as unknown as Abi,
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
  public async listenToAuthenticationFailed(
    address: Address,
    callback: EventCallback<ParsedEvent<AuthenticationFailedEvent>>,
    pollingInterval?: number
  ): Promise<void> {
    const contractId = this.ensureContract(address, pollingInterval);
    await this.listener.listenToEvent(contractId, 'AuthenticationFailed', callback);
  }

  public async listenToAuthenticationSuccessful(
    address: Address,
    callback: EventCallback<ParsedEvent<AuthenticationSuccessfulEvent>>,
    pollingInterval?: number
  ): Promise<void> {
    const contractId = this.ensureContract(address, pollingInterval);
    await this.listener.listenToEvent(contractId, 'AuthenticationSuccessful', callback);
  }

  public async listenToCredentialVerificationFailed(
    address: Address,
    callback: EventCallback<ParsedEvent<CredentialVerificationFailedEvent>>,
    pollingInterval?: number
  ): Promise<void> {
    const contractId = this.ensureContract(address, pollingInterval);
    await this.listener.listenToEvent(contractId, 'CredentialVerificationFailed', callback);
  }

  public async listenToCredentialVerified(
    address: Address,
    callback: EventCallback<ParsedEvent<CredentialVerifiedEvent>>,
    pollingInterval?: number
  ): Promise<void> {
    const contractId = this.ensureContract(address, pollingInterval);
    await this.listener.listenToEvent(contractId, 'CredentialVerified', callback);
  }

  public async listenToRoleGranted(
    address: Address,
    callback: EventCallback<ParsedEvent<RoleGrantedEvent>>,
    pollingInterval?: number
  ): Promise<void> {
    const contractId = this.ensureContract(address, pollingInterval);
    await this.listener.listenToEvent(contractId, 'RoleGranted', callback);
  }

  public async listenToRoleRevoked(
    address: Address,
    callback: EventCallback<ParsedEvent<RoleRevokedEvent>>,
    pollingInterval?: number
  ): Promise<void> {
    const contractId = this.ensureContract(address, pollingInterval);
    await this.listener.listenToEvent(contractId, 'RoleRevoked', callback);
  }

  // Query Methods
  public async queryAuthenticationFailedEvents(
    address: Address,
    fromBlock: bigint,
    toBlock: bigint | 'latest'
  ): Promise<ParsedEvent<AuthenticationFailedEvent>[]> {
    const contractId = this.ensureContract(address);
    return this.listener.queryEvents(contractId, 'AuthenticationFailed', fromBlock, toBlock);
  }

  public async queryAuthenticationSuccessfulEvents(
    address: Address,
    fromBlock: bigint,
    toBlock: bigint | 'latest'
  ): Promise<ParsedEvent<AuthenticationSuccessfulEvent>[]> {
    const contractId = this.ensureContract(address);
    return this.listener.queryEvents(contractId, 'AuthenticationSuccessful', fromBlock, toBlock);
  }

  public async queryCredentialVerificationFailedEvents(
    address: Address,
    fromBlock: bigint,
    toBlock: bigint | 'latest'
  ): Promise<ParsedEvent<CredentialVerificationFailedEvent>[]> {
    const contractId = this.ensureContract(address);
    return this.listener.queryEvents(contractId, 'CredentialVerificationFailed', fromBlock, toBlock);
  }

  public async queryCredentialVerifiedEvents(
    address: Address,
    fromBlock: bigint,
    toBlock: bigint | 'latest'
  ): Promise<ParsedEvent<CredentialVerifiedEvent>[]> {
    const contractId = this.ensureContract(address);
    return this.listener.queryEvents(contractId, 'CredentialVerified', fromBlock, toBlock);
  }

  public async queryRoleGrantedEvents(
    address: Address,
    fromBlock: bigint,
    toBlock: bigint | 'latest'
  ): Promise<ParsedEvent<RoleGrantedEvent>[]> {
    const contractId = this.ensureContract(address);
    return this.listener.queryEvents(contractId, 'RoleGranted', fromBlock, toBlock);
  }

  public async queryRoleRevokedEvents(
    address: Address,
    fromBlock: bigint,
    toBlock: bigint | 'latest'
  ): Promise<ParsedEvent<RoleRevokedEvent>[]> {
    const contractId = this.ensureContract(address);
    return this.listener.queryEvents(contractId, 'RoleRevoked', fromBlock, toBlock);
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

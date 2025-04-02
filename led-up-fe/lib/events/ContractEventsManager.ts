import { Address, Abi } from 'viem';
import { ContractEventListener } from './ContractEventListener';
import { ContractConfig, ContractEvent, EventCallback, ParsedEvent, EventError, EventErrorCode } from './types';

export class ContractEventsManager {
  private readonly listener: ContractEventListener;
  private readonly contractIds: Map<string, string> = new Map();

  constructor(rpcUrl: string) {
    this.listener = new ContractEventListener(rpcUrl);
  }

  /**
   * Register a new contract for event listening
   * @throws {EventError} If contract registration fails
   */
  public registerContract(config: ContractConfig): void {
    try {
      const contractId = this.listener.registerContract(config);
      this.contractIds.set(config.name, contractId);
    } catch (error) {
      throw new EventError(
        `Failed to register contract ${config.name}`,
        EventErrorCode.CONTRACT_NOT_REGISTERED,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Listen to events from a contract
   * @throws {EventError} If event listening fails
   */
  public async listenToEvent<T = unknown>(
    contractName: string,
    eventName: string,
    callback: EventCallback<ParsedEvent<T>>,
    pollingInterval?: number
  ): Promise<void> {
    const contractId = this.getContractId(contractName);
    try {
      await this.listener.listenToEvent(contractId, eventName, callback, pollingInterval);
    } catch (error) {
      throw new EventError(
        `Failed to listen to event ${eventName} for contract ${contractName}`,
        EventErrorCode.EVENT_LISTEN_FAILED,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Query historical events from a contract
   * @throws {EventError} If event query fails
   */
  public async queryEvents<T = unknown>(
    contractName: string,
    eventName: string,
    fromBlock: bigint,
    toBlock: bigint | 'latest'
  ): Promise<ParsedEvent<T>[]> {
    const contractId = this.getContractId(contractName);
    try {
      return await this.listener.queryEvents(contractId, eventName, fromBlock, toBlock);
    } catch (error) {
      throw new EventError(
        `Failed to query events ${eventName} for contract ${contractName}`,
        EventErrorCode.EVENT_QUERY_FAILED,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Get all registered events for a contract
   */
  public getContractEvents(contractName: string): ContractEvent[] {
    const contractId = this.getContractId(contractName);
    return this.listener.getContractEvents(contractId);
  }

  /**
   * Unsubscribe from events for a specific contract
   */
  public unsubscribe(contractName: string): void {
    const contractId = this.contractIds.get(contractName);
    if (contractId) {
      this.listener.unsubscribe(contractId);
      this.contractIds.delete(contractName);
    }
  }

  /**
   * Unsubscribe from all events
   */
  public unsubscribeAll(): void {
    this.listener.unsubscribeAll();
    this.contractIds.clear();
  }

  /**
   * Get contract ID for a contract name
   * @throws {EventError} If contract is not registered
   */
  private getContractId(contractName: string): string {
    const contractId = this.contractIds.get(contractName);
    if (!contractId) {
      throw new EventError(`Contract ${contractName} not registered`, EventErrorCode.CONTRACT_NOT_REGISTERED);
    }
    return contractId;
  }
}

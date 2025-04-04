import { Address } from 'viem';
import { EventParser } from './EventParser';
import { ContractConfig, ContractEvent, EventCallback, ParsedEvent, EventError, EventErrorCode } from './types';

interface StoredContract extends ContractConfig {
  parserId: string;
}

export class ContractEventListener {
  private readonly parser: EventParser;
  private contracts: { [key: string]: StoredContract } = {};

  constructor(rpcUrl: string = 'http://127.0.0.1:8545') {
    this.parser = new EventParser(rpcUrl);
  }

  /**
   * Register a new contract for event listening
   * @throws {EventError} If contract registration fails
   */
  public registerContract(config: ContractConfig): string {
    const contractId = this.generateContractId(config.name, config.address);

    if (this.contracts[contractId]) {
      return contractId;
    }

    try {
      const parserId = this.parser.registerContract({
        address: config.address,
        abi: config.abi,
        listener: {
          pollingInterval: config.defaultPollingInterval,
        },
      });

      this.contracts[contractId] = {
        ...config,
        parserId,
      };

      return contractId;
    } catch (error) {
      throw new EventError(
        `Failed to register contract ${config.name} at ${config.address}`,
        EventErrorCode.CONTRACT_NOT_REGISTERED
      );
    }
  }

  /**
   * Listen to events from a contract
   * @throws {EventError} If event listening fails
   */
  public async listenToEvent<T = unknown>(
    contractId: string,
    eventName: string,
    callback: EventCallback<ParsedEvent<T>>,
    pollingInterval?: number
  ): Promise<void> {
    const contract = this.getContract(contractId);
    if (!contract) {
      throw new EventError(`Contract not found: ${contractId}`, EventErrorCode.CONTRACT_NOT_REGISTERED);
    }

    // Check if the event exists in the ABI
    const eventExists = contract.abi.some((item) => item.type === 'event' && item.name === eventName);
    if (!eventExists) {
      throw new EventError(`Event '${eventName}' not found in contract ABI`, EventErrorCode.INVALID_EVENT_NAME);
    }

    // Update contract config with the specific event name and polling interval
    this.parser.registerContract({
      address: contract.address,
      abi: contract.abi,
      eventName: eventName,
      listener: {
        pollingInterval: pollingInterval || contract.defaultPollingInterval,
      },
    });

    await this.parser.listenToEvents(contract.parserId, (event) => {
      // Only forward events matching the requested event name
      if (event.eventName === eventName) {
        callback(event as ParsedEvent<T>);
      }
    });
  }

  /**
   * Query historical events from a contract
   * @throws {EventError} If event query fails
   */
  public async queryEvents<T = unknown>(
    contractId: string,
    eventName: string,
    fromBlock: bigint,
    toBlock: bigint | 'latest'
  ): Promise<ParsedEvent<T>[]> {
    const contract = this.getContract(contractId);
    if (!contract) {
      throw new EventError(`Contract not found: ${contractId}`, EventErrorCode.CONTRACT_NOT_REGISTERED);
    }

    const blockParam = toBlock === 'latest' ? undefined : toBlock;
    return this.parser.queryEvents(contract.parserId, {
      fromBlock,
      toBlock: blockParam,
      eventName,
    });
  }

  /**
   * Get all registered events for a contract
   */
  public getContractEvents(contractId: string): ContractEvent[] {
    const contract = this.getContract(contractId);
    if (!contract) {
      throw new EventError(`Contract not found: ${contractId}`, EventErrorCode.CONTRACT_NOT_REGISTERED);
    }

    return contract.abi
      .filter((item) => item.type === 'event')
      .map((event) => ({
        name: event.name || '',
        signature: `${event.name}(${event.inputs?.map((input) => input.type).join(',')})`,
        args: event.inputs || [],
      }));
  }

  /**
   * Unsubscribe from events for a specific contract
   */
  public unsubscribe(contractId: string): void {
    const contract = this.contracts[contractId];
    if (contract) {
      this.parser.unsubscribe(contract.parserId);
      delete this.contracts[contractId];
    }
  }

  /**
   * Unsubscribe from all events
   */
  public unsubscribeAll(): void {
    Object.values(this.contracts).forEach((contract) => {
      this.parser.unsubscribe(contract.parserId);
    });
    this.contracts = {};
  }

  /**
   * Get contract configuration
   */
  private getContract(contractId: string): StoredContract | undefined {
    return this.contracts[contractId];
  }

  /**
   * Generate a unique contract ID
   */
  private generateContractId(name: string, address: Address): string {
    return `${name}_${address}_${Date.now()}`;
  }
}

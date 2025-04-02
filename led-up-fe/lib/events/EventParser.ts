import { PublicClient, createPublicClient, http, decodeEventLog, Log, parseAbiItem, AbiEvent } from 'viem';
import {
  ContractEventConfig,
  EventCallback,
  EventError,
  EventErrorCode,
  EventParseResult,
  EventQueryParams,
  EventSubscription,
  ParsedEvent,
} from './types';

export class EventParser {
  private readonly client: PublicClient;
  private readonly configs: Map<string, ContractEventConfig> = new Map();
  private readonly subscriptions: Map<string, EventSubscription> = new Map();
  private readonly DEFAULT_RETRY_ATTEMPTS = 3;
  private readonly DEFAULT_RETRY_DELAY = 1000;

  constructor(rpcUrl: string = 'http://127.0.0.1:8545') {
    this.client = createPublicClient({
      transport: http(rpcUrl),
    });
  }

  /**
   * Registers a contract for event monitoring
   * @throws {EventError} If the configuration is invalid
   */
  public registerContract(config: ContractEventConfig): string {
    if (!config.address || !config.abi) {
      throw new EventError('Invalid contract configuration', EventErrorCode.CONTRACT_NOT_REGISTERED);
    }

    const id = `${config.address}_${Date.now()}`;
    this.configs.set(id, config);
    return id;
  }

  /**
   * Starts listening for events from a registered contract
   * @throws {EventError} If the contract is not registered
   */
  public async listenToEvents<T>(contractId: string, callback: EventCallback<ParsedEvent<T>>): Promise<void> {
    const config = this.getContractConfig(contractId);
    let retryCount = 0;
    const maxRetries = config.listener?.retryAttempts ?? this.DEFAULT_RETRY_ATTEMPTS;
    const retryDelay = config.listener?.retryDelay ?? this.DEFAULT_RETRY_DELAY;

    const unwatch = await this.client.watchContractEvent({
      address: config.address,
      abi: config.abi,
      eventName: config.eventName,
      onError: async (error: Error) => {
        const eventError = new EventError(error.message, EventErrorCode.EVENT_LISTEN_FAILED);

        if (retryCount < maxRetries) {
          retryCount++;
          await this.delay(retryDelay);
          // Retry logic will be handled by viem
        } else {
          config.listener?.onError?.(eventError);
        }
      },
      onLogs: async (logs) => {
        try {
          const parsedEvents = await this.parseLogs<T>(logs, config);
          for (const result of parsedEvents) {
            if (result.success && result.event) {
              await callback(result.event);
            } else if (result.error) {
              config.listener?.onError?.(result.error);
            }
          }
          config.listener?.onLogs?.(logs);
          retryCount = 0; // Reset retry count on successful execution
        } catch (error) {
          const eventError = new EventError('Failed to process logs', EventErrorCode.PARSER_ERROR);
          config.listener?.onError?.(eventError);
        }
      },
      poll: true,
      pollingInterval: config.listener?.pollingInterval ?? 1000,
    });

    this.subscriptions.set(contractId, { unsubscribe: unwatch });
  }

  /**
   * Queries historical events
   * @throws {EventError} If the contract is not registered or query fails
   */
  public async queryEvents<T>(contractId: string, params: EventQueryParams): Promise<ParsedEvent<T>[]> {
    const config = this.getContractConfig(contractId);

    try {
      // Find the event ABI entry for the specified event name
      const eventAbi = params.eventName
        ? config.abi.find((item): item is AbiEvent => item.type === 'event' && item.name === params.eventName)
        : undefined;

      if (params.eventName && !eventAbi) {
        throw new EventError(`Event ${params.eventName} not found in ABI`, EventErrorCode.INVALID_EVENT_NAME);
      }

      const logs = await this.client.getLogs({
        address: config.address,
        fromBlock: params.fromBlock,
        toBlock: params.toBlock,
        event: eventAbi,
      });

      const parsedResults = await this.parseLogs<T>(logs, config);
      return parsedResults
        .filter(
          (result): result is EventParseResult<T> & { success: true; event: ParsedEvent<T> } =>
            result.success && !!result.event
        )
        .map((result) => result.event);
    } catch (error) {
      if (error instanceof EventError) throw error;
      throw new EventError('Failed to query events', EventErrorCode.EVENT_QUERY_FAILED);
    }
  }

  /**
   * Stops listening to events for a specific contract
   */
  public unsubscribe(contractId: string): void {
    const subscription = this.subscriptions.get(contractId);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(contractId);
      this.configs.delete(contractId);
    }
  }

  /**
   * Unsubscribes from all event listeners
   */
  public unsubscribeAll(): void {
    for (const [contractId] of this.subscriptions) {
      this.unsubscribe(contractId);
    }
  }

  /**
   * Internal method to parse raw logs into structured events
   */
  private async parseLogs<T>(logs: Log[], config: ContractEventConfig): Promise<EventParseResult<T>[]> {
    return Promise.all(
      logs.map(async (log): Promise<EventParseResult<T>> => {
        try {
          const { eventName, args } = decodeEventLog({
            abi: config.abi,
            data: log.data,
            topics: log.topics,
          });

          // Handle null values from log entries
          if (!log.blockNumber || !log.blockHash || !log.transactionHash || log.logIndex === null) {
            throw new Error('Invalid log entry: missing required fields');
          }

          let timestamp: number | undefined;
          if (log.blockHash) {
            const block = await this.client.getBlock({
              blockHash: log.blockHash,
            });
            timestamp = Number(block.timestamp);
          }

          return {
            success: true,
            event: {
              eventName: eventName || 'UnknownEvent',
              args: args as T,
              blockNumber: log.blockNumber,
              blockHash: log.blockHash,
              transactionHash: log.transactionHash,
              logIndex: log.logIndex,
              address: log.address,
              timestamp,
            },
          };
        } catch (error) {
          return {
            success: false,
            error: new EventError(
              error instanceof Error ? error.message : 'Failed to parse log',
              EventErrorCode.PARSER_ERROR
            ),
          };
        }
      })
    );
  }

  /**
   * Helper method to get contract config with error handling
   */
  private getContractConfig(contractId: string): ContractEventConfig {
    const config = this.configs.get(contractId);
    if (!config) {
      throw new EventError(`Contract not registered: ${contractId}`, EventErrorCode.CONTRACT_NOT_REGISTERED);
    }
    return config;
  }

  /**
   * Helper method for delay in retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

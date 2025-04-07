import { Log, decodeEventLog, PublicClient, AbiEvent } from 'viem';
import { CompensationABI } from '@/abi/compensation.abi';
import {
  PaymentProcessedEvent,
  ServiceFeeWithdrawnEvent,
  ServiceFeeChangedEvent,
  UnitPriceChangedEvent,
} from './index';

/**
 * Enumeration of Compensation contract event names
 */
export enum CompensationEventName {
  PaymentProcessed = 'PaymentProcessed',
  ProducerPaid = 'ProducerPaid',
  ProducerRemoved = 'ProducerRemoved',
  ServiceFeeChanged = 'ServiceFeeChanged',
  ServiceFeeWithdrawn = 'ServiceFeeWithdrawn',
  UnitPriceChanged = 'UnitPriceChanged',
  Paused = 'Paused',
  Unpaused = 'Unpaused',
  OwnershipTransferred = 'OwnershipTransferred',
}

/**
 * Producer paid event arguments
 */
export interface ProducerPaidEvent {
  producer: `0x${string}`;
  amount: bigint;
  timestamp: bigint;
}

/**
 * Producer removed event arguments
 */
export interface ProducerRemovedEvent {
  producer: `0x${string}`;
  timestamp: bigint;
}

/**
 * Ownership transferred event arguments
 */
export interface OwnershipTransferredEvent {
  previousOwner: `0x${string}`;
  newOwner: `0x${string}`;
}

/**
 * Union type for all compensation events
 */
export type CompensationEvent =
  | { name: CompensationEventName.PaymentProcessed; args: PaymentProcessedEvent }
  | { name: CompensationEventName.ProducerPaid; args: ProducerPaidEvent }
  | { name: CompensationEventName.ProducerRemoved; args: ProducerRemovedEvent }
  | { name: CompensationEventName.ServiceFeeWithdrawn; args: ServiceFeeWithdrawnEvent }
  | { name: CompensationEventName.ServiceFeeChanged; args: ServiceFeeChangedEvent }
  | { name: CompensationEventName.UnitPriceChanged; args: UnitPriceChangedEvent }
  | { name: CompensationEventName.Paused; args: { account: `0x${string}` } }
  | { name: CompensationEventName.Unpaused; args: { account: `0x${string}` } }
  | { name: CompensationEventName.OwnershipTransferred; args: OwnershipTransferredEvent };

/**
 * Parse a transaction log to extract compensation events
 * @param log - The transaction log to parse
 * @returns The parsed event or null if not a recognized compensation event
 */
export function parseCompensationEvent(log: Log): CompensationEvent | null {
  try {
    const event = decodeEventLog({
      abi: CompensationABI,
      data: log.data,
      topics: log.topics,
    });

    // Return the appropriate event based on event name
    switch (event.eventName as unknown as CompensationEventName) {
      case CompensationEventName.PaymentProcessed:
        return {
          name: CompensationEventName.PaymentProcessed,
          args: event.args as unknown as PaymentProcessedEvent,
        };

      case CompensationEventName.ProducerPaid:
        return {
          name: CompensationEventName.ProducerPaid,
          args: event.args as unknown as ProducerPaidEvent,
        };

      case CompensationEventName.ProducerRemoved:
        return {
          name: CompensationEventName.ProducerRemoved,
          args: event.args as unknown as ProducerRemovedEvent,
        };

      case CompensationEventName.ServiceFeeWithdrawn:
        return {
          name: CompensationEventName.ServiceFeeWithdrawn,
          args: event.args as unknown as ServiceFeeWithdrawnEvent,
        };

      case CompensationEventName.ServiceFeeChanged:
        return {
          name: CompensationEventName.ServiceFeeChanged,
          args: event.args as unknown as ServiceFeeChangedEvent,
        };

      case CompensationEventName.UnitPriceChanged:
        return {
          name: CompensationEventName.UnitPriceChanged,
          args: event.args as unknown as UnitPriceChangedEvent,
        };

      case CompensationEventName.Paused:
        return {
          name: CompensationEventName.Paused,
          args: event.args as unknown as { account: `0x${string}` },
        };

      case CompensationEventName.Unpaused:
        return {
          name: CompensationEventName.Unpaused,
          args: event.args as unknown as { account: `0x${string}` },
        };

      case CompensationEventName.OwnershipTransferred:
        return {
          name: CompensationEventName.OwnershipTransferred,
          args: event.args as unknown as OwnershipTransferredEvent,
        };

      default:
        return null;
    }
  } catch (error) {
    console.error('Error parsing compensation event:', error);
    return null;
  }
}

/**
 * Options for fetching compensation events
 */
export interface GetCompensationEventsOptions {
  fromBlock?: bigint;
  toBlock?: bigint;
  address?: `0x${string}`;
}

/**
 * Options for fetching payment events
 */
export interface GetPaymentEventsOptions extends GetCompensationEventsOptions {
  recordId?: string;
  producer?: `0x${string}`;
  consumer?: `0x${string}`;
}

/**
 * Options for fetching withdrawal events
 */
export interface GetWithdrawalEventsOptions extends GetCompensationEventsOptions {
  producer?: `0x${string}`;
}

/**
 * Fetch compensation events from the blockchain
 * @param client - The Viem public client to use for fetching logs
 * @param eventName - The name of the event to fetch
 * @param options - Options for filtering events
 * @returns Array of parsed events
 */
export async function getCompensationEvents<T extends CompensationEvent>(
  client: PublicClient,
  eventName: CompensationEventName,
  options: GetCompensationEventsOptions = {}
): Promise<T[]> {
  try {
    const logs = await client.getLogs({
      address: options.address,
      event: CompensationABI.find((item) => item.type === 'event' && item.name === eventName) as AbiEvent,
      fromBlock: options.fromBlock,
      toBlock: options.toBlock,
    });

    return logs
      .map(parseCompensationEvent)
      .filter((event): event is T => event !== null && event.name === eventName) as T[];
  } catch (error) {
    console.error(`Error fetching ${eventName} events:`, error);
    return [];
  }
}

/**
 * Fetch payment processed events from the blockchain
 * @param client - The Viem public client to use for fetching logs
 * @param options - Options for filtering events
 * @returns Array of payment processed events
 */
export async function getPaymentProcessedEvents(
  client: PublicClient,
  options: GetPaymentEventsOptions = {}
): Promise<Array<CompensationEvent & { name: CompensationEventName.PaymentProcessed }>> {
  const events = await getCompensationEvents<{
    name: CompensationEventName.PaymentProcessed;
    args: PaymentProcessedEvent;
  }>(client, CompensationEventName.PaymentProcessed, options);

  // Apply additional filters
  return events.filter((event) => {
    if (options.producer && event.args.producer !== options.producer) return false;
    if (options.consumer && event.args.consumer !== options.consumer) return false;
    return true;
  });
}

/**
 * Fetch producer paid events from the blockchain
 * @param client - The Viem public client to use for fetching logs
 * @param options - Options for filtering events
 * @returns Array of producer paid events
 */
export async function getProducerPaidEvents(
  client: PublicClient,
  options: GetWithdrawalEventsOptions = {}
): Promise<Array<CompensationEvent & { name: CompensationEventName.ProducerPaid }>> {
  const events = await getCompensationEvents<{ name: CompensationEventName.ProducerPaid; args: ProducerPaidEvent }>(
    client,
    CompensationEventName.ProducerPaid,
    options
  );

  // Apply additional filters
  return events.filter((event) => {
    if (options.producer && event.args.producer !== options.producer) return false;
    return true;
  });
}

/**
 * Type guard to check if an event is of a specific type
 * @param event - The event to check
 * @param eventName - The event name to check for
 * @returns Whether the event is of the specified type
 */
export function isEventType<T extends CompensationEventName>(
  event: CompensationEvent,
  eventName: T
): event is Extract<CompensationEvent, { name: T }> {
  return event.name === eventName;
}

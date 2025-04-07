/**
 * Utilities for working with data registry query functions and caching
 */

import { type Address } from 'viem';
import { ResourceType, RecordStatus, ConsentStatus } from '../types';

/**
 * Cache keys for data registry queries
 */
export const CACHE_KEYS = {
  PRODUCER_PREFIX: 'data-registry:producer:',
  RECORD_PREFIX: 'data-registry:record:',
  ACCESS_PREFIX: 'data-registry:access:',
  PRODUCER_RECORDS_PREFIX: 'data-registry:producer-records:',
  TOTAL_RECORDS: 'data-registry:total-records',
  ALL_RECORDS: 'data-registry:all-records',
  ALL_PRODUCERS: 'data-registry:all-producers',
  EVENTS_PREFIX: 'data-registry:events:',
  CONFIG: 'data-registry:config',
} as const;

/**
 * Available query IDs for data registry
 */
export enum DataRegistryQueryId {
  GetProducerMetadata = 'getProducerMetadata',
  GetRecordInfo = 'getRecordInfo',
  CheckAccess = 'checkAccess',
  GetProducerRecords = 'getProducerRecords',
  GetTotalRecords = 'getTotalRecords',
  IsRecordVerified = 'isRecordVerified',
  IsAuthorizedProvider = 'isAuthorizedProvider',
}

/**
 * Available mutation IDs for data registry
 */
export enum DataRegistryMutationId {
  RegisterProducer = 'registerProducer',
  RegisterRecord = 'registerRecord',
  UpdateRecord = 'updateRecord',
  ShareData = 'shareData',
  ShareToProvider = 'shareToProvider',
  RevokeAccess = 'revokeAccess',
  UpdateProducerConsent = 'updateProducerConsent',
  VerifyRecord = 'verifyRecord',
  TriggerAccess = 'triggerAccess',
  UpdateDidAuthAddress = 'updateDidAuthAddress',
  UpdateCompensationAddress = 'updateCompensationAddress',
  Pause = 'pause',
  Unpause = 'unpause',
  AddProvider = 'addProvider',
  RemoveProvider = 'removeProvider',
}

/**
 * Creates a producer metadata cache key
 */
export function getProducerCacheKey(producerAddress: Address): string {
  return `${CACHE_KEYS.PRODUCER_PREFIX}${producerAddress}`;
}

/**
 * Creates a record info cache key
 */
export function getRecordCacheKey(recordId: string): string {
  return `${CACHE_KEYS.RECORD_PREFIX}${recordId}`;
}

/**
 * Creates a access check cache key
 */
export function getAccessCacheKey(recordId: string, consumerAddress: Address): string {
  return `${CACHE_KEYS.ACCESS_PREFIX}${recordId}:${consumerAddress}`;
}

/**
 * Creates a producer records cache key
 */
export function getProducerRecordsCacheKey(producerAddress: Address): string {
  return `${CACHE_KEYS.PRODUCER_RECORDS_PREFIX}${producerAddress}`;
}

/**
 * Creates an events cache key
 */
export function getEventsCacheKey(eventType: string, filters?: Record<string, any>): string {
  const filtersString = filters ? `:${JSON.stringify(filters)}` : '';
  return `${CACHE_KEYS.EVENTS_PREFIX}${eventType}${filtersString}`;
}

/**
 * Determines which cache keys to invalidate after a mutation
 */
export function getInvalidationKeysForMutation(
  mutationId: DataRegistryMutationId,
  params: Record<string, any> = {}
): string[] {
  const keysToInvalidate: string[] = [];

  // Always invalidate total records for certain operations
  if ([DataRegistryMutationId.RegisterRecord, DataRegistryMutationId.VerifyRecord].includes(mutationId)) {
    keysToInvalidate.push(CACHE_KEYS.TOTAL_RECORDS);
  }

  // Operation-specific cache invalidation
  switch (mutationId) {
    case DataRegistryMutationId.RegisterProducer:
      keysToInvalidate.push(CACHE_KEYS.ALL_PRODUCERS);
      if (params.address) {
        keysToInvalidate.push(getProducerCacheKey(params.address as Address));
      }
      break;

    case DataRegistryMutationId.RegisterRecord:
      if (params.recordId) {
        keysToInvalidate.push(getRecordCacheKey(params.recordId));
      }
      if (params.address) {
        keysToInvalidate.push(getProducerCacheKey(params.address as Address));
        keysToInvalidate.push(getProducerRecordsCacheKey(params.address as Address));
      }
      keysToInvalidate.push(CACHE_KEYS.ALL_RECORDS);
      break;

    case DataRegistryMutationId.UpdateRecord:
      if (params.recordId) {
        keysToInvalidate.push(getRecordCacheKey(params.recordId));
      }
      keysToInvalidate.push(CACHE_KEYS.ALL_RECORDS);
      break;

    case DataRegistryMutationId.ShareData:
    case DataRegistryMutationId.ShareToProvider:
      if (params.recordId && params.consumerAddress) {
        keysToInvalidate.push(getAccessCacheKey(params.recordId, params.consumerAddress as Address));
        keysToInvalidate.push(getRecordCacheKey(params.recordId));
      }
      break;

    case DataRegistryMutationId.RevokeAccess:
      if (params.recordId && params.consumerAddress) {
        keysToInvalidate.push(getAccessCacheKey(params.recordId, params.consumerAddress as Address));
      }
      break;

    case DataRegistryMutationId.UpdateProducerConsent:
      if (params.producer) {
        keysToInvalidate.push(getProducerCacheKey(params.producer as Address));
      }
      if (params.address) {
        keysToInvalidate.push(getProducerCacheKey(params.address as Address));
      }
      break;

    case DataRegistryMutationId.VerifyRecord:
      if (params.recordId) {
        keysToInvalidate.push(getRecordCacheKey(params.recordId));
      }
      break;

    case DataRegistryMutationId.Pause:
    case DataRegistryMutationId.Unpause:
      keysToInvalidate.push(CACHE_KEYS.CONFIG);
      break;

    default:
      // For other operations, don't invalidate specific caches
      break;
  }

  // Always include event caches for invalidation
  keysToInvalidate.push(`${CACHE_KEYS.EVENTS_PREFIX}*`);

  return keysToInvalidate;
}

/**
 * Type definition for query filters
 */
export interface QueryFilters {
  resourceType?: ResourceType;
  recordStatus?: RecordStatus;
  consentStatus?: ConsentStatus;
  verified?: boolean;
  searchTerm?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

/**
 * Default pagination limits
 */
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

/**
 * Helper to apply client-side filtering to records
 */
export function applyFilters<T extends Record<string, any>>(
  data: T[],
  filters: QueryFilters,
  keyMap: Record<string, keyof T> = {}
): T[] {
  if (!data || data.length === 0) return [];

  let filteredData = [...data];

  // Apply resource type filter
  if (filters.resourceType !== undefined) {
    const key = keyMap.resourceType || 'resourceType';
    filteredData = filteredData.filter((item) => item[key] === filters.resourceType);
  }

  // Apply record status filter
  if (filters.recordStatus !== undefined) {
    const key = keyMap.recordStatus || 'status';
    filteredData = filteredData.filter((item) => item[key] === filters.recordStatus);
  }

  // Apply consent status filter
  if (filters.consentStatus !== undefined) {
    const key = keyMap.consentStatus || 'consent';
    filteredData = filteredData.filter((item) => item[key] === filters.consentStatus);
  }

  // Apply verified filter
  if (filters.verified !== undefined) {
    const key = keyMap.verified || 'isVerified';
    filteredData = filteredData.filter((item) => Boolean(item[key]) === filters.verified);
  }

  // Apply search term filter
  if (filters.searchTerm) {
    const term = filters.searchTerm.toLowerCase();
    filteredData = filteredData.filter((item) => {
      // Search in common text fields
      return Object.values(item).some((value) => {
        if (typeof value === 'string') {
          return value.toLowerCase().includes(term);
        }
        return false;
      });
    });
  }

  // Apply sorting
  if (filters.sortBy) {
    const sortKey = keyMap[filters.sortBy] || (filters.sortBy as keyof T);
    const direction = filters.sortDirection || 'asc';

    filteredData.sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
        return direction === 'asc' ? Number(aValue) - Number(bValue) : Number(bValue) - Number(aValue);
      }

      return 0;
    });
  }

  // Apply pagination
  if (filters.page !== undefined && filters.limit !== undefined) {
    const start = (filters.page - 1) * filters.limit;
    const end = start + filters.limit;
    return filteredData.slice(start, end);
  }

  return filteredData;
}

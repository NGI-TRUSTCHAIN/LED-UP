'use client';

import { useQuery } from '@tanstack/react-query';
import * as dataRegistryActions from '../actions';
import * as compensationActions from '../../compensation/actions';
import { Address } from 'viem';

/**
 * Hook to get producer metadata
 * @param producer - The producer address
 */
export function useProducerMetadata(producer?: Address) {
  return useQuery({
    queryKey: ['dataRegistry', 'getProducerMetadata', producer],
    queryFn: () => dataRegistryActions.getProducerMetadata(producer!),
    enabled: !!producer,
  });
}

/**
 * Hook to get producer records
 * @param producer - The producer address
 */
export function useProducerRecords(producer?: Address) {
  return useQuery({
    queryKey: ['dataRegistry', 'getProducerRecords', producer],
    queryFn: () => dataRegistryActions.getProducerRecords(producer!),
    enabled: !!producer,
  });
}

/**
 * Hook to get producer balance
 * @param producer - The producer address
 */
export function useProducerBalance(producer?: Address) {
  return useQuery({
    queryKey: ['compensation', 'getProducerBalance', producer],
    queryFn: () => compensationActions.getProducerBalance(producer!),
    enabled: !!producer,
  });
}

/**
 * Hook to get record info
 * @param recordId - The record ID
 */
export function useRecordInfo(recordId?: string) {
  return useQuery({
    queryKey: ['dataRegistry', 'getRecordInfo', recordId],
    queryFn: () => dataRegistryActions.getRecordInfo(recordId!),
    enabled: !!recordId,
  });
}

/**
 * Hook to get multiple records info
 * @param recordIds - Array of record IDs
 */
export function useMultipleRecordsInfo(recordIds?: string[]) {
  return useQuery({
    queryKey: ['dataRegistry', 'getMultipleRecordsInfo', recordIds],
    queryFn: async () => {
      if (!recordIds) return [];
      const records = await Promise.all(recordIds.map((recordId) => dataRegistryActions.getRecordInfo(recordId)));
      return records;
    },
    enabled: !!recordIds && recordIds.length > 0,
  });
}

/**
 * Hook to check if a record is verified
 * @param recordId - The record ID
 */
export function useIsRecordVerified(recordId?: string) {
  return useQuery({
    queryKey: ['dataRegistry', 'isRecordVerified', recordId],
    queryFn: () => dataRegistryActions.isRecordVerified(recordId!),
    enabled: !!recordId,
  });
}

/**
 * Hook to get total records count
 */
export function useTotalRecords() {
  return useQuery({
    queryKey: ['dataRegistry', 'getTotalRecords'],
    queryFn: () => dataRegistryActions.getTotalRecords(),
  });
}

/**
 * Hook to get active shares count for a producer
 * @param producer - The producer address
 */
export function useActiveShares(producer?: Address) {
  return useQuery({
    queryKey: ['dataRegistry', 'getActiveShares', producer],
    queryFn: () => dataRegistryActions.getActiveShares(producer!),
    enabled: !!producer,
  });
}

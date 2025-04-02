'use server';

import { API_ENDPOINTS } from '../config';
import { HealthRecord, ProducerRecordsResponse, RecordInfoResponse, RecordStatus, ResourceType } from '../types';
import { fetchWithErrorHandling } from '../utils/api';
import { ApiError } from '../../../lib/error';

/**
 * Server action to get a producer record
 * @param producer The address of the producer
 * @param recordId The ID of the record
 * @returns The producer record
 * @throws ApiError if the request fails
 */
export async function getProducerRecord(producer: string, recordId: string): Promise<HealthRecord> {
  try {
    const response = await fetchWithErrorHandling<HealthRecord>(
      `${API_ENDPOINTS.DATA_REGISTRY.GET_PRODUCER_RECORD}?producer=${producer}&recordId=${recordId}`,
      {
        method: 'GET',
        cache: 'no-store',
        next: { tags: ['data-registry'] },
      }
    );

    if (!response.success || !response.data) {
      throw new ApiError(response.message || 'Failed to get producer record', 400);
    }

    // Cast producer address to correct type and ensure all required fields are present
    return {
      recordId,
      producer: producer as `0x${string}`,
      resourceType: response.data.resourceType ?? ResourceType.Other,
      sharedCount: response.data.sharedCount ?? 0,
      updatedAt: response.data.updatedAt ?? Date.now(),
      dataSize: response.data.dataSize ?? 0,
      contentHash: response.data.contentHash ?? '',
      cid: response.data.cid ?? '',
      isVerified: response.data.isVerified ?? false,
    };
  } catch (error) {
    console.error(`Error getting producer record: ${error}`);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(error instanceof Error ? error.message : 'Failed to get producer record', 500);
  }
}

/**
 * Server action to get all producer records
 * @param producer The address of the producer
 * @returns The producer records
 * @throws ApiError if the request fails
 */
export async function getProducerRecords(producer: string): Promise<ProducerRecordsResponse> {
  try {
    const response = await fetchWithErrorHandling<ProducerRecordsResponse>(
      `${API_ENDPOINTS.DATA_REGISTRY.GET_PRODUCER_RECORDS}?producer=${producer}`,
      {
        method: 'GET',
        cache: 'no-store',
        next: { tags: ['data-registry'] },
      }
    );

    if (!response.success || !response.data) {
      throw new ApiError(response.message || 'Failed to get producer records', 400);
    }

    return response.data;
  } catch (error) {
    console.error(`Error getting producer records: ${error}`);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(error instanceof Error ? error.message : 'Failed to get producer records', 500);
  }
}

/**
 * Server action to get a producer record's status
 * @param producer The address of the producer
 * @returns The producer record status
 * @throws ApiError if the request fails
 */
export async function getProducerRecordStatus(producer: string): Promise<RecordStatus> {
  try {
    const response = await fetchWithErrorHandling<RecordStatus>(
      `${API_ENDPOINTS.DATA_REGISTRY.GET_PRODUCER_RECORD_STATUS}?producer=${producer}`,
      {
        method: 'GET',
        cache: 'no-store',
        next: { tags: ['data-registry'] },
      }
    );

    if (!response.success || response.data === undefined) {
      throw new ApiError(response.message || 'Failed to get producer record status', 400);
    }

    return response.data;
  } catch (error) {
    console.error(`Error getting producer record status: ${error}`);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(error instanceof Error ? error.message : 'Failed to get producer record status', 500);
  }
}

/**
 * Server action to get a producer record's information
 * @param producer The address of the producer
 * @returns The producer record information
 * @throws ApiError if the request fails
 */
export async function getProducerRecordInfo(producer: string): Promise<RecordInfoResponse> {
  try {
    const response = await fetchWithErrorHandling<RecordInfoResponse>(
      `${API_ENDPOINTS.DATA_REGISTRY.GET_PRODUCER_RECORD_INFO}?producer=${producer}`,
      {
        method: 'GET',
        cache: 'no-store',
        next: { tags: ['data-registry'] },
      }
    );

    if (!response.success || !response.data) {
      throw new ApiError(response.message || 'Failed to get producer record info', 400);
    }

    // Cast producer address to correct type and ensure all required fields are present
    return {
      producer: producer as `0x${string}`,
      did: response.data.did ?? '',
      consent: response.data.consent,
      entries: response.data.entries ?? 0,
      isActive: response.data.isActive ?? true,
      lastUpdated: response.data.lastUpdated ?? Date.now(),
      nonce: response.data.nonce ?? 0,
      version: response.data.version ?? 1,
      metadata: response.data.metadata,
    };
  } catch (error) {
    console.error(`Error getting producer record info: ${error}`);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(error instanceof Error ? error.message : 'Failed to get producer record info', 500);
  }
}

/**
 * Server action to get a producer record's count
 * @param producer The address of the producer
 * @returns The producer record count
 * @throws ApiError if the request fails
 */
export async function getProducerRecordCount(producer: string): Promise<number> {
  try {
    const response = await fetchWithErrorHandling<number>(
      `${API_ENDPOINTS.DATA_REGISTRY.GET_PRODUCER_RECORD_COUNT}?producer=${producer}`,
      {
        method: 'GET',
        cache: 'no-store',
        next: { tags: ['data-registry'] },
      }
    );

    if (!response.success || response.data === undefined) {
      throw new ApiError(response.message || 'Failed to get producer record count', 400);
    }

    return response.data;
  } catch (error) {
    console.error(`Error getting producer record count: ${error}`);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(error instanceof Error ? error.message : 'Failed to get producer record count', 500);
  }
}

/**
 * Server action to get the total records count
 * @returns The total records count
 * @throws ApiError if the request fails
 */
export async function getTotalRecordsCount(): Promise<number> {
  try {
    const response = await fetchWithErrorHandling<number>(API_ENDPOINTS.DATA_REGISTRY.GET_TOTAL_RECORDS_COUNT, {
      method: 'GET',
      cache: 'no-store',
      next: { tags: ['data-registry'] },
    });

    if (!response.success || response.data === undefined) {
      throw new ApiError(response.message || 'Failed to get total records count', 400);
    }

    return response.data;
  } catch (error) {
    console.error(`Error getting total records count: ${error}`);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(error instanceof Error ? error.message : 'Failed to get total records count', 500);
  }
}

/**
 * Server action to check if a producer exists
 * @param producer The address of the producer
 * @returns True if the producer exists, false otherwise
 * @throws ApiError if the request fails
 */
export async function producerExists(producer: string): Promise<boolean> {
  try {
    const response = await fetchWithErrorHandling<boolean>(
      `${API_ENDPOINTS.DATA_REGISTRY.PRODUCER_EXISTS}?producer=${producer}`,
      {
        method: 'GET',
        cache: 'no-store',
        next: { tags: ['data-registry'] },
      }
    );

    if (!response.success || response.data === undefined) {
      throw new ApiError(response.message || 'Failed to check if producer exists', 400);
    }

    return response.data;
  } catch (error) {
    console.error(`Error checking if producer exists: ${error}`);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(error instanceof Error ? error.message : 'Failed to check if producer exists', 500);
  }
}

/**
 * Server action to get the compensation contract address
 * @returns The compensation contract address
 * @throws ApiError if the request fails
 */
export async function getCompensationContractAddress(): Promise<string> {
  try {
    const response = await fetchWithErrorHandling<string>(
      API_ENDPOINTS.DATA_REGISTRY.GET_COMPENSATION_CONTRACT_ADDRESS,
      {
        method: 'GET',
        cache: 'no-store',
        next: { tags: ['data-registry'] },
      }
    );

    if (!response.success || !response.data) {
      throw new ApiError(response.message || 'Failed to get compensation contract address', 400);
    }

    return response.data;
  } catch (error) {
    console.error(`Error getting compensation contract address: ${error}`);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(error instanceof Error ? error.message : 'Failed to get compensation contract address', 500);
  }
}

/**
 * Server action to get the pause state of the contract
 * @returns True if the contract is paused, false otherwise
 * @throws ApiError if the request fails
 */
export async function getPauseState(): Promise<boolean> {
  try {
    const response = await fetchWithErrorHandling<boolean>(API_ENDPOINTS.DATA_REGISTRY.GET_PAUSE_STATE, {
      method: 'GET',
      cache: 'no-store',
      next: { tags: ['data-registry'] },
    });

    if (!response.success || response.data === undefined) {
      throw new ApiError(response.message || 'Failed to get pause state', 400);
    }

    return response.data;
  } catch (error) {
    console.error(`Error getting pause state: ${error}`);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(error instanceof Error ? error.message : 'Failed to get pause state', 500);
  }
}

/**
 * Server action to get a shared record
 * @param recordId The ID of the record
 * @param requesterDid The DID of the requester
 * @returns The CID of the shared record
 * @throws ApiError if the request fails
 */
export async function getSharedRecord(recordId: string, requesterDid: string): Promise<string> {
  try {
    const response = await fetchWithErrorHandling<string>(
      `${API_ENDPOINTS.DATA_REGISTRY.GET_SHARED_RECORD}?recordId=${recordId}&requesterDid=${requesterDid}`,
      {
        method: 'GET',
        cache: 'no-store',
        next: { tags: ['data-registry'] },
      }
    );

    if (!response.success || !response.data) {
      throw new ApiError(response.message || 'Failed to get shared record', 400);
    }

    return response.data;
  } catch (error) {
    console.error(`Error getting shared record: ${error}`);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(error instanceof Error ? error.message : 'Failed to get shared record', 500);
  }
}

/**
 * Server action to check if a consumer is authorized
 * @param recordId The ID of the record
 * @param consumerDid The DID of the consumer
 * @returns True if the consumer is authorized, false otherwise
 * @throws ApiError if the request fails
 */
export async function isConsumerAuthorized(recordId: string, consumerDid: string): Promise<boolean> {
  try {
    const response = await fetchWithErrorHandling<boolean>(
      `${API_ENDPOINTS.DATA_REGISTRY.IS_CONSUMER_AUTHORIZED}?recordId=${recordId}&consumerDid=${consumerDid}`,
      {
        method: 'GET',
        cache: 'no-store',
        next: { tags: ['data-registry'] },
      }
    );

    if (!response.success || response.data === undefined) {
      throw new ApiError(response.message || 'Failed to check if consumer is authorized', 400);
    }

    return response.data;
  } catch (error) {
    console.error(`Error checking if consumer is authorized: ${error}`);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(error instanceof Error ? error.message : 'Failed to check if consumer is authorized', 500);
  }
}

/**
 * Server action to get the address from a DID
 * @param did The DID to get the address for
 * @returns The address associated with the DID
 * @throws ApiError if the request fails
 */
export async function getAddressFromDid(did: string): Promise<string> {
  try {
    const response = await fetchWithErrorHandling<string>(
      `${API_ENDPOINTS.DATA_REGISTRY.GET_ADDRESS_FROM_DID}?did=${did}`,
      {
        method: 'GET',
        cache: 'no-store',
        next: { tags: ['data-registry'] },
      }
    );

    if (!response.success || !response.data) {
      throw new ApiError(response.message || 'Failed to get address from DID', 400);
    }

    return response.data;
  } catch (error) {
    console.error(`Error getting address from DID: ${error}`);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(error instanceof Error ? error.message : 'Failed to get address from DID', 500);
  }
}

/**
 * Server action to get the DID from a producer address
 * @param producer The address of the producer
 * @returns The DID associated with the producer address
 * @throws ApiError if the request fails
 */
export async function getProducerDid(producer: string): Promise<string> {
  try {
    const response = await fetchWithErrorHandling<string>(
      `${API_ENDPOINTS.DATA_REGISTRY.GET_PRODUCER_DID}?producer=${producer}`,
      {
        method: 'GET',
        cache: 'no-store',
        next: { tags: ['data-registry'] },
      }
    );

    if (!response.success || !response.data) {
      throw new ApiError(response.message || 'Failed to get producer DID', 400);
    }

    return response.data;
  } catch (error) {
    console.error(`Error getting producer DID: ${error}`);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(error instanceof Error ? error.message : 'Failed to get producer DID', 500);
  }
}

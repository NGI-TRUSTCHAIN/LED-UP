/**
 * Configuration for the Data Registry API endpoints
 */

// Base API URL - should be configured in environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_AZURE_API_URL || 'http://localhost:7071/api';

/**
 * Data Registry API endpoints
 */
export const API_ENDPOINTS = {
  DATA_REGISTRY: {
    // Producer endpoints
    REGISTER_PRODUCER: `${API_BASE_URL}/data-registry/producer/register`,
    PRODUCER_EXISTS: `${API_BASE_URL}/data-registry/producer/exists`,
    REMOVE_PRODUCER: `${API_BASE_URL}/data-registry/producer/remove`,

    // Producer record endpoints
    GET_PRODUCER_RECORD: `${API_BASE_URL}/data-registry/producer/record`,
    GET_PRODUCER_RECORDS: `${API_BASE_URL}/data-registry/producer/records`,
    GET_PRODUCER_RECORD_COUNT: `${API_BASE_URL}/data-registry/producer/record-count`,
    GET_PRODUCER_RECORD_INFO: `${API_BASE_URL}/data-registry/producer/record-info`,
    GET_PRODUCER_RECORD_STATUS: `${API_BASE_URL}/data-registry/producer/record-status`,
    UPDATE_PRODUCER_RECORD: `${API_BASE_URL}/data-registry/producer/record/update`,
    UPDATE_PRODUCER_RECORD_METADATA: `${API_BASE_URL}/data-registry/producer/record/metadata/update`,
    UPDATE_PRODUCER_RECORD_STATUS: `${API_BASE_URL}/data-registry/producer/record/status/update`,
    REMOVE_PRODUCER_RECORD: `${API_BASE_URL}/data-registry/producer/record/remove`,
    REGISTER_PRODUCER_RECORD: `${API_BASE_URL}/data-registry/producer/register-record`,

    // Consent endpoints
    UPDATE_PRODUCER_CONSENT: `${API_BASE_URL}/data-registry/producer/consent/update`,

    // Data sharing endpoints
    SHARE_DATA: `${API_BASE_URL}/data-registry/data/share`,
    GET_SHARED_RECORD: `${API_BASE_URL}/data-registry/data/shared`,
    VERIFY_DATA: `${API_BASE_URL}/data-registry/data/verify`,
    IS_CONSUMER_AUTHORIZED: `${API_BASE_URL}/data-registry/consumer/authorized`,

    // Provider endpoints
    GET_PROVIDER_METADATA: `${API_BASE_URL}/data-registry/provider/metadata`,
    UPDATE_PROVIDER_METADATA: `${API_BASE_URL}/data-registry/provider/metadata/update`,
    GET_RECORD_SCHEMA: `${API_BASE_URL}/data-registry/provider/schema`,
    UPDATE_PROVIDER_RECORD_SCHEMA: `${API_BASE_URL}/data-registry/provider/schema/update`,

    // Contract management endpoints
    GET_PAUSE_STATE: `${API_BASE_URL}/data-registry/pause-state`,
    CHANGE_PAUSE_STATE: `${API_BASE_URL}/data-registry/pause-state/change`,
    TRANSFER_OWNERSHIP: `${API_BASE_URL}/data-registry/ownership/transfer`,
    RENOUNCE_OWNERSHIP: `${API_BASE_URL}/data-registry/ownership/renounce`,

    // Utility endpoints
    GET_TOTAL_RECORDS_COUNT: `${API_BASE_URL}/data-registry/records/count`,
    GET_COMPENSATION_CONTRACT_ADDRESS: `${API_BASE_URL}/data-registry/compensation-address`,
    GET_ADDRESS_FROM_DID: `${API_BASE_URL}/data-registry/address-from-did`,
    GET_PRODUCER_DID: `${API_BASE_URL}/data-registry/producer-did`,
  },
};

/**
 * Default pagination settings
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
};

/**
 * Cache settings
 */
export const CACHE = {
  TTL: 60 * 1000, // 1 minute in milliseconds
  STALE_TIME: 30 * 1000, // 30 seconds in milliseconds
};

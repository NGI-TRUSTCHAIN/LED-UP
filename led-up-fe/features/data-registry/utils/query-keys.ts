/**
 * Query keys for data registry related queries
 */
export const DATA_REGISTRY_KEYS = {
  all: ['data-registry'] as const,
  producerRecords: (producer?: string) => [...DATA_REGISTRY_KEYS.all, 'producer-records', producer] as const,
  producerExists: (producer?: string) => [...DATA_REGISTRY_KEYS.all, 'producer-exists', producer] as const,
  recordInfo: (recordId?: string) => [...DATA_REGISTRY_KEYS.all, 'record-info', recordId] as const,
  isVerified: (recordId?: string) => [...DATA_REGISTRY_KEYS.all, 'is-verified', recordId] as const,
  isAuthorizedProvider: (producer?: string, provider?: string) =>
    [...DATA_REGISTRY_KEYS.all, 'is-authorized-provider', producer, provider] as const,
};

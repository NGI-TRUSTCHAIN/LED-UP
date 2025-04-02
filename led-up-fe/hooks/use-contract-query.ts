import { useQuery } from '@tanstack/react-query';
import { ContractName, ContractReadResponse } from '../features/data-registry/types';
import { getErrorHandler } from '../utils/contract-interaction';

/**
 * Options for creating a contract query hook
 */
interface CreateContractQueryOptions<TParams, TData> {
  queryFn: (params: TParams) => Promise<ContractReadResponse<TData>>;
  getQueryKey: (params: TParams) => unknown[];
  contractName?: ContractName;
  enabled?: (params: TParams) => boolean;
}

/**
 * Factory function to create a contract query hook
 * @param options Options for creating the hook
 * @returns A custom hook for contract queries
 */
export function createContractQuery<TParams, TData = any>({
  queryFn,
  getQueryKey,
  contractName = ContractName.DataRegistry,
  enabled,
}: CreateContractQueryOptions<TParams, TData>) {
  return function useContractQuery(params: TParams) {
    const errorHandler = getErrorHandler(contractName);

    return useQuery<TData, Error>({
      queryKey: getQueryKey(params),
      queryFn: async () => {
        const response = await queryFn(params);

        if (!response.success) {
          throw new Error(response.error || 'Failed to fetch data');
        }

        return response.data as TData;
      },
      enabled: enabled ? enabled(params) : true,
    });
  };
}

/**
 * Factory function to create a simple contract query hook
 * @param queryFn The query function
 * @param queryKeyPrefix The prefix for the query key
 * @param contractName The contract name
 * @returns A custom hook for contract queries
 */
export function createSimpleContractQuery<TParam = string, TData = any>(
  queryFn: (param: TParam) => Promise<ContractReadResponse<TData>>,
  queryKeyPrefix: string,
  contractName = ContractName.DataRegistry
) {
  return createContractQuery<TParam, TData>({
    queryFn,
    getQueryKey: (param) => [queryKeyPrefix, param],
    contractName,
    enabled: (param) => !!param,
  });
}

/**
 * Factory function to create a parameterless contract query hook
 * @param queryFn The query function
 * @param queryKey The query key
 * @param contractName The contract name
 * @returns A custom hook for contract queries
 */
export function createSimpleContractQueryWithoutParams<TData = any>(
  queryFn: () => Promise<ContractReadResponse<TData>>,
  queryKey: string,
  contractName = ContractName.DataRegistry
) {
  return function useContractQuery() {
    const errorHandler = getErrorHandler(contractName);

    return useQuery<TData, Error>({
      queryKey: [queryKey],
      queryFn: async () => {
        const response = await queryFn();

        if (!response.success) {
          throw new Error(response.error || 'Failed to fetch data');
        }

        return response.data as TData;
      },
    });
  };
}

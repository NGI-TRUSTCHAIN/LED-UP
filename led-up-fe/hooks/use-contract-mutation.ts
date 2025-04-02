import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAccount, useWalletClient } from 'wagmi';
import {
  ContractInteractionOptions,
  ContractName,
  ContractWriteResponse,
  TransactionResult,
} from '../features/data-registry/types';
import { getErrorHandler } from '@/utils/contract-interaction';
import { handleContractWrite } from '@/helpers/contract-interaction';

/**
 * Options for creating a contract mutation hook
 */
interface CreateContractMutationOptions<TParams> {
  mutationFn: (params: TParams) => Promise<ContractWriteResponse>;
  contractName?: ContractName;
  invalidateQueries?: (params: TParams, address?: string) => string[][];
  defaultRevalidatePath?: string;
}

/**
 * Factory function to create a contract mutation hook
 * @param options Options for creating the hook
 * @returns A custom hook for contract mutations
 */
export function createContractMutation<TParams = any>({
  mutationFn,
  contractName = ContractName.DataRegistry,
  invalidateQueries,
  defaultRevalidatePath,
}: CreateContractMutationOptions<TParams>) {
  return function useContractMutation(options: ContractInteractionOptions = {}) {
    const queryClient = useQueryClient();
    const { address } = useAccount();
    const { data: walletClient } = useWalletClient();
    const errorHandler = getErrorHandler(contractName);

    return useMutation<TransactionResult, Error, TParams>({
      mutationFn: async (params: TParams) => {
        if (!address || !walletClient) {
          throw new Error('Wallet not connected');
        }

        // Get transaction data from server action
        const response = await mutationFn(params);

        if (!response.success || !response.request) {
          throw new Error(response.error || 'Failed to prepare transaction');
        }

        const { contractAddress, abi, functionName, args } = response.request;

        // Execute the contract write
        return handleContractWrite(
          async () =>
            walletClient.writeContract({
              address: contractAddress,
              abi,
              functionName,
              args,
            }),
          {
            errorHandler,
            revalidatePath: options.revalidatePath || defaultRevalidatePath,
            onError: options.onError,
            onSuccess: options.onSuccess,
          }
        );
      },
      onSuccess: (_, variables) => {
        // Invalidate relevant queries if provided
        if (invalidateQueries) {
          const queriesToInvalidate = invalidateQueries(variables, address);
          queriesToInvalidate.forEach((queryKey) => {
            queryClient.invalidateQueries({ queryKey });
          });
        }
      },
    });
  };
}

/**
 * Factory function to create a simple contract mutation hook with predefined invalidation
 * @param mutationFn The mutation function
 * @param queryKeys Query keys to invalidate on success
 * @param contractName The contract name
 * @returns A custom hook for contract mutations
 */
export function createSimpleContractMutation<TParams = any>(
  mutationFn: (params: TParams) => Promise<ContractWriteResponse>,
  queryKeys: string[][],
  contractName = ContractName.DataRegistry,
  defaultRevalidatePath?: string
) {
  return createContractMutation<TParams>({
    mutationFn,
    contractName,
    invalidateQueries: () => queryKeys,
    defaultRevalidatePath,
  });
}

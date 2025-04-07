import { BaseErrorHandler } from './error-handler/BaseErrorHandler';

/**
 * Options for handling contract interactions
 */
interface ContractInteractionOptions {
  errorHandler: BaseErrorHandler;
  revalidatePath?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

/**
 * Handle a contract interaction with proper error handling
 * @param interaction The async contract interaction function
 * @param options Options for handling the interaction
 */
export async function handleContractInteraction<T>(
  interaction: () => Promise<T>,
  options: ContractInteractionOptions
): Promise<T> {
  try {
    const result = await interaction();
    if (options.onSuccess) {
      options.onSuccess(result);
    }
    return result;
  } catch (error) {
    // Get user-friendly error message
    const message = options.errorHandler.getUserFriendlyMessage(error);

    // Create an error with the user-friendly message
    const enhancedError = new Error(message);
    Object.assign(enhancedError, { originalError: error });

    // Call error callback if provided
    if (options.onError) {
      options.onError(enhancedError);
    }

    throw enhancedError;
  }
}

/**
 * Handle a contract write operation with proper error handling
 * @param writeOperation The async contract write operation
 * @param options Options for handling the operation
 */
export async function handleContractWrite<T>(
  writeOperation: () => Promise<`0x${string}`>,
  options: ContractInteractionOptions
): Promise<T> {
  return handleContractInteraction(async () => {
    // Execute the write operation to get transaction hash
    const hash = await writeOperation();

    // Process the transaction response
    const response = await processTransactionResponse(hash, options.revalidatePath);

    if (!response.success) {
      throw new Error(response.error || 'Transaction failed');
    }

    return {
      hash,
      events: response.events,
    } as T;
  }, options);
}

/**
 * Process a transaction response
 * @param hash The transaction hash
 * @param path Optional path to revalidate
 */
async function processTransactionResponse(
  hash: `0x${string}`,
  path?: string
): Promise<{ success: boolean; error?: string; events?: any[] }> {
  try {
    // Wait for transaction receipt and process events
    // This is where you'd implement your existing processTransactionResponse logic
    // For now, returning a simple success response
    return {
      success: true,
      events: [],
    };
  } catch (error) {
    // Here we specifically want to throw the raw error
    // It will be handled by the parent handleContractInteraction
    throw error;
  }
}

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { z } from 'zod';

import { CompensationABI, ERC20ABI } from '../../abi';
import { CompensationService } from '../../services/contracts/CompensationService';
import { TokenService } from '../../services/contracts/TokenService';

/**
 * Zod schema for validating address parameter
 */
const AddressSchema = z.object({
  address: z
    .string()
    .startsWith('0x')
    .length(42)
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address format'),
});

/**
 * Azure Function that retrieves the producer balance.
 *
 * This function handles the producer balance retrieval workflow by:
 * 1. Validating the input parameters
 * 2. Initializing the CompensationService with the contract address and ABI
 * 3. Retrieving the producer's balance
 * 4. Returning a standardized response with the balance information
 *
 * @param {HttpRequest} request - The HTTP request object
 * @param {InvocationContext} context - The Azure Functions invocation context
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HTTP response
 */
const handler = async (
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> => {
  const requestId = context.invocationId || `req-${Date.now()}`;
  context.log(`[${requestId}] Processing producer balance request for url "${request.url}"`);

  try {
    // Get and validate the producer address from query parameters
    const address = request.query.get('address');

    if (!address) {
      context.warn(`[${requestId}] Missing address parameter`);

      return {
        status: 400,
        jsonBody: {
          success: false,
          error: 'Missing parameter',
          message: 'The address parameter is required',
        },
      };
    }

    // Validate address format
    const validationResult = AddressSchema.safeParse({ address });

    if (!validationResult.success) {
      context.warn(`[${requestId}] Invalid address format`, {
        address,
        errors: validationResult.error.errors,
      });

      return {
        status: 400,
        jsonBody: {
          success: false,
          error: 'Invalid address format',
          details: validationResult.error.errors,
        },
      };
    }

    // Initialize service
    const compensationContractAddress = process.env.COMPENSATION_CONTRACT_ADDRESS;

    if (!compensationContractAddress) {
      context.error(`[${requestId}] Missing compensation contract address configuration`);

      return {
        status: 500,
        jsonBody: {
          success: false,
          error: 'Service configuration error',
          message: 'Compensation contract address not properly configured',
        },
      };
    }

    // Initialize service with contract ABI from the abi folder
    const compensationService = new CompensationService(
      compensationContractAddress,
      CompensationABI
    );

    // Get producer balance
    const balance = await compensationService.getProducerBalance(address);

    // Get token address and details for context
    const tokenAddress = await compensationService.getTokenAddress();
    const tokenService = new TokenService(tokenAddress, ERC20ABI);
    const decimals = await tokenService.decimals();
    const symbol = await tokenService.symbol();

    context.log(`[${requestId}] Retrieved producer balance for ${address}: ${balance}`);

    return {
      status: 200,
      jsonBody: {
        success: true,
        data: {
          producer: address,
          balance: balance.toString(),
          formattedBalance: formatTokenAmount(BigInt(balance), BigInt(decimals)),
          token: {
            address: tokenAddress,
            symbol,
            decimals,
          },
          timestamp: new Date().toISOString(),
        },
      },
    };
  } catch (error) {
    const errorMessage = 'Failed to retrieve producer balance';

    context.error(`[${requestId}] ${errorMessage}`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return {
      status: 500,
      jsonBody: {
        success: false,
        error: errorMessage,
        details: error instanceof Error ? error.message : String(error),
      },
    };
  }
};

/**
 * Format token amount with proper decimal places
 *
 * @param amount - The token amount as a BigInt
 * @param decimals - The number of decimals for the token as a BigInt
 * @returns Formatted token amount as a string
 */
function formatTokenAmount(amount: bigint, decimals: bigint): string {
  const divisor = BigInt(10) ** decimals;
  const integerPart = amount / divisor;
  const fractionalPart = amount % divisor;

  // Convert to string and pad with leading zeros if needed
  let fractionalStr = fractionalPart.toString();
  fractionalStr = fractionalStr.padStart(Number(decimals), '0');

  // Trim trailing zeros
  fractionalStr = fractionalStr.replace(/0+$/, '');

  if (fractionalStr === '') {
    return integerPart.toString();
  }

  return `${integerPart}.${fractionalStr}`;
}

/**
 * HTTP route configuration for the Azure Function to retrieve the producer balance.
 */
app.http('getProducerBalance', {
  methods: ['GET'],
  route: 'compensation/producer-balance',
  authLevel: 'anonymous',
  handler,
});

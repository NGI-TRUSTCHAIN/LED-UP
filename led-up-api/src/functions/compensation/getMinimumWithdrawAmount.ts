import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { CompensationABI, ERC20ABI } from '../../abi';
import { CompensationService } from '../../services/contracts/CompensationService';
import { TokenService } from '../../services/contracts/TokenService';

/**
 * Azure Function that retrieves the minimum withdraw amount.
 *
 * This function handles the minimum withdraw amount retrieval workflow by:
 * 1. Initializing the CompensationService with the contract address and ABI
 * 2. Retrieving the minimum withdraw amount
 * 3. Getting token information for context
 * 4. Returning a standardized response with the amount information
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
  context.log(`[${requestId}] Processing minimum withdraw amount request for url "${request.url}"`);

  try {
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

    // Get minimum withdraw amount
    const minimumWithdrawAmount = await compensationService.getMinimumWithdrawAmount();

    // Get token information for context
    const tokenAddress = await compensationService.getTokenAddress();
    const tokenService = new TokenService(tokenAddress, ERC20ABI);
    const symbol = await tokenService.symbol();
    const decimals = await tokenService.decimals();

    // Convert to BigInt for formatting
    const minimumWithdrawAmountBigInt = BigInt(minimumWithdrawAmount.toString());

    // Format the amount for display
    const formattedAmount = formatTokenAmount(minimumWithdrawAmountBigInt, BigInt(decimals));

    context.log(`[${requestId}] Retrieved minimum withdraw amount: ${minimumWithdrawAmount}`);

    return {
      status: 200,
      jsonBody: {
        success: true,
        data: {
          minimumWithdrawAmount: minimumWithdrawAmount.toString(),
          formattedAmount,
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
    const errorMessage = 'Failed to retrieve minimum withdraw amount';

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
 * HTTP route configuration for the Azure Function to retrieve the minimum withdraw amount.
 */
app.http('getMinimumWithdrawAmount', {
  methods: ['GET'],
  route: 'compensation/minimum-withdraw-amount',
  authLevel: 'anonymous',
  handler,
});

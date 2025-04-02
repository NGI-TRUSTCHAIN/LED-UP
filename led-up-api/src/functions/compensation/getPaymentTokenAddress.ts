import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { CompensationABI, ERC20ABI } from '../../abi';
import { CompensationService } from '../../services/contracts/CompensationService';
import { TokenService } from '../../services/contracts/TokenService';

/**
 * Azure Function that retrieves the payment token address.
 *
 * This function handles the payment token address retrieval workflow by:
 * 1. Initializing the CompensationService with the contract address and ABI
 * 2. Retrieving the payment token address
 * 3. Getting additional token information
 * 4. Returning a standardized response with the token information
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
  context.log(`[${requestId}] Processing payment token address request for url "${request.url}"`);

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

    // Get token address
    const tokenAddress = await compensationService.getTokenAddress();

    // Get additional token information
    const tokenService = new TokenService(tokenAddress, ERC20ABI);
    const name = await tokenService.name();
    const symbol = await tokenService.symbol();
    const decimals = await tokenService.decimals();
    const totalSupply = await tokenService.totalSupply();

    context.log(`[${requestId}] Retrieved payment token address: ${tokenAddress}`);

    return {
      status: 200,
      jsonBody: {
        success: true,
        data: {
          address: tokenAddress,
          name,
          symbol,
          decimals,
          totalSupply: totalSupply.toString(),
          network: process.env.NETWORK_NAME || 'mainnet',
          timestamp: new Date().toISOString(),
        },
      },
    };
  } catch (error) {
    const errorMessage = 'Failed to retrieve payment token address';

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
 * HTTP route configuration for the Azure Function to retrieve the payment token address.
 */
app.http('getPaymentTokenAddress', {
  methods: ['GET'],
  route: 'compensation/token-address',
  authLevel: 'anonymous',
  handler,
});

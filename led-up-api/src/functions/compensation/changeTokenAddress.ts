import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { z } from 'zod';

import { CompensationABI, ERC20ABI } from '../../abi';
import { CompensationService } from '../../services/contracts/CompensationService';
import { TokenService } from '../../services/contracts/TokenService';

/**
 * Zod schema for validating token address parameter
 */
const TokenAddressSchema = z.object({
  address: z
    .string()
    .startsWith('0x')
    .length(42)
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address format'),
});

/**
 * Azure Function that changes the payment token address in the Compensation smart contract.
 *
 * This function handles the token address update workflow by:
 * 1. Validating the input parameters
 * 2. Initializing the CompensationService with the contract address and ABI
 * 3. Verifying the new token address is a valid ERC20 token
 * 4. Updating the token address on the blockchain
 * 5. Returning a standardized response with the transaction receipt
 *
 * @param {HttpRequest} request - The HTTP request object containing the new token address
 * @param {InvocationContext} context - The Azure Functions invocation context
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HTTP response
 */
const handler = async (
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> => {
  const requestId = context.invocationId || `req-${Date.now()}`;
  context.log(`[${requestId}] Processing change token address request for url "${request.url}"`);

  try {
    // Parse and validate request body
    const requestBody = await request.json();
    const validationResult = TokenAddressSchema.safeParse(requestBody);

    if (!validationResult.success) {
      context.warn(`[${requestId}] Invalid token address format`, {
        errors: validationResult.error.errors,
      });

      return {
        status: 400,
        jsonBody: {
          success: false,
          error: 'Invalid token address format',
          details: validationResult.error.errors,
        },
      };
    }

    const { address } = validationResult.data;

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

    // Verify the token address is a valid ERC20 token
    try {
      const tokenService = new TokenService(address, ERC20ABI);
      await tokenService.name(); // This will throw if the address is not a valid ERC20 token
    } catch (error) {
      context.warn(`[${requestId}] Invalid ERC20 token address`, {
        address,
        error: error instanceof Error ? error.message : String(error),
      });

      return {
        status: 400,
        jsonBody: {
          success: false,
          error: 'Invalid ERC20 token address',
          details: 'The provided address does not implement the ERC20 interface',
        },
      };
    }

    // Get current token address for comparison
    const currentTokenAddress = await compensationService.getTokenAddress();

    // Change token address
    context.log(`[${requestId}] Changing token address from ${currentTokenAddress} to ${address}`);
    const receipt = await compensationService.changeTokenAddress(address);

    context.log(`[${requestId}] Token address changed successfully`, {
      transactionHash: receipt.transactionHash,
      oldAddress: currentTokenAddress,
      newAddress: address,
    });

    return {
      status: 200,
      jsonBody: {
        success: true,
        data: {
          receipt,
          token: {
            previous: currentTokenAddress,
            current: address,
          },
          timestamp: new Date().toISOString(),
        },
      },
    };
  } catch (error) {
    let status = 500;
    let errorMessage = 'Failed to change token address';

    // Check for specific blockchain errors
    if (error instanceof Error) {
      if (error.message.includes('not owner')) {
        status = 403;
        errorMessage = 'Not authorized to change token address';
      } else if (error.message.includes('invalid address')) {
        status = 400;
        errorMessage = 'Invalid token address format';
      }
    }

    context.error(`[${requestId}] ${errorMessage}`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return {
      status,
      jsonBody: {
        success: false,
        error: errorMessage,
        details: error instanceof Error ? error.message : String(error),
      },
    };
  }
};

/**
 * HTTP route configuration for the Azure Function to change the token address.
 */
app.http('changeTokenAddress', {
  methods: ['POST'],
  route: 'compensation/update-token-address',
  authLevel: 'function',
  handler,
});

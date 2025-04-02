import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { z } from 'zod';

import { getContractABI } from '../../helpers/contract-loader';
import { CompensationService } from '../../services/contracts/CompensationService';
import { TokenService } from '../../services/contracts/TokenService';
import { ProcessPaymentParams } from '../../types';

/**
 * Zod schema for validating payment request parameters
 */
const PaymentRequestSchema = z.object({
  producer: z.string().startsWith('0x').length(42),
  recordId: z.string().min(1),
  dataSize: z.number().positive(),
});

/**
 * Azure Function that processes a payment for data usage.
 *
 * This function handles the payment processing workflow by:
 * 1. Validating the input parameters
 * 2. Initializing the required services
 * 3. Calculating the payment amount based on unit price and data size
 * 4. Approving the token transfer
 * 5. Processing the payment through the smart contract
 * 6. Returning a standardized response
 *
 * @param {HttpRequest} request - The HTTP request object containing the payment parameters
 * @param {InvocationContext} context - The Azure Functions invocation context
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HTTP response
 */
const handler = async (
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> => {
  const requestId = context.invocationId || `req-${Date.now()}`;
  context.log(`[${requestId}] Processing payment request for url "${request.url}"`);

  try {
    // Parse and validate request body
    const requestBody = await request.json();
    const validationResult = PaymentRequestSchema.safeParse(requestBody);

    if (!validationResult.success) {
      context.warn(`[${requestId}] Invalid request parameters`, {
        errors: validationResult.error.errors,
      });

      return {
        status: 400,
        jsonBody: {
          success: false,
          error: 'Invalid request parameters',
          details: validationResult.error.errors,
        },
      };
    }

    const params = validationResult.data as ProcessPaymentParams;

    // Initialize services
    const compensationContractAddress = process.env.COMPENSATION_CONTRACT_ADDRESS;
    const tokenContractAddress = process.env.TOKEN_CONTRACT_ADDRESS;

    if (!compensationContractAddress || !tokenContractAddress) {
      context.error(`[${requestId}] Missing contract configuration`, {
        compensationContractAddress: !!compensationContractAddress,
        tokenContractAddress: !!tokenContractAddress,
      });

      return {
        status: 500,
        jsonBody: {
          success: false,
          error: 'Service configuration error',
          message: 'Contract addresses not properly configured',
        },
      };
    }

    // Initialize services with contract ABIs
    const compensationABI = await getContractABI('Compensation');
    const tokenABI = await getContractABI('Token');

    const compensationService = new CompensationService(
      compensationContractAddress,
      compensationABI
    );
    const tokenService = new TokenService(tokenContractAddress, tokenABI);

    // Get current unit price from the contract
    const unitPrice = await compensationService.getUnitPrice();

    // Calculate payment amount
    const paymentAmount = BigInt(params.dataSize) * BigInt(unitPrice);

    context.log(`[${requestId}] Calculated payment amount`, {
      producer: params.producer,
      recordId: params.recordId,
      dataSize: params.dataSize,
      unitPrice,
      paymentAmount: paymentAmount.toString(),
    });

    // Approve token transfer
    context.log(`[${requestId}] Approving token transfer`);
    await tokenService.approve(compensationContractAddress, paymentAmount);

    // Process payment
    context.log(`[${requestId}] Processing payment`);
    const receipt = await compensationService.processPayment(params);

    context.log(`[${requestId}] Payment processed successfully`, {
      transactionHash: receipt.transactionHash,
    });

    return {
      status: 200,
      jsonBody: {
        success: true,
        data: {
          receipt,
          paymentDetails: {
            producer: params.producer,
            recordId: params.recordId,
            dataSize: params.dataSize,
            unitPrice: unitPrice.toString(),
            amount: paymentAmount.toString(),
          },
        },
      },
    };
  } catch (error) {
    // Handle specific error types
    let status = 500;
    let errorMessage = 'Failed to process payment';

    if (error instanceof z.ZodError) {
      status = 400;
      errorMessage = 'Invalid request format';
    } else if (error instanceof Error) {
      // Check for specific blockchain errors
      if (error.message.includes('insufficient funds')) {
        status = 402;
        errorMessage = 'Insufficient funds to process payment';
      } else if (error.message.includes('user rejected')) {
        status = 400;
        errorMessage = 'Transaction was rejected';
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
 * HTTP route configuration for the Azure Function to process a payment.
 */
app.http('processPayment', {
  methods: ['POST'],
  route: 'compensation/process-payment',
  authLevel: 'function',
  handler,
});

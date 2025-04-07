import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { ipfsService } from '../../services';

/**
 * Updates the blockchain by uploading encrypted data to IPFS.
 * This function handles HTTP requests to pin and encrypt data on IPFS,
 * returning the CID and other metadata about the uploaded content.
 *
 * @param request - The incoming HTTP request
 * @param context - The function invocation context
 * @returns A response containing upload status and IPFS CID
 */
export async function updateBlockchain(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  // Use multiple logging methods to debug the issue
  context.log('Received request to update blockchain by uploading to IPFS');

  try {
    // Use the improved IPFS service to handle the request
    const result = await ipfsService.handleUpdateBlockchain(request, context);

    // Log after service call
    context.log('IPFS upload completed successfully', JSON.stringify(result.jsonBody, null, 2));
    console.log('DEBUG: IPFS operation successful via console.log');

    return result;
  } catch (error) {
    // Log error with all available details
    context.error(`Unhandled error in updateBlockchain: ${error}`);
    if (error instanceof Error) {
      context.error('Error details:', error.message);
      context.error('Error stack:', error.stack);
    }
    console.error('DEBUG error via console.error:', error);

    return {
      status: 500,
      jsonBody: {
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'An unexpected error occurred while processing the request',
      },
    };
  }
}

/**
 * Azure Function configuration for handling HTTP requests to update the blockchain.
 */
app.http('updateBlockchain', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'ipfs/pin',
  handler: updateBlockchain,
});

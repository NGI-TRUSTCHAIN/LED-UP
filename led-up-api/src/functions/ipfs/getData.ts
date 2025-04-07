import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { ipfsService } from '../../services';

/**
 * Retrieves data from IPFS without decryption.
 * This function handles HTTP requests to fetch raw data from IPFS
 * or return service information when no CID is provided.
 *
 * @param request - The incoming HTTP request, optionally containing a CID
 * @param context - The function invocation context
 * @returns A response containing the raw IPFS data or service information
 */
export async function getData(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('Received request to get data or service information');

  try {
    // Use the improved IPFS service to handle the request
    return await ipfsService.handleGetData(request, context);
  } catch (error) {
    context.error(`Unhandled error in getData: ${error}`);
    return {
      status: 500,
      jsonBody: {
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'An unexpected error occurred while retrieving data',
      },
    };
  }
}

/**
 * Azure Function configuration for handling HTTP requests to fetch data.
 */
app.http('getData', {
  methods: ['GET', 'POST'],
  authLevel: 'anonymous',
  route: 'ipfs/getData',
  handler: getData,
});

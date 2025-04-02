import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { IPFSService } from '../../services/ipfs/IPFSService';

/**
 * Retrieves and decrypts data from IPFS using the provided CID.
 * This function handles HTTP requests to fetch encrypted data from IPFS,
 * decrypt it using the server's encryption key, and return the decrypted data.
 *
 * @param request - The incoming HTTP request containing a CID
 * @param context - The function invocation context
 * @returns A response containing the decrypted data and metadata
 */
export async function getIPFSData(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.info('Processing request to fetch and decrypt IPFS data');

  try {
    // Create a new instance of IPFSService
    const ipfsService = new IPFSService();

    // Use the updated handleGetIPFSData method which handles errors properly
    return await ipfsService.handleGetIPFSData(request, context);
  } catch (error) {
    // This catch block is a safety measure to prevent the Azure Function from crashing
    // if there's an unexpected error not handled by the IPFSService
    context.error(
      `Unhandled error in getIPFSData function: ${error instanceof Error ? error.message : 'Unknown error'}`
    );

    return {
      status: 500,
      jsonBody: {
        success: false,
        message: 'Failed to retrieve IPFS data',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}

/**
 * HTTP route configuration for the Azure Function to retrieve and decrypt IPFS data.
 */
app.http('getIPFSData', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'getData',
  handler: getIPFSData,
});

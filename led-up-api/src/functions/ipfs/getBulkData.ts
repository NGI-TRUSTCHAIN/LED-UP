import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { IPFSService } from '../../services/ipfs/IPFSService';

/**
 * Azure Function to retrieve multiple IPFS data items in a single request.
 * This function accepts an array of CIDs and returns the corresponding data for each.
 * It gracefully handles invalid or non-existent CIDs without crashing.
 *
 * @param request HTTP request containing an array of CIDs
 * @param context Azure Functions invocation context
 * @returns HTTP response with the retrieved data for each CID
 */
export async function getBulkData(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.info('Processing bulk IPFS data retrieval request');

  try {
    // Create a new instance of IPFSService
    const ipfsService = new IPFSService();

    // Use the existing handleGetBulkData method which has been enhanced
    // to handle errors for individual CIDs without crashing
    return await ipfsService.handleGetBulkData(request, context);
  } catch (error) {
    // This catch block is a safety measure to prevent the Azure Function from crashing
    // if there's an unexpected error not handled by the IPFSService
    context.error(
      `Unhandled error in getBulkData function: ${error instanceof Error ? error.message : 'Unknown error'}`
    );

    return {
      status: 500,
      jsonBody: {
        success: false,
        message: 'Failed to retrieve bulk IPFS data',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}

// Register the Azure Function
app.http('getBulkData', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'ipfs/getBulkData',
  handler: getBulkData,
});

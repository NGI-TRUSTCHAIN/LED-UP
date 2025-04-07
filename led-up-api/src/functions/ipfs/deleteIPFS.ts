import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { ipfsService } from '../../services';

/**
 * Unpins data from IPFS using the provided CID.
 * This function handles HTTP requests to delete (unpin) content from IPFS,
 * removing it from Pinata's pinned storage.
 *
 * @param request - The incoming HTTP request containing the CID to unpin
 * @param context - The function invocation context
 * @returns A response indicating success or failure of the unpin operation
 */
export async function deleteIPFS(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('Received request to unpin data from IPFS');

  try {
    // Use the improved IPFS service to handle the request
    return await ipfsService.handleDeleteIPFS(request, context);
  } catch (error) {
    context.error(`Unhandled error in deleteIPFS: ${error}`);
    return {
      status: 500,
      jsonBody: {
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'An unexpected error occurred while deleting data from IPFS',
      },
    };
  }
}

/**
 * HTTP route configuration for the Azure Function to delete data from IPFS.
 */
app.http('deleteIPFS', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'ipfs/:cid',
  handler: deleteIPFS,
});

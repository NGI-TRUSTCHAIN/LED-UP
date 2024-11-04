import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { fetchFromIPFS } from '../utils/fetch-ipfs';

/**
 * Azure Function that handles HTTP requests to delete data from IPFS using a CID.
 *
 
 */

/**
 * Deletes data from IPFS based on the provided Content Identifier (CID).
 *
 * This function retrieves the CID from the query parameters and attempts to delete the corresponding
 * data from IPFS. If the CID is not provided, a 400 Bad Request response is returned.
 * In case of an error during the deletion process, a 500 Internal Server Error response is returned
 * with a message indicating the failure.
 *
 * @param {HttpRequest} request - The HTTP request object containing information about the incoming request.
 * @param {InvocationContext} context - The context object providing information about the execution of the function.
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HttpResponseInit object containing the response data.
 *
 * @throws Will throw an error if fetching data from IPFS fails.
 *
 * @example
 * Example Request:
 * DELETE /ipfs/QmYwAPJzv5CZsnAzt8auVZRnD4v1tYqM2ULw3qG3B8Bf6Q
 *
 * Query Parameters:
 * - cid: The Content Identifier (CID) for the IPFS data to be deleted.
 *
 * Example Response:
 * Status: 200
 * Body:
 * {
 *   "message": "Data deleted successfully."
 * }
 *
 * Error Responses:
 * Status: 400
 * Body:
 * "Please provide a cid"
 *
 * Status: 500
 * Body:
 * {
 *   "error": "Detailed error message",
 *   "message": "Failed to delete data from IPFS"
 * }
 */
export default async function deleteIPFS(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);
  const cid = await request.query.get('cid');

  if (!cid) {
    return {
      status: 400,
      jsonBody: 'Please provide a cid',
    };
  }

  try {
    const res = await fetchFromIPFS(cid);

    return {
      status: 200,
      jsonBody: res,
    };
  } catch (error) {
    context.error(`Error deleting data: ${error}`);
    return {
      status: 500,
      jsonBody: {
        error: error,
        message: 'Failed to delete data from IPFS',
      },
    };
  }
}

/**
 * HTTP route configuration for the Azure Function to delete data from IPFS.
 */
app.http('DeleteIPFS', {
  methods: ['DELETE'],
  route: 'ipfs/:cid',
  authLevel: 'anonymous',
  handler: deleteIPFS,
});

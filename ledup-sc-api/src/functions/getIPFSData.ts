import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { decrypt, toCipherKey } from '../utils/encrypt';
import { fetchFromIPFS } from '../utils/fetch-ipfs';
// import { sign } from '../helpers/sign';
// import { hashData } from '../utils/hash-data';

/**
 * Azure Function that retrieves and decrypts data from IPFS using a CID.
 *
 
 */

/**
 * Retrieves data from IPFS using the provided CID, decrypts the data,
 * and returns the decrypted result in the HTTP response.
 *
 * This function processes a GET request and expects a `cid` parameter
 * either as a path parameter or as a query parameter. If successful,
 * it returns a 200 OK response with the decrypted data. In case of an
 * error during the retrieval or decryption process, a 500 Internal Server Error
 * response is returned with a message indicating the failure.
 *
 * @param {HttpRequest} request - The HTTP request object containing information about the incoming request.
 * @param {InvocationContext} context - The context object providing information about the execution of the function.
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HttpResponseInit object containing the response data.
 *
 * @throws Will throw an error if fetching or decrypting the data fails.
 *
 * @example
 * Example Request:
 * GET /ipfs?cid=QmTzQwD1u...
 *
 * Example Response:
 * Status: 200
 * Body:
 * {
 *   "data": { ...decrypted data... },
 *   "res": { ...raw IPFS data... }
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
 *   "message": "Failed to retrieve data from IPFS"
 * }
 */
export default async function getIPFSData(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);

  const cid = request.params.cid || (await request.query.get('cid'));
  const key = process.env.ENCRYPTION_KEY as string;
  if (!cid) {
    return {
      status: 400,
      jsonBody: 'Please provide a cid',
    };
  }

  try {
    const res = await fetchFromIPFS(cid);
    const decrypted = decrypt(res, toCipherKey(key));
    // const hash = await hashData(
    //   JSON.stringify({
    //     resourceType: 'Patient',
    //     id: 'd0658787-9eeb-4b40-9053-09e1adacdf6a',
    //     meta: {
    //       versionId: '1',
    //       lastUpdated: '2024-04-19T04:55:59.038+00:00',
    //     },
    //     active: true,
    //     name: [
    //       {
    //         use: 'official',
    //         family: 'Smith',
    //         given: ['Lisa', 'Marie'],
    //       },
    //       {
    //         use: 'usual',
    //         given: ['Lisa'],
    //       },
    //     ],
    //     gender: 'female',
    //     birthDate: '1974-12-25',
    //   })
    // );
    // console.log('Hash:', hash);
    return {
      status: 200,
      jsonBody: {
        data: decrypted,
        res: res,
      },
    };
  } catch (error) {
    context.error(`Error fetching data: ${error}`);
    return {
      status: 500,
      jsonBody: {
        error: error,
        message: 'Failed to retrieve data from IPFS',
      },
    };
  }
}

/**
 * HTTP route configuration for the Azure Function to retrieve and decrypt IPFS data.
 */
app.http('GetIPFSData', {
  methods: ['GET'],
  route: 'ipfs',
  authLevel: 'anonymous',
  handler: getIPFSData,
});

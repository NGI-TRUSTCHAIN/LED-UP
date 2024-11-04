import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { uploadToIPFS } from '../utils/pin-json';
import { encrypt, toCipherKey } from '../utils/encrypt';

/**
 * Azure Function to update the blockchain by uploading encrypted data to IPFS.
 *
 * This function handles POST and PUT requests, encrypts the incoming data, uploads it to IPFS,
 * and returns the response from IPFS or an error message if the upload fails.
 *
 * @param {HttpRequest} request - The incoming HTTP request.
 * @param {InvocationContext} context - The execution context of the function.
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HTTP response.
 */
export default async function updateBlockchain(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);

  const body = (await request.json()) as { name: string; data: any }; // Define the expected structure of the request body
  const key = process.env.ENCRYPTION_KEY as string;

  try {
    // Encrypt the data and get the encrypted content
    const encryptedData = encrypt(JSON.stringify(body.data), toCipherKey(key));

    console.log('Uploading to IPFS...');

    const res = await uploadToIPFS({
      pinataContent: encryptedData,
      pinataMetadata: {
        name: body.name,
      },
      pinataOptions: {
        cidVersion: 1,
      },
    });

    console.log({
      requestBody: body,
      ipfsResponse: res,
      encryptionKey: key, // Consider logging sensitive information with caution
    });

    return {
      status: 200,
      jsonBody: res, // Return the response from IPFS
    };
  } catch (error: any) {
    context.error(`Error Uploading Data: ${error}`);

    return {
      status: 500,
      jsonBody: {
        error: error.response ? error.response.data : error.message, // Handle error response
        message: 'Failed to create resource',
      },
    };
  }
}

/**
 * Azure Function configuration for handling HTTP requests to update the blockchain.
 */
app.http('UpdateBlockchain', {
  methods: ['POST', 'PUT'], // Supports both POST and PUT requests
  route: 'pin', // The route for this function
  authLevel: 'anonymous', // No authentication required
  handler: updateBlockchain, // The function to handle the requests
});

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { provider } from '../helpers/provider';
import { signer } from '../helpers/get-signer';
import callContract, {
  getProviderMetadata,
  getProducerRecordCount,
  getRecordSchema,
  paused,
} from '../helpers/view-query';

/**
 * Azure Function to fetch various metadata and blockchain-related data.
 *
 * This function handles GET requests to retrieve information such as
 * the block number, transaction nonce, contract details, and more.
 *
 * @param {HttpRequest} request - The incoming HTTP request.
 * @param {InvocationContext} context - The execution context of the function.
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HTTP response.
 */
const getData = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    // Fetch necessary blockchain and contract data
    const blockNumber = await provider.getBlockNumber();
    const address = await signer.getAddress();
    const nonce = await provider.getTransactionCount(address);

    return {
      status: 200,
      jsonBody: {
        address,
        contract: process.env.CONTRACT_ADDRESS,
        owner_address: process.env.OWNER_ADDRESS,
        blockNumber,
        nonce,
        callContract: await callContract(''), // Consider providing a specific argument for clarity
        txCount: nonce, // Reuse the fetched nonce for transaction count
        ownerMetadata: await getProviderMetadata(),
        schema: await getRecordSchema(),
        // Uncomment and adjust the producer address as needed
        // count: await getProducerRecordCount("0x0000000000000000000000000000000000000000"),
        pauseState: await paused(),
      },
    };
  } catch (error) {
    context.error(`Error fetching data: ${error}`);

    // Return a structured error response
    return {
      status: 500,
      jsonBody: {
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to retrieve data from IPFS',
      },
    };
  }
};

/**
 * Azure Function configuration for handling HTTP requests to fetch data.
 */
app.http('GetData', {
  methods: ['GET'], // Only supports GET requests
  route: 'getData', // The route for this function
  authLevel: 'anonymous', // No authentication required
  handler: getData, // The function to handle the requests
});

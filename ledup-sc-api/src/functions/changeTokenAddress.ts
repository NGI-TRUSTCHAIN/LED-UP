import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { changeTokenAddress } from '../helpers/update-query';
import { AddressParam } from '../types';

/**
 * Azure Function that handles HTTP requests to change the token address.
 *
 
 */

/**
 * HTTP handler function that processes requests to change the token address.
 *
 * @param {HttpRequest} request - The HTTP request object containing information about the incoming request.
 * @param {InvocationContext} context - The context object providing information about the execution of the function.
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HttpResponseInit object containing the response data.
 *
 * @throws Will throw an error if changing the token address fails.
 */
const handler = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    const { address } = (await request.json()) as AddressParam;
    const receipt = await changeTokenAddress(address);
    return {
      status: 200,
      jsonBody: {
        receipt,
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
};

/**
 * HTTP route configuration for the Azure Function to change the token address.
 */
app.http('changeTokenAddress', {
  methods: ['POST'],
  route: 'changeTokenAddress',
  authLevel: 'anonymous',
  handler,
});

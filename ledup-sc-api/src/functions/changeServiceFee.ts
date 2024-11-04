import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { changeServiceFee } from '../helpers/update-query';
import { ValueParam } from '../types';

/**
 * Azure Function that handles HTTP requests to change the service fee.
 *
 
 */

/**
 * HTTP handler function that processes requests to change the service fee.
 *
 * @param {HttpRequest} request - The HTTP request object containing information about the incoming request.
 * @param {InvocationContext} context - The context object providing information about the execution of the function.
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HttpResponseInit object containing the response data.
 *
 * @throws Will throw an error if changing the service fee fails.
 */
const handler = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    const { value } = (await request.json()) as ValueParam;
    const receipt = await changeServiceFee(value);
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
 * HTTP route configuration for the Azure Function to change the service fee.
 */
app.http('changeSeviceFee', {
  methods: ['POST'],
  route: 'changeSeviceFee',
  authLevel: 'anonymous',
  handler,
});

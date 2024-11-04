import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { changePauseState } from '../helpers/update-query';
import { PauseParam } from '../types';

/**
 * Azure Function that handles HTTP requests to change the pause state of a resource.
 * Represents the parameters required to change the pause state.
 *
 * @typedef {Object} PauseParam
 * @property {boolean} pause - Indicates whether to pause (true) or unpause (false) the resource.
 */

/**
 * HTTP handler function that processes requests to change the pause state.
 *
 * @param {HttpRequest} request - The HTTP request object containing information about the incoming request.
 * @param {InvocationContext} context - The context object provides information about the execution of the function.
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HttpResponseInit object containing the response data.
 *
 * @throws Will throw an error if changing the pause state fails.
 */
const handler = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    const { pause } = (await request.json()) as PauseParam;
    const receipt = await changePauseState(pause);
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
 * HTTP route configuration for the Azure Function.
 */
app.http('changePauseState', {
  methods: ['POST'],
  route: 'changePauseState',
  authLevel: 'anonymous',
  handler,
});

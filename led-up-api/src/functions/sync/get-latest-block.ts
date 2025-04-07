import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { readLatestBlocks } from '../../services/db/writeToDatabase';

const getCompletedBlocks = async function (
  req: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('HTTP trigger function processed a request:', req.url);
  try {
    const result = await readLatestBlocks();

    return {
      status: 200,
      jsonBody: {
        data: result,
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

export default getCompletedBlocks;

/**
 * HTTP route configuration for the Azure Function.
 */
app.http('getCompletedBlocks', {
  methods: ['GET'],
  route: 'getCompletedBlocks',
  handler: getCompletedBlocks,
});

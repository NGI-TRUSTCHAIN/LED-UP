import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { pauseService } from '../helpers/update-query';

const handler = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    const receipt = await pauseService();
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

app.http('pauseCompensation', {
  methods: ['POST'],
  route: 'pauseCompensation',
  authLevel: 'anonymous',
  handler,
});

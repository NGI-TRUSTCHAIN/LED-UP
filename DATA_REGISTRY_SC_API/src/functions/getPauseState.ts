import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { paused } from '../helpers/view-query';

const handler = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);
  try {
    const pauseState = await paused();

    return {
      status: 200,
      jsonBody: {
        pause: pauseState,
      },
    };
  } catch (error) {
    context.error(`Error fetching data: ${error}`);
    return {
      status: 500,
      jsonBody: {
        error: error,
        message: 'Failed to retrieve pause state',
      },
    };
  }
};

app.http('getPauseState', {
  methods: ['GET'],
  route: 'pauseState',
  authLevel: 'anonymous',
  handler,
});

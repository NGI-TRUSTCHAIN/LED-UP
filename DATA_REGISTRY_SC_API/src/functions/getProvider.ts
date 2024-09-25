import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getProvider } from '../helpers/view-query';

const handler = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    const provider = await getProvider();
    return {
      status: 200,
      jsonBody: {
        provider,
      },
    };
  } catch (error) {
    context.error(`Error fetching data: ${error}`);
    return {
      status: 500,
      jsonBody: {
        error: error,
        message: 'Failed to retrieve provider',
      },
    };
  }
};

app.http('GetProvider', {
  methods: ['GET'],
  route: 'provider',
  authLevel: 'anonymous',
  handler,
});

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getProviderMetadata } from '../helpers/view-query';

const handler = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    const metadata = await getProviderMetadata();
    return {
      status: 200,
      jsonBody: {
        metadata,
      },
    };
  } catch (error) {
    context.error(`Error fetching data: ${error}`);
    return {
      status: 500,
      jsonBody: {
        error: error,
        message: 'Failed to retrieve provider metadata',
      },
    };
  }
};

app.http('getProviderMetadata', {
  methods: ['GET'],
  route: 'getProviderMetadata',
  authLevel: 'anonymous',
  handler,
});

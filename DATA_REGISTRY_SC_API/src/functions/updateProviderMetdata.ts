import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { updateProviderMetadata } from '../helpers/update-query';
import { Metadata } from '../types';

const handler = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    const data = (await request.json()) as Metadata;
    const receipt = await updateProviderMetadata(data);
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
        message: 'Failed to update provider metadata',
      },
    };
  }
};

app.http('updateProviderMetadata', {
  methods: ['PUT', 'POST'],
  route: 'updateProviderMetadata',
  authLevel: 'anonymous',
  handler,
});

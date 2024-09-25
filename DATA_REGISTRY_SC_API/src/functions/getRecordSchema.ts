import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getRecordSchema } from '../helpers/view-query';

const handler = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    const schema = await getRecordSchema();
    return {
      status: 200,
      jsonBody: {
        schema,
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

app.http('getRecordSchema', {
  methods: ['GET'],
  route: 'getRecordSchema',
  authLevel: 'anonymous',
  handler,
});

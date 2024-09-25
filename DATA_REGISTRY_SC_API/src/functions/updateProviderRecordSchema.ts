import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { updateProviderRecordSchema } from '../helpers/update-query';
import { RecordSchema } from '../types';

const handler = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    const schema = (await request.json()) as RecordSchema;

    const receipt = await updateProviderRecordSchema(schema);

    return {
      status: 200,
      jsonBody: {
        receipt,
      },
    };
  } catch (error) {
    context.error(`Error Updating: ${error}`);
    return {
      status: 500,
      jsonBody: {
        error: error,
        message: 'Failed to update the provider record schema',
      },
    };
  }
};

app.http('updateProviderRecordSchema', {
  methods: ['PUT', 'POST'],
  route: 'updateProviderRecordSchema',
  authLevel: 'anonymous',
  handler,
});

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getProducerRecord } from '../helpers/view-query';

const handler = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    const producer = (await request.query.get('producer')) as string;
    const recordId = (await request.query.get('recordId')) as string;
    context.log(`Fetching record for producer: ${producer} with recordId: ${recordId}`);
    const record = await getProducerRecord(producer, recordId);
    return {
      status: 200,
      jsonBody: {
        record,
      },
    };
  } catch (error) {
    context.error(`Error fetching data: ${error}`);
    return {
      status: 500,
      jsonBody: {
        error: error,
        message: 'Failed to retrieve producer record',
      },
    };
  }
};

app.http('getProducerRecord', {
  methods: ['GET'],
  route: 'getProducerRecord',
  authLevel: 'anonymous',
  handler,
});

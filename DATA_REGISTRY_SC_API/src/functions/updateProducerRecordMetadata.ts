import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { updateProducerRecordMetadata } from '../helpers/update-query';

const handler = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    const data = (await request.json()) as {
      producer: string;
      recordId: string;
      metadata: {
        cid: string;
        url: string;
        hash: string;
      };
    };
    const receipt = await updateProducerRecordMetadata(data.producer, data.recordId, data.metadata);
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

app.http('updateProducerRecordMetadata', {
  methods: ['PUT', 'POST'],
  route: 'updateProducerRecordMetadata',
  authLevel: 'anonymous',
  handler,
});

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { updateProducerRecordStatus } from '../helpers/update-query';

const handler = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    const data = (await request.json()) as {
      producer: string;
      status: number;
    };

    const receipt = await updateProducerRecordStatus(data.producer, data.status);

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

app.http('updateProducerRecordStatus', {
  methods: ['PUT', 'POST'],
  route: 'updateProducerRecordStatus',
  authLevel: 'anonymous',
  handler,
});

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { updateProducerConsent } from '../helpers/update-query';
import { stringifyBigInt } from '../helpers/bigIntStringify';

const handler = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    const data = (await request.json()) as {
      producer: string;
      status: number;
    };

    const receipt = await updateProducerConsent(data.producer, data.status);
    return {
      status: 200,
      jsonBody: stringifyBigInt(receipt),
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

app.http('updateProducerConsent', {
  methods: ['PUT', 'POST'],
  route: 'updateProducerConsent',
  authLevel: 'anonymous',
  handler,
});

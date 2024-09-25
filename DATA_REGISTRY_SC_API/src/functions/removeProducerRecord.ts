import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { removeProducerRecord } from '../helpers/update-query';
import { stringifyBigInt } from '../helpers/bigIntStringify';

const handler = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);
  const data = (await request.json()) as { producer: string };
  try {
    console.log({ data });
    const receipt = await removeProducerRecord(data.producer);

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

app.http('removeProducerRecord', {
  methods: ['POST'],
  route: 'removeProducerRecord',
  authLevel: 'anonymous',
  handler,
});

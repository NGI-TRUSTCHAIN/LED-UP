import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getProducerRecordStatus } from '../helpers/view-query';
import { stringifyBigInt } from '../helpers/bigIntStringify';

const handler = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    const producer = (await request.query.get('producer')) as string;
    const status = await getProducerRecordStatus(producer);
    console.log({ status });
    return {
      status: 200,
      jsonBody: {
        status: stringifyBigInt(status),
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

app.http('getProducerRecordStatus', {
  methods: ['GET'],
  route: 'getProducerRecordStatus',
  authLevel: 'anonymous',
  handler,
});

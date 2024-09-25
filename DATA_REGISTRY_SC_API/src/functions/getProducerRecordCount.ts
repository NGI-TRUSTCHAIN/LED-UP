import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getProducerRecordCount } from '../helpers/view-query';
import { stringifyBigInt } from '../helpers/bigIntStringify';

const handler = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    const producer = (await request.query.get('producer')) as string;
    const count = await getProducerRecordCount(producer);
    return {
      status: 200,
      jsonBody: {
        count: stringifyBigInt(count),
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

app.http('getProducerRecordCount', {
  methods: ['GET'],
  route: 'getProducerRecordCount',
  authLevel: 'anonymous',
  handler,
});

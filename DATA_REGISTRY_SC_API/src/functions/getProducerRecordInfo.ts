import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getProducerRecordInfo } from '../helpers/view-query';
import { stringifyBigInt } from '../helpers/bigIntStringify';

const handler = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    const producer = (await request.query.get('producer')) as string;
    const data = await getProducerRecordInfo(producer);

    return {
      status: 200,
      jsonBody: stringifyBigInt(data),
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

app.http('getProducerRecordInfo', {
  methods: ['GET'],
  route: 'getProducerRecordInfo',
  authLevel: 'anonymous',
  handler,
});

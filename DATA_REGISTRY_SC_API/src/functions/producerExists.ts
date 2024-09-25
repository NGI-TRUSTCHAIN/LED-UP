import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { producerExists } from '../helpers/view-query';

const handler = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    const producer = (await request.query.get('producer')) as string;
    const isProducerExist = await producerExists(producer);
    return {
      status: 200,
      jsonBody: {
        isProducerExist,
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

app.http('CheckProducerExists', {
  methods: ['GET'],
  route: 'producerExists',
  authLevel: 'anonymous',
  handler,
});

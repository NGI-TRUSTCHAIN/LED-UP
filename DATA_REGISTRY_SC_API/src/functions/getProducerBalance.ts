import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getProducerBalanceByOwner } from '../helpers/view-query';
import { AddressParam } from '../types';

const handler = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    const address = (await request.query.get('address')) as string;
    const balance = await getProducerBalanceByOwner(address);
    return {
      status: 200,
      jsonBody: balance,
    };
  } catch (error) {
    context.error(`Error getting producer balance: ${error}`);
    return {
      status: 500,
      jsonBody: {
        error: error,
        message: 'Failed to get producer balance',
      },
    };
  }
};

app.http('getProducerBalance', {
  methods: ['GET'],
  route: 'getProducerBalance',
  authLevel: 'anonymous',
  handler,
});

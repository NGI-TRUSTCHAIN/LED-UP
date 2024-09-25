import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getLeveaWalletBalance } from '../helpers/view-query';

const handler = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    const balance = await getLeveaWalletBalance();
    return {
      status: 200,
      jsonBody: balance,
    };
  } catch (error) {
    context.error(`Error getting provider balance: ${error}`);
    return {
      status: 500,
      jsonBody: {
        error: error,
        message: 'Failed to get provider balance',
      },
    };
  }
};

app.http('GetProviderBalance', {
  methods: ['GET'],
  route: 'getProviderBalance',
  authLevel: 'anonymous',
  handler,
});

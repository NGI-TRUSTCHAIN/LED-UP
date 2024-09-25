import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getLeveaWallet } from '../helpers/view-query';

const handler = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    const wallet = await getLeveaWallet();
    return {
      status: 200,
      jsonBody: wallet,
    };
  } catch (error) {
    context.error(`Error getting provider wallet: ${error}`);
    return {
      status: 500,
      jsonBody: {
        error: error,
        message: 'Failed to get provider wallet',
      },
    };
  }
};

app.http('GetProviderWallet', {
  methods: ['GET'],
  route: 'getProviderWallet',
  authLevel: 'anonymous',
  handler,
});

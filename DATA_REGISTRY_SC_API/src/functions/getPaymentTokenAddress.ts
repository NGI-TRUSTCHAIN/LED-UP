import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getPaymentTokenAddress } from '../helpers/view-query';

const handler = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    const paymentToken = await getPaymentTokenAddress();
    return {
      status: 200,
      jsonBody: paymentToken,
    };
  } catch (error) {
    context.error(`Error fetching payment token address: ${error}`);
    return {
      status: 500,
      jsonBody: {
        error: error,
        message: 'Failed to retrieve payment token address',
      },
    };
  }
};

app.http('GetPaymentTokenAddress', {
  methods: ['GET'],
  route: 'getPaymentTokenAddress',
  authLevel: 'anonymous',
  handler,
});

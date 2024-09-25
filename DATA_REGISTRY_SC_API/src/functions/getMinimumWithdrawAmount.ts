import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getMinimumWithdrawAmount } from '../helpers/view-query';

const handler = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    const minimumWithdrawAmount = await getMinimumWithdrawAmount();
    return {
      status: 200,
      jsonBody: minimumWithdrawAmount,
    };
  } catch (error) {
    context.error(`Error getting minimum withdraw amount: ${error}`);
    return {
      status: 500,
      jsonBody: {
        error: error,
        message: 'Failed to get minimum withdraw amount',
      },
    };
  }
};

app.http('getMinimumWithdrawAmount', {
  methods: ['GET'],
  route: 'getMinimumWithdrawAmount',
  authLevel: 'anonymous',
  handler,
});

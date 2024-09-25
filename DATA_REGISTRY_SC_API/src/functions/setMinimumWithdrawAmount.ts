import { ProcessPaymentParams, ValueParam } from '../types';
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { setMinimumWithdrawAmount } from '../helpers/update-query';

const handler = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    const { value } = (await request.json()) as ValueParam;
    const receipt = await setMinimumWithdrawAmount(value);
    return {
      status: 200,
      jsonBody: {
        receipt,
      },
    };
  } catch (error) {
    context.error(`Error setting minimum withdraw amount: ${error}`);
    return {
      status: 500,
      jsonBody: {
        error: error,
        message: 'Failed to set minimum withdraw amount',
      },
    };
  }
};

app.http('setMinimumWithdrawAmount', {
  methods: ['POST'],
  route: 'setMinimumWithdrawAmount',
  authLevel: 'anonymous',
  handler,
});

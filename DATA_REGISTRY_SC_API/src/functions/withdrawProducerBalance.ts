import { CompensationABI } from '../utils/compensation.abi';
import { ValueParam } from '../types';
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { withdrawProducerBalance } from '../helpers/update-query';
import { decodeError } from '../helpers/decodeError';

const handler = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    const { value } = (await request.json()) as ValueParam;
    const receipt = await withdrawProducerBalance(value);
    return {
      status: 200,
      jsonBody: {
        receipt,
      },
    };
  } catch (error) {
    context.error(`Error withdrawing payment: ${error}`);
    return {
      status: 500,
      jsonBody: {
        error: decodeError(CompensationABI, error),
        message: 'Failed to withdraw an amount',
      },
    };
  }
};

app.http('withdrawProducerBalance', {
  methods: ['POST'],
  route: 'withdrawProducerBalance',
  authLevel: 'anonymous',
  handler,
});

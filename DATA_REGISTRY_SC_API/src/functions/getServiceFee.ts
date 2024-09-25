import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getServiceFee } from '../helpers/view-query';

const handler = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    const serviceFee = await getServiceFee();
    return {
      status: 200,
      jsonBody: serviceFee,
    };
  } catch (error) {
    context.error(`Error fetching service fee: ${error}`);
    return {
      status: 500,
      jsonBody: {
        error: error,
        message: 'Failed to retrieve service fee',
      },
    };
  }
};

app.http('getServiceFee', {
  methods: ['GET'],
  route: 'getServiceFee',
  authLevel: 'anonymous',
  handler,
});

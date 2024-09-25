import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getUnitPrice } from '../helpers/view-query';

const handler = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    const unitPrice = await getUnitPrice();
    return {
      status: 200,
      jsonBody: unitPrice,
    };
  } catch (error) {
    context.error(`Error fetching unit price: ${error}`);
    return {
      status: 500,
      jsonBody: {
        error: error,
        message: 'Failed to retrieve unit price',
      },
    };
  }
};

app.http('GetUnitPrice', {
  methods: ['GET'],
  route: 'getUnitPrice',
  authLevel: 'anonymous',
  handler,
});

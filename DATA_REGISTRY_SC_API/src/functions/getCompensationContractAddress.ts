import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getCompensationContractAddress } from '../helpers/view-query';

const handler = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    const compensationContractAddress = await getCompensationContractAddress();
    return {
      status: 200,
      jsonBody: {
        compensationContractAddress,
      },
    };
  } catch (error) {
    context.error(`Error getting compensation contract address: ${error}`);
    return {
      status: 500,
      jsonBody: {
        error: error,
        message: 'Failed to get compensation contract address',
      },
    };
  }
};

app.http('getCompensationContractAddress', {
  methods: ['GET'],
  route: 'getCompensationContractAddress',
  authLevel: 'anonymous',
  handler,
});

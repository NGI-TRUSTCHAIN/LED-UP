import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { changeTokenAddress } from '../helpers/update-query';
import { AddressParam } from '../types';

const handler = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    const { address } = (await request.json()) as AddressParam;
    const receipt = await changeTokenAddress(address);
    return {
      status: 200,
      jsonBody: {
        receipt,
      },
    };
  } catch (error) {
    context.error(`Error fetching data: ${error}`);
    return {
      status: 500,
      jsonBody: {
        error: error,
        message: 'Failed to retrieve data from IPFS',
      },
    };
  }
};

app.http('changeTokenAddress', {
  methods: ['POST'],
  route: 'changeTokenAddress',
  authLevel: 'anonymous',
  handler,
});

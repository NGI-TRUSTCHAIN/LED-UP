import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { changeServiceFee } from '../helpers/update-query';
import { ValueParam } from '../types';

const handler = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    const { value } = (await request.json()) as ValueParam;
    const receipt = await changeServiceFee(value);
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

app.http('changeSeviceFee', {
  methods: ['POST'],
  route: 'changeSeviceFee',
  authLevel: 'anonymous',
  handler,
});

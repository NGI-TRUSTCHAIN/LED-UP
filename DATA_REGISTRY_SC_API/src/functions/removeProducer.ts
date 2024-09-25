import { AddressParam } from '../types';
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { removeProducer } from '../helpers/update-query';

const handler = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    const { address } = (await request.json()) as AddressParam;
    const receipt = await removeProducer(address);
    return {
      status: 200,
      jsonBody: {
        receipt,
      },
    };
  } catch (error) {
    context.error(`Error removeing producer/patient: ${error}`);
    return {
      status: 500,
      jsonBody: {
        error: error,
        message: 'Failed to remove producer/patient',
      },
    };
  }
};

app.http('removeProducer', {
  methods: ['POST'],
  route: 'removeProducer',
  authLevel: 'anonymous',
  handler,
});

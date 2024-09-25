import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { updateProducerRecord } from '../helpers/update-query';
import { ProducerRegistrationParam } from '../types';

const handler = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    const data = (await request.json()) as ProducerRegistrationParam;

    const receipt = await updateProducerRecord(data);
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

app.http('updateProducerRecord', {
  methods: ['PUT', 'POST'],
  route: 'updateProducerRecord',
  authLevel: 'anonymous',
  handler,
});

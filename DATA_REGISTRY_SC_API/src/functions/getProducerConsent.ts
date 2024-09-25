import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getProducerConsent } from '../helpers/view-query';
import { stringifyBigInt } from '../helpers/bigIntStringify';

const handler = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    const producer = (await request.query.get('producer')) as string;
    const consent = await getProducerConsent(producer);
    return {
      status: 200,
      jsonBody: {
        consent: stringifyBigInt(consent),
      },
    };
  } catch (error) {
    context.error(`Error fetching data: ${error}`);
    return {
      status: 500,
      jsonBody: {
        error: error,
        message: 'Failed to retrieve producer consent',
      },
    };
  }
};

app.http('getProducerConsent', {
  methods: ['GET'],
  route: 'getProducerConsent',
  authLevel: 'anonymous',
  handler,
});

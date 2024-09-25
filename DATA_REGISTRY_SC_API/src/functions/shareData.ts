import { CompensationABI } from '../utils/compensation.abi';
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { shareData } from '../helpers/update-query';
import { decodeError } from '../helpers/decodeError';
import { DataRegistryABI } from '../utils/dataRegistry.abi';
import { verifyPayment } from '../helpers/view-query';

export default async function handler(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);

  const body = (await request.json()) as {
    producer: string;
    consumer: string;
    recordId: string;
  };
  try {
    const verified = await verifyPayment(body.recordId);
    if (!verified) {
      return {
        status: 400,
        jsonBody: {
          message: 'Payment not verified',
        },
      };
    }
    console.log('Sharing Data...', verified);
    const receipt = await shareData(body.producer, body.consumer, body.recordId);

    return {
      status: 200,
      jsonBody: receipt,
    };
  } catch (error: any) {
    context.error(`Error sharing Data: ${error}`);
    console.error(decodeError(DataRegistryABI, error));

    return {
      status: 500,
      jsonBody: {
        error,
        parsed: decodeError(DataRegistryABI, error),
        message: 'Failed to share resource',
      },
    };
  }
}

app.http('shareData', {
  methods: ['POST'],
  route: 'shareData',
  authLevel: 'anonymous',
  handler,
});

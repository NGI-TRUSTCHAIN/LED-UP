import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { changePauseState } from '../helpers/update-query';
import { PauseParam } from '../types';

const handler = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    const { pause } = (await request.json()) as PauseParam;
    const receipt = await changePauseState(pause);
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

app.http('changePauseState', {
  methods: ['POST'],
  route: 'changePauseState',
  authLevel: 'anonymous',
  handler,
});

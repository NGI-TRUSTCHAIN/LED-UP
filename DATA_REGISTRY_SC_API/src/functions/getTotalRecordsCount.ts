import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getTotalRecordsCount } from '../helpers/view-query';

const handler = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    const totalCount = await getTotalRecordsCount();
    return {
      status: 200,
      jsonBody: {
        totalCount,
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

app.http('getTotalRecordsCount', {
  methods: ['GET'],
  route: 'getTotalRecordsCount',
  authLevel: 'anonymous',
  handler,
});

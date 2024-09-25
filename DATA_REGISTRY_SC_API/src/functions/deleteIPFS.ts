import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { fetchFromIPFS } from '../utils/fetch-ipfs';

export default async function deleteIPFS(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);
  const cid = await request.query.get('cid');

  if (!cid) {
    return {
      status: 400,
      jsonBody: 'Please provide a cid',
    };
  }

  try {
    console.log('Deleting from IPFS');
    const res = await fetchFromIPFS(cid);

    console.log({
      res,
    });

    return {
      status: 200,
      jsonBody: res,
    };
  } catch (error) {
    context.error(`Error deleting data: ${error}`);
    return {
      status: 500,
      jsonBody: {
        error: error,
        message: 'Failed to delete data from IPFS',
      },
    };
  }
}

app.http('DeleteIPFS', {
  methods: ['DELETE'],
  route: 'ipfs/:cid',
  authLevel: 'anonymous',
  handler: deleteIPFS,
});

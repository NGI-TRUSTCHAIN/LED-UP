import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { decrypt, toCipherKey } from '../utils/encrypt';
import { fetchFromIPFS } from '../utils/fetch-ipfs';
import { sign } from '../helpers/sign';
import { hashData } from '../utils/hash-data';

export default async function getIPFSData(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);

  const cid = request.params.cid || (await request.query.get('cid'));
  const key = process.env.ENCRYPTION_KEY as string;
  if (!cid) {
    return {
      status: 400,
      jsonBody: 'Please provide a cid',
    };
  }

  try {
    const res = await fetchFromIPFS(cid);
    const decrypted = decrypt(res, toCipherKey(key));
    const hash = await hashData(
      JSON.stringify({
        resourceType: 'Patient',
        id: 'd0658787-9eeb-4b40-9053-09e1adacdf6a',
        meta: {
          versionId: '1',
          lastUpdated: '2024-04-19T04:55:59.038+00:00',
        },
        active: true,
        name: [
          {
            use: 'official',
            family: 'Smith',
            given: ['Lisa', 'Marie'],
          },
          {
            use: 'usual',
            given: ['Lisa'],
          },
        ],
        gender: 'female',
        birthDate: '1974-12-25',
      })
    );
    console.log('Hash:', hash);
    return {
      status: 200,
      jsonBody: {
        data: decrypted,
        res: res,
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
}

app.http('GetIPFSData', {
  methods: ['GET'],
  route: 'ipfs',
  authLevel: 'anonymous',
  handler: getIPFSData,
});

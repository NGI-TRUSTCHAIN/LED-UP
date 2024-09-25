import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { uploadToIPFS } from '../utils/pin-json';
import { encrypt, toCipherKey } from '../utils/encrypt';

export default async function updateBlockchain(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);

  const body = (await request.json()) as any; // plain data comes from frontend
  const key = process.env.ENCRYPTION_KEY as string;

  try {
    // encrypt and get encrypted data, iv, tag
    const data = encrypt(JSON.stringify(body.data), toCipherKey(key));

    console.log('Uploading to IPFS...');

    const res = await uploadToIPFS({
      pinataContent: data,
      pinataMetadata: {
        name: body.name,
      },
      pinataOptions: {
        cidVersion: 1,
      },
    });

    console.log({
      body,
      res,
      key,
    });

    return {
      status: 200,
      jsonBody: res,
    };
  } catch (error: any) {
    context.error(`Error Uploading Data: ${error}`);

    return {
      status: 500,
      jsonBody: {
        error: error.response ? error.response.data : error.message,
        message: 'Failed to create resource',
      },
    };
  }
}

app.http('UpdateBlockchain', {
  methods: ['POST', 'PUT'],
  route: 'pin',
  authLevel: 'anonymous',
  handler: updateBlockchain,
});

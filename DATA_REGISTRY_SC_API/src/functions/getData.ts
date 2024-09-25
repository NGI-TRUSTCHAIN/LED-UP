import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { provider } from '../helpers/provider';
import { signer } from '../helpers/get-signer';
import callContract, {
  getProviderMetadata,
  getProducerRecordCount,
  getRecordSchema,
  paused,
} from '../helpers/view-query';

const getData = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);
  try {
    const blockNumber = await provider.getBlockNumber();
    const nonce = await provider.getTransactionCount(signer.getAddress());

    return {
      status: 200,
      jsonBody: {
        address: await signer.getAddress(),
        contract: process.env.CONTRACT_ADDRESS,
        owner_address: process.env.OWNER_ADDRESS,
        blockNumber,
        nonce,
        callContract: await callContract(''),
        txCount: await provider.getTransactionCount(signer.getAddress()),
        ownerMetadata: await getProviderMetadata(),
        schema: await getRecordSchema(),
        // count: await getProducerRecordCount("0x0000000000000000000000000000000000000000"),
        pauseState: await paused(),
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

app.http('GetData', {
  methods: ['GET'],
  route: 'getData',
  authLevel: 'anonymous',
  handler: getData,
});

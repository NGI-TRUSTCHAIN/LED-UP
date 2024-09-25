import { uploadToIPFS } from '../utils/pin-json';
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { registerProducerRecord } from '../helpers/update-query';
import { ProducerRegistrationParam } from '../types';
import { encrypt, toCipherKey } from '../utils/encrypt';
import { hashData, hashHex } from '../utils/hash-data';
import { sign } from 'crypto';
import { wallet } from '../helpers/provider';

const handler = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);
  // const params = (await request.json()) as ProducerRegistrationParam;

  try {
    const registrationData = (await request.json()) as {
      producer: string;
      // signature: string;
      consent: number;
      data: any;
    };

    const key = process.env.ENCRYPTION_KEY as string;
    //encrypt and get encrypted data, iv, tag
    const { producer, consent, data } = registrationData;

    const encryptedData = encrypt(JSON.stringify(data), toCipherKey(key));

    //upload to IPFS and get cid
    const res = await uploadToIPFS({
      pinataContent: encryptedData,
      pinataMetadata: {
        name: data.resourceType,
      },
      pinataOptions: {
        cidVersion: 1,
      },
    });

    // get the hash of data
    const hash = await hashHex(JSON.stringify(data));

    // calculate the signature -> later this should be done in frontend
    const signature = await wallet.signMessage(hash);

    // we have got now signature, id, cid, hash,
    const metadata = {
      url: 'https://ipfs.io/ipfs/' + res.IpfsHash,
      cid: res.IpfsHash as string,
      hash: `0x${hash}`,
    };

    const blockchainData = {
      recordId: data.id,
      producer,
      signature,
      resourceType: data.resourceType,
      consent,
      metadata,
    };

    console.log(blockchainData);

    // register the record
    const txhash = await registerProducerRecord(blockchainData);

    return {
      status: 200,
      jsonBody: {
        txhash,
        data: blockchainData,
      },
    };

    // const receipt = await registerProducerRecord(params);
    // return {
    //   status: 200,
    //   jsonBody: {
    //     receipt,
    //   },
    // };
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

app.http('registerProducer', {
  methods: ['POST'],
  route: 'registerProducer',
  authLevel: 'anonymous',
  handler,
});

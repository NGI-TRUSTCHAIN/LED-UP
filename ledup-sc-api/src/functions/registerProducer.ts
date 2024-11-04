import { uploadToIPFS } from '../utils/pin-json';
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { registerProducerRecord } from '../helpers/update-query';
import { ProducerRegistrationParam } from '../types';
import { encrypt, toCipherKey } from '../utils/encrypt';
import { hashData, hashHex } from '../utils/hash-data';
import { sign } from 'crypto';
import { wallet } from '../helpers/provider';

/**
 * Azure Function that registers a producer by uploading encrypted data to IPFS
 * and creating a blockchain record.
 *
 
 */

/**
 * Handler for the HTTP function that registers a producer.
 *
 * This function processes a POST request to register a producer by uploading their
 * encrypted data to IPFS and creating a corresponding record on the blockchain.
 * It retrieves the producer's details from the request body, encrypts the data,
 * uploads it to IPFS, and calculates a signature for the data.
 * The resulting metadata, including the IPFS URL and hash, is used to register
 * the producer record on the blockchain. On successful execution, it returns a
 * 200 OK response with a JSON object containing the transaction hash and the
 * blockchain data. In case of an error, it returns a 500 Internal Server Error response.
 *
 * @param {HttpRequest} request - The HTTP request object containing the registration data.
 * @param {InvocationContext} context - The context object providing information about the execution of the function.
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HttpResponseInit object containing the response data.
 *
 * @throws Will throw an error if fetching data or processing the request fails.
 *
 * @example
 * Example Request:
 * POST /registerProducer
 * Body:
 * {
 *   "producer": "0xProducerAddress",
 *   "consent": 1,
 *   "data": {
 *     "id": "1234",
 *     "resourceType": "SomeResourceType"
 *   }
 * }
 *
 * Example Response:
 * Status: 200
 * Body:
 * {
 *   "txhash": "transaction_hash_here",
 *   "data": {
 *     "recordId": "1234",
 *     "producer": "0xProducerAddress",
 *     "signature": "signature_here",
 *     "resourceType": "SomeResourceType",
 *     "consent": 1,
 *     "metadata": {
 *       "url": "https://ipfs.io/ipfs/ipfs_hash_here",
 *       "cid": "ipfs_hash_here",
 *       "hash": "0xhash_here"
 *     }
 *   }
 * }
 *
 * Error Responses:
 * Status: 500
 * Body:
 * {
 *   "error": "Detailed error message",
 *   "message": "Failed to retrieve data from IPFS"
 * }
 */
const handler = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    const registrationData = (await request.json()) as {
      producer: string;
      consent: number;
      data: any;
    };

    const key = process.env.ENCRYPTION_KEY as string;
    const { producer, consent, data } = registrationData;

    // Encrypt the data
    const encryptedData = encrypt(JSON.stringify(data), toCipherKey(key));

    // Upload to IPFS and get the CID
    const res = await uploadToIPFS({
      pinataContent: encryptedData,
      pinataMetadata: {
        name: data.resourceType,
        owner: producer,
      },
      pinataOptions: {
        cidVersion: 1,
      },
    });

    // Get the hash of the data
    const hash = await hashHex(JSON.stringify(data));

    // Calculate the signature
    const signature = await wallet.signMessage(hash);

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

    // Register the record on the blockchain
    const txhash = await registerProducerRecord(blockchainData);

    return {
      status: 200,
      jsonBody: {
        txhash,
        data: blockchainData,
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

/**
 * HTTP route configuration for the Azure Function to register a producer.
 */
app.http('registerProducer', {
  methods: ['POST'], // Specifies that this function responds to POST requests
  route: 'registerProducer', // Defines the route for the function
  authLevel: 'anonymous', // Sets the authentication level for the function
  handler, // Sets the handler function to process requests
});

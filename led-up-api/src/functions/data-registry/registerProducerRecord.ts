import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { DataRegistryABI } from '../../abi/data-registry.abi';
import { DATA_REGISTRY_CONTRACT_ADDRESS } from '../../constants';
import { wallet } from '../../helpers/provider';
import { DataRegistryService } from '../../services/contracts/DataRegistryService';
import { ConsentStatus } from '../../types';
import { encrypt, toCipherKey } from '../../utils/encrypt';
import { hashHex } from '../../utils/hash-data';
import { uploadToIPFS } from '../../utils/pin-json';

/**
 * Azure Function that registers a producer by uploading encrypted data to IPFS
 * and creating a blockchain record using the DataRegistryService.
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
 * 200 OK response with a JSON object containing the transaction receipt and the
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
 * POST /producer/register
 * Body:
 * {
 *   "ownerDid": "did:ledup:producer:123456789",
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
 *   "success": true,
 *   "data": {
 *     "receipt": {
 *       "transactionHash": "0x...",
 *       "blockNumber": 12345,
 *       "events": [...]
 *     },
 *     "recordData": {
 *       "recordId": "1234",
 *       "producer": "0xProducerAddress",
 *       "signature": "signature_here",
 *       "resourceType": "SomeResourceType",
 *       "consent": 1,
 *       "metadata": {
 *         "url": "https://ipfs.io/ipfs/ipfs_hash_here",
 *         "cid": "ipfs_hash_here",
 *         "hash": "0xhash_here"
 *       }
 *     }
 *   }
 * }
 *
 * Error Responses:
 * Status: 500
 * Body:
 * {
 *   "success": false,
 *   "error": "Detailed error message",
 *   "message": "Failed to register producer record"
 * }
 */
const handler = async (
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    const registrationData = (await request.json()) as {
      ownerDid: string;
      producer: string;
      consent: number;
      data: any;
    };

    const key = process.env.ENCRYPTION_KEY as string;
    const { ownerDid, producer, consent, data } = registrationData;

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

    // Initialize the DataRegistryService
    const dataRegistryService = new DataRegistryService(
      DATA_REGISTRY_CONTRACT_ADDRESS,
      DataRegistryABI
    );

    // Register the producer record
    const receipt = await dataRegistryService.registerProducerRecord({
      ownerDid,
      recordId: data.id,
      producer,
      signature,
      resourceType: data.resourceType,
      consent: consent as ConsentStatus,
      metadata,
    });

    return {
      status: 200,
      jsonBody: {
        success: true,
        data: {
          receipt,
          recordData: {
            recordId: data.id,
            producer,
            signature,
            resourceType: data.resourceType,
            consent,
            metadata,
          },
        },
      },
    };
  } catch (error) {
    context.error(`Error registering producer record: ${error}`);
    return {
      status: 500,
      jsonBody: {
        success: false,
        error: error,
        message: 'Failed to register producer record',
      },
    };
  }
};

/**
 * HTTP route configuration for the Azure Function to register a producer.
 */
app.http('registerProducer', {
  methods: ['POST'], // Specifies that this function responds to POST requests
  route: 'data-registry/producer/register-record', // Defines the route for the function
  authLevel: 'anonymous', // Sets the authentication level for the function
  handler, // Sets the handler function to process requests
});

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { DataRegistryABI } from '../../abi/data-registry.abi';
import { DATA_REGISTRY_CONTRACT_ADDRESS } from '../../constants';
import { wallet } from '../../helpers/provider';
import { DataRegistryService } from '../../services/contracts/DataRegistryService';
import { ConsentStatus, RecordStatus } from '../../types';
import { encrypt, toCipherKey } from '../../utils/encrypt';
import { hashHex } from '../../utils/hash-data';
import { uploadToIPFS } from '../../utils/pin-json';

/**
 * Azure Function that updates a producer record on the blockchain.
 */

/**
 * Handler for the HTTP function that updates a producer record.
 *
 * This function processes a POST request to update an existing producer record.
 * It retrieves the producer's details from the request body, encrypts the updated data,
 * uploads it to IPFS, and calculates a signature for the data.
 * The resulting metadata, including the IPFS URL and hash, is used to update
 * the producer record on the blockchain. On successful execution, it returns a
 * 200 OK response with a JSON object containing the transaction receipt and the
 * updated blockchain data. In case of an error, it returns a 500 Internal Server Error response.
 *
 * @param {HttpRequest} request - The HTTP request object containing the update data.
 * @param {InvocationContext} context - The context object providing information about the execution of the function.
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HttpResponseInit object containing the response data.
 *
 * @throws Will throw an error if updating the producer record fails.
 *
 * @example
 * Example Request:
 * POST /producer/record/update
 * Body:
 * {
 *   "recordId": "record-123",
 *   "producer": "0xProducerAddress",
 *   "status": 1,
 *   "consent": 1,
 *   "data": {
 *     "id": "record-123",
 *     "resourceType": "HealthRecord",
 *     "content": "Updated encrypted health data"
 *   },
 *   "updaterDid": "did:ledup:producer:123456789"
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
 *       "recordId": "record-123",
 *       "producer": "0xProducerAddress",
 *       "signature": "signature_here",
 *       "resourceType": "HealthRecord",
 *       "status": 1,
 *       "consent": 1,
 *       "metadata": {
 *         "url": "https://ipfs.io/ipfs/Qm...",
 *         "cid": "Qm...",
 *         "hash": "0x..."
 *       },
 *       "updaterDid": "did:ledup:producer:123456789"
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
 *   "message": "Failed to update producer record"
 * }
 */
const handler = async (
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    const updateData = (await request.json()) as {
      recordId: string;
      producer: string;
      status: number;
      consent: number;
      data: any;
      updaterDid: string;
    };

    const key = process.env.ENCRYPTION_KEY as string;
    const { recordId, producer, status, consent, data, updaterDid } = updateData;

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

    // Update the producer record
    const receipt = await dataRegistryService.updateProducerRecord({
      recordId,
      producer,
      signature,
      resourceType: data.resourceType,
      status: status as RecordStatus,
      consent: consent as ConsentStatus,
      metadata,
      updaterDid,
    });

    return {
      status: 200,
      jsonBody: {
        success: true,
        data: {
          receipt,
          recordData: {
            recordId,
            producer,
            signature,
            resourceType: data.resourceType,
            status,
            consent,
            metadata,
            updaterDid,
          },
        },
      },
    };
  } catch (error) {
    context.error(`Error updating producer record: ${error}`);
    return {
      status: 500,
      jsonBody: {
        success: false,
        error: error,
        message: 'Failed to update producer record',
      },
    };
  }
};

/**
 * HTTP route configuration for the Azure Function to update a producer record.
 */
app.http('updateProducerRecord', {
  methods: ['POST'], // Specifies that this function responds to POST requests
  route: 'data-registry/producer/update-record', // Defines the route for the function
  authLevel: 'anonymous', // Sets the authentication level for the function
  handler, // Sets the handler function to process requests
});

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { getContractConfig } from '../../config/contract-config';
import { DataRegistryService, DidRegistryService, ipfsService } from '../../services';

/**
 * Retrieves data from IPFS and decrypts it using the public key of the producer.
 *
 * @param request - The incoming HTTP request, containing a DID, CID, and consumer address
 * @param context - The function invocation context
 * @returns A response containing the decrypted data or an error message
 */
export async function accessData(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('Received request to get data from IPFS');

  try {
    // get the body of the request
    const { did, cid, consumerAddress, recordId } = (await request.json()) as {
      did: string;
      cid: string;
      consumerAddress: string;
      recordId: string;
    };

    // Validate required fields and ensure they're not false/null
    if (!did || !cid || !consumerAddress || !recordId) {
      context.log(
        `Missing required fields in request. Did: ${did}, CID: ${cid}, ConsumerAddress: ${consumerAddress}, RecordId: ${recordId}`
      );
      return {
        status: 400,
        jsonBody: {
          success: false,
          message: 'Missing required fields: did, cid, consumerAddress, or recordId',
        },
      };
    }

    const config = getContractConfig();

    const dataRegistryService = new DataRegistryService(
      config.dataRegistry.address,
      config.dataRegistry.abi
    );

    const didRegistryService = new DidRegistryService(
      config.didRegistry.address,
      config.didRegistry.abi
    );

    // Get requester's public key for re-encryption
    const publicKey = await didRegistryService.getPublicKeyForDid(did);

    if (!publicKey) {
      context.log(`Public key not found for DID: ${did}`);
      return {
        status: 404,
        jsonBody: {
          success: false,
          message: 'Public key not found for the given DID',
        },
      };
    }

    const recordIds = await dataRegistryService.getProducerRecords(did);

    console.log('recordIds', recordIds);

    // Check access with correct record ID
    const accessResult = await dataRegistryService.checkAccess(recordId, consumerAddress);

    if (!accessResult.hasAccess) {
      context.log(`Access denied for consumer ${consumerAddress} to record ${recordId}`);
      return {
        status: 403,
        jsonBody: {
          success: false,
          message: 'You do not have permission to view this health record data',
        },
      };
    }

    // If access is revoked, deny access
    if (accessResult.isRevoked) {
      context.log(`Access revoked for consumer ${consumerAddress} to record ${recordId}`);
      return {
        status: 403,
        jsonBody: {
          success: false,
          message: 'Your access to this health record has been revoked',
        },
      };
    }

    // Check if access has expired
    const currentTimestamp = Math.floor(Date.now() / 1000);
    if (accessResult.expiration < currentTimestamp && accessResult.expiration !== 0) {
      context.log(`Access expired for consumer ${consumerAddress} to record ${recordId}`);
      return {
        status: 403,
        jsonBody: {
          success: false,
          message: 'Your access to this health record has expired',
        },
      };
    }

    context.log(`Access granted for consumer ${consumerAddress} to record ${recordId}`);

    // Get the data from IPFS and re-encrypt with user's public key
    const data = await ipfsService.fetchFromIPFSAndReencrypt(publicKey, cid, context);

    return {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      jsonBody: {
        debug: true,
        success: true,
        data,
        recordId,
        accessDetails: {
          accessLevel: accessResult.accessLevel,
          expiration: accessResult.expiration,
        },
        message: 'Health record data retrieved successfully',
      },
    };
  } catch (error) {
    context.error(`Unhandled error in accessData: ${error}`);
    return {
      status: 500,
      jsonBody: {
        success: false,
        message: 'An unexpected error occurred while retrieving health record data',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}

/**
 * Azure Function configuration for handling HTTP requests to fetch data.
 */
app.http('accessData', {
  methods: ['GET', 'POST'],
  authLevel: 'anonymous',
  route: 'ipfs/accessData',
  handler: accessData,
});

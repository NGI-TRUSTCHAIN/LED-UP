/**
 * Azure Function to create a DID using a client-signed transaction.
 * This approach allows users to register DIDs with their own wallet addresses.
 */
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { ethers } from 'ethers';

import { getContractAbi, getContractAddress } from '../../helpers/contract-config';
import { provider } from '../../helpers/provider';
import { DidRegistryService, DidResolverService } from '../../services';
import { CreateDidResponse } from '../../types/did-types';

/**
 * Handler for the HTTP function that creates a DID using a client-signed transaction.
 *
 * This function processes a POST request to create a DID for an Ethereum address.
 * Unlike the original createDid function, this version expects the client to sign
 * the transaction data, ensuring that the DID is registered under the user's address.
 *
 * @param {HttpRequest} request - The HTTP request object.
 * @param {InvocationContext} context - The context object providing information about the execution of the function.
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HttpResponseInit object containing the response data.
 *
 * @example
 * Example Request:
 * POST /did/create2
 * Body:
 * {
 *   "address": "0x1234567890abcdef1234567890abcdef12345678",
 *   "signedTransaction": "0x...", // The signed transaction data
 *   "didDocument": "..." // Optional: The DID document as a JSON string
 * }
 */
export async function handler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    // Parse the request body
    const requestBody = await request.text();
    context.log(`Request body: ${requestBody}`);

    let body;
    try {
      body = JSON.parse(requestBody) as {
        address: string;
        signedTransaction?: string;
        didDocument?: string;
      };
    } catch (parseError) {
      context.error(`Error parsing request body: ${parseError}`);
      return {
        status: 400,
        jsonBody: {
          success: false,
          message: 'Invalid JSON in request body',
        },
      };
    }

    // Validate the request
    if (!body.address) {
      return {
        status: 400,
        jsonBody: {
          success: false,
          message: 'Address is required',
        },
      };
    }

    // Normalize the address
    const normalizedAddress = body.address.toLowerCase();
    context.log(`Processing request for address: ${normalizedAddress}`);

    // Initialize the DidRegistryService for read-only operations
    const didRegistryService = new DidRegistryService(
      getContractAddress('DID_REGISTRY'),
      getContractAbi('DID_REGISTRY')
    );

    // Initialize the DidResolverService
    const didResolverService = new DidResolverService(didRegistryService, undefined, context);

    // Check if a DID already exists for this address
    try {
      const existingDid = await didRegistryService.getDidForAddress(normalizedAddress);
      context.log(`Existing DID check result: ${JSON.stringify(existingDid)}`);

      if (existingDid) {
        return {
          status: 200,
          jsonBody: {
            success: true,
            data: {
              did: existingDid.did,
              didDocument: existingDid,
            },
            message: 'DID already exists for this address',
          },
        };
      }
    } catch (error) {
      // If there's an error checking for an existing DID, continue with creation
      context.log(`Error checking for existing DID: ${error}`);
    }

    // Create a DID
    const did = didResolverService.createDid(normalizedAddress);
    context.log(`Created DID: ${did}`);

    // Create or use the provided DID document
    let didDocument;
    let documentString;

    if (body.didDocument) {
      try {
        // Use the provided DID document
        didDocument = JSON.parse(body.didDocument);
        documentString = body.didDocument;
      } catch (error) {
        return {
          status: 400,
          jsonBody: {
            success: false,
            message: 'Invalid DID document format',
          },
        };
      }
    } else {
      // Create a DID document
      didDocument = didResolverService.createDidDocument(did, normalizedAddress);
      documentString = JSON.stringify(didDocument);
    }

    // Extract the public key from the DID document
    const publicKey =
      didDocument.verificationMethod?.[0]?.publicKeyMultibase ||
      JSON.stringify(didDocument.verificationMethod?.[0]?.publicKeyJwk) ||
      '';

    // If a signed transaction is provided, broadcast it
    if (body.signedTransaction) {
      try {
        // The signedTransaction is actually the transaction hash from the client
        // We need to wait for the transaction to be mined
        const txHash = body.signedTransaction as `0x${string}`;
        context.log(`Processing transaction hash: ${txHash}`);

        try {
          // Wait for the transaction receipt
          const receipt = await provider.getTransactionReceipt(txHash);
          context.log(`Transaction receipt: ${receipt ? JSON.stringify(receipt) : 'null'}`);

          if (!receipt) {
            // If no receipt is found, the transaction might be pending
            return {
              status: 202,
              jsonBody: {
                success: true,
                data: {
                  did,
                  didDocument,
                  transactionHash: txHash,
                  status: 'pending',
                },
                message: 'Transaction is pending. Please check back later.',
              },
            };
          }

          // Check if the transaction was successful
          if (receipt.status === 0) {
            return {
              status: 400,
              jsonBody: {
                success: false,
                message: 'Transaction failed',
                transactionHash: txHash,
              },
            };
          }

          // Return the DID and DID document
          const response: CreateDidResponse = {
            did,
            didDocument,
            role: 'producer',
          };

          return {
            status: 201,
            jsonBody: {
              success: true,
              data: response,
              transactionHash: receipt.hash,
              message: 'DID created successfully',
            },
          };
        } catch (receiptError) {
          context.error(`Error getting transaction receipt: ${receiptError}`);
          return {
            status: 500,
            jsonBody: {
              success: false,
              message: 'Error getting transaction receipt',
              transactionHash: txHash,
              error: receiptError instanceof Error ? receiptError.message : String(receiptError),
            },
          };
        }
      } catch (error: any) {
        context.error(`Error processing signed transaction: ${error}`);
        return {
          status: 500,
          jsonBody: {
            success: false,
            message: error.message || 'Failed to process signed transaction',
            error: String(error),
          },
        };
      }
    } else {
      // If no signed transaction is provided, return the data needed for the client to create one
      const didRegistryAddress = getContractAddress('DID_REGISTRY');
      const didRegistryAbi = getContractAbi('DID_REGISTRY');

      // Create the transaction data that the client needs to sign
      const contract = new ethers.Contract(didRegistryAddress, didRegistryAbi);
      const data = contract.interface.encodeFunctionData('registerDid', [
        did,
        documentString,
        publicKey,
      ]);

      context.log(`Prepared transaction data for client signing`);

      return {
        status: 200,
        jsonBody: {
          success: true,
          data: {
            did,
            didDocument,
            transactionData: {
              to: didRegistryAddress,
              data: data,
              from: normalizedAddress,
            },
          },
          message: 'Transaction data prepared. Please sign and submit this transaction.',
        },
      };
    }
  } catch (error: any) {
    context.error(`Error creating DID: ${error}`);

    return {
      status: 400,
      jsonBody: {
        success: false,
        message: error.message || 'Failed to create DID',
        error: String(error),
      },
    };
  }
}

/**
 * HTTP route configuration for the Azure Function to create a DID with client-signed transaction.
 */
app.http('createDid2', {
  methods: ['POST'],
  route: 'did/create2',
  authLevel: 'anonymous',
  handler,
});

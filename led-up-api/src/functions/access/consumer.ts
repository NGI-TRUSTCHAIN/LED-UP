import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { getContractConfig } from '../../config/contract-config';
import { DidAuthService, DidVerifierService } from '../../services';
import { DataAccessControllerService } from '../../services/access/data-access-controller.service';
import { DataAccessRequest } from '../../services/access/types';
import { AuthService } from '../../services/auth';
import { KeyVaultService } from '../../services/auth/KeyVault.service';
import { DidRegistryService } from '../../services/contracts';
import { DataRegistryService } from '../../services/contracts/DataRegistryService';
import { AsymmetricCryptoService } from '../../services/crypto';
import { EncryptionService } from '../../services/crypto/Encryption.service';
import { IPFSService } from '../../services/ipfs';

/**
 * Azure Function that handles data access requests from consumers.
 * Validates the request, processes data access, and returns encrypted data with shared secret.
 */
const handler = async (
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    // Parse request body
    const requestData = (await request.json()) as DataAccessRequest;
    const { did, publicKey, cid, address, signature } = requestData;

    // Validate request parameters
    if (!did || !publicKey || !cid) {
      return {
        status: 400,
        jsonBody: {
          success: false,
          error: 'Missing required parameters',
          message: 'did, publicKey, and cid are required',
        },
      };
    }

    // Initialize required services
    const contractConfig = getContractConfig();
    const didAuthService = new DidAuthService(
      contractConfig.didAuth.address,
      contractConfig.didAuth.abi
    );
    const didVerifierService = new DidVerifierService(
      contractConfig.didVerifier.address,
      contractConfig.didVerifier.abi
    );
    const encryptionService = new EncryptionService();
    const asymmetricCryptoService = new AsymmetricCryptoService();
    const ipfsService = new IPFSService();

    const didRegistryService = new DidRegistryService(
      contractConfig.didRegistry.address,
      contractConfig.didRegistry.abi
    );
    const dataRegistryService = new DataRegistryService(
      contractConfig.dataRegistry.address,
      contractConfig.dataRegistry.abi
    );

    const authService = new AuthService(
      didAuthService,
      didRegistryService,
      didVerifierService,
      context
    );

    const keyVaultService = new KeyVaultService();

    // Initialize the DataAccessControllerService with required dependencies
    const dataAccessController = new DataAccessControllerService(
      encryptionService,
      asymmetricCryptoService,
      ipfsService,
      dataRegistryService,
      keyVaultService
    );
    // authenticate the request
    const isAuthenticated = await authService.authenticate(address, signature);

    if (!isAuthenticated) {
      return {
        status: 401,
        jsonBody: {
          success: false,
          error: 'Unauthorized',
          message: 'You do not have permission to access this data',
        },
      };
    }

    // Process the data access request
    const { encryptedData, encryptedSharedSecret } =
      await dataAccessController.processDataAccessRequest(publicKey, cid, address);

    return {
      status: 200,
      jsonBody: {
        success: true,
        data: {
          encryptedData,
          encryptedSharedSecret,
        },
      },
    };
  } catch (error: any) {
    context.error('Error processing data access request:', error);

    // Handle specific error types
    if (error.message === 'Access denied') {
      return {
        status: 403,
        jsonBody: {
          success: false,
          error: 'Access denied',
          message: 'You do not have permission to access this data',
        },
      };
    }

    return {
      status: 500,
      jsonBody: {
        success: false,
        error: error.message || 'Internal server error',
        message: 'Failed to process data access request',
      },
    };
  }
};

app.http('RequestDataAccess', {
  methods: ['POST'],
  authLevel: 'anonymous', // Consider changing based on your security requirements
  route: 'consumer-access/request',
  handler: handler,
});

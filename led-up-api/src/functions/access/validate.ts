import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { getContractConfig } from '../../config/contract-config';
import { DataAccessControllerService } from '../../services/access/data-access-controller.service';
import { KeyVaultService } from '../../services/auth/KeyVault.service';
import { DataRegistryService } from '../../services/contracts';
import { AsymmetricCryptoService } from '../../services/crypto/AsymmetricCryptoService';
import { EncryptionService } from '../../services/crypto/Encryption.service';
import { IPFSService } from '../../services/ipfs';

/**
 * Azure Function that validates if a consumer has access to specific data.
 * This endpoint performs quick validation without retrieving or processing the actual data.
 */
const handler = async (
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    // Get query parameters
    const address = request.query.get('address');
    const cid = request.query.get('cid');

    // Validate required parameters
    if (!address || !cid) {
      return {
        status: 400,
        jsonBody: {
          success: false,
          error: 'Missing required parameters',
          message: 'address and cid are required query parameters',
        },
      };
    }

    // Initialize required services
    const contractConfig = getContractConfig();
    const encryptionService = new EncryptionService();
    const asymmetricCryptoService = new AsymmetricCryptoService();
    const ipfsService = new IPFSService();
    const dataRegistryService = new DataRegistryService(
      contractConfig.dataRegistry.address,
      contractConfig.dataRegistry.abi
    );
    const keyVaultService = new KeyVaultService();

    // Initialize the DataAccessControllerService
    const dataAccessController = new DataAccessControllerService(
      encryptionService,
      asymmetricCryptoService,
      ipfsService,
      dataRegistryService,
      keyVaultService
    );

    // Validate access
    const hasAccess = await dataAccessController.validateConsumerAccess(cid, address);

    return {
      status: 200,
      jsonBody: {
        success: true,
        data: {
          isValid: hasAccess,
          cid,
          address,
        },
      },
    };
  } catch (error: any) {
    context.error('Error validating access:', error);

    return {
      status: 500,
      jsonBody: {
        success: false,
        error: error.message || 'Internal server error',
        message: 'Failed to validate access',
      },
    };
  }
};

app.http('ValidateAccess', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'access/validate',
  handler: handler,
});

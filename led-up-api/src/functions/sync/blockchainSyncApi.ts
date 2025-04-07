import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { DATA_REGISTRY_CONTRACT_ADDRESS } from '../../constants';
import {
  updateBlockchainSyncState,
  getBlockchainSyncState,
} from '../../services/db/BlockchainEventService';
import { ContractType } from '../../helpers/ContractHandlerFactory';
import { BlockchainSyncService } from '../../services/sync';

// Create an instance of the BlockchainSyncService
const syncService = new BlockchainSyncService(
  ContractType.DATA_REGISTRY,
  DATA_REGISTRY_CONTRACT_ADDRESS
);

/**
 * Gets or creates a BlockchainSyncService instance for the specified contract type and address.
 * @param contractTypeStr The contract type as a string.
 * @param contractAddress The contract address.
 * @returns A BlockchainSyncService instance.
 */
function getSyncService(contractTypeStr?: string, contractAddress?: string): BlockchainSyncService {
  if (!contractTypeStr) {
    return syncService;
  }

  // Convert string to ContractType enum
  let contractType: ContractType;
  try {
    contractType = contractTypeStr as ContractType;
    // Validate that the contract type is valid
    if (!Object.values(ContractType).includes(contractType)) {
      throw new Error(`Invalid contract type: ${contractTypeStr}`);
    }
  } catch (error) {
    console.error(`Error parsing contract type: ${error}`);
    return syncService;
  }

  // Create a new service instance for the specified contract
  return new BlockchainSyncService(contractType, contractAddress || DATA_REGISTRY_CONTRACT_ADDRESS);
}

/**
 * HTTP trigger function that processes incoming requests to get blockchain sync status.
 *
 * @param req - The HTTP request object containing information about the request.
 * @param context - The context object provides information about the execution of the function.
 * @returns A promise that resolves to an HttpResponseInit object containing the response data.
 */
const getSyncStatus = async function (
  req: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('HTTP trigger function processed a request for sync status:', req.url);

  try {
    const contractType = req.query.get('contractType');
    const contractAddress = req.query.get('contractAddress');

    const syncService = getSyncService(contractType, contractAddress);
    const syncState = await syncService.getSyncState();

    return {
      status: 200,
      jsonBody: {
        status: 'success',
        contractType: syncService.getContractType(),
        contractAddress: syncService.getContractAddress(),
        data: syncState,
      },
    };
  } catch (error) {
    context.error(`Error getting sync status: ${error}`);

    return {
      status: 500,
      jsonBody: {
        status: 'error',
        message: `Failed to get sync status: ${error.message}`,
      },
    };
  }
};

/**
 * HTTP API endpoint to get the current blockchain sync state
 */
const getSyncState = async function (
  req: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const syncState = await getBlockchainSyncState();
    return {
      status: 200,
      jsonBody: {
        success: true,
        syncState,
      },
    };
  } catch (error) {
    context.error(`Error getting sync state: ${error}`);
    return {
      status: 500,
      jsonBody: {
        success: false,
        error: 'Failed to get sync state',
        message: error.message,
      },
    };
  }
};

/**
 * HTTP API endpoint to manually trigger a blockchain sync
 */
const triggerSync = async function (
  req: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    await syncService.initialize();
    const syncResult = await syncService.syncEvents(context);
    return {
      status: 200,
      jsonBody: {
        success: true,
        message: 'Blockchain sync triggered successfully',
        syncResult,
      },
    };
  } catch (error) {
    context.error(`Error triggering sync: ${error}`);
    return {
      status: 500,
      jsonBody: {
        success: false,
        error: 'Failed to trigger blockchain sync',
        message: error.message,
      },
    };
  }
};

/**
 * HTTP API endpoint to reset the sync state to a specific block number
 */
const resetSyncState = async function (
  req: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const requestBody = (await req.json()) as { blockNumber?: string | number };
    const blockNumber = requestBody.blockNumber;

    if (blockNumber === undefined) {
      return {
        status: 400,
        jsonBody: {
          success: false,
          error: 'Missing required parameter',
          message: 'blockNumber is required',
        },
      };
    }

    // Parse the block number and validate it
    const parsedBlockNumber = parseInt(blockNumber.toString());
    if (isNaN(parsedBlockNumber) || parsedBlockNumber < 0) {
      return {
        status: 400,
        jsonBody: {
          success: false,
          error: 'Invalid block number',
          message: 'blockNumber must be a non-negative integer',
        },
      };
    }

    // Update the sync state with the new block number
    await updateBlockchainSyncState({
      lastProcessedBlock: parsedBlockNumber.toString(),
      lastProcessedTimestamp: new Date().toISOString(),
      syncStatus: 'SYNCED',
    });

    const updatedSyncState = await getBlockchainSyncState();

    return {
      status: 200,
      jsonBody: {
        success: true,
        message: `Sync state reset to block ${parsedBlockNumber}`,
        syncState: updatedSyncState,
      },
    };
  } catch (error) {
    context.error(`Error resetting sync state: ${error}`);
    return {
      status: 500,
      jsonBody: {
        success: false,
        error: 'Failed to reset sync state',
        message: error.message,
      },
    };
  }
};

/**
 * HTTP trigger function that processes incoming requests to get the latest blockchain events.
 *
 * @param req - The HTTP request object containing information about the request.
 * @param context - The context object provides information about the execution of the function.
 * @returns A promise that resolves to an HttpResponseInit object containing the response data.
 */
const getLatestEvents = async function (
  req: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('HTTP trigger function processed a request for latest events:', req.url);

  try {
    const limit = parseInt(req.query.get('limit') || '10');
    const parsedArgs = req.query.get('parsed') === 'true';
    const contractType = req.query.get('contractType');
    const contractAddress = req.query.get('contractAddress');

    const syncService = getSyncService(contractType, contractAddress);

    const events = parsedArgs
      ? await syncService.getEventsWithParsedArgs(limit)
      : await syncService.getLatestEvents(limit);

    return {
      status: 200,
      jsonBody: {
        status: 'success',
        contractType: syncService.getContractType(),
        contractAddress: syncService.getContractAddress(),
        data: events,
      },
    };
  } catch (error) {
    context.error(`Error getting latest events: ${error}`);

    return {
      status: 500,
      jsonBody: {
        status: 'error',
        message: `Failed to get latest events: ${error.message}`,
      },
    };
  }
};

/**
 * HTTP trigger function that processes incoming requests to get events by name.
 *
 * @param req - The HTTP request object containing information about the request.
 * @param context - The context object provides information about the execution of the function.
 * @returns A promise that resolves to an HttpResponseInit object containing the response data.
 */
const getEventsByName = async function (
  req: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('HTTP trigger function processed a request for events by name:', req.url);

  try {
    const eventName = req.params.eventName;
    if (!eventName) {
      return {
        status: 400,
        jsonBody: {
          status: 'error',
          message: 'Event name is required',
        },
      };
    }

    const limit = parseInt(req.query.get('limit') || '100');
    const contractType = req.query.get('contractType');
    const contractAddress = req.query.get('contractAddress');

    const syncService = getSyncService(contractType, contractAddress);

    const events = await syncService.getEventsByName(eventName, limit);

    return {
      status: 200,
      jsonBody: {
        status: 'success',
        contractType: syncService.getContractType(),
        contractAddress: syncService.getContractAddress(),
        eventName,
        data: events,
      },
    };
  } catch (error) {
    context.error(`Error getting events by name: ${error}`);

    return {
      status: 500,
      jsonBody: {
        status: 'error',
        message: `Failed to get events by name: ${error.message}`,
      },
    };
  }
};

// Export the HTTP trigger functions
export {
  getSyncStatus,
  getSyncState,
  resetSyncState,
  getLatestEvents,
  getEventsByName,
  triggerSync,
};

/**
 * HTTP route configuration for the Azure Function to get sync status.
 */
app.http('getSyncStatus', {
  methods: ['GET'],
  route: 'blockchain/sync/status',
  handler: getSyncStatus,
});

/**
 * HTTP route configuration for the Azure Function to get sync state.
 */
app.http('getSyncState', {
  methods: ['GET'],
  route: 'blockchain/sync/state',
  handler: getSyncState,
});

/**
 * HTTP route configuration for the Azure Function to reset sync state.
 */
app.http('resetSyncState', {
  methods: ['POST'],
  route: 'blockchain/sync/reset',
  handler: resetSyncState,
});

/**
 * HTTP route configuration for the Azure Function to get latest events.
 */
app.http('getLatestEvents', {
  methods: ['GET'],
  route: 'blockchain/events/latest',
  handler: getLatestEvents,
});

/**
 * HTTP route configuration for the Azure Function to get events by name.
 */
app.http('getEventsByName', {
  methods: ['GET'],
  route: 'blockchain/events/{eventName}',
  handler: getEventsByName,
});

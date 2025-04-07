import { Timer, app, InvocationContext } from '@azure/functions';

import { DATA_REGISTRY_CONTRACT_ADDRESS } from '../../constants';
import { ContractType } from '../../helpers/ContractHandlerFactory';
import { BlockchainSyncService } from '../../services/sync';

/**
 * Azure Function that triggers periodically to sync blockchain events.
 * This function initializes the blockchain sync service and then syncs events
 * from the last processed block to the latest block.
 *
 * @module
 */

// Create instances of the BlockchainSyncService for different contracts
const dataRegistrySyncService = new BlockchainSyncService(
  ContractType.DATA_REGISTRY,
  DATA_REGISTRY_CONTRACT_ADDRESS
);

// You can create additional sync services for other contracts as needed
// For example:
// const didRegistrySyncService = new BlockchainSyncService(
//   ContractType.DID_REGISTRY,
//   DID_REGISTRY_CONTRACT_ADDRESS
// );

/**
 * Timer-triggered function that runs periodically to sync blockchain events.
 *
 * @param myTimer - The timer object that provides information about the current timer.
 * @param context - The context object provides information about the execution of the function.
 * @returns A promise that resolves when the function execution is complete.
 * @throws Will throw an error if syncing blockchain events fails.
 */
const blockchainSyncTimer = async function (
  myTimer: Timer,
  context: InvocationContext
): Promise<void> {
  try {
    context.log('Blockchain sync timer triggered at', new Date().toISOString());

    // Initialize the blockchain sync service if needed
    await dataRegistrySyncService.initialize();

    // Sync blockchain events for the Data Registry contract
    const syncResult = await dataRegistrySyncService.syncEvents(context);

    context.log('Data Registry sync completed successfully', {
      contractType: dataRegistrySyncService.getContractType(),
      lastProcessedBlock: syncResult.lastProcessedBlock,
      syncStatus: syncResult.syncStatus,
      totalEventsProcessed: syncResult.totalEventsProcessed || 0,
    });

    // Uncomment to sync other contracts
    // await didRegistrySyncService.initialize();
    // const didSyncResult = await didRegistrySyncService.syncEvents(context);
    // context.log('DID Registry sync completed successfully', {
    //   contractType: didRegistrySyncService.getContractType(),
    //   lastProcessedBlock: didSyncResult.lastProcessedBlock,
    //   syncStatus: didSyncResult.syncStatus,
    //   totalEventsProcessed: didSyncResult.totalEventsProcessed
    // });
  } catch (error) {
    context.error(`Error syncing blockchain events: ${error}`);
  }
};

export default blockchainSyncTimer;

/**
 * Timer configuration for the Azure Function.
 * Runs every 5 minutes by default, but can be configured via environment variables.
 */
app.timer('blockchainSyncTimer', {
  schedule: process.env.BLOCKCHAIN_SYNC_SCHEDULE || '0 */50 * * * *', // Run every 50 minutes by default
  handler: blockchainSyncTimer,
  runOnStartup: true,
});

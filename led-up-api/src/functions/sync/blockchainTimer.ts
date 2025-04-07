// import { randomUUID } from 'crypto';

// import { Timer, app, InvocationContext } from '@azure/functions';
// import { LogDescription } from 'ethers';

// import { DATA_REGISTRY_CONTRACT_ADDRESS } from '../../constants';
// import { getEntity, updateEntity } from '../../db';
// import { writeDatabase } from '../../db/writeToDatabase';
// import { stringifyBigInt } from '../../helpers/bigIntStringify';
// import DataRegistry from '../../helpers/data-registry';
// import { provider } from '../../helpers/provider';
// import { BlockchainRecordType } from '../../types';

// const tableName = process.env.TABLE_NAME;
// const partitionKey = process.env.PARTITION_KEY;
// const rowKey = process.env.ROW_KEY;

// /**
//  * Azure Function that triggers periodically to query past events from the blockchain
//  * and write them to the database.
//  *
//  * @module
//  */

// /**
//  * Queries past events from the blockchain and writes them to the database.
//  *
//  * @param context - The context object provides information about the execution of the function.
//  * @returns A promise that resolves to a BlockchainRecordType object containing the latest event data.
//  */
// async function queryPastEvents(context: InvocationContext): Promise<BlockchainRecordType> {
//   // Fetch the last processed block height from persistent storage
//   const lastProcessedBlock = await getLastProcessedBlock();
//   console.log({ lastProcessedBlock });

//   // Define the filter for the Transfer event
//   // const filter = DataRegistry.filters.ProducerRecordAdded();

//   const fromBlock = lastProcessedBlock + 1;
//   const toBlock = 'latest';

//   // Query past events
//   const loggings = await provider.getLogs({
//     fromBlock,
//     toBlock,
//     address: DATA_REGISTRY_CONTRACT_ADDRESS,
//   });

//   // Write the logs to the database
//   const entity = await writeToDatabase(context, loggings);

//   await updateLastProcessedBlock(entity);

//   return entity;
// }

// /**
//  * Retrieves the last processed block number from persistent storage.
//  *
//  * @returns A promise that resolves to the last processed block number.
//  * @throws Will throw an error if the entity cannot be retrieved.
//  */
// async function getLastProcessedBlock(): Promise<number> {
//   const entity = (await getEntity(tableName, partitionKey, rowKey)) as any;

//   return parseInt(entity.blockNumber);
// }

// /**
//  * Updates the last processed block information in the database.
//  *
//  * @param data - The BlockchainRecordType object containing event data to update.
//  * @returns A promise that resolves when the update is complete.
//  */
// async function updateLastProcessedBlock(data: BlockchainRecordType): Promise<void> {
//   if (!data) return;
//   const entity = {
//     partitionKey,
//     rowKey,
//     blockNumber: data.blockNumber,
//     blockHash: data.blockHash,
//     transactionHash: data.transactionHash,
//     transactionIndex: data.transactionIndex,
//     eAddress: data.eAddress,
//     eData: data.eData,
//     topics: data.topics,
//     args: data.args,
//     eSignature: data.eSignature,
//     eName: data.eName,
//     eTopic: data.eTopic,
//     eTimestamp: data.eTimestamp,
//   };

//   await updateEntity(tableName, entity);
// }

// /**
//  * Writes the fetched logs to the database.
//  *
//  * @param context - The context object provides information about the execution of the function.
//  * @param loggings - An array of log entries retrieved from the blockchain.
//  * @returns A promise that resolves to the last written BlockchainRecordType object.
//  * @throws Will throw an error if writing to the database fails.
//  */
// async function writeToDatabase(
//   context: InvocationContext,
//   loggings: any[]
// ): Promise<BlockchainRecordType> {
//   // Handle the case where loggings might be empty
//   if (loggings.length === 0) {
//     context.trace('No logs to write to the database.');
//   }

//   let entity: BlockchainRecordType;

//   // Write the logs to the database
//   for (const log of loggings) {
//     const desc = (await DataRegistry.interface.parseLog(log)) as LogDescription;

//     entity = {
//       partitionKey,
//       id: randomUUID(),
//       rowKey: log.transactionHash,
//       blockNumber: log.blockNumber.toString(),
//       blockHash: log.blockHash,
//       transactionHash: log.transactionHash,
//       transactionIndex: log.transactionIndex.toString(),
//       eAddress: log.address,
//       eData: JSON.stringify(log.data),
//       topics: JSON.stringify(log.topics),
//       args: JSON.stringify(stringifyBigInt(desc.args)),
//       eSignature: desc.signature,
//       eName: desc.name,
//       eTopic: JSON.stringify(desc.topic),
//       eTimestamp: new Date().toISOString(),
//     };

//     await writeDatabase(entity);
//   }

//   return entity;
// }

// /**
//  * Timer-triggered function that runs periodically to query past events.
//  *
//  * @param myTimer - The timer object that provides information about the current timer.
//  * @param context - The context object provides information about the execution of the function.
//  * @returns A promise that resolves when the function execution is complete.
//  * @throws Will throw an error if querying past events fails.
//  */
// const timerTrigger = async function (myTimer: Timer, context: InvocationContext): Promise<void> {
//   try {
//     context.log('Timer trigger function ran at', new Date().toISOString());
//     context.log(myTimer);

//     await queryPastEvents(context);
//   } catch (error) {
//     context.error(`Error updating event: ${error}`);
//   }
// };

// export default timerTrigger;

// /**
//  * Timer configuration for the Azure Function.
//  */
// app.timer('timerTrigger', {
//   schedule: '0 */20 * * * *', // Run every 20 minutes
//   handler: timerTrigger,
//   runOnStartup: true,
// });

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import DataRegistry from '../helpers/data-registry';
import { provider } from '../helpers/provider';
import { DATA_REGISTRY_CONTRACT_ADDRESS } from '../constants';
import { getEntity, updateEntity } from '../db';
import { writeDatabase } from '../db/writeToDatabase';
import { LogDescription } from 'ethers';
import { BlockchainRecordType } from '../types';

const tableName = process.env.TABLE_NAME;
const partitionKey = process.env.PARTITION_KEY;
const rowKey = process.env.ROW_KEY;

/**
 * Azure Function that triggers periodically to query past events from the blockchain
 * and write them to the database.
 *
 * @module
 */

/**
 * Queries past events from the blockchain and writes them to the database.
 *
 * @param context - The context object provides information about the execution of the function.
 * @returns A promise that resolves to a BlockchainRecordType object containing the latest event data.
 */
async function queryPastEvents(context: InvocationContext) {
  // Fetch the last processed block height from persistent storage
  const lastProcessedBlock = await getLastProcessedBlock();

  // Define the filter for the Transfer event
  const filter = DataRegistry.filters.ProducerRecordAdded();

  const fromBlock = lastProcessedBlock + 1; // Start from the last processed block + 1

  console.log({ fromBlock });

  const toBlock = 'latest';

  const loggings = await provider.getLogs({
    fromBlock,
    toBlock,
    address: DATA_REGISTRY_CONTRACT_ADDRESS,
  });

  const entity = await writeToDatabase(loggings);

  updateLastProcessedBlock(entity);

  return entity;
}

/**
 * Retrieves the last processed block number from persistent storage.
 *
 * @returns A promise that resolves to the last processed block number, or 0 if retrieval fails.
 */
async function getLastProcessedBlock(): Promise<number> {
  try {
    const entity = (await getEntity(tableName, partitionKey, rowKey)) as any;

    return parseInt(entity.blockNumber);
  } catch (error) {
    // Handle error or return a default value
    return 0;
  }
}

/**
 * Updates the last processed block information in the database.
 *
 * @param data - The BlockchainRecordType object containing event data to update.
 * @returns A promise that resolves when the update is complete.
 */
async function updateLastProcessedBlock(data: BlockchainRecordType): Promise<void> {
  if (!data) return;
  const entity = {
    partitionKey,
    rowKey,
    blockNumber: data.blockNumber,
    blockHash: data.blockHash,
    transactionHash: data.transactionHash,
    transactionIndex: data.transactionIndex,
    eAddress: data.eAddress,
    eData: data.eData,
    topics: data.topics,
    args: data.args,
    eSignature: data.eSignature,
    eName: data.eName,
    eTopic: data.eTopic,
    eTimestamp: data.eTimestamp,
  };
  await updateEntity(tableName, entity);
}

/**
 * Writes the fetched logs to the database.
 *
 * @param loggings - An array of log entries retrieved from the blockchain.
 * @returns A promise that resolves to the last written BlockchainRecordType object.
 * @throws Will throw an error if writing to the database fails.
 */
async function writeToDatabase(loggings: any[]): Promise<any> {
  // Write the logs to the database
  let entity: BlockchainRecordType;
  for (const log of loggings) {
    const desc = (await DataRegistry.interface.parseLog(log)) as LogDescription;

    entity = {
      partitionKey,
      rowKey: log.transactionHash,
      blockNumber: log.blockNumber.toString(),
      blockHash: log.blockHash,
      transactionHash: log.transactionHash,
      transactionIndex: log.transactionIndex.toString(),
      eAddress: log.address,
      eData: JSON.stringify(log.data),
      topics: JSON.stringify(log.topics),
      args: JSON.stringify(desc.args),
      eSignature: desc.signature,
      eName: desc.name,
      eTopic: JSON.stringify(desc.topic),
      eTimestamp: new Date().toISOString(),
    };

    await writeDatabase(entity);
  }
  // @ts-ignore
  return entity;
}

/**
 * HTTP trigger function that processes incoming requests to refresh past events.
 *
 * @param req - The HTTP request object containing information about the request.
 * @param context - The context object provides information about the execution of the function.
 * @returns A promise that resolves to an HttpResponseInit object containing the response data.
 */
const refreshEvents = async function (req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log('HTTP trigger function processed a request:', req.url);

  const lastProcessedData = await queryPastEvents(context);

  return {
    body: lastProcessedData,
  };
};

export default refreshEvents;

/**
 * HTTP route configuration for the Azure Function.
 */
app.http('refreshEvents', {
  methods: ['GET'],
  route: 'refreshEvents',
  handler: refreshEvents,
});

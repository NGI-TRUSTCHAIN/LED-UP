import { Timer } from '@azure/functions';
import { app, InvocationContext } from '@azure/functions';
import DataRegistry from '../helpers/data-registry';
import { BlockchainRecordType, sendToSql, write, writeDatabase } from '../db/writeToDatabase';
import { DATA_REGISTRY_CONTRACT_ADDRESS } from '../constants';
import { provider } from '../helpers/provider';
import { getEntity, updateEntity } from '../db';
import { randomUUID } from 'crypto';
import { LogDescription } from 'ethers';
import { stringifyBigInt } from '../helpers/bigIntStringify';

const tableName = 'BlockTracker';
const partitionKey = 'LedUpBlockchain';
const rowKey = 'LastProcessedBlock';

// Function to query past events
async function queryPastEvents(context: InvocationContext) {
  // Fetch the last processed block height from persistent storage
  const lastProcessedBlock = await getLastProcessedBlock();
  console.log({ lastProcessedBlock });

  // Define the filter for the Transfer event
  const filter = DataRegistry.filters.ProducerRecordAdded();

  const fromBlock = lastProcessedBlock + 1;
  const toBlock = 'latest';

  // Query past events
  const loggings = await provider.getLogs({
    fromBlock,
    toBlock,
    address: DATA_REGISTRY_CONTRACT_ADDRESS,
  });

  // Write the logs to the database
  const entity = await writeToDatabase(context, loggings);

  await updateLastProcessedBlock(entity);

  return entity;
}

async function getLastProcessedBlock(): Promise<number> {
  try {
    const entity = (await getEntity(tableName, partitionKey, rowKey)) as any;
    return parseInt(entity.blockNumber);
  } catch (error) {
    throw error;
  }
}

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

async function writeToDatabase(context: InvocationContext, loggings: any[]): Promise<BlockchainRecordType> {
  // Handle the case where loggings might be empty
  if (loggings.length === 0) {
    context.trace('No logs to write to the database.');
  }

  let entity: BlockchainRecordType;

  // Write the logs to the database
  for (const log of loggings) {
    const desc = (await DataRegistry.interface.parseLog(log)) as LogDescription;

    entity = {
      partitionKey,
      id: randomUUID(),
      rowKey: log.transactionHash,
      blockNumber: log.blockNumber.toString(),
      blockHash: log.blockHash,
      transactionHash: log.transactionHash,
      transactionIndex: log.transactionIndex.toString(),
      eAddress: log.address,
      eData: JSON.stringify(log.data),
      topics: JSON.stringify(log.topics),
      args: JSON.stringify(stringifyBigInt(desc.args)),
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

const timerTrigger = async function (myTimer: Timer, context: InvocationContext): Promise<void> {
  try {
    context.log('Timer trigger function ran at', new Date().toISOString());
    context.log(myTimer);

    await queryPastEvents(context);
  } catch (error) {
    context.error(`Error updating event: ${error}`);
  }
};

export default timerTrigger;

app.timer('timerTrigger', {
  schedule: '0 */20 * * * *', // Run every 5 minutes
  handler: timerTrigger,
  runOnStartup: true,
});

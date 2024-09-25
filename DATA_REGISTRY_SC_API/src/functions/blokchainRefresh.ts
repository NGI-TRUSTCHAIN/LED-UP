import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import DataRegistry from '../helpers/data-registry';
import { provider } from '../helpers/provider';
import { DATA_REGISTRY_CONTRACT_ADDRESS } from '../constants';
import { getEntity, updateEntity } from '../db';
import { BlockchainRecordType, writeDatabase } from '../db/writeToDatabase';
import { LogDescription } from 'ethers';

const tableName = 'BlockTracker';
const partitionKey = 'LedUpBlockchain';
const rowKey = 'LastProcessedBlock';

// Function to query past events
async function queryPastEvents(context: InvocationContext) {
  // Fetch the last processed block height from persistent storage
  const lastProcessedBlock = await getLastProcessedBlock();

  // Define the filter for the Transfer event
  const filter = DataRegistry.filters.ProducerRecordAdded();

  const fromBlock = lastProcessedBlock + 1; // Start from the last processed block + 1

  console.log({ fromBlock });

  const toBlock = 'latest';

  // Query past events
  const loggings = await provider.getLogs({
    fromBlock,
    toBlock,
    address: DATA_REGISTRY_CONTRACT_ADDRESS,
  });

  // ==================== I NEED TO WRITE LOGGINGS TO DATABASE ====================
  const entity = await writeToDatabase(loggings);

  updateLastProcessedBlock(entity);

  return entity;
}

async function getLastProcessedBlock(): Promise<number> {
  try {
    const entity = (await getEntity(tableName, partitionKey, rowKey)) as any;

    return parseInt(entity.blockNumber);
  } catch (error) {
    // Handle error or return a default value
    return 0;
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

const refreshEvents = async function (req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log('HTTP trigger function processed a request:', req.url);

  const lastProcessedData = await queryPastEvents(context);

  return {
    body: lastProcessedData,
  };
};

export default refreshEvents;

app.http('refreshEvents', {
  methods: ['GET'],
  route: 'refreshEvents',
  handler: refreshEvents,
});

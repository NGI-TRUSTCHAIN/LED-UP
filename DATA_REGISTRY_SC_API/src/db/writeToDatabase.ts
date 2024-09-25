import { InvocationContext, output } from '@azure/functions';
import poolPromise from './connect';

export type BlockchainRecordType = {
  partitionKey?: string;
  rowKey?: string;
  transactionIndex?: string;
  id?: string;
  transactionHash: string;
  blockHash: string;
  blockNumber: string;
  eAddress: string;
  eData: string;
  topics: string;
  args: string;
  eSignature: string;
  eName: string;
  eTopic: string;
  eTimestamp: string;
};

export const writeDatabase = async (data: BlockchainRecordType) => {
  try {
    if (!data.id) data.id = crypto.randomUUID();
    const sqlString = `INSERT INTO dbo.DataRegistryEvents (id, transactionHash, blockHash, blockNumber, eAddress, eData, topics, args, eSignature, eName, eTopic, eTimestamp)
                    VALUES (@id, @transactionHash, @blockHash, @blockNumber, @eAddress, @eData, @topics, @args, @eSignature, @eName, @eTopic, @eTimestamp)`;
    const pool = await poolPromise;
    const request = pool.request();
    request.input('id', data.id);
    request.input('transactionHash', data.transactionHash);
    request.input('blockHash', data.blockHash);
    request.input('blockNumber', data.blockNumber);
    request.input('eData', data.eData);
    request.input('topics', data.topics);
    request.input('args', data.args);
    request.input('eAddress', data.eAddress);
    request.input('eSignature', data.eSignature);
    request.input('eName', data.eName);
    request.input('eTopic', data.eTopic);
    request.input('eTimestamp', data.eTimestamp);

    const result = await request.query(sqlString);
    return result;
  } catch (error) {
    console.error(error);
  }
};

export const sendToSql = output.sql({
  commandText: '[dbo].[DataRegistryEvents]',
  connectionStringSetting: 'SqlConnectionString',
});

export const write = (context: InvocationContext, data: BlockchainRecordType) => {
  // console.log('Writing to database');
  context.extraOutputs.set(sendToSql, JSON.stringify(data));
  // console.log('write to database');
};

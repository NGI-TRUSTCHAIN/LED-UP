import { InvocationContext, output } from '@azure/functions';
import poolPromise from './connect';
import { BlockchainRecordType } from '../types';

/**
 * Writes a BlockchainRecordType entry to the database.
 * If the id is not provided, it generates a new UUID.
 *
 * @param {BlockchainRecordType} data - The blockchain record data to be written to the database.
 * @returns {Promise<any>} - A promise that resolves with the result of the database query.
 * @throws {Error} - Throws an error if the database operation fails.
 */
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

/**
 * SQL output configuration for sending data to the SQL database.
 *
 * @type {SqlOutput}
 */
export const sendToSql = output.sql({
  commandText: '[dbo].[DataRegistryEvents]',
  connectionStringSetting: 'SqlConnectionString',
});

/**
 * Sends the provided BlockchainRecordType data to the SQL database context.
 *
 * @param {InvocationContext} context - The context of the Azure Function invocation.
 * @param {BlockchainRecordType} data - The blockchain record data to be sent.
 */
export const write = (context: InvocationContext, data: BlockchainRecordType) => {
  context.extraOutputs.set(sendToSql, JSON.stringify(data));
};

export const readLatestBlocks = async () => {
  const pool = await poolPromise;
  const result = await pool.request().query('SELECT TOP 10 * FROM dbo.DataRegistryEvents ORDER BY eTimestamp DESC');
  return result.recordset;
};

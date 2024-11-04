import {
  AzureNamedKeyCredential,
  odata,
  TableClient,
  TableEntityQueryOptions,
  TableEntityResult,
  TableServiceClient,
  TransactionAction,
} from '@azure/data-tables';

/**
 * Configuration for connecting to SQL Database.
 * @constant {Object} dbConfig
 * @property {string} user - Username for SQL Database.
 * @property {string} password - Password for SQL Database.
 * @property {string} server - Server URL for SQL Database (e.g., "myserver.database.windows.net").
 * @property {string} database - Name of the SQL Database.
 * @property {Object} options - Additional options for connection.
 * @property {boolean} options.encrypt - Indicates whether to encrypt the connection (default is true).
 */
export const dbConfig = {
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  server: process.env.SQL_SERVER, // e.g. "myserver.database.windows.net"
  database: process.env.SQL_DATABASE,
  options: {
    encrypt: true,
  },
};

// Endpoint configuration for Azure Table Storage
const endpoint = process.env.TABLE_ACCOUNT_ENDPOINT as string; // e.g. "https://myaccount.table.core.windows.net/"
const accountName = process.env.TABLE_ACCOUNT_NAME as string;
const accountKey = process.env.TABLE_ACCOUNT_KEY as string;
// const credential = new AzureNamedKeyCredential(accountName, accountKey);
// const tableService = new TableServiceClient(endpoint, credential);

// Connection method using a connection string
const tableService = TableServiceClient.fromConnectionString(process.env.TABLE_CONNECTION_STRING as string);

/**
 * Creates a new table in Azure Table Storage if it does not already exist.
 * @param {string} tableName - The name of the table to create.
 * @returns {Promise<void>} - A promise that resolves when the table is created.
 */
export const createTable = async (tableName: string) => {
  await tableService.createTable(tableName);
};

/**
 * Creates a TableClient instance for interacting with a specified table.
 * @param {string} tableName - The name of the table to interact with.
 * @returns {Promise<TableClient>} - A promise that resolves to a TableClient instance.
 */
export const createTableClient = async (tableName: string) => {
  return new TableClient(endpoint, tableName, new AzureNamedKeyCredential(accountName, accountKey));
};

/**
 * Adds an entity to the specified table in Azure Table Storage.
 * @param {string} tableName - The name of the table to add the entity to.
 * @param {Object} entity - The entity to add, must contain partitionKey and rowKey.
 * @returns {Promise<void>} - A promise that resolves when the entity is added.
 */
export const addEntity = async (tableName: string, entity: any) => {
  const tableClient = await createTableClient(tableName);
  await tableClient.createEntity(entity);
};

/**
 * Retrieves an entity from the specified table using its partitionKey and rowKey.
 * @param {string} tableName - The name of the table to retrieve the entity from.
 * @param {string} partitionKey - The partition key of the entity.
 * @param {string} rowKey - The row key of the entity.
 * @returns {Promise<Object>} - A promise that resolves to the retrieved entity.
 */
export const getEntity = async (tableName: string, partitionKey: string, rowKey: string) => {
  const tableClient = await createTableClient(tableName);
  const entity = await tableClient.getEntity(partitionKey, rowKey);
  return entity;
};

/**
 * Updates an existing entity in the specified table.
 * @param {string} tableName - The name of the table containing the entity to update.
 * @param {Object} entity - The updated entity object (must contain partitionKey and rowKey).
 * @returns {Promise<void>} - A promise that resolves when the entity is updated.
 */
export const updateEntity = async (tableName: string, entity: any) => {
  const tableClient = await createTableClient(tableName);
  await tableClient.updateEntity(entity, 'Replace'); // 'Merge' or 'Replace'
};

/**
 * Deletes an entity from the specified table using its partitionKey and rowKey.
 * @param {string} tableName - The name of the table to delete the entity from.
 * @param {string} partitionKey - The partition key of the entity.
 * @param {string} rowKey - The row key of the entity.
 * @returns {Promise<void>} - A promise that resolves when the entity is deleted.
 */
export const deleteEntity = async (tableName: string, partitionKey: string, rowKey: string) => {
  const tableClient = await createTableClient(tableName);
  await tableClient.deleteEntity(partitionKey, rowKey);
};

/**
 * Deletes a table from Azure Table Storage.
 * @param {string} tableName - The name of the table to delete.
 * @returns {Promise<void>} - A promise that resolves when the table is deleted.
 */
export const deleteTable = async (tableName: string) => {
  await tableService.deleteTable(tableName);
};

/**
 * Performs a batch action on a specified table, allowing multiple entities to be created or modified in a single operation.
 * @param {string} tableName - The name of the table for the batch operation.
 * @param {TransactionAction[]} entities - An array of TransactionAction objects representing the entities to be created or modified.
 * @returns {Promise<void>} - A promise that resolves when the batch action is complete.
 */
export const performBatchAction = async (tableName: string, entities: TransactionAction[]) => {
  const tableClient = await createTableClient(tableName);
  await tableClient.submitTransaction(entities);
};

/**
 * Queries a set of entities from a specified table in Azure Table Storage based on partition key and optional filters.
 * @param {string} tableName - The name of the table to query.
 * @param {number} topN - The maximum number of entities to return.
 * @param {string} partitionKey - The partition key to filter the entities by.
 * @param {string} [filter] - Optional OData filter string to apply to the query.
 * @param {string[]} [select] - Optional array of property names to select.
 * @returns {Promise<TableEntityResult<any>>} - A promise that resolves to an array of entities matching the query.
 */
export const queryEntities = async (
  tableName: string,
  topN: number,
  partitionKey: string,
  filter?: string,
  select?: string[]
): Promise<TableEntityResult<any>> => {
  const tableClient = new TableClient('<connection-string>', tableName);

  const queryOptions: TableEntityQueryOptions = {
    filter: odata`PartitionKey eq '${partitionKey}'${filter ? ' and ' + filter : ''}`,
    select,
  };

  let entities: any[] = [];
  let continuationToken: string | undefined = undefined;

  do {
    const page: any = await tableClient
      .listEntities({ queryOptions })
      .byPage({ maxPageSize: topN, continuationToken })
      .next();

    continuationToken = page.value.continuationToken;

    if (!page.done) {
      entities = [...entities, ...page.value];
    }
  } while (continuationToken);

  return entities;
};

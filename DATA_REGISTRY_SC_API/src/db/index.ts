import {
  AzureNamedKeyCredential,
  odata,
  TableClient,
  TableEntityQueryOptions,
  TableEntityResult,
  TableServiceClient,
  TransactionAction,
} from '@azure/data-tables';

// Set up database configuration
export const dbConfig = {
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  server: process.env.SQL_SERVER, // e.g. "myserver.database.windows.net"
  database: process.env.SQL_DATABASE,
  options: {
    encrypt: true,
  },
};

// connection - method - 1

const endpoint = process.env.TABLE_ACCOUNT_ENDPOINT as string; // e.g. "https://myaccount.table.core.windows.net/"

const accountName = process.env.TABLE_ACCOUNT_NAME as string;
const accountKey = process.env.TABLE_ACCOUNT_KEY as string;
// const credential = new AzureNamedKeyCredential(accountName, accountKey);

// const tableService = new TableServiceClient(endpoint, credential);

// connection - method - 2

const tableService = TableServiceClient.fromConnectionString(process.env.TABLE_CONNECTION_STRING as string);

// creates new table if it doesn't exist
export const createTable = async (tableName: string) => {
  await tableService.createTable(tableName);
};

// to interact with table
export const createTableClient = async (tableName: string) => {
  return new TableClient(endpoint, tableName, new AzureNamedKeyCredential(accountName, accountKey));
};

// add entity to table
// entity should have partitionKey and rowKey - uniquely identifying the entity

export const addEntity = async (tableName: string, entity: any) => {
  const tableClient = await createTableClient(tableName);
  await tableClient.createEntity(entity);
};

// get entity from table
export const getEntity = async (tableName: string, partitionKey: string, rowKey: string) => {
  const tableClient = await createTableClient(tableName);
  const entity = await tableClient.getEntity(partitionKey, rowKey);
  return entity;
};

// update entity in table
export const updateEntity = async (tableName: string, entity: any) => {
  const tableClient = await createTableClient(tableName);
  await tableClient.updateEntity(entity, 'Replace'); // 'Merge' or 'Replace'
};

// delete entity from table
export const deleteEntity = async (tableName: string, partitionKey: string, rowKey: string) => {
  const tableClient = await createTableClient(tableName);
  await tableClient.deleteEntity(partitionKey, rowKey);
};

export const deleteTable = async (tableName: string) => {
  await tableService.deleteTable(tableName);
};

// create multiple atomic entities in table
export const performBatchAction = async (tableName: string, entities: TransactionAction[]) => {
  const tableClient = await createTableClient(tableName);
  await tableClient.submitTransaction(entities);
};

// query a set of entities from table
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

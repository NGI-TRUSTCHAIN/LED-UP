const sql = require('mssql');

const server = process.env.DB_SERVER;
const port = Number(process.env.DB_PORT);
const database = process.env.DB_NAME;
const type = 'azure-active-directory-default';

/**
 * Configuration for SQL Server connection.
 */
const config = {
  server,
  port,
  database,
  authentication: {
    type,
  },
  options: {
    encrypt: true, // Use encryption for the connection
  },
};

/**
 * Create a connection pool and connect to the database.
 *
 * @returns {Promise<sql.ConnectionPool>} A promise that resolves to the connection pool.
 */
const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then((pool) => {
    console.log('Connected to SQL Server');
    return pool;
  })
  .catch((err) => {
    console.error('Database Connection Failed! Bad Config: ', err);
    return Promise.reject(err);
  });

export default poolPromise;

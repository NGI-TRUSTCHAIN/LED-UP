import * as sql from 'mssql';
import { config as SqlConfig } from 'mssql';

// Get connection parameters from environment variables
const server = process.env.DB_SERVER;
const port = Number(process.env.DB_PORT) || 1433;
const database = process.env.DB_NAME;
const user = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;

/**
 * Configuration for SQL Server connection.
 */
const config: SqlConfig = {
  server,
  port,
  database,
  user,
  password,
  options: {
    encrypt: true,
    trustServerCertificate: false,
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

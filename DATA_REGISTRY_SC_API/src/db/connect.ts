const sql = require('mssql');

// export const config = {
//   // user: process.env.DB_USER,
//   // password: process.env.DB_PASSWORD,
//   server: process.env.DB_SERVER,
//   database: process.env.DB_NAME,
//   user: process.env.AZURE_SQL_USER,
//   password: process.env.AZURE_SQL_PASSWORD,
//   port: 1433,
//   options: {
//     encrypt: true,
//     enableArithAbort: true,
//   },
//   pool: {
//     max: 10,
//     min: 0,
//     idleTimeoutMillis: 30000, // 30 seconds
//   },
// };

const server = process.env.DB_SERVER;
const port = Number(process.env.DB_PORT);
const database = process.env.DB_NAME;
const type = 'azure-active-directory-default';

const config = {
  server,
  port,
  database,
  authentication: {
    type,
  },
  options: {
    encrypt: true,
  },
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then((pool: any) => {
    console.log('Connected to SQL Server');
    return pool;
  })
  .catch((err: any) => {
    console.log('Database Connection Failed! Bad Config: ', err);
    return Promise.reject(err);
  });

export default poolPromise;

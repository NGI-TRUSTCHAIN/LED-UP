# LED-UP Smart Contract Operations API

This API is used to interact with the LED-UP Smart Contract and IPFS. It is used to perform all operations such as encryption, data upload, data sharing, and data retrieval action on the LED-UP Smart Contract ad the correcsponding IPFS Node.

## Features

- **Serverless**: Leverage Azure Functions for event-driven, scalable applications.
- **TypeScript**: Provides strong typing for easier development and bug prevention.
- **HTTP Triggers**: Easily handle HTTP requests to implement APIs or webhooks.
- **Unit Tests**: Set up with Jest to test the business logic of functions.
- **CI/CD**: Compatible with GitHub Actions and Azure Pipelines for automatic deployment.

## Project Structure

```bash
├── src                     # Source code for the Azure Functions
│   ├── constants           # Constants used in the functions
│   ├── data                # Data operations
│   ├── db                  # Database operations
│   ├── functions           # Individual function logic
│   ├── helpers             # Helper functions
│   ├── index.ts            # Entry point for the Azure Functions
│   ├── types               # TypeScript types
│   └── utils               # Reusable utilities
├── local.settings.json     # Local environment variables
├── tsconfig.json           # TypeScript configuration
├── package.json           # NPM dependencies and scripts
├── package-lock.json      # NPM lock file
├── .gitignore            # Git ignore file
└── README.md            # Project documentation
```

## Prerequisites

Before you can use this API locally, you need to have the following:

- Node.js 18.x or later installed on your machine
- TypeScript 4.x or later
- A running LED-UP Smart Contract - see [LED-UP Smart Contract](https://github.com/NGI-TRUSTCHAIN/LED-UP/blob/master/LED-UP-SMART-CONTRACTS/README.md) for more information
- A running IPFS Node - you can use Pinata, Infura, or your own IPFS Node - see [IPFS](https://ipfs.io) for more information
- Visual Studio Code
- Azure Functions Core Tools - for local development
- Azure Functions Extension - for Visual Studio Code

## Setup Instructions

1. **Clone the repository**:

   ```bash
   git clone https://github.com/your-repo/azure-functions-typescript.git
   cd azure-functions-typescript
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up environment variables**:

   The project requires several environment variables. They are stored in the local.settings.json for local development and in Azure Application Settings for production.
   Create a `local.settings.json` file at the project root if it doesn't already exist. This file should not be committed to version control. Here’s an example setting that you can use:

   ```json
   {
     "IsEncrypted": false,
     "Values": {
       "DATA_REGISTRY_CONTRACT_ADDRESS": "data-registry-contract-address",
       "COMPENSATION_CONTRACT_ADDRESS": "compensation-contract-address",
       "TOKEN_ADDRESS": "your-token-address",
       "OWNER_ADDRESS": "owner-wallet-address",
       "PRIVATE_KEY": "owner-wallet-private-key",
       "PATIENT_ADDRESS": "patient-wallet-address",
       "PATIENT_PRIVATE_KEY": "patient-wallet-private-key",

       "RPC_URL": "local-rpc-url(localhost:8545)",
       "ALCHEMY_API_KEY": "your-alchemy-api-key",
       "INFURA_API_KEY": "infura-api-key-optional",

       "AzureWebJobsStorage": "your-webjobsstorage-connection-string-here-or-use-azure-storage-emulator",
       "DB_NAME": "azure-sql-db-name-for-data-sync-operations",
       "DB_PORT": "azure-sql-db-port",
       "DB_SERVER": "sql-server-url",
       "ENCRYPTION_KEY": "encryption-key-for-data-encryption",
       "FUNCTIONS_EXTENSION_VERSION": "~4",
       "FUNCTIONS_WORKER_RUNTIME": "node",

       "TABLE_ACCOUNT_ENDPOINT": "your-azure-table-account-endpoint",
       "TABLE_ACCOUNT_KEY": "your-azure-table-account-key",
       "TABLE_ACCOUNT_NAME": "your-azure-table-account-name",
       "TABLE_CONNECTION_STRING": "your-azure-table-connection-string",
       "TABLE_NAME": "your-azure-table-name",
       "PARTITION_KEY": "your-azure-table-partition-key",
       "ROW_KEY": "your-azure-table-row-key",
       "SqlConnectionString": "azure-sql-connection-string",
       "WEBSITE_CONTENTSHARE": "your-website-content-share",

       "PINATA_JWT": "your-pinata-jwt",
       "API_KEY": "your-pinata-api-key",
       "API_SECRET": "your-pinata-api-secret",
       "GATEWAY_URL": "your-ipfs-gateway-url"
     },
     "Host": {
       "CORS": "*",
       "CORSCredentials": false
     }
   }
   ```

4. **Run the Azure Functions locally**:
   Start the Azure Functions runtime locally to test your application: this command will build the TypeScript code and start the runtime.

   ```bash
   npm start
   ```

5. **Access the functions**:
   Once the runtime is running, you can invoke the function by navigating to:

   ```
   http://localhost:7071/api/{function-name}
   ```

   You can use Postman or any other API testing tool to test the functions.

## Deployment

To deploy the application to Azure:

1. **Login to Azure**:

   ```bash
   az login
   ```

2. **Create a resource group** (if not done already):

   ```bash
   az group create --name <resource-group-name> --location <location>
   ```

3. **Create a new Azure Function App**:

   ```bash
   az functionapp create --resource-group <resource-group-name> --consumption-plan-location <location> --runtime node --functions-version 4 --name <function-app-name> --storage-account <storage-account-name>
   ```

4. **Deploy the application**:

   ```bash
   npm run deploy
   ```

   This script will automatically build and deploy the functions to Azure.

## Contributing

We welcome contributions to this project! Please follow these steps:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/my-feature`).
3. Commit your changes (`git commit -m 'Add feature'`).
4. Push to the branch (`git push origin feature/my-feature`).
5. Create a new Pull Request.

## License

AGPL-3.0 license

## Contact

led-up@modern-miracle.com

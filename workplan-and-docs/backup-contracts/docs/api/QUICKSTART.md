# LED-UP Smart Contract API Quick Start Guide

This guide provides a quick overview of the LED-UP Smart Contract API project and how to get started with development.

## Project Overview

The LED-UP Smart Contract API is an Azure Functions-based API that interacts with Ethereum smart contracts for the LED-UP platform. It provides endpoints for data registry operations, compensation management, and administrative functions.

## Getting Started

### Prerequisites

- Node.js 18.x or later
- TypeScript 4.x or later
- Azure Functions Core Tools
- Visual Studio Code with Azure Functions extension

### Setup Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-repo/led-up.git
   cd led-up/ledup-sc-api
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure local settings**

   Create or update `local.settings.json` with appropriate values:

   ```json
   {
     "IsEncrypted": false,
     "Values": {
       "DATA_REGISTRY_CONTRACT_ADDRESS": "your-data-registry-contract-address",
       "COMPENSATION_CONTRACT_ADDRESS": "your-compensation-contract-address",
       "TOKEN_ADDRESS": "your-token-address",
       "OWNER_ADDRESS": "your-owner-wallet-address",
       "PRIVATE_KEY": "your-private-key",
       "RPC_URL": "your-rpc-url",
       "ALCHEMY_API_KEY": "your-alchemy-api-key",
       "FUNCTIONS_WORKER_RUNTIME": "node"
     }
   }
   ```

4. **Build the project**

   ```bash
   npm run build
   ```

5. **Run locally**

   ```bash
   npm start
   ```

## Project Structure

- **src/constants/**: Contract ABIs and other constants
- **src/functions/**: Azure Functions implementation
- **src/helpers/**: Helper functions for common operations
- **src/types/**: TypeScript type definitions
- **src/db/**: Database connection and operations
- **src/utils/**: Utility functions

## Key Concepts

### Smart Contract Interaction

The API uses ethers.js to interact with Ethereum smart contracts. Contract ABIs are stored in `src/constants/` and are used to create contract instances.

Example:

```typescript
import { ethers } from 'ethers';
import DataRegistryABI from '../constants/data-registry.abi';

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const dataRegistry = new ethers.Contract(process.env.DATA_REGISTRY_CONTRACT_ADDRESS, DataRegistryABI, signer);

// Call contract methods
const result = await dataRegistry.someMethod();
```

### Azure Functions

Each API endpoint is implemented as an Azure Function in the `src/functions/` directory. Functions are triggered by HTTP requests and interact with smart contracts and databases.

Example:

```typescript
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

export async function httpTrigger(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log('HTTP trigger function processed a request.');

  // Function implementation

  return {
    status: 200,
    jsonBody: { result: 'success' },
  };
}

app.http('functionName', {
  methods: ['GET', 'POST'],
  authLevel: 'anonymous',
  handler: httpTrigger,
});
```

## Development Workflow

1. **Create a feature branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Implement your changes**

   - Follow the TypeScript best practices
   - Add appropriate error handling
   - Document your code with TypeDoc comments

3. **Build and test locally**

   ```bash
   npm run build
   npm start
   ```

4. **Submit a pull request**

   - Ensure all tests pass
   - Update documentation if necessary
   - Request code review

## Troubleshooting

- **Database connection issues**: Check your connection string and ensure your IP is allowed in the Azure SQL firewall rules.
- **Smart contract interaction issues**: Verify contract addresses and ABIs.
- **Azure Functions issues**: Check the Azure Functions Core Tools documentation.

## Additional Resources

- [Azure Functions Documentation](https://docs.microsoft.com/en-us/azure/azure-functions/)
- [ethers.js Documentation](https://docs.ethers.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [LED-UP Smart Contract Documentation](../led-up-sc/README.md)

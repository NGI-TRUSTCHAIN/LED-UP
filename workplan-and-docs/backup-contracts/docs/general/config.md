// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script, console} from "forge-std/Script.sol";
import {DataTypes} from "../src/library/DataTypes.sol";

contract HelperConfig is Script {
address public provider = 0x04E1B236182b9703535ecB490697b79B45453Ba1;
address public owner = msg.sender;
address public leveaWallet = 0xc11d7664cE6C27AD61e1D935735683686A9B4E9a;
address public token = 0x702Bd63ddB359fF45F1De789e9aD8E2EcAb15218;

    string _data_url = "https://example.com";
    bytes32 _data_hash = intoBytes32("https://example.com");
    string _schema_url = "https://example.com";
    bytes32 _schema_hash = intoBytes32("https://example.com");

    DataTypes.Metadata public metadata;
    DataTypes.Schema public schema;

    constructor() {
        metadata = DataTypes.Metadata({url: _data_url, hash: _data_hash});
        schema = DataTypes.Schema({schemaRef: DataTypes.Metadata({url: _schema_url, hash: _schema_hash})});
    }

    // Helper function
    function intoBytes32(string memory _input) public pure returns (bytes32) {
        return bytes32(keccak256(abi.encodePacked(_input)));
    }

    function getMetadata() public view returns (DataTypes.Metadata memory) {
        return metadata;
    }

    function getSchema() public view returns (DataTypes.Schema memory) {
        return schema;
    }

    function getProvider() public view returns (address) {
        return provider;
    }

    function getLeveaWallet() public view returns (address) {
        return leveaWallet;
    }

    function getToken() public view returns (address) {
        return token;
    }

    function getOwner() public view returns (address) {
        return owner;
    }

}

Here's a sample professional README for an Azure Functions project built with TypeScript:

---

# Azure Functions TypeScript Project

This repository contains a serverless application built using **Azure Functions** and **TypeScript**. The project leverages the power of the Azure Functions runtime to execute serverless code in response to various events, providing an easy way to scale based on demand while keeping the infrastructure management overhead low.

## Table of Contents

- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)
- [License](#license)

---

## Getting Started

This project demonstrates how to develop and deploy Azure Functions using TypeScript. It includes several example HTTP-triggered functions to demonstrate a typical RESTful API pattern.

## Project Structure

```bash
├── src/                  # Source code for the Azure Functions
│   ├── functions/        # Individual function logic
│   │   ├── ExampleFunction.ts
│   ├── utils/            # Reusable utilities
│   ├── config/           # Configuration logic (e.g., database, settings)
├── test/                 # Unit and integration tests
├── local.settings.json   # Local environment variables
├── tsconfig.json         # TypeScript configuration
├── host.json             # Azure Functions host configuration
├── package.json          # NPM dependencies and scripts
├── .gitignore            # Git ignore file
└── README.md             # Project documentation
```

## Features

- **Serverless**: Leverage Azure Functions for event-driven, scalable applications.
- **TypeScript**: Provides strong typing for easier development and bug prevention.
- **HTTP Triggers**: Easily handle HTTP requests to implement APIs or webhooks.
- **Unit Tests**: Set up with Jest to test the business logic of functions.
- **CI/CD**: Compatible with GitHub Actions and Azure Pipelines for automatic deployment.

## Prerequisites

To work with this project, you'll need the following:

- [Node.js](https://nodejs.org/) (version 14.x or later)
- [Azure Functions Core Tools](https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local)
- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)
- An Azure Subscription (for deployment)

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
   Create a `local.settings.json` file at the project root if it doesn't already exist. This file should not be committed to version control. Here’s an example:

   ```json
   {
     "IsEncrypted": false,
     "Values": {
       "AzureWebJobsStorage": "<your-connection-string>",
       "FUNCTIONS_WORKER_RUNTIME": "node",
       "ExampleVariable": "some-value"
     }
   }
   ```

4. **Build the project**:
   TypeScript needs to be compiled into JavaScript before it can run in the Azure Functions runtime.

   ```bash
   npm run build
   ```

5. **Run the Azure Functions locally**:
   Start the Azure Functions runtime locally to test your application:

   ```bash
   npm start
   ```

6. **Access the functions**:
   Once the runtime is running, you can invoke the function by navigating to:

   ```
   http://localhost:7071/api/ExampleFunction
   ```

## Development

For local development, ensure you use the following scripts:

- **Start local server**: `npm start`
- **Compile TypeScript**: `npm run build`
- **Watch changes**: `npm run watch`

### Linting

This project uses ESLint for code quality and consistency. Run the linter with:

```bash
npm run lint
```

### Testing

Testing is set up using **Jest**. Unit tests can be run with:

```bash
npm test
```

Tests are located in the `test/` directory and follow the structure of the application code for clarity and maintainability.

### Example Test File

```ts
// test/ExampleFunction.test.ts
import { ExampleFunction } from '../src/functions/ExampleFunction';

test('should return a success response', async () => {
  const result = await ExampleFunction();
  expect(result.statusCode).toBe(200);
});
```

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

## Environment Variables

The project requires several environment variables. They are stored in the `local.settings.json` for local development and in Azure Application Settings for production.

Example variables:

- **AzureWebJobsStorage**: Connection string for Azure Storage account.
- **FUNCTIONS_WORKER_RUNTIME**: Runtime environment (e.g., `node`).
- **Other Custom Variables**: You can add any additional environment variables as required by your application.

## Contributing

We welcome contributions to this project! Please follow these steps:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/my-feature`).
3. Commit your changes (`git commit -m 'Add feature'`).
4. Push to the branch (`git push origin feature/my-feature`).
5. Create a new Pull Request.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

---

Let me know if you'd like to customize any specific sections or add more details based on your project requirements!

# LED-UP Smart Contract API Setup Guide

This guide provides instructions for setting up and running the LED-UP Smart Contract API locally.

## Prerequisites

- Node.js 18.x or later
- TypeScript 4.x or later
- Azure Functions Core Tools
- Visual Studio Code with Azure Functions extension
- A running LED-UP Smart Contract (local or deployed)
- Access to Azure resources (for production deployment)

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-repo/led-up.git
cd led-up/ledup-sc-api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

The project uses `local.settings.json` for local development. This file contains configuration for:

- Smart contract addresses
- Wallet private keys
- RPC URLs
- Database connection strings
- IPFS/Pinata configuration

Make sure these values are correctly set for your environment.

### 4. Build the Project

```bash
npm run build
```

### 5. Run Locally

```bash
npm start
```

## Database Configuration

The API uses Azure SQL Database for storing blockchain events and other data. For local development, you can:

1. Use a local SQL Server instance
2. Use Azure SQL Database with appropriate firewall rules
3. Mock the database connection for testing

Update the following settings in `local.settings.json`:

```json
{
  "DB_NAME": "your-db-name",
  "DB_PORT": "1433",
  "DB_SERVER": "your-db-server",
  "SqlConnectionString": "your-connection-string"
}
```

## Smart Contract Integration

The API interacts with the following smart contracts:

- DataRegistry
- Compensation
- Token
- DID-related contracts

Contract ABIs are stored in `src/constants/` and are used to interact with the deployed contracts.

## API Endpoints

The API provides endpoints for:

1. Data Registry Operations

   - Register producers
   - Manage producer records
   - Share data

2. Compensation Operations

   - Process payments
   - Withdraw balances
   - Manage service fees

3. Administrative Operations
   - Change contract settings
   - Pause/unpause contracts
   - Transfer ownership

## Troubleshooting

### Database Connection Issues

If you encounter database connection errors:

- Check your connection string in `local.settings.json`
- Ensure your IP is allowed in the Azure SQL firewall rules
- For local development, you can modify the code to bypass database operations

### Smart Contract Interaction Issues

If you encounter issues with smart contract interactions:

- Verify contract addresses in `local.settings.json`
- Ensure you have the correct ABIs in `src/constants/`
- Check that your wallet has sufficient funds and permissions

## Deployment

For production deployment, follow the instructions in the README.md file.

## Development Guidelines

When developing new features or fixing bugs:

1. Follow the guidelines in `.cursorrules`
2. Ensure proper error handling
3. Write comprehensive tests
4. Document your code with TypeDoc
5. Follow TypeScript best practices

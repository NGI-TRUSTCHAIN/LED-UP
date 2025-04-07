# LedUp Smart Contract API

A blockchain-based API for DID management, secure IPFS data storage, and zero-knowledge proofs.

## Overview

LedUp Smart Contract API provides a comprehensive solution for decentralized identity management, encrypted data storage, and privacy-preserving verification using zero-knowledge proofs.

## Features

- **DID Management**: Registration, resolution, verification, and authentication
- **Secure IPFS Storage**: Encrypted data storage with Pinata integration
- **Zero-Knowledge Proofs**: Privacy-preserving verification using circom circuits
- **Smart Contract Integration**: Blockchain-based access control and consent management
- **Compensation System**: Fair payment for data sharing contributions

## Tech Stack

- **Backend**: Node.js with Azure Functions
- **Blockchain**: Ethereum-compatible smart contracts
- **Storage**: IPFS via Pinata
- **Database**: Azure SQL Database
- **Encryption**: AES-256 for data, RSA for key exchange
- **ZKP**: circom circuit compiler and snarkjs for zero-knowledge proofs

## API Endpoints

### IPFS Endpoints
- `GET /ipfs/getIPFSData`: Retrieve and decrypt data from IPFS
- `GET /ipfs/getBulkData`: Retrieve multiple data items from IPFS
- `DELETE /ipfs/deleteIPFS`: Delete data from IPFS
- `POST /ipfs/updateBlockchain`: Encrypt and upload data to IPFS
- `GET /ipfs/getData`: Retrieve blockchain metadata
- `POST /ipfs/accessData`: Access data with proper authorization

### DID Registry Endpoints
- Endpoints for DID lifecycle management and verification

### ZKP Endpoints
- Endpoints for verifying zero-knowledge proofs

## Setup

### Prerequisites
- Node.js (v14+)
- Azure Functions Core Tools
- Ethereum wallet with test funds
- IPFS Pinata account

### Configuration
Create a `local.settings.json` with the following:

```json
{
  "IsEncrypted": false,
  "Values": {
    "FUNCTIONS_WORKER_RUNTIME": "node",

    "KEY_VAULT_URL"
    
    
    "DID_REGISTRY_CONTRACT_ADDRESS": "0x...",
    "DID_ACCESS_CONTROL_CONTRACT_ADDRESS": "0x...",
    "DID_VERIFIER_CONTRACT_ADDRESS": "0x...",
    "TOKEN_CONTRACT_ADDRESS": "0x...",
    "DATA_REGISTRY_CONTRACT_ADDRESS": "0x...",
    "COMPENSATION_CONTRACT_ADDRESS": "0x...",
    "CONSENT_MANAGEMENT_CONTRACT_ADDRESS": "0x...",
    
    
    "OWNER_ADDRESS": "0x0000000",
    "OWNER_PRIVATE_KEY": "0x0000000000",
    
    "RPC_URL": "",
    "ALCHEMY_API_KEY": "",
    "INFURA_API_KEY": "",
    "ENCRYPTION_KEY": "",
    "JWT_SECRET": "",
    "JWT_REFRESH_SECRET": "",
    "PINATA_API_KEY": "your_pinata_api_key",
    "PINATA_API_SECRET": "your_pinata_api_secret",
    "PINATA_API_JWT": "your_pinata_jwt",
    "IPFS_GATEWAY_URL": "your_gateway_url",
    "ENCRYPTION_KEY": "your_encryption_key",

    "JWT_SECRET": ,
    "JWT_REFRESH_SECRET": ,
    
    "DB_SERVER": "your_db_server",
    "DB_PORT": "1433",
    "DB_USERNAME": "your_username",
    "DB_PASSWORD": "your_password",
    "DB_NAME": "your_database_name",


    "TABLE_ACCOUNT_ENDPOINT":
    "TABLE_ACCOUNT_KEY"
    "TABLE_ACCOUNT_NAME"
    "TABLE_CONNECTION_STRING",
    "SYNC_STATE_TABLE",
    "DEFAULT_PARTITION_KEY",
    "SYNC_STATE_ROW_KEY"
  },
  "Host": {
    "CORS": "*"
  }
}
```

## Usage

### Start the API locally
```bash
npm start
```

### Deploy to Azure
```bash
npm run deploy
```

## Security

- All IPFS data is encrypted with AES-256
- Smart contracts enforce access control
- Zero-knowledge proofs enable privacy-preserving verification
- Private keys are never exposed in logs or responses

## License

This project is licensed under the AGPL License - see the LICENSE file for details.

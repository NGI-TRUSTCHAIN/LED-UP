# Project Setup & Initial Documentation

This document provides a comprehensive overview of the LEDUP frontend application, including its architecture, technology stack, setup procedures, and configuration.

## Project Overview

LEDUP is a secure health data transaction platform that leverages blockchain and IPFS technologies to provide a robust and privacy-preserving solution for sharing medical files. The platform enables:

- Secure storage and sharing of healthcare data
- Automatic compensation for data producers
- Privacy-preserving data verification using Zero-Knowledge Proofs (ZKP)
- Decentralized identity management

The frontend application provides a user-friendly interface for interacting with these features, offering a seamless experience for healthcare data producers, consumers, and administrators.

## Architecture

The LEDUP frontend is built using Next.js with the App Router architecture, organizing code by features and utilizing React Server Components where appropriate. The architecture follows these key principles:

### Core Architectural Principles

1. **Feature-based Organization**: Code is organized by feature, not by technical function
2. **Separation of Concerns**: Clear separation between UI components, business logic, and data fetching
3. **Component Composition**: Building complex interfaces from smaller, reusable components
4. **Progressive Enhancement**: Core functionality works without JavaScript, enhanced with client-side features

### Directory Structure

```
led-up-fe/
├── app/                  # Next.js App Router pages and layouts
├── components/           # Reusable UI components
├── features/             # Feature-specific code
│   ├── auth/             # Authentication feature
│   ├── data-registry/    # Data registry feature
│   ├── zkp/              # Zero-knowledge proof feature
│   └── ...
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and server actions
├── abi/                  # Smart contract ABIs
├── utils/                # Helper functions
├── public/               # Static assets
├── types/                # TypeScript type definitions
└── __tests__/            # Test files
```

### Key Architectural Components

1. **Frontend Layer**: React components and hooks for UI rendering and user interaction
2. **Service Layer**: Functions for interacting with APIs and blockchain
3. **State Management**: React Context API and TanStack Query for state management
4. **Blockchain Integration**: Web3 interaction using wagmi and viem libraries

## Technology Stack

### Core Technologies

- **React 19**: For building the user interface
- **Next.js 15**: Full-stack React framework with App Router
- **TypeScript**: For type-safe code
- **TailwindCSS**: For styling components

### State Management & Data Fetching

- **React Context API**: For global state management
- **TanStack Query**: For server state management and data fetching
- **SWR**: For data fetching with stale-while-revalidate strategy (in some components)

### Blockchain Integration

- **wagmi**: React hooks for Ethereum
- **viem**: Low-level Ethereum interface
- **ConnectKit**: Wallet connection UI
- **ethers.js**: Ethereum library for specific use cases

### Storage & Data

- **IPFS/Pinata**: For decentralized file storage
- **snarkjs**: For Zero-Knowledge Proof generation and verification
- **zokrates-js**: For Zero-Knowledge circuit compilation

### UI Components

- **Radix UI**: Unstyled, accessible components
- **Lucide React**: Icon library
- **React Hook Form**: Form handling
- **Zod**: Schema validation

### Testing

- **Jest**: Test runner
- **React Testing Library**: Component testing
- **Playwright**: End-to-end testing

## Installation and Setup

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Git
- An Ethereum wallet (e.g., MetaMask)

### Installation Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/LED-UP/led-up-fe.git
   cd led-up-fe
   ```

2. **Install dependencies**

   ```bash
   # Using npm
   npm install

   # Using yarn
   yarn install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory with the following variables:

   ```
   # API Endpoints
   NEXT_PUBLIC_API_URL=http://localhost:3001/local

   # Blockchain Configuration
   NEXT_PUBLIC_ALCHEMY_ID=your_alchemy_id
   NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_walletconnect_project_id
   NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545
   RPC_URL=http://127.0.0.1:8545
   CHAIN_ID=31337
   NEXT_PUBLIC_CHAIN_ID=31337

   # IPFS Configuration
   NEXT_PUBLIC_PINATA_API_KEY=your_pinata_api_key
   NEXT_PUBLIC_PINATA_API_SECRET=your_pinata_api_secret
   NEXT_PUBLIC_PINATA_API_JWT=your_pinata_jwt
   NEXT_PUBLIC_IPFS_GATEWAY_URL=your_pinata_gateway_url
   NEXT_PUBLIC_ENCRYPTION_KEY=your_encryption_key

   # Contract Addresses
   NEXT_PUBLIC_DID_REGISTRY_CONTRACT_ADDRESS=0x...
   NEXT_PUBLIC_DATA_REGISTRY_CONTRACT_ADDRESS=0x...
   NEXT_PUBLIC_COMPENSATION_CONTRACT_ADDRESS=0x...
   NEXT_PUBLIC_CONSENT_MANAGEMENT_CONTRACT_ADDRESS=0x...
   ```

4. **Set up ZKP circuits**

   Download the ZKP files and place them in the appropriate directory:

   ```bash
   # Create the public/circuits directory if it doesn't exist
   mkdir -p public/circuits

   # Run the setup script
   npm run setup-circuits
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Access the application**

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

The LEDUP frontend provides several npm/yarn scripts for development, testing, and building:

| Script                          | Description                                      |
| ------------------------------- | ------------------------------------------------ |
| `npm run dev`                   | Starts the development server with hot reloading |
| `npm run build`                 | Builds the application for production            |
| `npm run start`                 | Starts the production server                     |
| `npm run lint`                  | Runs ESLint for code linting                     |
| `npm run test`                  | Runs Jest unit and integration tests             |
| `npm run test:watch`            | Runs Jest tests in watch mode                    |
| `npm run setup-circuits`        | Sets up ZKP circuit files                        |
| `npm run test:playwright`       | Runs Playwright E2E tests                        |
| `npm run test:playwright:ui`    | Runs Playwright tests with UI                    |
| `npm run test:playwright:debug` | Runs Playwright tests in debug mode              |
| `npm run test:playwright:zkp`   | Runs ZKP-specific Playwright tests               |

## Environment Configuration

The LEDUP frontend uses environment variables for configuration. These are managed through `.env.local` files and accessed via `process.env` or `process.env.NEXT_PUBLIC_*` variables.

### Core Environment Variables

#### API Configuration

- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NEXT_PUBLIC_AZURE_API_URL`: Azure API URL (if using Azure)

#### Blockchain Configuration

- `NEXT_PUBLIC_ALCHEMY_ID`: Alchemy API key for blockchain access
- `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID`: WalletConnect project ID
- `NEXT_PUBLIC_RPC_URL`: JSON-RPC URL for blockchain access
- `CHAIN_ID`: Ethereum chain ID (31337 for local Hardhat, 11155111 for Sepolia)

#### IPFS Configuration

- `NEXT_PUBLIC_PINATA_API_KEY`: Pinata API key
- `NEXT_PUBLIC_PINATA_API_SECRET`: Pinata API secret
- `NEXT_PUBLIC_PINATA_API_JWT`: Pinata JWT for authentication
- `NEXT_PUBLIC_IPFS_GATEWAY_URL`: IPFS gateway URL
- `NEXT_PUBLIC_ENCRYPTION_KEY`: Encryption key for IPFS data

#### Contract Addresses

- `NEXT_PUBLIC_DID_REGISTRY_CONTRACT_ADDRESS`: DID Registry contract address
- `NEXT_PUBLIC_DATA_REGISTRY_CONTRACT_ADDRESS`: Data Registry contract address
- `NEXT_PUBLIC_COMPENSATION_CONTRACT_ADDRESS`: Compensation contract address
- `NEXT_PUBLIC_CONSENT_MANAGEMENT_CONTRACT_ADDRESS`: Consent Management contract address

### Environment File Examples

A minimal `.env.local` file for local development:

```
NEXT_PUBLIC_API_URL=http://localhost:3001/local
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545
CHAIN_ID=31337
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_PINATA_API_JWT=your_jwt_token
NEXT_PUBLIC_IPFS_GATEWAY_URL=your_gateway_url
NEXT_PUBLIC_ENCRYPTION_KEY=your_encryption_key
NEXT_PUBLIC_DID_REGISTRY_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_DATA_REGISTRY_CONTRACT_ADDRESS=0x...
```

## Next.js Configuration

The LEDUP frontend uses a custom Next.js configuration defined in `next.config.mjs`:

```javascript
const nextConfig = {
  // Configured image domains for Next.js Image component
  images: {
    domains: ['gateway.pinata.cloud'],
  },

  // API route rewrites
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://localhost:3000/api/v1/:path*',
      },
    ];
  },

  // Server Actions configuration
  experimental: {
    serverActions: {
      bodySizeLimit: '8mb', // Increased limit for file uploads
    },
  },

  // Development-only settings
  typescript: {
    ignoreBuildErrors: true, // For development only
  },
  eslint: {
    ignoreDuringBuilds: true, // For development only
  },
};

export default nextConfig;
```

## Getting Help

If you encounter issues with the LEDUP frontend setup, you can:

1. Check the [project README](https://github.com/LED-UP/led-up-fe/blob/main/README.md)
2. Open an issue in the GitHub repository
3. Contact the LED-UP development team

---

**Last Updated:** March 2025
**Contact:** LED-UP Development Team

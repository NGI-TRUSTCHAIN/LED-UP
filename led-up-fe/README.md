# LED-UP Frontend

LED-UP is a secure health data transaction platform that leverages blockchain and IPFS technologies to provide a robust and privacy-preserving solution for sharing medical files.

## Features

- Blockchain-based security for immutable and transparent file tracking
- IPFS storage for distributed and censorship-resistant file storage
- Automatic compensation for shared files
- Zero-Knowledge Proofs (ZKP) for privacy-preserving data verification
- Smart contract for automatic compensation
- Decentralized Identity (DID) management for secure authentication
- Role-based access control for healthcare data
- Consent management for patient data sharing

## Prerequisites

- Node.js (v18 or later)
- npm or yarn
- An Ethereum wallet (e.g., MetaMask)

## Technologies Used

- Next.js 15 with App Router
- React 19
- TypeScript
- Tailwind CSS
- Ethereum (Sepolia testnet / local Hardhat network)
- IPFS (via Pinata)
- Zero-Knowledge Proofs (via ZoKrates)
- ConnectKit (for wallet connection)
- Wagmi & Viem (for blockchain interactions)
- TanStack Query (for data fetching)
- Radix UI (for accessible components)

## Getting Started

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/LED-UP/led-up-fe.git
   cd led-up-fe
   ```

2. Install dependencies:

   ```
   yarn install
   # or
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory based on `.env.local.example`.

4. Set up ZKP circuits:

   ```bash
   npm run setup-circuits
   # or
   yarn setup-circuits
   ```

5. Run the development server:

   ```
   npm run dev
   # or
   yarn dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Available Scripts

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

## Project Structure

- `app/`: Next.js App Router pages and layouts
- `components/`: Reusable UI components
- `features/`: Feature-specific code
  - `auth/`: Authentication feature
  - `data-registry/`: Data registry feature
  - `zkp/`: Zero-knowledge proof feature
  - `did-registry/`: DID registry feature
  - `compensation/`: Compensation feature
- `hooks/`: Custom React hooks
- `lib/`: Utility functions and server actions
- `abi/`: Smart contract ABIs
- `utils/`: Helper functions
- `public/`: Static assets
- `types/`: TypeScript type definitions
- `__tests__/`: Test files

## Key Features

### DID Authentication

Provides decentralized identity-based authentication with secure key management.

### Data Registry

Enables secure storage of healthcare data using IPFS with backend encryption.

### Zero-Knowledge Proofs

Privacy-preserving verification of data without revealing the underlying information.

### Compensation System

Manages payments between data producers and consumers with automatic settlements.

## Usage

1. Connect your Ethereum wallet using the "CONNECT TO LED-UP" button.
2. Navigate to the "Files" page to view and upload files.
3. Navigate to the "Patient Data" page to view and upload patient data.

## Contributing

We welcome contributions to this project! Please follow these steps:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/<your-feature-name>`).
3. Commit your changes (`git commit -m 'Add feature: <meaningful commit message>'`).
4. Push to the branch (`git push origin feature/<your-feature-name>`).
5. Create a new Pull Request.

## License

This project is licensed under the AGPL License. See the [LICENSE](./LICENSE) file for details.

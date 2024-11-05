# LED-UP Frontend

LED-UP is a secure health data transaction platform that leverages blockchain and IPFS technologies to provide a robust and privacy-preserving solution for sharing medical files.

## Features

- Blockchain-based security for immutable and transparent file tracking
- IPFS storage for distributed and censorship-resistant file storage
- Automatic compensation for shared files
- Zero-Knowledge Proofs (ZKP) for privacy-preserving data verification
- Smart contract for automatic compensation

## Prerequisites

- Node.js (v18 or later)
- npm or yarn
- An Ethereum wallet (e.g., MetaMask)

## Technologies Used

- Next.js
- React
- TypeScript
- Tailwind CSS
- Ethereum (Sepolia testnet)
- IPFS (via Pinata)
- ZoKrates (for ZKP)
- ConnectKit (for wallet connection)

## Getting Started

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/LED-UP/led-up-fe.git
   cd led-up-fe
   ```

2. Install dependencies:

   ```
   yarn install or npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add the following variables:

   ```
   NEXT_PUBLIC_ALCHEMY_ID=your_alchemy_id
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
   PINATA_JWT=your_pinata_jwt
   API_SECRET=your_api_secret
   API_KEY=your_api_key
   NEXT_PUBLIC_GATEWAY_URL=your_pinata_gateway_url
   ENCRYPTION_KEY=your_encryption_key
   BASE_URL=your_base_url  # backend base url
   ```

4. Download the zkp files from [here](https://drive.google.com/file/d/1JFp9gsCLI-nnNO42VXEj0PTLrMCy0W_L/view?usp=sharing) unzip it and put it in the `zkp` folder in the root directory.

5. Run the development server:

   ```
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

1. Connect your Ethereum wallet using the "CONNECT TO LED-UP" button.
2. Navigate to the "Files" page to view and upload files.
3. Navigate to the "Patient Data" page to view and upload patient data.

## Project Structure

- `app/`: Next.js app router and page components
- `components/`: Reusable React components
- `lib/`: Utility functions and server actions
- `utils/`: Helper functions and constants
- `zkp/`: zkp related files and scripts

## Contributing

We welcome contributions to this project! Please follow these steps:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/<your-feature-name>`).
3. Commit your changes (`git commit -m 'Add feature: <meaningful commit message>'`).
4. Push to the branch (`git push origin feature/<your-feature-name>`).
5. Create a new Pull Request.

## License

This project is licensed under the AGPL License. See the [LICENSE](./LICENSE) file for details.

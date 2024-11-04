## LED-UP Smart Contracts

The LED-UP smart contracts are written in Solidity and tested using the Foundry testing framework.There are two main contracts in the project:

- **LEDToken.sol**: ERC20 token contract for the LED token. This contract is based on the OpenZeppelin ERC20 implementation. The contract acts as the main token for the compensation system.
- **DataRegistry.sol**: The main contract for the LED-UP platform. This contract is responsible for managing the data registration, sharing and operations.
- **Compensation.sol**: The contract for managing the compensation system. This contract is responsible for managing the compensation system for the data sharing and operations.

## Main Features

- **Registering Data**: Providers can register new data records for producers. Each record includes a unique ID, metadata (like a URL and hash), and a digital signature. Updating Data: Providers can update existing data records, including changing the metadata and status.
- **Sharing Data**: Data can be shared with consumers, but only if the producer has given consent and the payment for the data has been verified.
  Consent Management: Producers can grant or revoke consent for their data to be shared.
- **Access Control**: The contract access control for data security purposes. The functions are equipped with efficient access control. The contract can be paused and unpaused by the owner to temporarily stop all operations.
- **Compensation**: The contract integrates with a compensation system to verify payments for data sharing.

## Project Structure

```bash
├── lib
│   ├── forge-std
│   └── openzeppelin-contracts
├── script
│   ├── Compensation.s.sol
│   ├── DataRegistry.s.sol
│   └── HelperConfig.s.sol
├── src
│   ├── contracts
│   ├── interface
│   └── library
└── test
│   ├── Compensation.t.sol
│   ├── Consent.t.sol
│   ├── DataRegistry.t.sol
│   ├── DataRegistry.t.ts
│   ├── Token.t.sol
│   └── ZKP.t.sol
├── foundry.toml
├── Makefile
├── README.md
```

# Prerequisites

Before you can try to test and interact with the LED-UP smart contracts, you need to have the following:

- Foundry Installed on your machine
- git installed on your machine

## Setup Instructions

1. **Clone the repository**:

   ```bash
   git clone https://github.com/NGI-TRUSTCHAIN/LED-UP/tree/master/LED-UP-SMART-CONTRACTS
   cd LED-UP-SMART-CONTRACTS
   ```

2. **Install dependencies**:
   Run the following command to install the dependencies and build the project:

   ```bash
   forge build
   ```

3. **Set up environment variables**:
   The project requires several environment variables. They are stored in the `.env` file for local development and in the deployment environment for production. Create a `.env` file at the project root if it doesn't already exist. This file should not be committed to version control. Here’s an example setting that you can use:

   ```bash
   SEPOLIA_RPC_URL=<your_sepolia_rpc_url>      # For deployment
   SEPOLIA_API_KEY=<your_sepolia_api_key>      # For deployment
   PRIVATE_KEY=<your_private_key>              # For deployment
   ETHERSCAN_API_KEY=<etherscan_api_key>       # For verification on Etherscan
   ```

### Test

```shell
# simple local test
$ forge test

# test locally with details
forge test -vvvv --detailed --summary --build-info --show-progress
# fork test with details
forge test -vvvv --detailed --summary --build-info --show-progress --fork <rpc_url>
```

### Deployments

```shell
# Deploy DataRegistry Smart Contract
$ forge script script/DataRegistry.s.sol:DeployDataRegistry --rpc-url <your_rpc_url> --private-key <your_private_key>
# Deploy Compensation Smart Contract
$ forge script script/Compensation.s.sol:DeployCompensation --rpc-url <your_rpc_url> --private-key <your_private_key>
```

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

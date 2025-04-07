# Blockchain Services Implementation

This document provides an overview of the blockchain services implementation in the LED-UP frontend application. The implementation uses a client-side approach with wallet signers to interact with smart contracts.

## Overview

The implementation consists of several key components:

1. **Service Base Class**: A base class that all service classes extend, providing common functionality for contract interactions.
2. **Service Classes**: Specific service classes for each contract (DidRegistry, DidAccessControl, etc.).
3. **Ethers Signer Hook**: A hook that provides an ethers.js signer from the connected wallet.
4. **Blockchain Services Hook**: A hook that creates and provides instances of all service classes.

## Usage

### Connecting to a Wallet

```tsx
import { useConnect, useAccount, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';

function WalletConnection() {
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { isConnected, address } = useAccount();

  const handleConnect = async () => {
    try {
      await connect({ connector: injected() });
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  return (
    <div>
      {!isConnected ? (
        <button onClick={handleConnect}>Connect Wallet</button>
      ) : (
        <div>
          <p>Connected: {address}</p>
          <button onClick={() => disconnect()}>Disconnect</button>
        </div>
      )}
    </div>
  );
}
```

### Using Blockchain Services

```tsx
import { useBlockchainServices } from '@/hooks/use-blockchain-services';

function DidRegistryComponent() {
  const { loading, isConnected, didRegistryService } = useBlockchainServices();

  const registerDid = async (did, document, publicKey) => {
    if (!didRegistryService) return;

    try {
      const receipt = await didRegistryService.registerDid(did, document, publicKey);
    } catch (error) {
      console.error('Failed to register DID:', error);
    }
  };

  return (
    <div>
      {loading ? (
        <p>Loading services...</p>
      ) : isConnected ? (
        <button onClick={() => registerDid('did:example:123', '{}', 'publicKey')}>Register DID</button>
      ) : (
        <p>Please connect your wallet</p>
      )}
    </div>
  );
}
```

## Implementation Details

### Service Base Class

The `ServiceBase` class provides a foundation for all service classes:

```tsx
export abstract class ServiceBase {
  public contract: Contract;
  protected errorHandler: any;
  protected eventParser: any;
  protected contractType!: ContractType;

  constructor(contractAddress: string, abi: any, signerOrContract?: Signer | Contract | ContractRunner) {
    this.initializeContractType();

    if (signerOrContract instanceof Contract) {
      this.contract = signerOrContract;
    } else if (signerOrContract) {
      this.contract = new Contract(contractAddress, abi, signerOrContract);
    } else {
      this.contract = new Contract(contractAddress, abi, defaultSigner);
    }

    this.errorHandler = ContractHandlerFactory.createErrorHandler(this.contractType, this.contract);
    this.eventParser = ContractHandlerFactory.createEventParser(this.contractType, this.contract);
  }

  protected abstract initializeContractType(): void;

  protected formatTransactionReceipt(receipt: any): Record<string, any> {
    return this.eventParser.formatTransactionReceipt(receipt);
  }
}
```

### Ethers Signer Hook

The `useEthersSigner` hook retrieves an ethers.js signer from the connected wallet:

```tsx
export function useEthersSigner() {
  const { data: walletClient } = useWalletClient();
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);

  useEffect(() => {
    if (!walletClient) {
      setSigner(null);
      return;
    }

    const provider = new BrowserProvider(walletClient.transport);
    provider.getSigner().then(setSigner).catch(console.error);
  }, [walletClient]);

  return signer;
}
```

### Blockchain Services Hook

The `useBlockchainServices` hook creates instances of all service classes:

```tsx
export const useBlockchainServices = () => {
  const { isConnected } = useAccount();
  const signer = useEthersSigner();
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState({
    didRegistryService: null,
    // ... other services
  });

  useEffect(() => {
    const initializeServices = async () => {
      if (!isConnected || !signer) {
        setLoading(false);
        return;
      }

      try {
        // Create service instances
        const didRegistryService = new DidRegistryService(
          process.env.NEXT_PUBLIC_DID_REGISTRY_CONTRACT_ADDRESS || '',
          DidRegistryABI,
          signer
        );
        // ... other services

        setServices({
          didRegistryService,
          // ... other services
        });
      } catch (error) {
        console.error('Error initializing blockchain services:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeServices();
  }, [isConnected, signer]);

  return {
    loading,
    isConnected,
    ...services,
  };
};
```

## Security Considerations

- All interactions with the blockchain occur client-side using the user's wallet.
- No private keys are stored or transmitted.
- Authentication is handled through wallet signatures.
- Services are only instantiated when a wallet is connected.

## Environment Variables

The following environment variables are required:

```
NEXT_PUBLIC_DID_REGISTRY_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_DID_ACCESS_CONTROL_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_DID_AUTH_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_DID_ISSUER_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_DID_VERIFIER_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_DATA_REGISTRY_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_COMPENSATION_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_CONSENT_MANAGEMENT_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_ZKP_CONTRACT_ADDRESS=0x...
```

## Error Handling

Each service class includes robust error handling:

1. Contract errors are parsed and converted to user-friendly messages.
2. Transaction receipts are formatted with event data.
3. Specific error types are handled appropriately (e.g., DID not found).

## Example Component

A complete example component is provided in `components/DidRegistryDemo.tsx` that demonstrates:

1. Connecting to a wallet
2. Using the blockchain services
3. Registering and checking DIDs
4. Handling errors and displaying results

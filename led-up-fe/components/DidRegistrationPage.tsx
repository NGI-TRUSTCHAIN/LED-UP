'use client';

import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, usePublicClient, useWalletClient } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { Address, TransactionReceipt } from 'viem';
import { DidRegistryABI } from '@/abi';

/**
 * DID Registration Page
 *
 * This page allows users to register a new DID directly using wagmi hooks with viem,
 * without relying on a service layer.
 */
export default function DidRegistrationPage() {
  // Wagmi hooks
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  // State variables
  const [did, setDid] = useState('did:ethr:0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
  const [document, setDocument] = useState('Sample Document');
  const [publicKey, setPublicKey] = useState(
    '0x40a079e25259ecc8004d37c918b1eb79eed819cd19c6c2834d8d01d169fe7501540d3303c5c3299a2db0bba8791eca16d7f70572c9498e1059fc74b9c0d72171'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [contractAddress, setContractAddress] = useState<Address | null>(null);

  // Get contract address from environment variable
  useEffect(() => {
    const address = process.env.NEXT_PUBLIC_DID_REGISTRY_CONTRACT_ADDRESS;
    if (address && address.startsWith('0x')) {
      setContractAddress(address as Address);
    } else {
      setError('Invalid contract address configuration. Please check your environment variables.');
    }
  }, []);

  // Connect wallet handler
  const handleConnect = async () => {
    try {
      setError(null);

      await connect({ chainId: 1337, connector: injected() });
    } catch (err) {
      setError(`Failed to connect wallet: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  // Disconnect wallet handler
  const handleDisconnect = () => {
    disconnect();
    setResult(null);
  };

  // Register DID handler
  const handleRegisterDid = async () => {
    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    if (!contractAddress) {
      setError('Contract address not configured');
      return;
    }

    if (!did || !document || !publicKey) {
      setError('All fields are required');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // First check if the DID already exists
      try {
        const exists = await checkDidExists(did);
        if (exists) {
          setError(`DID ${did} already exists`);
          setLoading(false);
          return;
        }
      } catch (checkError) {
        // If the error is about the DID not existing, that's what we want
        if (
          checkError instanceof Error &&
          !checkError.message.includes('not exist') &&
          !checkError.message.includes('Invalid DID')
        ) {
          setError(`Failed to check if DID exists: ${checkError.message}`);
          setLoading(false);
          return;
        }
      }

      // Simulate the transaction to check for errors
      if (!publicClient) {
        throw new Error('Public client not available');
      }

      const { request } = await publicClient.simulateContract({
        address: contractAddress,
        abi: DidRegistryABI,
        functionName: 'registerDid',
        args: [did, document, publicKey],
        account: address,
      });

      // If simulation succeeds, send the transaction
      const hash = await walletClient!.writeContract(request);

      // Wait for the transaction to be mined
      const receipt = await publicClient.waitForTransactionReceipt({
        hash,
        confirmations: 1,
        timeout: 60_000, // 60 seconds timeout
      });

      setResult(formatTransactionReceipt(receipt));
    } catch (err) {
      console.error('Failed to register DID:', err);

      // Handle specific error messages
      if (err instanceof Error) {
        if (err.message.includes('DidRegistry__DIDAlreadyRegistered')) {
          setError('This DID is already registered');
        } else if (err.message.includes('DidRegistry__InvalidDID')) {
          setError('The DID format is invalid');
        } else if (err.message.includes('user rejected') || err.message.includes('User denied')) {
          setError('Transaction was rejected by the user');
        } else if (err.message.includes('insufficient funds')) {
          setError('Insufficient funds to complete this transaction');
        } else {
          setError(err.message);
        }
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  // Check if DID exists
  const checkDidExists = async (didToCheck: string): Promise<boolean> => {
    if (!contractAddress || !publicClient) {
      throw new Error('Contract address or public client not available');
    }

    try {
      // Try to get the controller for the DID
      // If the DID doesn't exist, this will throw an error
      const controller = await publicClient.readContract({
        address: contractAddress,
        abi: DidRegistryABI,
        functionName: 'getController',
        args: [didToCheck],
      });

      // If we get here, the DID exists
      return true;
    } catch (error) {
      return false;
    }
  };

  // Format transaction receipt
  const formatTransactionReceipt = (receipt: TransactionReceipt): Record<string, any> => {
    return {
      transactionHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
      status: receipt.status === 'success' ? 'success' : 'failed',
      logs: receipt.logs,
    };
  };

  return (
    <div className="p-6 max-w-4xl mx-auto mb-12">
      <h1 className="text-2xl font-bold mb-6">DID Registration</h1>

      {/* Contract Address Status */}
      {contractAddress ? (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          <h3 className="font-bold mb-2">Contract Status</h3>
          <p>
            <strong>Contract Address:</strong> {contractAddress}
          </p>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
          <h3 className="font-bold mb-2">Contract Status</h3>
          <p>Contract address not configured or invalid</p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <h3 className="font-bold mb-2">Error</h3>
          <p>{error}</p>
        </div>
      )}

      {/* Wallet Connection */}
      <div className="mb-6">
        {!isConnected ? (
          <button onClick={handleConnect} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
            Connect Wallet
          </button>
        ) : (
          <div className="flex flex-col space-y-2">
            <p className="text-green-600 font-medium">Connected: {address}</p>
            <button
              onClick={handleDisconnect}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded w-fit"
            >
              Disconnect Wallet
            </button>
          </div>
        )}
      </div>

      {/* Registration Form */}
      {isConnected && contractAddress && (
        <div className="border p-4 rounded">
          <h2 className="text-xl font-semibold mb-4">Register New DID</h2>

          <div className="mb-4">
            <label className="block mb-1 font-medium">DID</label>
            <input
              type="text"
              value={did}
              onChange={(e) => setDid(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="did:ethr:0x..."
              disabled={loading}
            />
            <p className="text-sm text-gray-500 mt-1">Format: did:ethr:&lt;ethereum-address&gt;</p>
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-medium">Document</label>
            <textarea
              value={document}
              onChange={(e) => setDocument(e.target.value)}
              className="w-full p-2 border rounded h-24"
              placeholder="Enter DID document content"
              disabled={loading}
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-medium">Public Key</label>
            <textarea
              value={publicKey}
              onChange={(e) => setPublicKey(e.target.value)}
              className="w-full p-2 border rounded h-24"
              placeholder="Enter public key"
              disabled={loading}
            />
          </div>

          <button
            onClick={handleRegisterDid}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register DID'}
          </button>
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="mt-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          <h3 className="font-bold mb-2">Registration Successful</h3>
          <pre className="whitespace-pre-wrap overflow-auto max-h-60 bg-white p-2 rounded">
            {JSON.stringify(result, (key, value) => (typeof value === 'bigint' ? value.toString() : value), 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

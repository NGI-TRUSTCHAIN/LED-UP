'use client';

import { useState } from 'react';
import { useBlockchainServices } from '@/hooks/use-blockchain-services';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useAuth } from '@/features/auth/contexts/auth-provider';
import { injected } from 'wagmi/connectors';

/**
 * Component that demonstrates how to use the blockchain services
 */
export default function DidRegistryDemo() {
  const { address } = useAuth();
  const { connect } = useConnect();
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { loading, didRegistryService } = useBlockchainServices();

  const [did, setDid] = useState('did:ethr:0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');
  const [document, setDocument] = useState('Sample Document');
  const [publicKey, setPublicKey] = useState(
    '0x40a079e25259ecc8004d37c918b1eb79eed819cd19c6c2834d8d01d169fe7501540d3303c5c3299a2db0bba8791eca16d7f70572c9498e1059fc74b9c0d72171'
  );
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    try {
      await connect({ connector: injected() });
    } catch {
      setError('Failed to connect wallet');
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setResult(null);
    setError(null);
  };

  const handleRegisterDid = async () => {
    if (!didRegistryService) {
      setError('DID Registry service not available');
      return;
    }

    try {
      setError(null);
      setResult(null);

      const receipt = await didRegistryService.registerDid(did, document, publicKey);

      setResult(receipt);
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
    }
  };

  const handleCheckDid = async () => {
    if (!didRegistryService) {
      setError('DID Registry service not available');
      return;
    }

    try {
      setError(null);
      setResult(null);

      const exists = await didRegistryService.resolveDid(did);
      if (!exists) {
        setResult({ exists });
        return;
      }

      const document = await didRegistryService.getDocument(did);
      const isActive = await didRegistryService.isDidActive(did);
      const controller = await didRegistryService.getDidController(did);

      setResult({
        exists,
        document,
        isActive,
        controller,
      });
    } catch (error) {
      console.error('Failed to check DID:', error);
      setError(error instanceof Error ? error.message : String(error));
    }
  };

  const handleUpdatePublicKey = async () => {
    if (!didRegistryService) {
      setError('DID Registry service not available');
      return;
    }

    try {
      setError(null);
      setResult(null);

      // Validate public key format
      if (!publicKey || publicKey.trim() === '') {
        setError('Public key cannot be empty');
        return;
      }

      // Ensure DID is valid
      if (!did || did.trim() === '') {
        setError('DID cannot be empty');
        return;
      }

      try {
        const exists = await didRegistryService.resolveDid(did);
        if (!exists) {
          setError(`DID ${did} does not exist. Please register it first.`);
          return;
        }

        const controller = await didRegistryService.getDidController(did);
        const isActive = await didRegistryService.isDidActive(did);

        if (!isActive) {
          setError(`DID ${did} is deactivated. Cannot update public key.`);
          return;
        }

        // Check if the connected wallet is the controller
        if (address && controller.toLowerCase() !== address.toLowerCase()) {
          setError(`You are not the controller of this DID. Only the controller (${controller}) can update it.`);
          return;
        }
      } catch (checkError) {
        console.error('Error checking DID:', checkError);
        setError(`Error checking DID: ${checkError instanceof Error ? checkError.message : String(checkError)}`);
        return;
      }

      // Now try to update the public key

      try {
        // Try the standard method first
        const receipt = await didRegistryService.updateDidPublicKey(did, publicKey);
        setResult(receipt);
      } catch (updateError) {
        // If the standard method fails, try a fallback approach
        try {
          // Get the contract directly
          const contract = didRegistryService.getContract();

          if (!contract) {
            throw new Error('Contract not available');
          }

          // Try with a different gas limit and explicit chainId
          const tx = await contract.updateDidPublicKey(did, publicKey, {
            gasLimit: 1000000, // Much higher gas limit for local networks
            chainId: 1337, // Explicitly set chainId to 1337 for local networks
          });

          const receipt = await tx.wait();

          setResult({
            transactionHash: receipt.hash,
            blockNumber: receipt.blockNumber,
            status: receipt.status === 1 ? 'success' : 'failed',
            message: 'Transaction completed using fallback method',
          });
        } catch (fallbackError) {
          throw updateError;
        }
      }
    } catch (error) {
      // More detailed error handling
      if (typeof error === 'object' && error !== null) {
        const errorObj = error as any;
        if (errorObj.code && errorObj.message) {
          setError(`Error ${errorObj.code}: ${errorObj.message}`);
        } else if (errorObj.reason) {
          setError(errorObj.reason);
        } else {
          setError(error instanceof Error ? error.message : String(error));
        }
      } else {
        setError(String(error));
      }
    }
  };

  const handleUpdateDocument = async () => {
    if (!didRegistryService) {
      setError('DID Registry service not available');
      return;
    }

    try {
      setError(null);
      setResult(null);

      const receipt = await didRegistryService.updateDidDocument(did, document);
      setResult(receipt);
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto mb-12">
      <h1 className="text-2xl font-bold mb-6">DID Registry Demo</h1>

      <div className="mb-6">
        {!isConnected ? (
          <button onClick={handleConnect} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
            Connect Wallet
          </button>
        ) : (
          <div>
            <div className="mb-2">
              <span className="font-semibold">Connected Address:</span> {address}
            </div>
            <button onClick={handleDisconnect} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
              Disconnect Wallet
            </button>
          </div>
        )}
      </div>

      {isConnected && !loading && (
        <div className="space-y-6">
          <div className="p-4 border rounded">
            <h2 className="text-xl font-semibold mb-4">Register DID</h2>
            <div className="space-y-3">
              <div>
                <label className="block mb-1">DID:</label>
                <input
                  title="DID"
                  placeholder="DID"
                  type="text"
                  value={did}
                  onChange={(e) => setDid(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block mb-1">Document:</label>
                <textarea
                  title="Document"
                  placeholder="Document"
                  value={document}
                  onChange={(e) => setDocument(e.target.value)}
                  className="w-full p-2 border rounded"
                  rows={3}
                />
              </div>
              <div>
                <label className="block mb-1">Public Key:</label>
                <input
                  title="Public Key"
                  placeholder="Public Key"
                  type="text"
                  value={publicKey}
                  onChange={(e) => setPublicKey(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <button
                onClick={handleRegisterDid}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                Register DID
              </button>
            </div>
          </div>

          <div className="p-4 border rounded">
            <h2 className="text-xl font-semibold mb-4">Check DID</h2>
            <div className="space-y-3">
              <div>
                <label className="block mb-1">DID:</label>
                <input
                  title="DID"
                  placeholder="DID"
                  type="text"
                  value={did}
                  onChange={(e) => setDid(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <button onClick={handleCheckDid} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                Check DID
              </button>
            </div>
          </div>

          <div className="p-4 border rounded">
            <h2 className="text-xl font-semibold mb-4">Update Public Key</h2>
            <div className="space-y-3">
              <div>
                <label className="block mb-1">DID:</label>
                <input
                  title="DID"
                  placeholder="DID"
                  type="text"
                  value={did}
                  onChange={(e) => setDid(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block mb-1">New Public Key:</label>
                <input
                  title="New Public Key"
                  placeholder="New Public Key"
                  type="text"
                  value={publicKey}
                  onChange={(e) => setPublicKey(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <button
                onClick={handleUpdatePublicKey}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
              >
                Update Public Key
              </button>
            </div>
          </div>

          <div className="p-4 border rounded">
            <h2 className="text-xl font-semibold mb-4">Update Document</h2>
            <div className="space-y-3">
              <div>
                <label className="block mb-1">DID:</label>
                <input
                  title="DID"
                  placeholder="DID"
                  type="text"
                  value={did}
                  onChange={(e) => setDid(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block mb-1">New Document:</label>
                <textarea
                  title="New Document"
                  placeholder="New Document"
                  value={document}
                  onChange={(e) => setDocument(e.target.value)}
                  className="w-full p-2 border rounded"
                  rows={3}
                />
              </div>
              <button
                onClick={handleUpdateDocument}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Update Document
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-100 border border-red-300 rounded text-red-700 text-wrap overflow-x-auto pr-2">
              {error}
            </div>
          )}

          {result && (
            <div className="p-4 bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 rounded ">
              <h3 className="font-semibold mb-2">Result:</h3>
              <pre className="whitespace-pre-wrap overflow-x-auto">
                {JSON.stringify(result, (key, value) => (typeof value === 'bigint' ? value.toString() : value), 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useBlockchainServicesViem } from '@/hooks/use-blockchain-services-viem';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useAuth } from '@/features/auth/contexts/auth-provider';
import { injected } from 'wagmi/connectors';

/**
 * Component that demonstrates how to use the blockchain services with Viem
 */
export default function DidRegistryDemoViem() {
  const { address } = useAuth();
  const { connect } = useConnect();
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { loading, didRegistryService } = useBlockchainServicesViem();
  const [retrying, setRetrying] = useState(false);
  const [serviceStatus, setServiceStatus] = useState<{
    isInitialized: boolean;
    contractAddress: string;
    readyForRead: boolean;
    readyForWrite: boolean;
    error: string | null;
  }>({
    isInitialized: false,
    contractAddress: '',
    readyForRead: false,
    readyForWrite: false,
    error: null,
  });

  // Check service status when it changes
  useEffect(() => {
    if (loading) return;

    if (!didRegistryService) {
      setServiceStatus({
        isInitialized: false,
        contractAddress: '',
        readyForRead: false,
        readyForWrite: false,
        error:
          'DID Registry service is not available. This could be due to missing or invalid contract address, network connection issues, or blockchain node unavailability.',
      });
      return;
    }

    try {
      const contractAddress = didRegistryService.getContractAddress();
      const readyForRead = didRegistryService.isReadyForRead();
      const readyForWrite = didRegistryService.isReadyForWrite();

      setServiceStatus({
        isInitialized: true,
        contractAddress,
        readyForRead,
        readyForWrite,
        error: null,
      });
    } catch (error) {
      setServiceStatus({
        isInitialized: false,
        contractAddress: '',
        readyForRead: false,
        readyForWrite: false,
        error: `Error checking service status: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  }, [didRegistryService, loading]);

  const [did, setDid] = useState('did:ethr:0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');
  const [document, setDocument] = useState('Sample Document');
  const [publicKey, setPublicKey] = useState(
    '0x40a079e25259ecc8004d37c918b1eb79eed819cd19c6c2834d8d01d169fe7501540d3303c5c3299a2db0bba8791eca16d7f70572c9498e1059fc74b9c0d72171'
  );
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRetry = () => {
    setRetrying(true);
    // Force a page reload to reinitialize services
    window.location.reload();
  };

  const handleConnect = async () => {
    try {
      setError(null);
      await connect({ connector: injected() });
    } catch (error) {
      setError('Failed to connect wallet');
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setResult(null);
    setError(null);
  };

  const checkServiceReadiness = (operation: 'read' | 'write'): boolean => {
    if (!didRegistryService) {
      setError('DID Registry service not available. Please refresh the page or check your connection.');
      return false;
    }

    if (operation === 'read' && !didRegistryService.isReadyForRead()) {
      setError('Connection to blockchain not available. Please ensure you are connected to the network.');
      return false;
    }

    if (operation === 'write' && !didRegistryService.isReadyForWrite()) {
      setError('Wallet not connected or blockchain connection not available. Please connect your wallet.');
      return false;
    }

    return true;
  };

  const handleRegisterDid = async () => {
    if (!checkServiceReadiness('write')) return;

    try {
      setError(null);
      setResult(null);

      const receipt = await didRegistryService!.registerDid(did, document, publicKey);

      setResult(receipt);
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
    }
  };

  const handleCheckDid = async () => {
    if (!checkServiceReadiness('read')) return;

    try {
      setError(null);
      setResult(null);

      const exists = await didRegistryService!.resolveDid(did);
      if (!exists) {
        setResult({ exists });
        return;
      }

      const document = await didRegistryService!.getDocument(did);
      const isActive = await didRegistryService!.isDidActive(did);
      const controller = await didRegistryService!.getDidController(did);

      setResult({
        exists,
        document,
        isActive,
        controller,
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
    }
  };

  const handleUpdatePublicKey = async () => {
    if (!checkServiceReadiness('write')) return;

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

      // Log the values being sent to help with debugging
      try {
        const exists = await didRegistryService!.resolveDid(did);
        if (!exists) {
          setError(`DID ${did} does not exist. Please register it first.`);
          return;
        }

        const controller = await didRegistryService!.getDidController(did);
        const isActive = await didRegistryService!.isDidActive(did);

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
      const receipt = await didRegistryService!.updateDidPublicKey(did, publicKey);
      setResult(receipt);
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
    if (!checkServiceReadiness('write')) return;

    try {
      setError(null);
      setResult(null);

      const receipt = await didRegistryService!.updateDidDocument(did, document);
      setResult(receipt);
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto mb-12">
      <h1 className="text-2xl font-bold mb-6">DID Registry Demo (Viem)</h1>

      {loading ? (
        <div className="mb-6 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded">
          <p>Loading blockchain services...</p>
        </div>
      ) : !serviceStatus.isInitialized ? (
        <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
          <h3 className="font-bold mb-2">Service Unavailable</h3>
          <p>{serviceStatus.error}</p>
          <div className="mt-4">
            <h4 className="font-semibold">Troubleshooting Steps:</h4>
            <ul className="list-disc pl-5 mt-2">
              <li>Check if your wallet is connected to the correct network</li>
              <li>Verify that the contract address is correct</li>
              <li>Ensure the blockchain node is available and responding</li>
              <li>Check browser console for more detailed error messages</li>
            </ul>
          </div>
          <button
            onClick={handleRetry}
            className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
            disabled={retrying}
          >
            {retrying ? 'Retrying...' : 'Retry'}
          </button>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          <h3 className="font-bold mb-2">Service Status</h3>
          <p>
            <strong>Contract Address:</strong> {serviceStatus.contractAddress}
          </p>
          <p>
            <strong>Ready for Read Operations:</strong> {serviceStatus.readyForRead ? 'Yes' : 'No'}
          </p>
          <p>
            <strong>Ready for Write Operations:</strong> {serviceStatus.readyForWrite ? 'Yes' : 'No'}
          </p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <h3 className="font-bold mb-2">Error</h3>
          <p>{error}</p>
        </div>
      )}

      <div className="mb-6">
        {!isConnected ? (
          <button onClick={handleConnect} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
            Connect Wallet
          </button>
        ) : (
          <button onClick={handleDisconnect} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded">
            Disconnect Wallet
          </button>
        )}
      </div>

      {!isConnected && <div className="text-center py-4">Please connect your wallet to use the DID Registry.</div>}

      {result && (
        <div className="mt-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          <h3 className="font-bold mb-2">Result</h3>
          <pre className="whitespace-pre-wrap overflow-auto max-h-60 bg-white p-2 rounded">
            {JSON.stringify(result, (key, value) => (typeof value === 'bigint' ? value.toString() : value), 2)}
          </pre>
        </div>
      )}

      {isConnected && serviceStatus.isInitialized && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="border p-4 rounded">
            <h2 className="text-xl font-semibold mb-4">Register DID</h2>
            <div className="mb-4">
              <label className="block mb-1">DID</label>
              <input
                type="text"
                value={did}
                onChange={(e) => setDid(e.target.value)}
                className="w-full p-2 border rounded"
                title="DID"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1">Document</label>
              <input
                type="text"
                value={document}
                onChange={(e) => setDocument(e.target.value)}
                className="w-full p-2 border rounded"
                title="Document"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1">Public Key</label>
              <input
                type="text"
                value={publicKey}
                onChange={(e) => setPublicKey(e.target.value)}
                className="w-full p-2 border rounded"
                title="Public Key"
              />
            </div>
            <button
              onClick={handleRegisterDid}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              Register DID
            </button>
          </div>

          <div className="border p-4 rounded">
            <h2 className="text-xl font-semibold mb-4">Check DID</h2>
            <div className="mb-4">
              <label className="block mb-1">DID</label>
              <input
                type="text"
                value={did}
                onChange={(e) => setDid(e.target.value)}
                className="w-full p-2 border rounded"
                title="DID"
              />
            </div>
            <button onClick={handleCheckDid} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
              Check DID
            </button>
          </div>

          <div className="border p-4 rounded">
            <h2 className="text-xl font-semibold mb-4">Update Public Key</h2>
            <div className="mb-4">
              <label className="block mb-1">DID</label>
              <input
                type="text"
                value={did}
                onChange={(e) => setDid(e.target.value)}
                className="w-full p-2 border rounded"
                title="DID"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1">New Public Key</label>
              <input
                type="text"
                value={publicKey}
                onChange={(e) => setPublicKey(e.target.value)}
                className="w-full p-2 border rounded"
                title="New Public Key"
              />
            </div>
            <button
              onClick={handleUpdatePublicKey}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
            >
              Update Public Key
            </button>
          </div>

          <div className="border p-4 rounded">
            <h2 className="text-xl font-semibold mb-4">Update Document</h2>
            <div className="mb-4">
              <label className="block mb-1">DID</label>
              <input
                type="text"
                value={did}
                onChange={(e) => setDid(e.target.value)}
                className="w-full p-2 border rounded"
                title="DID"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1">New Document</label>
              <input
                type="text"
                value={document}
                onChange={(e) => setDocument(e.target.value)}
                className="w-full p-2 border rounded"
                title="New Document"
              />
            </div>
            <button
              onClick={handleUpdateDocument}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
            >
              Update Document
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

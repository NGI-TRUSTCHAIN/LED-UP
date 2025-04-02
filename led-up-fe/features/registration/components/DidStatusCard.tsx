'use client';

import React from 'react';
import { useAccount } from 'wagmi';
import { useCallback } from 'react';
import { getContractAddresses } from '../../../lib/ethers';
import { useDidManager } from '../query/didQueries';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, AlertCircle, Info } from 'lucide-react';

// Get contract addresses
const { DID_REGISTRY_ADDRESS, DID_AUTH_ADDRESS } = getContractAddresses();

// Convert string addresses to `0x${string}` format for Wagmi
const didRegistryAddress = DID_REGISTRY_ADDRESS as `0x${string}`;
const didAuthAddress = DID_AUTH_ADDRESS as `0x${string}`;

interface DidStatusCardProps {
  onRegister?: () => void;
  onAuthenticate?: (role: 'consumer' | 'producer') => void;
}

export function DidStatusCard({ onRegister, onAuthenticate }: DidStatusCardProps) {
  const { address, isConnected } = useAccount();

  // Generate a DID for the connected wallet
  const generateDid = useCallback(() => {
    if (!address) {
      throw new Error('Wallet not connected');
    }
    // Format: did:ledup:<network>:<address>
    const network = process.env.NEXT_PUBLIC_NETWORK_NAME || 'mainnet'; // Default to mainnet if not specified
    return `did:ledup:${network}:${address.toLowerCase()}`;
  }, [address]);

  // Use the DID manager hook
  const {
    didExists,
    did,
    didDocument,
    didPublicKey,
    didLastUpdated,
    consumerAuthenticated,
    producerAuthenticated,
    consumerAuthError,
    producerAuthError,
    isLoading,
    hasError,
  } = useDidManager(address, didRegistryAddress, didAuthAddress, generateDid);

  // Format timestamp to readable date
  const formatDate = (timestamp: bigint | undefined) => {
    if (!timestamp) return 'N/A';
    return new Date(Number(timestamp) * 1000).toLocaleString();
  };

  // Render loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>DID Status</CardTitle>
          <CardDescription>Loading your decentralized identity information...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  // Render not connected state
  if (!isConnected || !address) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>DID Status</CardTitle>
          <CardDescription>Connect your wallet to view your DID status</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800">Wallet Not Connected</AlertTitle>
            <AlertDescription className="text-blue-700">
              Please connect your wallet to view your DID status.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Render DID not registered state
  if (!didExists) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>DID Status</CardTitle>
          <CardDescription>Your decentralized identity is not registered</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm font-medium">Potential DID</p>
            <p className="text-xs font-mono break-all">{did}</p>
          </div>

          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-yellow-800">DID Not Registered</AlertTitle>
            <AlertDescription className="text-yellow-700">
              Your DID is not registered yet. Please register it to use the platform.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter>
          {onRegister && (
            <Button onClick={onRegister} className="w-full">
              Register DID
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  }

  // Render DID registered state
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>DID Status</CardTitle>
          <CardDescription>Your decentralized identity information</CardDescription>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Registered
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm font-medium">Your DID</p>
          <p className="text-xs font-mono break-all">{did}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Last Updated</p>
            <p className="text-xs">{formatDate(didLastUpdated as bigint | undefined)}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Public Key</p>
            <p className="text-xs font-mono truncate" title={didPublicKey as string | undefined}>
              {didPublicKey ? `${(didPublicKey as string).substring(0, 10)}...` : 'N/A'}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Authentication Status</p>
          <div className="flex space-x-2">
            <Badge
              variant={consumerAuthenticated ? 'default' : 'outline'}
              className={
                consumerAuthenticated
                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }
            >
              {consumerAuthenticated ? (
                <CheckCircle2 className="mr-1 h-3 w-3" />
              ) : (
                <AlertCircle className="mr-1 h-3 w-3" />
              )}
              Consumer
            </Badge>
            <Badge
              variant={producerAuthenticated ? 'default' : 'outline'}
              className={
                producerAuthenticated
                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }
            >
              {producerAuthenticated ? (
                <CheckCircle2 className="mr-1 h-3 w-3" />
              ) : (
                <AlertCircle className="mr-1 h-3 w-3" />
              )}
              Producer
            </Badge>
          </div>
        </div>

        {(consumerAuthError || producerAuthError) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Authentication Error</AlertTitle>
            <AlertDescription>
              {consumerAuthError && <p>Consumer: {consumerAuthError}</p>}
              {producerAuthError && <p>Producer: {producerAuthError}</p>}
            </AlertDescription>
          </Alert>
        )}

        {didDocument && (
          <div className="space-y-2">
            <p className="text-sm font-medium">DID Document</p>
            <div className="bg-muted p-3 rounded-lg max-h-32 overflow-y-auto">
              <pre className="text-xs whitespace-pre-wrap break-all">
                {typeof didDocument === 'string' ? didDocument : JSON.stringify(didDocument, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between gap-2">
        {onAuthenticate && !consumerAuthenticated && (
          <Button variant="outline" onClick={() => onAuthenticate('consumer')} className="flex-1">
            Authenticate as Consumer
          </Button>
        )}
        {onAuthenticate && !producerAuthenticated && (
          <Button variant="outline" onClick={() => onAuthenticate('producer')} className="flex-1">
            Authenticate as Producer
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

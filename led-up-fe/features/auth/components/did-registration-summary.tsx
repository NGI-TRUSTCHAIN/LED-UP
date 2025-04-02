'use client';

import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface DidRegistrationSummaryProps {
  didIdentifier: string;
  publicKey: string;
  didDocument: string;
  isProcessing: boolean;
  onPrevious: () => void;
  onRegister: () => void;
}

export function DidRegistrationSummary({
  didIdentifier,
  publicKey,
  didDocument,
  isProcessing,
  onPrevious,
  onRegister,
}: DidRegistrationSummaryProps) {
  return (
    <div className="space-y-6">
      <div className="p-6 border rounded-md">
        <h3 className="font-medium mb-4 text-lg">DID Registration Summary</h3>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium">DID Identifier:</p>
            <p className="text-xs font-mono bg-muted p-2 rounded mt-1">{didIdentifier}</p>
          </div>

          <div>
            <p className="text-sm font-medium">Public Key:</p>
            <p className="text-xs font-mono bg-muted p-2 rounded mt-1 truncate">{publicKey}</p>
          </div>

          <div>
            <p className="text-sm font-medium">DID Document:</p>
            <div className="text-xs font-mono bg-muted p-2 rounded mt-1 max-h-32 overflow-y-auto">
              <pre>{didDocument}</pre>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-sm text-muted-foreground">
            By registering your DID, you're creating a permanent identity on the blockchain. This will require a
            transaction to be signed with your wallet.
          </p>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onPrevious}>
          Back
        </Button>
        <Button
          onClick={onRegister}
          disabled={isProcessing}
          className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <span className="flex items-center text-primary">
              <Loader2 className="mr-2 h-4 w-4 animate-spin " />
              Registering...
            </span>
          ) : (
            <span className="text-foreground">Register DID</span>
          )}
        </Button>
      </div>
    </div>
  );
}

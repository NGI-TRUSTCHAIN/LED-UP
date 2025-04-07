'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, LockIcon, UnlockIcon, ShieldAlert, Download, Copy, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Address } from 'viem';
import { useAuth } from '@/features/auth/contexts/auth-provider';
import { useRevealData } from '../../hooks/use-ipfs-queries';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Define a simplified HealthRecord type for this component
interface HealthRecord {
  recordId: string;
  cid: string;
  resourceType: number;
  producer: Address;
  updatedAt: number;
  dataSize: number;
  contentHash: string;
  isVerified: boolean;
}

interface RevealDataDialogProps {
  revealingRecord: HealthRecord | null;
  setRevealingRecord: (record: HealthRecord | null) => void;
  recordId: string;
  copyToClipboard?: (text: string, id: string, field: string) => void;
  copiedItem?: { id: string; field: string } | null;
  ipfsData?: any;
  isLoading?: boolean;
}

export const RevealDataDialog: React.FC<RevealDataDialogProps> = ({
  revealingRecord,
  setRevealingRecord,
  recordId,
  copyToClipboard = () => {},
  copiedItem = null,
  ipfsData,
  isLoading,
}) => {
  if (!revealingRecord) return null;

  // State to manage user-entered private key
  const [userPrivateKey, setUserPrivateKey] = useState('');
  const [hasEnteredKey, setHasEnteredKey] = useState(false);
  const { did, address: consumerAddress } = useAuth();

  // Add error state for better error handling
  const [errorState, setErrorState] = useState<{
    hasError: boolean;
    message: string;
  }>({
    hasError: false,
    message: '',
  });

  // Below the errorState, add the isDecrypting state
  const [isDecrypting, setIsDecrypting] = useState(false);

  // Use the reveal data hook with the user-provided key only after they've entered it
  const {
    data: revealedData,
    isLoading: isRevealLoading,
    error: revealError,
    hasPermission,
    sensitiveFieldsHidden,
    toggleSensitiveFields,
    accessGranted,
  } = useRevealData(
    revealingRecord.cid,
    did,
    consumerAddress as Address,
    hasEnteredKey ? userPrivateKey : undefined,
    revealingRecord.recordId,
    {
      trackAccess: true,
    }
  );

  // Handle form submission and key validation
  const handleKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!userPrivateKey) {
      return;
    }

    // Validate the key format - basic validation only
    if (userPrivateKey.length < 32) {
      setErrorState({
        hasError: true,
        message: 'Invalid private key format. Private keys should be at least 32 characters long.',
      });
      return;
    }

    try {
      setIsDecrypting(true);
      setErrorState({ hasError: false, message: '' });
      // Set that the user has entered their key - this will trigger the useRevealData hook
      setHasEnteredKey(true);
    } finally {
      setIsDecrypting(false);
    }
  };

  // Function to download the decrypted data as a JSON file
  const downloadDecryptedData = () => {
    if (!revealedData) return;

    // Create a Blob with the data
    const dataStr = JSON.stringify(revealedData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });

    // Create a download link and trigger the download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `metadata-${revealingRecord.recordId.substring(0, 8)}.json`;
    document.body.appendChild(a);
    a.click();

    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  return (
    <Dialog open={!!revealingRecord} onOpenChange={(open) => !open && setRevealingRecord(null)}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" /> Decrypt Health Record
          </DialogTitle>
          <DialogDescription>Enter your private key to decrypt and view this health record's data.</DialogDescription>
        </DialogHeader>

        {/* Add error message display */}
        {errorState.hasError && (
          <div className="p-3 mb-3 bg-red-50 border border-red-100 text-red-700 rounded-md flex items-start">
            <ShieldAlert className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <span>{errorState.message}</span>
          </div>
        )}

        {/* Key Input Section */}
        {!hasEnteredKey && (
          <div className="bg-muted/30 rounded-md p-4 my-4">
            <form onSubmit={handleKeySubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="privateKey" className="text-sm font-medium">
                  Private Key
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="privateKey"
                    type="password"
                    value={userPrivateKey}
                    onChange={(e) => setUserPrivateKey(e.target.value)}
                    placeholder="Enter your private key to decrypt data"
                    className="font-mono text-sm"
                  />
                  <Button type="submit" disabled={userPrivateKey.trim().length < 64}>
                    Decrypt
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Your private key is used locally and never transmitted to our servers.
                </p>
              </div>
            </form>
          </div>
        )}

        {/* Data Display Section */}
        <div className="flex-1 overflow-auto p-1 my-4">
          {hasEnteredKey ? (
            isRevealLoading ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : revealError ? (
              <div className="bg-destructive/10 p-4 rounded-md text-destructive border border-destructive/20">
                <div className="flex items-center gap-2 font-semibold mb-2">
                  <ShieldAlert className="h-5 w-5" />
                  <span>Error Decrypting Data</span>
                </div>
                <p className="text-sm">
                  {revealError instanceof Error ? revealError.message : 'An unknown error occurred'}
                </p>
                <div className="mt-4 pt-3 border-t border-destructive/20">
                  <Button variant="outline" onClick={() => setHasEnteredKey(false)} size="sm">
                    Try Different Key
                  </Button>
                </div>
              </div>
            ) : !hasPermission ? (
              <div className="bg-amber-500/10 p-4 rounded-md text-amber-700 dark:text-amber-400 border border-amber-500/20">
                <div className="flex items-center gap-2 font-semibold mb-2">
                  <LockIcon className="h-5 w-5" />
                  <span>Access Restricted</span>
                </div>
                <p className="text-sm">You don't have permission to view this health record data.</p>
                <div className="mt-4 pt-3 border-t border-amber-500/20">
                  <Button variant="outline" onClick={() => setHasEnteredKey(false)} size="sm">
                    Try Different Key
                  </Button>
                </div>
              </div>
            ) : revealedData ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Badge
                    variant="outline"
                    className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 flex items-center gap-1"
                  >
                    <UnlockIcon className="h-3 w-3 mr-1" />
                    Successfully Decrypted
                  </Badge>

                  {accessGranted && (
                    <span className="text-xs text-muted-foreground">{accessGranted.toLocaleString()}</span>
                  )}
                </div>

                <div className="relative bg-muted/30 rounded-md p-1">
                  <div className="absolute right-2 top-2 z-10 flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => toggleSensitiveFields()}>
                      {sensitiveFieldsHidden ? (
                        <>
                          <Eye className="h-3.5 w-3.5 mr-1.5" /> Show Sensitive Data
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3.5 w-3.5 mr-1.5" /> Hide Sensitive Data
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={downloadDecryptedData}
                      title="Download as JSON"
                    >
                      <Download className="h-3.5 w-3.5 mr-1.5" /> Download
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() =>
                        copyToClipboard(
                          JSON.stringify(revealedData, null, 2),
                          revealingRecord.recordId,
                          'revealed-data'
                        )
                      }
                    >
                      {copiedItem?.id === revealingRecord.recordId && copiedItem?.field === 'revealed-data' ? (
                        <>
                          <Check className="h-3.5 w-3.5 mr-1.5" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy
                        </>
                      )}
                    </Button>
                  </div>

                  <pre className="bg-muted p-4 pt-12 rounded-md text-xs font-mono overflow-x-auto max-h-[400px] overflow-y-auto whitespace-pre-wrap">
                    {JSON.stringify(revealedData, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                <p>No data available</p>
                <Button variant="outline" onClick={() => setHasEnteredKey(false)} className="mt-4" size="sm">
                  Try Different Key
                </Button>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-md border-muted-foreground/20 mt-2">
              <div className="bg-muted/50 p-3 rounded-full mb-4">
                <LockIcon className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-center mb-2">Data is Encrypted</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
                Enter your private key above to decrypt and view this health record data. Your key is processed locally
                for security.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={() => setRevealingRecord(null)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

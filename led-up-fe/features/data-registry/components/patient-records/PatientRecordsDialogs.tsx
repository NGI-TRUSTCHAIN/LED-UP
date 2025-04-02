'use client';

import React, { useState, useEffect } from 'react';
import {
  Eye,
  EyeOff,
  LockIcon,
  UnlockIcon,
  ShieldAlert,
  Download,
  Copy,
  Check,
  Share2,
  FileText,
  ExternalLink,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { HealthRecord } from '../../types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useRevealData } from '../../hooks/use-ipfs-queries';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getResourceTypeName } from '../../utils/transformation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { useAuth } from '@/features/auth/contexts/auth-provider';
import { Address } from 'viem';

// Record Detail Dialog Component
export const RecordDetailDialog = ({
  selectedRecord,
  setSelectedRecord,
  ipfsDataMap,
  copyToClipboard,
  copiedItem,
  openInIPFS,
}: {
  selectedRecord: HealthRecord | null;
  setSelectedRecord: (record: HealthRecord | null) => void;
  ipfsDataMap: Record<string, any>;
  copyToClipboard: (text: string, id: string, field: string) => void;
  copiedItem: { id: string; field: string } | null;
  openInIPFS: (cid: string) => void;
}) => {
  if (!selectedRecord) return null;

  const ipfsData = ipfsDataMap[selectedRecord.cid]?.data || {};
  const ipfsMetadata = ipfsDataMap[selectedRecord.cid]?.metadata || {};
  const resourceTypeName = getResourceTypeName(selectedRecord.resourceType);

  // Format timestamp
  const formatTimestamp = (timestamp: number): string => {
    if (!timestamp) return 'N/A';
    return format(new Date(timestamp * 1000), 'MMM d, yyyy HH:mm:ss');
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (!bytes) return '0 KB';
    const kb = bytes / 1024;
    return `${kb.toFixed(2)} KB`;
  };

  // Get display name for record
  const getDisplayName = (): string => {
    if (!ipfsData) return resourceTypeName;

    if (resourceTypeName === 'Patient' && ipfsData.name) {
      return `${ipfsData.name[0]?.given?.join(' ') || ''} ${ipfsData.name[0]?.family || ''}`.trim() || resourceTypeName;
    }

    if (
      (resourceTypeName === 'Observation' || resourceTypeName === 'Condition' || resourceTypeName === 'Procedure') &&
      ipfsData.code?.text
    ) {
      return ipfsData.code.text;
    }

    if (ipfsData.description) {
      return ipfsData.description;
    }

    if (ipfsData.title) {
      return ipfsData.title;
    }

    return resourceTypeName;
  };

  // Helper to render JSON data more cleanly
  const renderJsonValue = (value: any, depth = 0): React.ReactNode => {
    if (value === null || value === undefined) return <span className="text-gray-400">null</span>;
    if (typeof value === 'string') return <span className="text-green-600 dark:text-green-400">"{value}"</span>;
    if (typeof value === 'number') return <span className="text-blue-600 dark:text-blue-400">{value}</span>;
    if (typeof value === 'boolean')
      return <span className="text-purple-600 dark:text-purple-400">{value ? 'true' : 'false'}</span>;

    if (Array.isArray(value)) {
      if (value.length === 0) return <span className="text-gray-400">[]</span>;
      return (
        <div className="pl-4 border-l border-gray-200 dark:border-gray-700">
          {value.map((item, idx) => (
            <div key={idx} className="my-1">
              {renderJsonValue(item, depth + 1)}
              {idx < value.length - 1 && <span className="text-gray-400">,</span>}
            </div>
          ))}
        </div>
      );
    }

    if (typeof value === 'object') {
      const entries = Object.entries(value);
      if (entries.length === 0) return <span className="text-gray-400">{'{}'}</span>;
      return (
        <div className="pl-4 border-l border-gray-200 dark:border-gray-700">
          {entries.map(([key, val], idx) => (
            <div key={key} className="my-1">
              <span className="text-amber-600 dark:text-amber-400">{key}</span>: {renderJsonValue(val, depth + 1)}
              {idx < entries.length - 1 && <span className="text-gray-400">,</span>}
            </div>
          ))}
        </div>
      );
    }

    return String(value);
  };

  return (
    <Dialog open={!!selectedRecord} onOpenChange={(open) => !open && setSelectedRecord(null)}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-5 w-5" /> {getDisplayName()}
          </DialogTitle>
          <DialogDescription>
            Health record details - {resourceTypeName} ({selectedRecord.isVerified ? 'Verified' : 'Pending'})
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-6 pr-2 pb-2">
          {/* Record Metadata */}
          <div className="bg-muted/30 rounded-md p-4 shadow-sm">
            <h3 className="text-lg font-medium mb-3 flex items-center">
              <span className="inline-block w-6 h-6 bg-primary/10 rounded-full mr-2 flex items-center justify-center text-primary">
                <FileText className="h-3.5 w-3.5" />
              </span>
              Record Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-background rounded-md shadow-sm">
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium w-1/3 py-2.5">Resource Type</TableCell>
                      <TableCell className="py-2.5">
                        <Badge variant="outline">{resourceTypeName}</Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium w-1/3 py-2.5">Record ID</TableCell>
                      <TableCell className="flex items-center gap-2 py-2.5">
                        <span className="text-sm font-mono">{selectedRecord.recordId}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={() => copyToClipboard(selectedRecord.recordId, selectedRecord.recordId, 'detail-id')}
                        >
                          {copiedItem?.id === selectedRecord.recordId && copiedItem?.field === 'detail-id' ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3 text-muted-foreground" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium w-1/3 py-2.5">IPFS CID</TableCell>
                      <TableCell className="flex items-center gap-2 py-2.5">
                        <span className="text-sm font-mono truncate max-w-[200px]" title={selectedRecord.cid}>
                          {selectedRecord.cid}
                        </span>
                        <div className="flex items-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={() => copyToClipboard(selectedRecord.cid, selectedRecord.recordId, 'detail-cid')}
                          >
                            {copiedItem?.id === selectedRecord.recordId && copiedItem?.field === 'detail-cid' ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3 text-muted-foreground" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={() => openInIPFS(selectedRecord.cid)}
                          >
                            <ExternalLink className="h-3 w-3 text-muted-foreground" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              <div className="bg-background rounded-md shadow-sm">
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium w-1/3 py-2.5">Created</TableCell>
                      <TableCell className="py-2.5">{formatTimestamp(selectedRecord.updatedAt)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium w-1/3 py-2.5">Updated</TableCell>
                      <TableCell className="py-2.5">{formatTimestamp(selectedRecord.updatedAt)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium w-1/3 py-2.5">File Size</TableCell>
                      <TableCell className="py-2.5">{formatFileSize(selectedRecord.dataSize)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium w-1/3 py-2.5">Verification</TableCell>
                      <TableCell className="py-2.5">
                        {selectedRecord.isVerified ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-amber-600 flex items-center gap-1">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          {/* Record Content */}
          <div className="bg-muted/30 rounded-md p-4 shadow-sm">
            <h3 className="text-lg font-medium mb-3 flex items-center">
              <span className="w-6 h-6 bg-primary/10 rounded-full mr-2 flex items-center justify-center text-primary">
                <FileText className="h-3.5 w-3.5" />
              </span>
              Record Content
            </h3>
            <Tabs defaultValue="formatted" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="formatted">Formatted</TabsTrigger>
                <TabsTrigger value="raw">Raw JSON</TabsTrigger>
              </TabsList>
              <TabsContent value="formatted" className="space-y-4">
                {Object.keys(ipfsData).length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground bg-background rounded-md border border-dashed">
                    <LockIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground/60" />
                    <p>No data available or data is encrypted</p>
                    <p className="text-xs mt-1">Use the "Decrypt Data" button to reveal the content</p>
                  </div>
                ) : (
                  <div className="bg-background p-4 rounded-md">
                    {/* Render specific fields based on resource type */}
                    {resourceTypeName === 'Patient' && (
                      <div className="space-y-4 divide-y">
                        {ipfsData.name && (
                          <div className="pb-3">
                            <h4 className="text-md font-medium mb-1">Name</h4>
                            <p className="text-lg">
                              {ipfsData.name[0]?.given?.join(' ')} {ipfsData.name[0]?.family}
                            </p>
                          </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3">
                          {ipfsData.birthDate && (
                            <div>
                              <h4 className="text-md font-medium mb-1">Birth Date</h4>
                              <p>{ipfsData.birthDate}</p>
                            </div>
                          )}
                          {ipfsData.gender && (
                            <div>
                              <h4 className="text-md font-medium mb-1">Gender</h4>
                              <p>{ipfsData.gender}</p>
                            </div>
                          )}
                        </div>
                        {ipfsData.address && (
                          <div className="pt-3">
                            <h4 className="text-md font-medium mb-1">Address</h4>
                            <p>
                              {ipfsData.address[0]?.line?.join(', ')}
                              {ipfsData.address[0]?.city && `, ${ipfsData.address[0].city}`}
                              {ipfsData.address[0]?.state && `, ${ipfsData.address[0].state}`}
                              {ipfsData.address[0]?.postalCode && ` ${ipfsData.address[0].postalCode}`}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Observation */}
                    {resourceTypeName === 'Observation' && (
                      <div className="space-y-4 divide-y">
                        {ipfsData.code && (
                          <div className="pb-3">
                            <h4 className="text-md font-medium mb-1">Test</h4>
                            <p className="text-lg">{ipfsData.code.text || ipfsData.code.coding?.[0]?.display}</p>
                          </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3">
                          {ipfsData.valueQuantity && (
                            <div>
                              <h4 className="text-md font-medium mb-1">Result</h4>
                              <p className="text-lg font-medium">
                                {ipfsData.valueQuantity.value} {ipfsData.valueQuantity.unit}
                              </p>
                            </div>
                          )}
                          {ipfsData.effectiveDateTime && (
                            <div>
                              <h4 className="text-md font-medium mb-1">Date</h4>
                              <p>{ipfsData.effectiveDateTime}</p>
                            </div>
                          )}
                        </div>
                        {ipfsData.status && (
                          <div className="pt-3">
                            <h4 className="text-md font-medium mb-1">Status</h4>
                            <Badge variant="outline">{ipfsData.status}</Badge>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Condition */}
                    {resourceTypeName === 'Condition' && (
                      <div className="space-y-4 divide-y">
                        {ipfsData.code && (
                          <div className="pb-3">
                            <h4 className="text-md font-medium mb-1">Condition</h4>
                            <p className="text-lg">{ipfsData.code.text || ipfsData.code.coding?.[0]?.display}</p>
                          </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3">
                          {ipfsData.onsetDateTime && (
                            <div>
                              <h4 className="text-md font-medium mb-1">Onset Date</h4>
                              <p>{ipfsData.onsetDateTime}</p>
                            </div>
                          )}
                          {ipfsData.severity && (
                            <div>
                              <h4 className="text-md font-medium mb-1">Severity</h4>
                              <p>{ipfsData.severity.text || ipfsData.severity.coding?.[0]?.display}</p>
                            </div>
                          )}
                        </div>
                        {ipfsData.clinicalStatus && (
                          <div className="pt-3">
                            <h4 className="text-md font-medium mb-1">Clinical Status</h4>
                            <Badge
                              variant={ipfsData.clinicalStatus.coding?.[0]?.code === 'active' ? 'default' : 'outline'}
                            >
                              {ipfsData.clinicalStatus.text || ipfsData.clinicalStatus.coding?.[0]?.display}
                            </Badge>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Other resource types */}
                    {!['Patient', 'Observation', 'Condition'].includes(resourceTypeName) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {Object.entries(ipfsData).map(([key, value]) => {
                          // Skip complex nested objects
                          if (typeof value === 'object' && value !== null && Object.keys(value).length > 3) return null;

                          return (
                            <div key={key} className="bg-muted/30 p-3 rounded-md">
                              <h4 className="text-sm font-medium capitalize text-muted-foreground">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </h4>
                              <p
                                className="mt-1 truncate"
                                title={typeof value === 'string' ? value : JSON.stringify(value)}
                              >
                                {typeof value === 'string' ? value : JSON.stringify(value)}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="raw">
                <div className="bg-background p-4 rounded-md shadow-inner">
                  <div className="flex justify-end mb-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(JSON.stringify(ipfsData, null, 2), selectedRecord.recordId, 'detail-json')
                      }
                    >
                      {copiedItem?.id === selectedRecord.recordId && copiedItem?.field === 'detail-json' ? (
                        <>
                          <Check className="h-3.5 w-3.5 mr-1.5" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy JSON
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="text-sm font-mono overflow-x-auto max-h-[400px] overflow-y-auto whitespace-pre-wrap rounded-md bg-muted/30 p-4">
                    {renderJsonValue(ipfsData)}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <DialogFooter className="border-t pt-4 mt-2">
          <Button variant="outline" onClick={() => setSelectedRecord(null)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Define the form schema for sharing
const shareFormSchema = z.object({
  shareType: z.enum(['consumer', 'provider']),
  targetAddress: z
    .string()
    .min(1, 'Address is required')
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
  accessDuration: z.coerce
    .number()
    .min(1, 'Duration must be at least 1 day')
    .max(365, 'Duration cannot exceed 365 days'),
});

type ShareFormValues = z.infer<typeof shareFormSchema>;

// Share Record Dialog Component
export const ShareRecordDialog = ({
  sharingRecord,
  setSharingRecord,
  onShareSubmit,
  shareData,
  shareToProvider,
}: {
  sharingRecord: HealthRecord | null;
  setSharingRecord: (record: HealthRecord | null) => void;
  onShareSubmit: (values: ShareFormValues) => Promise<void>;
  shareData: { isPending: boolean };
  shareToProvider: { isPending: boolean };
}) => {
  // Initialize the form
  const shareForm = useForm<ShareFormValues>({
    resolver: zodResolver(shareFormSchema),
    defaultValues: {
      shareType: 'consumer',
      targetAddress: '',
      accessDuration: 7,
    },
  });

  if (!sharingRecord) return null;

  return (
    <Dialog open={!!sharingRecord} onOpenChange={(open) => !open && setSharingRecord(null)}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" /> Share Health Record
          </DialogTitle>
          <DialogDescription>Share this health record with a consumer or provider.</DialogDescription>
        </DialogHeader>

        <Form {...shareForm}>
          <form onSubmit={shareForm.handleSubmit(onShareSubmit)} className="space-y-4">
            <FormField
              control={shareForm.control}
              name="shareType"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Share with</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="consumer" />
                        </FormControl>
                        <FormLabel className="font-normal">Consumer (Patient or Doctor)</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="provider" />
                        </FormControl>
                        <FormLabel className="font-normal">Provider (Hospital or Lab)</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={shareForm.control}
              name="targetAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipient Address</FormLabel>
                  <FormControl>
                    <Input placeholder="0x..." {...field} />
                  </FormControl>
                  <FormDescription>Enter the Ethereum address of the recipient.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={shareForm.control}
              name="accessDuration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Access Duration (days)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormDescription>How many days the recipient will have access to this record.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setSharingRecord(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={shareData.isPending || shareToProvider.isPending} className="ml-2">
                {shareData.isPending || shareToProvider.isPending ? (
                  <div className="flex items-center">
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    Processing...
                  </div>
                ) : (
                  'Share Record'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

// Reveal Data Dialog Component
export const RevealDataDialog = ({
  revealingRecord,
  setRevealingRecord,
  recordId,
  copyToClipboard,
  copiedItem,
}: {
  revealingRecord: HealthRecord | null;
  setRevealingRecord: (record: HealthRecord | null) => void;
  recordId: string;
  copyToClipboard: (text: string, id: string, field: string) => void;
  copiedItem: { id: string; field: string } | null;
}) => {
  if (!revealingRecord) return null;

  console.log('===============revealingRecord', revealingRecord);

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

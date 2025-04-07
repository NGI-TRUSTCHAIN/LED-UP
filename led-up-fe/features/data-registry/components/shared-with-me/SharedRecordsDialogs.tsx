'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow, format } from 'date-fns';
import {
  Clock,
  Copy,
  Check,
  X,
  AlertTriangle,
  Loader2,
  ClipboardCopy,
  FileWarning,
  Key,
  ShieldAlert,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { SharedRecord } from '../types';
import { Address } from 'viem';
import { truncateString } from '@/lib/utils';
import { useClipboard } from '@/hooks/use-clipboard';

// Type for the SharedRecord with isExpired computed property
interface ExtendedSharedRecord extends SharedRecord {
  isExpired: boolean;
  consumer: Address;
  revokedAt?: bigint;
}

interface RecordDetailDialogProps {
  selectedRecord: ExtendedSharedRecord | null;
  setSelectedRecord: (record: ExtendedSharedRecord | null) => void;
  copyToClipboard: (text: string, id: string, field: string) => void;
  copiedItem: { id: string; field: string } | null;
  onAccessData: (record: ExtendedSharedRecord) => void;
  onRevokeAccess: (record: ExtendedSharedRecord) => void;
}

export const RecordDetailDialog: React.FC<RecordDetailDialogProps> = ({
  selectedRecord,
  setSelectedRecord,
  copyToClipboard,
  copiedItem,
  onAccessData,
  onRevokeAccess,
}) => {
  // Only render the dialog if there's a record to show
  if (!selectedRecord) return null;

  const statusBadge = selectedRecord?.isRevoked ? (
    <Badge variant="destructive" className="ml-2 gap-1">
      <ShieldAlert className="h-3 w-3" />
      <span>Revoked</span>
    </Badge>
  ) : selectedRecord?.isExpired ? (
    <Badge variant="outline" className="ml-2 gap-1">
      <Clock className="h-3 w-3" />
      <span>Expired</span>
    </Badge>
  ) : (
    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 ml-2 gap-1">
      <Key className="h-3 w-3" />
      <span>Active</span>
    </Badge>
  );

  return (
    <Dialog open={!!selectedRecord} onOpenChange={(open) => !open && setSelectedRecord(null)}>
      <DialogContent className="sm:max-w-md overflow-y-auto max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center">Record Details {statusBadge}</DialogTitle>
          <DialogDescription>View detailed information about this shared record</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Record ID</Label>
            <div className="flex items-center justify-between rounded-md border p-2">
              <code className="text-sm">{selectedRecord.recordId}</code>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(selectedRecord.recordId, selectedRecord.recordId, 'Record ID')}
                      aria-label="Copy Record ID to clipboard"
                    >
                      {copiedItem?.id === selectedRecord.recordId && copiedItem?.field === 'Record ID' ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy Record ID</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Your DID</Label>
            <div className="flex items-center justify-between rounded-md border p-2">
              <code className="text-sm">{truncateString(selectedRecord.consumer, 20)}</code>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(selectedRecord.consumer, selectedRecord.recordId, 'Consumer DID')}
                      aria-label="Copy DID to clipboard"
                    >
                      {copiedItem?.id === selectedRecord.recordId && copiedItem?.field === 'Consumer DID' ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy DID</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Granted On</Label>
              {selectedRecord.grantedAt instanceof Date || typeof selectedRecord.grantedAt === 'number' ? (
                <>
                  <p className="mt-1 text-sm">{format(new Date(selectedRecord.grantedAt), 'PPP')}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(selectedRecord.grantedAt), {
                      addSuffix: true,
                    })}
                  </p>
                </>
              ) : (
                <p className="mt-1 text-sm text-muted-foreground">Unknown</p>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium">Expires On</Label>
              {selectedRecord.expiration ? (
                <>
                  <p className="mt-1 text-sm">{format(new Date(Number(selectedRecord.expiration) * 1000), 'PPP')}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(Number(selectedRecord.expiration) * 1000), {
                      addSuffix: true,
                    })}
                  </p>
                </>
              ) : (
                <p className="mt-1 text-sm text-muted-foreground">Not specified</p>
              )}
            </div>
          </div>

          {selectedRecord.isRevoked && selectedRecord.revokedAt && (
            <div>
              <Label className="text-sm font-medium">Revoked On</Label>
              <p className="mt-1 text-sm">{format(new Date(Number(selectedRecord.revokedAt) * 1000), 'PPP')}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(Number(selectedRecord.revokedAt) * 1000), {
                  addSuffix: true,
                })}
              </p>
            </div>
          )}

          <Separator />

          <div className="space-y-2">
            <Label className="text-sm font-medium">Access Level</Label>
            <p className="text-sm">Level {selectedRecord.accessLevel}</p>
            <p className="text-xs text-muted-foreground">
              {selectedRecord.accessLevel === 1
                ? 'Basic access - view summary information'
                : selectedRecord.accessLevel === 2
                ? 'Standard access - view detailed information'
                : 'Full access - view all information including sensitive data'}
            </p>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          {selectedRecord && !selectedRecord.isRevoked && !selectedRecord.isExpired && (
            <>
              <Button variant="secondary" className="sm:w-auto w-full" onClick={() => onAccessData(selectedRecord)}>
                Access Data
              </Button>
              <Button
                variant="outline"
                className="sm:w-auto w-full text-destructive border-destructive hover:bg-destructive/5"
                onClick={() => onRevokeAccess(selectedRecord)}
              >
                Revoke Access
              </Button>
            </>
          )}
          <Button variant="ghost" className="sm:w-auto w-full" onClick={() => setSelectedRecord(null)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface AccessDataDialogProps {
  accessingRecord: ExtendedSharedRecord | null;
  setAccessingRecord: (record: ExtendedSharedRecord | null) => void;
  recordId: string;
  ipfsData: any;
  isLoading: boolean;
}

export const AccessDataDialog: React.FC<AccessDataDialogProps> = ({
  accessingRecord,
  setAccessingRecord,
  recordId,
  ipfsData,
  isLoading,
}) => {
  const { copy } = useClipboard();

  // Only render if there's a record to access
  if (!accessingRecord) return null;

  const copyToClipboard = (text: string) => {
    copy(text);
  };

  return (
    <Dialog open={!!accessingRecord} onOpenChange={(open) => !open && setAccessingRecord(null)}>
      <DialogContent className="sm:max-w-lg overflow-y-auto max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Health Record Data</DialogTitle>
          <DialogDescription>Viewing shared health record data for record ID: {recordId}</DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-4 text-sm text-muted-foreground">Retrieving health record data...</p>
            </div>
          </div>
        )}

        {!isLoading && !ipfsData && (
          <div className="flex justify-center items-center py-8">
            <div className="flex flex-col items-center">
              <FileWarning className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">Data Not Available</h3>
              <p className="mt-2 text-center text-sm text-muted-foreground max-w-md">
                We couldn't retrieve the health record data. This could be due to network issues or the data may no
                longer be available.
              </p>
            </div>
          </div>
        )}

        {!isLoading && ipfsData && (
          <div className="space-y-4 py-4">
            <Separator />

            {/* Patient Information */}
            <Card>
              <CardHeader>
                <CardTitle>Patient Information</CardTitle>
                <CardDescription>Basic demographic information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Name</Label>
                    <p className="text-sm">{ipfsData.patient?.name || 'Not available'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Date of Birth</Label>
                    <p className="text-sm">{ipfsData.patient?.dateOfBirth || 'Not available'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Gender</Label>
                    <p className="text-sm">{ipfsData.patient?.gender || 'Not available'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Blood Type</Label>
                    <p className="text-sm">{ipfsData.patient?.bloodType || 'Not available'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Clinical Observations */}
            {ipfsData.clinicalObservations && (
              <Card>
                <CardHeader>
                  <CardTitle>Clinical Observations</CardTitle>
                  <CardDescription>Latest health metrics and observations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {ipfsData.clinicalObservations.map((observation: any, index: number) => (
                      <div key={index} className="border rounded-md p-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium">Observation</Label>
                            <p className="text-sm">{observation.name || 'Unnamed'}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Date</Label>
                            <p className="text-sm">{observation.date || 'Unknown date'}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Value</Label>
                            <p className="text-sm">{observation.value || 'No value'}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Unit</Label>
                            <p className="text-sm">{observation.unit || 'No unit'}</p>
                          </div>
                          {observation.note && (
                            <div className="col-span-2">
                              <Label className="text-sm font-medium">Notes</Label>
                              <p className="text-sm">{observation.note}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {ipfsData.clinicalObservations.length === 0 && (
                      <p className="text-sm text-muted-foreground">No clinical observations recorded</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <DialogFooter>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => copyToClipboard(JSON.stringify(ipfsData, null, 2))}
                  disabled={!ipfsData || isLoading}
                  aria-label="Copy health record to clipboard"
                >
                  <ClipboardCopy className="h-4 w-4" />
                  <span>Copy JSON</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy full record data as JSON</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button variant="ghost" onClick={() => setAccessingRecord(null)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface RevokeAccessDialogProps {
  revokingRecord: ExtendedSharedRecord | null;
  setRevokingRecord: (record: ExtendedSharedRecord | null) => void;
  onRevokeConfirm: (recordId: string, consumerAddress: Address) => void;
  isRevoking: boolean;
}

export const RevokeAccessDialog = ({
  revokingRecord,
  setRevokingRecord,
  onRevokeConfirm,
  isRevoking,
}: {
  revokingRecord: ExtendedSharedRecord | null;
  setRevokingRecord: (record: ExtendedSharedRecord | null) => void;
  onRevokeConfirm: (recordId: string, consumerAddress: Address) => void;
  isRevoking: boolean;
}) => {
  // Only render if there's a record to revoke
  if (!revokingRecord) return null;

  return (
    <Dialog open={!!revokingRecord} onOpenChange={(open) => !open && setRevokingRecord(null)}>
      <DialogContent className="sm:max-w-md overflow-y-auto max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Revoke Access</DialogTitle>
          <DialogDescription>
            Are you sure you want to revoke access to this record? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="bg-muted p-4 rounded-md">
            <p className="font-medium mb-1">Record ID</p>
            <p className="text-sm font-mono break-all">{revokingRecord.recordId}</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setRevokingRecord(null)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => onRevokeConfirm(revokingRecord.recordId, revokingRecord.consumer)}
            disabled={isRevoking}
          >
            {isRevoking ? (
              <div className="flex items-center">
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                Revoking...
              </div>
            ) : (
              'Revoke Access'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Interface for trigger dialog props
interface AccessTriggerDialogProps {
  triggeringRecord: ExtendedSharedRecord | null;
  setTriggeringRecord: (record: ExtendedSharedRecord | null) => void;
  onConfirm: (recordId: string) => void;
  isLoading: boolean;
}

// Create a simple dialog for triggering access
export const AccessTriggerDialog: React.FC<AccessTriggerDialogProps> = ({
  triggeringRecord,
  setTriggeringRecord,
  onConfirm,
  isLoading,
}) => {
  if (!triggeringRecord) return null;

  // No need for async handler now
  const handleConfirm = () => {
    onConfirm(triggeringRecord.recordId);
    // Dialog will be closed by the parent component after success
  };

  return (
    <Dialog open={!!triggeringRecord} onOpenChange={(open) => !open && setTriggeringRecord(null)}>
      <DialogContent className="sm:max-w-md overflow-y-auto max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Trigger Access</DialogTitle>
          <DialogDescription>
            This action will notify the data provider that you wish to access this record.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="rounded-md bg-amber-50 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-amber-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-amber-800">Note</h3>
                <div className="mt-2 text-sm text-amber-700">
                  <p>
                    Triggering access creates a transaction on the blockchain and may incur gas fees. This action is
                    necessary to decrypt the data.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Record ID</Label>
            <code className="block p-2 border rounded-md bg-muted/30 text-xs overflow-x-auto">
              {triggeringRecord.recordId}
            </code>
          </div>
        </div>

        <DialogFooter className="flex sm:justify-between gap-2">
          <Button type="button" variant="ghost" onClick={() => setTriggeringRecord(null)}>
            Cancel
          </Button>
          <Button type="button" disabled={isLoading} onClick={handleConfirm}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>Trigger Access</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

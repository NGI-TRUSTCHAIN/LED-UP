'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format } from 'date-fns';
import { Clock, Eye, Lock, File, Clipboard, Calendar, LockOpen } from 'lucide-react';
import { Address } from 'viem';
import { SharedRecordCard } from './SharedRecordCard';

// SharedRecord type
export interface SharedRecord {
  recordId: string;
  consumer: Address;
  consumerDid: string;
  expiration: bigint;
  accessLevel: number;
  isRevoked: boolean;
  isExpired: boolean;
  revokedBy?: Address;
  grantedAt: Date;
  revokedAt?: Date;
  ipfsData?: any;
}

// Utility component for copying text
export const CopyButton = ({
  text,
  id,
  field,
  onCopy,
  isCopied,
}: {
  text: string;
  id: string;
  field: string;
  onCopy: (text: string, id: string, field: string) => void;
  isCopied: boolean;
}) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-5 w-5 text-muted-foreground hover:text-foreground"
      onClick={() => onCopy(text, id, field)}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <Clipboard className="h-3.5 w-3.5" />
        </TooltipTrigger>
        <TooltipContent side="top">{isCopied ? 'Copied!' : 'Copy to clipboard'}</TooltipContent>
      </Tooltip>
    </Button>
  );
};

// Utility component for accessing data
export const AccessButton = ({
  record,
  onAccess,
}: {
  record: SharedRecord;
  onAccess: (record: SharedRecord) => void;
}) => {
  return (
    <Button
      variant="outline"
      size="sm"
      className="flex items-center gap-1"
      onClick={() => onAccess(record)}
      disabled={record.isRevoked || record.isExpired}
    >
      <Eye className="h-3.5 w-3.5" />
      Access
    </Button>
  );
};

// Utility component for revoking access
export const RevokeButton = ({
  record,
  onRevoke,
}: {
  record: SharedRecord;
  onRevoke: (record: SharedRecord) => void;
}) => {
  return (
    <Button
      variant="outline"
      size="sm"
      className="flex items-center gap-1"
      onClick={() => onRevoke(record)}
      disabled={record.isRevoked || record.isExpired}
    >
      <Lock className="h-3.5 w-3.5" />
      Revoke
    </Button>
  );
};

// Formatter utilities
export const formatUtils = {
  truncate: (text: string, length = 8) => {
    if (!text) return '';
    if (text.length <= length * 2) return text;
    return `${text.substring(0, length)}...${text.substring(text.length - length)}`;
  },
  formatDate: (timestamp: bigint | Date) => {
    const date = timestamp instanceof Date ? timestamp : new Date(Number(timestamp) * 1000);
    return format(date, 'MMM d, yyyy');
  },
  formatAccessLevel: (level: number) => {
    switch (level) {
      case 1:
        return 'View Only';
      case 2:
        return 'View & Search';
      case 3:
        return 'Analytics';
      case 4:
        return 'Edit';
      case 5:
        return 'Full Access';
      default:
        return 'Unknown';
    }
  },
  formatStatus: (record: SharedRecord) => {
    if (record.isRevoked) return 'Revoked';
    if (record.isExpired) return 'Expired';
    return 'Active';
  },
  getStatusBadge: (record: SharedRecord) => {
    if (record.isRevoked) {
      return (
        <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 flex items-center gap-1">
          <Lock className="h-3 w-3" /> Revoked
        </Badge>
      );
    }

    if (record.isExpired) {
      return (
        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 flex items-center gap-1">
          <Clock className="h-3 w-3" /> Expired
        </Badge>
      );
    }

    return (
      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 flex items-center gap-1">
        <LockOpen className="h-3 w-3" /> Active
      </Badge>
    );
  },
};

// SharedRecordGrid - Grid view for shared records
export const SharedRecordGrid = ({
  records,
  onRecordClick,
  onAccessData,
  onRevokeAccess,
}: {
  records: SharedRecord[];
  onRecordClick: (record: SharedRecord) => void;
  onAccessData: (record: SharedRecord) => void;
  onRevokeAccess: (record: SharedRecord) => void;
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {records.map((record) => (
        <SharedRecordCard
          key={record.recordId}
          record={record}
          onClick={() => onRecordClick(record)}
          onAccessData={onAccessData}
          onRevokeAccess={onRevokeAccess}
        />
      ))}
    </div>
  );
};

// SharedRecordTable - Table view for shared records
export const SharedRecordTable = ({
  records,
  onRecordClick,
  onAccessData,
  onRevokeAccess,
  copyToClipboard,
  copiedItem,
}: {
  records: SharedRecord[];
  onRecordClick: (record: SharedRecord) => void;
  onAccessData: (record: SharedRecord) => void;
  onRevokeAccess: (record: SharedRecord) => void;
  copyToClipboard: (text: string, id: string, field: string) => void;
  copiedItem: { id: string; field: string } | null;
}) => {
  return (
    <div className="rounded-md border overflow-hidden px-4 py-2">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-medium">RECORD ID</TableHead>
            <TableHead className="font-medium">ACCESS LEVEL</TableHead>
            <TableHead className="font-medium">STATUS</TableHead>
            <TableHead className="font-medium">GRANTED ON</TableHead>
            <TableHead className="font-medium">EXPIRES</TableHead>
            <TableHead className="w-[200px] text-center">ACTIONS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No shared records found.
              </TableCell>
            </TableRow>
          ) : (
            records.map((record) => (
              <TableRow
                key={record.recordId}
                className="hover:bg-muted/50 cursor-pointer"
                onClick={() => onRecordClick(record)}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <File className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate max-w-[150px]" title={record.recordId}>
                      {formatUtils.truncate(record.recordId, 10)}
                    </span>
                    <CopyButton
                      text={record.recordId}
                      id={record.recordId}
                      field="recordId"
                      onCopy={copyToClipboard}
                      isCopied={copiedItem?.id === record.recordId && copiedItem?.field === 'recordId'}
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-normal">
                    {formatUtils.formatAccessLevel(record.accessLevel)}
                  </Badge>
                </TableCell>
                <TableCell>{formatUtils.getStatusBadge(record)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    {formatUtils.formatDate(record.grantedAt)}
                  </div>
                </TableCell>
                <TableCell>
                  {record.isExpired
                    ? 'Expired'
                    : record.isRevoked
                    ? 'Revoked'
                    : formatUtils.formatDate(record.expiration)}
                </TableCell>
                <TableCell>
                  <div className="flex justify-center gap-2">
                    <AccessButton record={record} onAccess={onAccessData} />
                    <RevokeButton record={record} onRevoke={onRevokeAccess} />
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

// SharedRecordsTabs - Tabs for filtering records by status
export const SharedRecordsTabs = ({
  activeTab,
  setActiveTab,
  recordCounts,
}: {
  activeTab: 'all' | 'active' | 'expired' | 'revoked';
  setActiveTab: (tab: 'all' | 'active' | 'expired' | 'revoked') => void;
  recordCounts: {
    all: number;
    active: number;
    expired: number;
    revoked: number;
  };
}) => {
  const tabs = [
    { id: 'all', label: 'All', count: recordCounts.all },
    { id: 'active', label: 'Active', count: recordCounts.active },
    { id: 'expired', label: 'Expired', count: recordCounts.expired },
    { id: 'revoked', label: 'Revoked', count: recordCounts.revoked },
  ] as const;

  return (
    <div className="flex border-b mb-6 overflow-x-auto">
      {tabs.map(({ id, label, count }) => (
        <button
          key={id}
          className={`px-4 py-2 border-b-2 transition-colors text-sm font-medium ${
            activeTab === id
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab(id)}
        >
          {label} {count > 0 && <span className="ml-1 text-xs">({count})</span>}
        </button>
      ))}
    </div>
  );
};

'use client';

import React from 'react';
import { SharedRecord } from '../types';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { truncateString } from '@/lib/utils';
import { Address } from 'viem';
import { LockIcon, UnlockIcon, XCircle, CheckCircle, Clock } from 'lucide-react';

// ExtendedSharedRecord with computed properties
interface ExtendedSharedRecord extends SharedRecord {
  isExpired: boolean;
  consumer: Address;
}

interface SharedRecordTableRowProps {
  record: ExtendedSharedRecord;
  onViewDetails: (record: ExtendedSharedRecord) => void;
  renderActions?: (record: ExtendedSharedRecord) => React.ReactNode;
  getAccessLevelText: (level: number) => string;
}

export const SharedRecordTableRow = React.memo(
  ({ record, onViewDetails, renderActions, getAccessLevelText }: SharedRecordTableRowProps) => {
    // Format date function
    const formatDate = (date: Date | null) => {
      if (!date) return 'Unknown';
      return format(date, 'MMM d, yyyy');
    };

    return (
      <TableRow className="cursor-pointer hover:bg-muted/50" onClick={() => onViewDetails(record)}>
        <TableCell className="font-medium truncate max-w-[120px]" title={record.recordId}>
          {record.recordId.substring(0, 6)}...{record.recordId.substring(record.recordId.length - 4)}
        </TableCell>
        <TableCell>
          {record.isRevoked ? (
            <Badge variant="outline" className="text-red-600 dark:text-red-400 flex items-center gap-1">
              <XCircle className="h-3 w-3 mr-1" /> Revoked
            </Badge>
          ) : record.isExpired ? (
            <Badge variant="outline" className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <Clock className="h-3 w-3 mr-1" /> Expired
            </Badge>
          ) : (
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 flex items-center gap-1">
              <CheckCircle className="h-3 w-3 mr-1" />
              Active
            </Badge>
          )}
        </TableCell>
        <TableCell className="text-center">
          <Badge variant="outline" className="font-medium">
            {getAccessLevelText(record.accessLevel)}
          </Badge>
        </TableCell>
        <TableCell className="text-muted-foreground text-sm">{formatDate(record.grantedAt)}</TableCell>
        <TableCell className="text-muted-foreground text-sm">
          {format(new Date(Number(record.expiration) * 1000), 'MMM d, yyyy')}
        </TableCell>
        <TableCell>
          {renderActions ? (
            renderActions(record)
          ) : (
            <Badge
              variant="outline"
              className={`flex items-center gap-1 ${
                record.isRevoked || record.isExpired ? 'text-red-600' : 'text-blue-600'
              }`}
            >
              {record.isRevoked || record.isExpired ? (
                <>
                  <LockIcon className="h-3 w-3 mr-1" /> Locked
                </>
              ) : (
                <>
                  <UnlockIcon className="h-3 w-3 mr-1" /> Accessible
                </>
              )}
            </Badge>
          )}
        </TableCell>
      </TableRow>
    );
  }
);

SharedRecordTableRow.displayName = 'SharedRecordTableRow';

interface SharedRecordTableProps {
  records: ExtendedSharedRecord[];
  onViewDetails: (record: ExtendedSharedRecord) => void;
  renderActions?: (record: ExtendedSharedRecord) => React.ReactNode;
  getAccessLevelText: (level: number) => string;
}

const SharedRecordTable = React.memo(
  ({ records, onViewDetails, renderActions, getAccessLevelText }: SharedRecordTableProps) => {
    return (
      <div className="rounded-md border bg-background">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="h-12 px-4 text-left font-medium">Record ID</th>
                <th className="h-12 px-4 text-left font-medium">Status</th>
                <th className="h-12 px-4 text-center font-medium">Access Level</th>
                <th className="h-12 px-4 text-left font-medium">Granted</th>
                <th className="h-12 px-4 text-left font-medium">Expires</th>
                <th className="h-12 px-4 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="h-24 text-center text-muted-foreground">
                    No records found.
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <SharedRecordTableRow
                    key={record.recordId}
                    record={record}
                    onViewDetails={onViewDetails}
                    renderActions={renderActions}
                    getAccessLevelText={getAccessLevelText}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
);

SharedRecordTable.displayName = 'SharedRecordTable';

export default SharedRecordTable;

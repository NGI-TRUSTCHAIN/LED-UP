'use client';

import React from 'react';
import { SharedRecord } from '../types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow, format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Eye, Clock, Ban, CheckCircle2, Calendar, Lock, Key, FileSearch } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { truncateString } from '@/lib/utils';
import { Address } from 'viem';

// ExtendedSharedRecord with computed properties
interface ExtendedSharedRecord extends SharedRecord {
  isExpired: boolean;
  consumer: Address;
}

interface SharedRecordCardProps {
  record: ExtendedSharedRecord;
  onViewDetails: (record: ExtendedSharedRecord) => void;
  onTriggerAccess?: (record: ExtendedSharedRecord) => void;
  onRevealData?: (record: ExtendedSharedRecord) => void;
}

const SharedRecordCard = React.memo(
  ({ record, onViewDetails, onTriggerAccess, onRevealData }: SharedRecordCardProps) => {
    return (
      <Card className="overflow-hidden hover:shadow-md transition-shadow duration-200 h-full flex flex-col border-muted-foreground/20">
        <CardContent className="p-5 flex-grow">
          <div className="flex justify-between items-start gap-2 mb-4">
            <div>
              <h3 className="font-mono text-sm truncate max-w-[180px]" title={record.recordId}>
                {truncateString(record.recordId, 16)}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Access Level: {record.accessLevel}</p>
            </div>
            {record.isRevoked ? (
              <Badge variant="destructive" className="font-medium">
                Revoked
              </Badge>
            ) : record.isExpired ? (
              <Badge variant="outline" className="text-muted-foreground font-medium">
                Expired
              </Badge>
            ) : (
              <Badge
                variant="default"
                className="bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/20 font-medium"
              >
                Active
              </Badge>
            )}
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="text-xs">
                    Granted: {formatDistanceToNow(record.grantedAt, { addSuffix: true })}
                  </TooltipTrigger>
                  <TooltipContent>{format(record.grantedAt, 'PPpp')}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="text-xs">
                    Expires: {formatDistanceToNow(new Date(Number(record.expiration) * 1000), { addSuffix: true })}
                  </TooltipTrigger>
                  <TooltipContent>{format(new Date(Number(record.expiration) * 1000), 'PPpp')}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {record.isRevoked && record.revokedBy && (
              <div className="flex items-center gap-2">
                <Ban className="h-3.5 w-3.5 text-destructive" />
                <span className="text-xs">Revoked by: {truncateString(record.revokedBy, 10)}</span>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-2 pt-0 border-t bg-muted/30 mt-auto">
          <div className="flex justify-end items-center gap-2 w-full my-2">
            <Button
              variant="outline"
              size="icon"
              className="text-primary"
              onClick={() => onViewDetails(record)}
              title="View Details"
            >
              <Eye className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="text-primary"
              onClick={() => onTriggerAccess?.(record)}
              title="Trigger Access"
              disabled={record.isExpired || record.isRevoked}
            >
              <Key className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="text-primary"
              onClick={() => onRevealData?.(record)}
              title="Reveal Data"
              disabled={record.isExpired || record.isRevoked}
            >
              <FileSearch className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    );
  }
);

SharedRecordCard.displayName = 'SharedRecordCard';

interface SharedRecordGridProps {
  records: ExtendedSharedRecord[];
  onViewDetails: (record: ExtendedSharedRecord) => void;
  onTriggerAccess?: (record: ExtendedSharedRecord) => void;
  onRevealData?: (record: ExtendedSharedRecord) => void;
}

export const SharedRecordGrid = React.memo(
  ({ records, onViewDetails, onTriggerAccess, onRevealData }: SharedRecordGridProps) => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {records.map((record) => (
          <SharedRecordCard
            key={record.recordId}
            record={record}
            onViewDetails={onViewDetails}
            onTriggerAccess={onTriggerAccess}
            onRevealData={onRevealData}
          />
        ))}
      </div>
    );
  }
);

SharedRecordGrid.displayName = 'SharedRecordGrid';

export default SharedRecordGrid;

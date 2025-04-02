'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HealthRecord } from '../../types';
import { getResourceTypeName } from '../../utils/transformation';
import { CopyButton, IPFSLinkButton, ShareButton, RevealButton, formatUtils } from './PatientRecordsComponents';
import { HealthRecordCard } from './HealthRecordCard';
import { ChevronRight, FileText } from 'lucide-react';

// HealthRecordGrid - Grid view for records
export const HealthRecordGrid = ({
  filteredRecords,
  ipfsDataMap,
  onRecordClick,
  onShareRecord,
  onRevealRecord,
}: {
  filteredRecords: HealthRecord[];
  ipfsDataMap: Record<string, any>;
  onRecordClick: (record: HealthRecord) => void;
  onShareRecord: (record: HealthRecord) => void;
  onRevealRecord: (record: HealthRecord) => void;
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredRecords.map((record) => (
        <HealthRecordCard
          key={record.recordId}
          record={record}
          ipfsData={ipfsDataMap[record.cid]?.data}
          ipfsMetadata={ipfsDataMap[record.cid]?.metadata}
          onClick={() => onRecordClick(record)}
          onShare={onShareRecord}
          onReveal={onRevealRecord}
        />
      ))}
    </div>
  );
};

// HealthRecordTable - Table view for records
export const HealthRecordTable = ({
  filteredRecords,
  ipfsDataMap,
  onRecordClick,
  onOpenInIPFS,
  onShareRecord,
  onRevealRecord,
  copyToClipboard,
  copiedItem,
}: {
  filteredRecords: HealthRecord[];
  ipfsDataMap: Record<string, any>;
  onRecordClick: (record: HealthRecord) => void;
  onOpenInIPFS: (cid: string) => void;
  onShareRecord: (record: HealthRecord) => void;
  onRevealRecord: (record: HealthRecord) => void;
  copyToClipboard: (text: string, id: string, field: string) => void;
  copiedItem: { id: string; field: string } | null;
}) => {
  return (
    <div className="rounded-md border overflow-hidden px-4 py-2">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-medium">NAME</TableHead>
            <TableHead className="font-medium">CID</TableHead>
            <TableHead className="font-medium">SIZE</TableHead>
            <TableHead className="font-medium">CREATED AT</TableHead>
            <TableHead className="font-medium">FILE ID</TableHead>
            <TableHead className="w-[200px] text-center">ACTIONS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredRecords.map((record) => (
            <TableRow key={record.recordId} className="hover:bg-muted/30">
              <TableCell>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{formatUtils.getDisplayName(record, ipfsDataMap)}</span>
                        {record.isVerified && (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                            Verified
                          </Badge>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {getResourceTypeName(record.resourceType)}: {formatUtils.getDisplayName(record, ipfsDataMap)}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>

              <TableCell>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span>{formatUtils.formatCid(record.cid)}</span>
                        <CopyButton
                          text={record.cid}
                          id={record.recordId}
                          field="cid"
                          copiedItem={copiedItem}
                          onCopy={copyToClipboard}
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-mono text-xs">{record.cid}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>

              <TableCell>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>{formatUtils.formatFileSize(record.dataSize)}</TooltipTrigger>
                    <TooltipContent>
                      <p>File size: {formatUtils.formatFileSize(record.dataSize)}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>

              <TableCell>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>{formatUtils.formatDate(record.updatedAt)}</TooltipTrigger>
                    <TooltipContent>
                      <p>{formatUtils.formatTimestamp(record.updatedAt)}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>

              <TableCell>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span>{formatUtils.formatId(record.recordId)}</span>
                        <CopyButton
                          text={record.recordId}
                          id={record.recordId}
                          field="id"
                          copiedItem={copiedItem}
                          onCopy={copyToClipboard}
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-mono text-xs">{record.recordId}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>

              <TableCell className="text-center">
                <TooltipProvider>
                  <div className="flex items-center justify-center gap-1">
                    <IPFSLinkButton cid={record.cid} onOpen={onOpenInIPFS} />
                    <ShareButton record={record} onShare={onShareRecord} />
                    <RevealButton record={record} onReveal={onRevealRecord} />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8" onClick={() => onRecordClick(record)}>
                          More
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>View Record Details</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

// PatientRecordsTabs - Tab navigation with counts
export const PatientRecordsTabs = ({
  activeTab,
  handleTabChange,
  recordCounts,
  ConsentManager,
}: {
  activeTab: string;
  handleTabChange: (tab: string) => void;
  recordCounts: {
    all: number;
    verified: number;
    pending: number;
  };
  ConsentManager: React.ComponentType<any>;
}) => {
  return (
    <div className="mb-8">
      <div className="flex flex-wrap gap-3 p-1 bg-muted/30 rounded-full w-fit">
        <Button
          variant="ghost"
          className={`group rounded-full px-4 py-2 transition-all duration-300 border ${
            activeTab === 'all'
              ? 'bg-primary text-primary-foreground shadow-md text-white hover:text-primary'
              : 'hover:bg-muted text-muted-foreground'
          }`}
          onClick={() => handleTabChange('all')}
        >
          <div className="flex items-center gap-2">
            All Records
            {recordCounts.all > 0 && (
              <Badge
                variant={activeTab === 'all' ? 'outline' : 'secondary'}
                className={`ml-2 ${
                  activeTab === 'all' ? 'bg-primary-foreground' : 'active:hover:bg-muted text-primary'
                }`}
              >
                {recordCounts.all}
              </Badge>
            )}
          </div>
        </Button>

        <Button
          variant="ghost"
          className={`group rounded-full px-4 py-2 transition-all duration-300 border ${
            activeTab === 'verified'
              ? 'bg-primary text-primary-foreground shadow-md text-white hover:text-primary'
              : 'hover:bg-muted text-muted-foreground'
          }`}
          onClick={() => handleTabChange('verified')}
        >
          <div className="flex items-center gap-2">
            Verified
            {recordCounts.verified > 0 && (
              <Badge
                variant={activeTab === 'verified' ? 'outline' : 'secondary'}
                className={`ml-2 ${
                  activeTab === 'verified' ? 'bg-primary-foreground' : 'active:hover:bg-muted text-primary'
                }`}
              >
                {recordCounts.verified}
              </Badge>
            )}
          </div>
        </Button>

        <Button
          variant="ghost"
          className={`group rounded-full px-4 py-2 transition-all duration-300 border ${
            activeTab === 'pending'
              ? 'bg-primary text-primary-foreground shadow-md text-white hover:text-primary'
              : 'hover:bg-muted text-muted-foreground'
          }`}
          onClick={() => handleTabChange('pending')}
        >
          <div className="flex items-center gap-2">
            Pending
            {recordCounts.pending > 0 && (
              <Badge
                variant={activeTab === 'pending' ? 'outline' : 'secondary'}
                className={`ml-2 ${
                  activeTab === 'pending' ? 'bg-primary-foreground' : 'active:hover:bg-muted text-primary'
                }`}
              >
                {recordCounts.pending}
              </Badge>
            )}
          </div>
        </Button>

        <ConsentManager />
      </div>
    </div>
  );
};

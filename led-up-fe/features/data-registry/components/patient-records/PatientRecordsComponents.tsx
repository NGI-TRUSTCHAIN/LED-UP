'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  X,
  Filter,
  Search,
  List,
  LayoutGrid,
  Copy,
  Check,
  ExternalLink,
  Share2,
  Eye,
  EyeOff,
  LockIcon,
  UnlockIcon,
  ShieldAlert,
  Download,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ResourceType, HealthRecord } from '../../types';
import { getResourceTypeName } from '../../utils/transformation';
import { format } from 'date-fns';

// =========== Utility Components ===========

// SearchInput - Reusable search component with clear button
export const SearchInput = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="  Search records..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10"
      />
      {value && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
          onClick={() => onChange('')}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

// FilterSelector - Resource type filter dropdown
export const FilterSelector = ({
  value,
  onValueChange,
  resourceTypes,
}: {
  value: string;
  onValueChange: (value: string) => void;
  resourceTypes: string[];
}) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[180px]">
        <div className="flex items-center">
          <Filter className="h-4 w-4 mr-2" />
          <SelectValue placeholder="Resource Type" />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Types</SelectItem>
        {resourceTypes.map((type) => (
          <SelectItem key={type} value={type}>
            {type}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

// ViewToggle - Grid/Table view toggle
export const ViewToggle = ({
  viewMode,
  onViewModeChange,
}: {
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
}) => {
  return (
    <div className="flex gap-2">
      <Button
        variant={viewMode === 'grid' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onViewModeChange('grid')}
        className="flex items-center gap-1"
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="hidden sm:inline">Grid</span>
      </Button>
      <Button
        variant={viewMode === 'table' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onViewModeChange('table')}
        className="flex items-center gap-1"
      >
        <List className="h-4 w-4" />
        <span className="hidden sm:inline">Table</span>
      </Button>
    </div>
  );
};

// RecordStats - Shows stats about records
export const RecordStats = ({
  totalRecords,
  resourceTypesCount,
  verifiedCount,
}: {
  totalRecords: number;
  resourceTypesCount: number;
  verifiedCount: number;
}) => {
  return (
    <div className="flex flex-wrap gap-4">
      <Badge variant="outline" className="text-sm py-1 px-3">
        Total Records: {totalRecords}
      </Badge>
      <Badge variant="outline" className="text-sm py-1 px-3">
        Resource Types: {resourceTypesCount}
      </Badge>
      <Badge variant="outline" className="text-sm py-1 px-3">
        Verified: {verifiedCount}
      </Badge>
    </div>
  );
};

// FilterBadges - Shows active filter badges
export const FilterBadges = ({ searchTerm, onClear }: { searchTerm: string; onClear: () => void }) => {
  if (!searchTerm) return null;

  return (
    <div className="flex items-center gap-2 mb-4">
      <Filter className="h-4 w-4 text-muted-foreground" />
      <Badge variant="outline" className="flex items-center gap-1 bg-primary/10">
        {searchTerm}
        <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 p-0" onClick={onClear}>
          <X className="h-3 w-3" />
        </Button>
      </Badge>
    </div>
  );
};

// TabButton - For switching between different views
export interface TabButtonProps {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  count: number;
  icon?: React.ReactNode;
}

export const TabButton = ({ children, active, onClick, count, icon }: TabButtonProps) => {
  return (
    <Button
      variant={active ? 'default' : 'outline'}
      className={`group rounded-full px-4 py-2 transition-all duration-300 border ${
        active ? 'shadow-md hover:text-primary' : 'hover:bg-muted'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        {icon}
        {children}
        {count > 0 && (
          <Badge
            variant={active ? 'outline' : 'secondary'}
            className={`ml-2 ${active ? 'bg-primary-foreground' : 'active:hover:bg-muted'}`}
          >
            {count}
          </Badge>
        )}
      </div>
    </Button>
  );
};

// Utility functions for formatting
export const formatUtils = {
  formatTimestamp: (timestamp: number) => {
    if (!timestamp) return '';
    return format(new Date(timestamp * 1000), 'MMM d, yyyy HH:mm:ss');
  },

  formatDate: (timestamp: number) => {
    if (!timestamp) return '';
    return format(new Date(timestamp * 1000), 'MM/dd/yyyy');
  },

  formatCid: (cid: string) => {
    return cid.length > 15 ? `${cid.substring(0, 6)}...${cid.substring(cid.length - 6)}` : cid;
  },

  formatId: (id: string) => {
    return id.length > 20 ? `${id.substring(0, 8)}...${id.substring(id.length - 8)}` : id;
  },

  formatFileSize: (bytes: number) => {
    if (!bytes) return '0 KB';
    const kb = bytes / 1024;
    return `${kb.toFixed(2)} KB`;
  },

  getDisplayName: (record: HealthRecord, ipfsDataMap: Record<string, any>) => {
    const ipfsData = ipfsDataMap[record.cid]?.data;
    const resourceTypeName = getResourceTypeName(record.resourceType);

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
  },
};

// CopyToClipboard component
export const CopyButton = ({
  text,
  id,
  field,
  copiedItem,
  onCopy,
}: {
  text: string;
  id: string;
  field: string;
  copiedItem: { id: string; field: string } | null;
  onCopy: (text: string, id: string, field: string) => void;
}) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-6 w-6 rounded-full"
      onClick={(e) => {
        e.stopPropagation();
        onCopy(text, id, field);
      }}
    >
      {copiedItem?.id === id && copiedItem?.field === field ? (
        <Check className="h-3 w-3 text-green-500" />
      ) : (
        <Copy className="h-3 w-3 text-muted-foreground" />
      )}
    </Button>
  );
};

// External IPFS link button
export const IPFSLinkButton = ({ cid, onOpen }: { cid: string; onOpen: (cid: string) => void }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              onOpen(cid);
            }}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>View on IPFS</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Share button
export const ShareButton = ({ record, onShare }: { record: HealthRecord; onShare: (record: HealthRecord) => void }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              onShare(record);
            }}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Share Record</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Reveal data button
export const RevealButton = ({
  record,
  onReveal,
}: {
  record: HealthRecord;
  onReveal: (record: HealthRecord) => void;
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              onReveal(record);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Reveal Data</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// PatientRecordsHeader - Page title and description
export const PatientRecordsHeader = () => {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold mb-2">My Health Records</h1>
      <p className="text-muted-foreground">View and manage all your health records stored on the blockchain.</p>
    </div>
  );
};

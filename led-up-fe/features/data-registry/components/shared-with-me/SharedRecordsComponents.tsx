'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  LayoutGrid,
  List,
  RefreshCw,
  Search,
  Filter,
  XCircle,
  Grid2X2,
  Clock,
  ShieldAlert,
  Fingerprint,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const SearchInput = React.memo(({ value, onChange, className }: SearchInputProps) => {
  return (
    <div className={cn('min-w-[300px] max-w-[350px] h-9', className)}>
      <div className="relative w-full h-full">
        <Input
          type="text"
          placeholder="Search by record ID..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'pr-10 w-full h-full bg-muted/40 dark:bg-muted/10 border-muted-foreground/20 hover:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary/30 transition-colors',
            className
          )}
        />
        {value ? (
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => onChange('')}
            aria-label="Clear search"
          >
            <XCircle className="h-4 w-4" />
          </button>
        ) : (
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        )}
      </div>
    </div>
  );
});

SearchInput.displayName = 'SearchInput';

interface StatusFilterSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export const StatusFilterSelector = React.memo(({ value, onValueChange, className }: StatusFilterSelectorProps) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={cn('w-full', className)}>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <SelectValue placeholder="Filter by status" />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Records</SelectItem>
        <SelectItem value="active" className="flex items-center">
          <div className="flex items-center gap-2">
            <Fingerprint className="h-3.5 w-3.5 text-green-500" />
            <span>Active Records</span>
          </div>
        </SelectItem>
        <SelectItem value="expired">
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-amber-500" />
            <span>Expired Records</span>
          </div>
        </SelectItem>
        <SelectItem value="revoked">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-3.5 w-3.5 text-destructive" />
            <span>Revoked Records</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
});

StatusFilterSelector.displayName = 'StatusFilterSelector';

interface AccessLevelFilterSelectorProps {
  value: number | 'all';
  onValueChange: (value: number | 'all') => void;
  className?: string;
}

export const AccessLevelFilterSelector = React.memo(
  ({ value, onValueChange, className }: AccessLevelFilterSelectorProps) => {
    return (
      <Select
        value={typeof value === 'number' ? value.toString() : value}
        onValueChange={(v) => onValueChange(v === 'all' ? 'all' : parseInt(v))}
      >
        <SelectTrigger className={cn('w-full', className)}>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Filter by access level" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Access Levels</SelectItem>
          <SelectItem value="1">Level 1 - Basic Access</SelectItem>
          <SelectItem value="2">Level 2 - Standard Access</SelectItem>
          <SelectItem value="3">Level 3 - Full Access</SelectItem>
        </SelectContent>
      </Select>
    );
  }
);

AccessLevelFilterSelector.displayName = 'AccessLevelFilterSelector';

interface ViewToggleProps {
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
  className?: string;
}

export const ViewToggle = React.memo(({ viewMode, onViewModeChange, className }: ViewToggleProps) => {
  return (
    <TooltipProvider>
      <div className={cn('flex items-center space-x-1 bg-muted/40 p-1 rounded-md', className)}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => onViewModeChange('grid')}
              className="h-8 w-8"
              aria-label="Grid view"
            >
              <Grid2X2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Grid view</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => onViewModeChange('table')}
              className="h-8 w-8"
              aria-label="Table view"
            >
              <List className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Table view</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
});

ViewToggle.displayName = 'ViewToggle';

interface RecordStatsProps {
  totalRecords: number;
  activeCount: number;
  expiredCount: number;
  revokedCount: number;
  className?: string;
}

export const RecordStats = React.memo(
  ({ totalRecords, activeCount, expiredCount, revokedCount, className }: RecordStatsProps) => {
    return (
      <div className={cn('flex flex-col md:flex-row gap-4', className)}>
        <div className="flex flex-col items-center justify-center p-3 bg-primary/5 rounded-lg border border-primary/10 flex-1">
          <span className=" font-medium text-muted-foreground">Total Records</span>
          <span className="text-2xl font-bold text-primary">{totalRecords}</span>
        </div>
        <div className="flex flex-col items-center justify-center p-3 bg-green-500/5 rounded-lg border border-green-500/10 flex-1">
          <span className="font-medium text-muted-foreground">Active</span>
          <span className="text-2xl font-bold text-green-500">{activeCount}</span>
        </div>
        <div className="flex flex-col items-center justify-center p-3 bg-amber-500/5 rounded-lg border border-amber-500/10 flex-1">
          <span className=" font-medium text-muted-foreground">Expired</span>
          <span className="text-2xl font-bold text-amber-500">{expiredCount}</span>
        </div>
        <div className="flex flex-col items-center justify-center p-3 bg-destructive/5 rounded-lg border border-destructive/10 flex-1">
          <span className=" font-medium text-muted-foreground">Revoked</span>
          <span className="text-2xl font-bold text-destructive">{revokedCount}</span>
        </div>
      </div>
    );
  }
);

RecordStats.displayName = 'RecordStats';

export const SharedRecordsHeader = React.memo(() => {
  return (
    <div className="px-6 py-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Shared Records</h1>
          <p className="text-muted-foreground mt-1">
            View and manage health data shared with you by healthcare providers.
          </p>
        </div>
      </div>
    </div>
  );
});

SharedRecordsHeader.displayName = 'SharedRecordsHeader';

interface RefreshButtonProps {
  onClick: () => void;
  isRefreshing?: boolean;
  className?: string;
}

export const RefreshButton = React.memo(({ onClick, isRefreshing, className }: RefreshButtonProps) => {
  return (
    <Button variant="ghost" size="sm" onClick={onClick} disabled={isRefreshing} className={cn('gap-2', className)}>
      <RefreshCw className={cn('h-3.5 w-3.5', { 'animate-spin': isRefreshing })} />
      <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
    </Button>
  );
});

RefreshButton.displayName = 'RefreshButton';

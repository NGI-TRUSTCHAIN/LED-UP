'use client';

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useConsumerAuthorizedRecords } from '../../hooks/use-data-registry-events';
import { useRevokeAccess, useTriggerAccess } from '../../hooks/use-data-registry';
import { useAuth } from '@/features/auth/contexts/auth-provider';
import { Address } from 'viem';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Search, Database, ArrowRight, RefreshCcw, Filter, Lock } from 'lucide-react';
import { useClipboard } from '@/hooks/use-clipboard';
import { SharedRecord } from '../types';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  SearchInput,
  StatusFilterSelector,
  ViewToggle,
  RecordStats,
  AccessLevelFilterSelector,
} from './SharedRecordsComponents';
import SharedRecordGrid from './SharedRecordsGrid';
import SharedRecordTable from './SharedRecordsTable';
import { RecordDetailDialog, AccessDataDialog, RevokeAccessDialog, AccessTriggerDialog } from './SharedRecordsDialogs';
import { Badge } from '@/components/ui/badge';
import { RevealDataDialog } from './RevealDataDialog';
import { HealthRecord } from '../../types';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useRecordInfo } from '../../hooks/use-data-registry';
import { getBulkIPFSData } from '../../actions/ipfs';

// Type definitions
type ViewMode = 'grid' | 'table';
type StatusFilter = 'all' | 'active' | 'expired' | 'revoked';
type AccessLevel = 'all' | '1' | '2' | '3';

// Type for the SharedRecord with isExpired computed property
interface ExtendedSharedRecord extends SharedRecord {
  isExpired: boolean;
  consumer: Address;
}

// Record counts type
interface RecordCounts {
  all: number;
  active: number;
  expired: number;
  revoked: number;
}

// Custom hook for shared records data and state management
function useSharedRecordsData(address: Address | undefined) {
  const queryClient = useQueryClient();
  const [triggeredAccess, setTriggeredAccess] = useState<Record<string, boolean>>({});

  // Query records with React Query
  const {
    data: authorizedRecords,
    isLoading,
    isRefetching,
    refetch,
  } = useConsumerAuthorizedRecords(address as Address, {
    refetchInterval: 60000, // 60 seconds
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
    enabled: !!address,
  });

  // Keep track of previous data to prevent empty states
  const previousDataRef = useRef<typeof authorizedRecords | null>(null);

  useEffect(() => {
    if (authorizedRecords?.length) {
      previousDataRef.current = authorizedRecords;
    }
  }, [authorizedRecords]);

  // Transform records with computed properties
  const extendedRecords = useMemo<ExtendedSharedRecord[]>(() => {
    if (!address) return [];

    // Use current or previous data to prevent flickering empty states
    const recordsToUse = (authorizedRecords?.length ? authorizedRecords : previousDataRef.current) || [];

    return recordsToUse.map((record) => {
      const isExpired = BigInt(Date.now()) / 1000n >= record.expiration;
      return {
        recordId: record.recordId,
        consumerDid: '', // This field might not be in the authorized records
        accessLevel: record.accessLevel,
        expiration: record.expiration,
        isRevoked: false, // Need to determine this differently for authorized records
        revokedBy: undefined,
        grantedAt: record.authorizedAt,
        isExpired,
        consumer: address as Address,
        _lastUpdated: Date.now(),
      };
    });
  }, [authorizedRecords, address]);

  // Calculate record counts
  const recordCounts = useMemo<RecordCounts>(() => {
    if (!extendedRecords?.length) return { all: 0, active: 0, expired: 0, revoked: 0 };

    const counts = {
      all: extendedRecords.length,
      active: 0,
      expired: 0,
      revoked: 0,
    };

    extendedRecords.forEach((record) => {
      if (record.isRevoked) {
        counts.revoked += 1;
      } else if (record.isExpired) {
        counts.expired += 1;
      } else {
        counts.active += 1;
      }
    });

    return counts;
  }, [extendedRecords]);

  // Setup periodic refresh
  const retryFetch = useCallback(() => {
    if (!isRefetching) {
      refetch();
    }
  }, [refetch, isRefetching]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      retryFetch();
    }, 30000); // Backup poll every 30 seconds

    return () => clearInterval(intervalId);
  }, [retryFetch]);

  // Handler for manual refresh
  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: ['consumer-authorized-records', address],
    });
    toast.success('Records refreshed');
  }, [queryClient, address]);

  return {
    authorizedRecords,
    extendedRecords,
    recordCounts,
    isLoading,
    isRefetching,
    triggeredAccess,
    setTriggeredAccess,
    handleRefresh,
  };
}

// Header component for the page
const SharedRecordsHeader: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="mb-8"
  >
    <div className="flex items-center gap-2 mb-2">
      <Database className="h-8 w-8 text-primary" />
      <h1 className="text-3xl font-bold tracking-tight">Shared Health Records</h1>
    </div>
    <p className="text-muted-foreground max-w-2xl">
      View and manage health records that have been shared with you. Access medical data, revoke access, and track
      record status.
    </p>
  </motion.div>
);

// Record Stats Display component
interface RecordStatsDisplayProps {
  recordCounts: RecordCounts;
}

const RecordStatsDisplay: React.FC<RecordStatsDisplayProps> = ({ recordCounts }) => (
  <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: 0.2 }}>
    <RecordStats
      totalRecords={recordCounts.all}
      activeCount={recordCounts.active}
      expiredCount={recordCounts.expired}
      revokedCount={recordCounts.revoked}
      className="mb-6 rounded-lg"
    />
  </motion.div>
);

// Filter controls component
interface RecordFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  activeTab: StatusFilter;
  setActiveTab: (value: StatusFilter) => void;
  selectedAccessLevel: AccessLevel;
  setSelectedAccessLevel: (value: AccessLevel) => void;
  viewMode: ViewMode;
  setViewMode: (value: ViewMode) => void;
}

const RecordFilters: React.FC<RecordFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  activeTab,
  setActiveTab,
  selectedAccessLevel,
  setSelectedAccessLevel,
  viewMode,
  setViewMode,
}) => (
  <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: 0.1 }}>
    <div className="mb-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          className="w-full h-9 bg-muted/50 hover:bg-muted focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-200"
        />

        <div className="flex flex-col md:flex-row gap-4">
          <div className="md:col-span-3">
            <StatusFilterSelector
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as StatusFilter)}
              className="h-11"
            />
          </div>

          <div className="md:col-span-3">
            <AccessLevelFilterSelector
              value={parseInt(selectedAccessLevel) || 'all'}
              onValueChange={(value) =>
                setSelectedAccessLevel(typeof value === 'number' ? (value.toString() as AccessLevel) : 'all')
              }
              className="h-11"
            />
          </div>

          <div className="md:col-span-1 flex justify-end">
            <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} className="h-11" />
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

// Record list display component
interface RecordListProps {
  records: ExtendedSharedRecord[];
  viewMode: ViewMode;
  searchTerm: string;
  activeTab: StatusFilter;
  handleViewDetails: (record: ExtendedSharedRecord) => void;
  handleTriggerAccess: (record: ExtendedSharedRecord) => void;
  handleRevealData: (record: ExtendedSharedRecord) => void;
  handleRefresh: () => void;
  renderRecordActions: (record: ExtendedSharedRecord) => React.ReactNode;
  getAccessLevelText: (level: number) => string;
  isRefetching: boolean;
  recordsTotal: number;
}

const RecordList: React.FC<RecordListProps> = ({
  records,
  viewMode,
  searchTerm,
  activeTab,
  handleViewDetails,
  handleTriggerAccess,
  handleRevealData,
  handleRefresh,
  renderRecordActions,
  getAccessLevelText,
  isRefetching,
  recordsTotal,
}) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.3 }}>
    {isRefetching && (
      <div className="flex justify-center my-4">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground bg-primary/5 px-3 py-2 rounded-full">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Refreshing records...</span>
        </div>
      </div>
    )}

    {records.length === 0 ? (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground flex-col rounded-lg border border-dashed p-8 bg-muted/5">
        <div className="rounded-full bg-muted p-3">
          <Search className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-medium">No records found</h3>
        <p className="mt-2 text-sm text-center max-w-sm">
          {searchTerm
            ? 'No records match your search criteria. Try a different search term.'
            : activeTab !== 'all'
            ? `No ${activeTab} records found. Try a different filter.`
            : "You don't have any shared records."}
        </p>
        <Button variant="outline" className="mt-4" onClick={handleRefresh}>
          <RefreshCcw className="mr-2 h-3 w-3" />
          Refresh
        </Button>
      </div>
    ) : viewMode === 'grid' ? (
      <SharedRecordGrid
        records={records}
        onViewDetails={handleViewDetails}
        onTriggerAccess={handleTriggerAccess}
        onRevealData={handleRevealData}
      />
    ) : (
      <SharedRecordTable
        records={records}
        onViewDetails={handleViewDetails}
        renderActions={renderRecordActions}
        getAccessLevelText={getAccessLevelText}
      />
    )}

    {records.length > 0 && (
      <div className="mt-4 flex justify-between items-center">
        <div className="text-xs text-muted-foreground">
          Showing {records.length} of {recordsTotal} records
        </div>
        <Button variant="ghost" size="sm" onClick={handleRefresh}>
          <RefreshCcw className="mr-2 h-3 w-3" />
          Refresh
        </Button>
      </div>
    )}
  </motion.div>
);

// Main Container Component
export const SharedWithMePage: React.FC = () => {
  const { address, isAuthenticated, hasRole } = useAuth();
  const { copy } = useClipboard();
  const queryClient = useQueryClient();

  // Mutations for trigger and revoke access
  const { mutate: triggerAccess } = useTriggerAccess();
  const { mutate: revokeAccess, isPending: isRevoking } = useRevokeAccess();

  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [activeTab, setActiveTab] = useState<StatusFilter>('active');
  const [selectedAccessLevel, setSelectedAccessLevel] = useState<AccessLevel>('all');

  // Dialog states
  const [selectedRecord, setSelectedRecord] = useState<ExtendedSharedRecord | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isAccessDialogOpen, setIsAccessDialogOpen] = useState(false);
  const [isRevokeDialogOpen, setIsRevokeDialogOpen] = useState(false);
  const [isTriggerDialogOpen, setIsTriggerDialogOpen] = useState(false);
  const [isRevealDialogOpen, setIsRevealDialogOpen] = useState(false);

  // Records for specific actions
  const [triggeringRecord, setTriggeringRecord] = useState<ExtendedSharedRecord | null>(null);
  const [revealingRecord, setRevealingRecord] = useState<ExtendedSharedRecord | null>(null);

  // Data access state
  const [accessedData, setAccessedData] = useState<any>(null);
  const [isAccessingData, setIsAccessingData] = useState(false);
  const [copiedItem, setCopiedItem] = useState<{ id: string; field: string } | null>(null);
  const [triggeredAccess, setTriggeredAccess] = useState<Record<string, boolean>>({});
  const [ipfsDataMap, setIpfsDataMap] = useState<Record<string, any>>({});

  // Get record info for the revealing record
  const { data: recordDetails } = useRecordInfo(revealingRecord?.recordId);

  // Get shared records data
  const { extendedRecords, recordCounts, isLoading, isRefetching, handleRefresh } = useSharedRecordsData(
    address as Address
  );

  // Create HealthRecord object for RevealDataDialog - using recordDetails to get the correct CID
  const healthRecordForReveal = useMemo(() => {
    if (!revealingRecord || !recordDetails) return null;

    return {
      recordId: revealingRecord.recordId,
      cid: recordDetails.metadata?.cid || '',
      resourceType: recordDetails.metadata?.resourceType || 0,
      producer: recordDetails.producer || ('0x0' as `0x${string}`),
      updatedAt: Number(revealingRecord.grantedAt) || 0,
      dataSize: recordDetails.metadata?.dataSize || 0,
      contentHash: recordDetails.metadata?.contentHash || ('0x' as `0x${string}`),
      isVerified: recordDetails.isVerified || false,
    };
  }, [revealingRecord, recordDetails]);

  // Open in IPFS explorer helper function
  const openInIPFS = useCallback((cid: string) => {
    window.open(`https://ipfs.io/ipfs/${cid}`, '_blank');
  }, []);

  // Filter records based on search and filters
  const filteredRecords = useMemo(() => {
    if (!extendedRecords?.length) return [];

    return extendedRecords.filter((record) => {
      const matchesSearch = record.recordId.toLowerCase().includes(searchTerm.toLowerCase());

      // Filter by status
      const matchesStatus =
        activeTab === 'all'
          ? true
          : activeTab === 'active'
          ? !record.isExpired && !record.isRevoked
          : activeTab === 'expired'
          ? record.isExpired && !record.isRevoked
          : activeTab === 'revoked'
          ? record.isRevoked
          : true;

      // Filter by access level
      const matchesAccessLevel =
        selectedAccessLevel === 'all' ? true : record.accessLevel === parseInt(selectedAccessLevel);

      return matchesSearch && matchesStatus && matchesAccessLevel;
    });
  }, [extendedRecords, searchTerm, activeTab, selectedAccessLevel]);

  // Helper Functions and Event Handlers
  const handleCopyToClipboard = useCallback(
    (text: string, id: string, field: string) => {
      copy(text);
      setCopiedItem({ id, field });
      setTimeout(() => setCopiedItem(null), 2000);
      toast.success(`${field} copied to clipboard`);
    },
    [copy]
  );

  // Convert access level to readable text
  const getAccessLevelText = useCallback((level: number): string => {
    switch (level) {
      case 0:
        return 'None';
      case 1:
        return 'Read';
      case 2:
        return 'Write';
      default:
        return `Level ${level}`;
    }
  }, []);

  // Access and reveal handlers
  const handleAccessData = useCallback(
    async (record: ExtendedSharedRecord) => {
      if (!record) return;

      setIsAccessingData(true);
      setAccessedData(null);

      try {
        setIsDetailDialogOpen(false);
        setIsAccessDialogOpen(true);

        triggerAccess(record.recordId, {
          onSuccess: (data) => {
            setAccessedData(data);
            toast.success('Data accessed successfully');
          },
          onError: (error: any) => {
            toast.error('Failed to access data: ' + (error.message || 'Unknown error'));
            setIsAccessDialogOpen(false);
          },
          onSettled: () => {
            setIsAccessingData(false);
          },
        });
      } catch (error: any) {
        toast.error('Failed to process access request: ' + (error.message || 'Unknown error'));
        setIsAccessingData(false);
        setIsAccessDialogOpen(false);
      }
    },
    [triggerAccess]
  );

  const confirmRevokeAccess = useCallback(() => {
    if (!selectedRecord) return;

    revokeAccess(
      {
        recordId: selectedRecord.recordId,
        consumerAddress: selectedRecord.consumer,
      },
      {
        onSuccess: () => {
          toast.success('Access revoked successfully');
          setIsRevokeDialogOpen(false);
          queryClient.invalidateQueries({
            queryKey: ['consumer-authorized-records', address],
          });
        },
        onError: (error: any) => {
          toast.error('Failed to revoke access: ' + (error.message || 'Unknown error'));
        },
      }
    );
  }, [selectedRecord, revokeAccess, queryClient, address]);

  // Dialog interaction handlers
  const handleViewDetails = useCallback((record: ExtendedSharedRecord) => {
    setIsRevealDialogOpen(false);
    setIsTriggerDialogOpen(false);
    setIsRevokeDialogOpen(false);
    setSelectedRecord(record);
    setIsDetailDialogOpen(true);
  }, []);

  const handleTriggerAccess = useCallback((record: ExtendedSharedRecord) => {
    setIsDetailDialogOpen(false);
    setIsRevealDialogOpen(false);
    setIsRevokeDialogOpen(false);
    setTriggeringRecord(record);
    setIsTriggerDialogOpen(true);
  }, []);

  const handleRevealData = useCallback((record: ExtendedSharedRecord) => {
    setIsDetailDialogOpen(false);
    setIsTriggerDialogOpen(false);
    setIsRevokeDialogOpen(false);
    setRevealingRecord(record);
    setIsRevealDialogOpen(true);
  }, []);

  const handleRevokeAccess = useCallback((record: ExtendedSharedRecord) => {
    setIsDetailDialogOpen(false);
    setIsTriggerDialogOpen(false);
    setIsRevealDialogOpen(false);
    setSelectedRecord(record);
    setIsRevokeDialogOpen(true);
  }, []);

  // Function to handle confirm trigger access
  const handleConfirmTriggerAccess = useCallback(() => {
    if (!triggeringRecord) return;

    triggerAccess(triggeringRecord.recordId, {
      onSuccess: () => {
        setTriggeredAccess((prev) => ({
          ...prev,
          [triggeringRecord.recordId]: true,
        }));
        toast.success('Access triggered successfully');
        setTriggeringRecord(null);
        setIsTriggerDialogOpen(false);
      },
      onError: (error: any) => {
        console.error('Error triggering access:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to trigger access');
      },
    });
  }, [triggeringRecord, triggerAccess]);

  // Record action buttons
  const renderRecordActions = useCallback(
    (record: ExtendedSharedRecord) => (
      <div className="flex space-x-2">
        <Button variant="outline" size="sm" onClick={() => handleViewDetails(record)}>
          View Details
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleTriggerAccess(record)}
          disabled={!!triggeredAccess[record.recordId]}
          className={triggeredAccess[record.recordId] ? 'bg-green-50 text-green-700' : ''}
        >
          {triggeredAccess[record.recordId] ? 'Access Triggered' : 'Trigger Access'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleRevealData(record)}
          disabled={!triggeredAccess[record.recordId]}
        >
          Reveal Data
        </Button>
      </div>
    ),
    [handleViewDetails, handleTriggerAccess, handleRevealData, triggeredAccess]
  );

  // Render loading state
  if (isLoading && !isRefetching) {
    return (
      <Card className="border-muted-foreground/20">
        <CardContent className="flex items-center justify-center p-16">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-sm text-muted-foreground">Loading shared records...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Check for authentication
  if (!isAuthenticated || (!hasRole('CONSUMER') && !hasRole('ADMIN') && !hasRole('PRODUCER') && !hasRole('PROVIDER'))) {
    return (
      <Card className="border-muted-foreground/20">
        <CardContent className="p-6">
          <h2 className="text-xl font-medium mb-2">Unauthorized Access</h2>
          <p className="text-muted-foreground">
            You must be authenticated as a consumer or admin to view shared records.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full max-w-7xl mx-auto">
      <div className="bg-gradient-to-b from-background to-muted/20 min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <SharedRecordsHeader />

        {/* Stats */}
        <RecordStatsDisplay recordCounts={recordCounts} />

        <Card className="border-muted-foreground/20 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Filter Records</h2>
              </div>
              <Button variant="outline" size="sm" className="hidden sm:flex">
                Documentation <ArrowRight className="ml-2 h-3 w-3" />
              </Button>
            </div>

            {/* Filters */}
            <RecordFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              selectedAccessLevel={selectedAccessLevel}
              setSelectedAccessLevel={setSelectedAccessLevel}
              viewMode={viewMode}
              setViewMode={setViewMode}
            />

            {/* Record List */}
            <RecordList
              records={filteredRecords}
              viewMode={viewMode}
              searchTerm={searchTerm}
              activeTab={activeTab}
              handleViewDetails={handleViewDetails}
              handleTriggerAccess={handleTriggerAccess}
              handleRevealData={handleRevealData}
              handleRefresh={handleRefresh}
              renderRecordActions={renderRecordActions}
              getAccessLevelText={getAccessLevelText}
              isRefetching={isRefetching}
              recordsTotal={extendedRecords.length}
            />
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      {selectedRecord && isDetailDialogOpen && (
        <RecordDetailDialog
          selectedRecord={selectedRecord}
          setSelectedRecord={(record) => {
            setSelectedRecord(record);
            setIsDetailDialogOpen(false);
          }}
          copyToClipboard={handleCopyToClipboard}
          copiedItem={copiedItem}
          onAccessData={handleAccessData}
          onRevokeAccess={handleRevokeAccess}
        />
      )}

      {triggeringRecord && isTriggerDialogOpen && (
        <AccessTriggerDialog
          triggeringRecord={triggeringRecord}
          setTriggeringRecord={(record) => {
            setTriggeringRecord(record);
            setIsTriggerDialogOpen(false);
          }}
          onConfirm={handleConfirmTriggerAccess}
          isLoading={false}
        />
      )}

      {revealingRecord && isRevealDialogOpen && healthRecordForReveal && (
        <RevealDataDialog
          revealingRecord={healthRecordForReveal}
          setRevealingRecord={() => {
            setRevealingRecord(null);
            setIsRevealDialogOpen(false);
          }}
          recordId={revealingRecord.recordId}
          copyToClipboard={handleCopyToClipboard}
          copiedItem={copiedItem}
        />
      )}

      {selectedRecord && isRevokeDialogOpen && (
        <RevokeAccessDialog
          revokingRecord={selectedRecord}
          setRevokingRecord={(record) => {
            setSelectedRecord(record);
            setIsRevokeDialogOpen(false);
          }}
          onRevokeConfirm={confirmRevokeAccess}
          isRevoking={isRevoking}
        />
      )}

      {selectedRecord && isAccessDialogOpen && (
        <AccessDataDialog
          accessingRecord={selectedRecord}
          setAccessingRecord={(record) => {
            setSelectedRecord(record);
            setIsAccessDialogOpen(false);
          }}
          recordId={selectedRecord?.recordId || ''}
          ipfsData={accessedData}
          isLoading={isAccessingData}
        />
      )}
    </div>
  );
};

export default SharedWithMePage;

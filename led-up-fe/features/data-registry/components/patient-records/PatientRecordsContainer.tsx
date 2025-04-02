'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { HealthRecord } from '../../types';
import { getResourceTypeName } from '../../utils/transformation';
import { getBulkIPFSData } from '../../actions/ipfs';
import { Address } from 'viem';
import { toast } from 'sonner';
import { useProducerRecordsWithIPFSData } from '../../hooks';
import { useShareData, useShareToProvider } from '../../hooks/use-data-registry';
import { useAuth } from '@/features/auth/contexts/auth-provider';
import { Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

// Import all component parts
import { SearchInput, FilterSelector, ViewToggle, RecordStats, PatientRecordsHeader } from './PatientRecordsComponents';

import { HealthRecordGrid, HealthRecordTable, PatientRecordsTabs } from './PatientRecordsDisplay';

import { ShareRecordDialog, RevealDataDialog, RecordDetailDialog } from './PatientRecordsDialogs';

// Core PatientRecordsContent component
export const PatientRecordsContent = React.memo(
  ({ records, isLoading }: { records: any; isLoading: boolean }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedResourceType, setSelectedResourceType] = useState<string>('all');
    const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null);
    const [ipfsDataMap, setIpfsDataMap] = useState<Record<string, any>>({});
    const [isLoadingIPFSData, setIsLoadingIPFSData] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
    const [copiedItem, setCopiedItem] = useState<{ id: string; field: string } | null>(null);
    const [sharingRecord, setSharingRecord] = useState<HealthRecord | null>(null);
    const [revealingRecord, setRevealingRecord] = useState<HealthRecord | null>(null);

    console.log('revealingRecord', revealingRecord);
    const { address } = useAuth();

    const shareData = useShareData();
    const shareToProvider = useShareToProvider();

    // Get unique resource types from records
    const resourceTypes = useMemo(() => {
      return records?.healthRecords
        ? Array.from(
            new Set(records.healthRecords.map((record: HealthRecord) => getResourceTypeName(record.resourceType)))
          )
        : [];
    }, [records?.healthRecords]);

    // Filter records based on search term and selected resource type
    const filteredRecords = useMemo(() => {
      if (!records?.healthRecords) return [];

      return records.healthRecords.filter((record: HealthRecord) => {
        const resourceTypeStr = getResourceTypeName(record.resourceType);
        const ipfsData = ipfsDataMap[record.cid]?.data;

        const matchesSearch =
          searchTerm === '' ||
          resourceTypeStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.cid.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.recordId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          // Search in IPFS data if available
          (ipfsData &&
            Object.values(ipfsData).some(
              (value) => typeof value === 'string' && value.toLowerCase().includes(searchTerm.toLowerCase())
            ));

        const matchesResourceType = selectedResourceType === 'all' || resourceTypeStr === selectedResourceType;

        return matchesSearch && matchesResourceType;
      });
    }, [records?.healthRecords, searchTerm, selectedResourceType, ipfsDataMap]);

    // Load IPFS data for all records when component mounts or records change
    useEffect(() => {
      // Skip if already loading or no records to load
      if (isLoadingIPFSData || !records?.healthRecords?.length) return;

      // Extract CIDs from records
      const cids = records.healthRecords.map((record: HealthRecord) => record.cid);
      if (!cids.length) return;

      // Check if we already have data for all CIDs to avoid unnecessary loading
      const missingCids = cids.filter((cid: string) => !ipfsDataMap[cid]);
      if (missingCids.length === 0) return;

      const loadIPFSData = async () => {
        setIsLoadingIPFSData(true);
        try {
          const ipfsResponse = await getBulkIPFSData(missingCids);

          // Create a map of CID -> IPFS data for easy lookup
          const newDataMap: Record<string, any> = { ...ipfsDataMap };
          if (ipfsResponse?.results) {
            ipfsResponse.results.forEach((result: any) => {
              if (result.success) {
                newDataMap[result.cid] = {
                  data: result.data,
                  metadata: result.metadata,
                };
              }
            });
          }

          setIpfsDataMap(newDataMap);
        } catch (error) {
          console.error('Error loading IPFS data:', error);
        } finally {
          setIsLoadingIPFSData(false);
        }
      };

      loadIPFSData();
    }, [records?.healthRecords, ipfsDataMap, isLoadingIPFSData]);

    // Handle record click to open dialog
    const handleRecordClick = useCallback((record: HealthRecord) => {
      setSelectedRecord(record);
    }, []);

    // Close the dialog
    const handleCloseDialog = useCallback(() => {
      setSelectedRecord(null);
    }, []);

    // Clear all filters
    const clearFilters = useCallback(() => {
      setSearchTerm('');
      setSelectedResourceType('all');
    }, []);

    // Copy to clipboard with visual feedback
    const copyToClipboard = useCallback((text: string, id: string, field: string) => {
      navigator.clipboard.writeText(text);
      // Set which item is being copied
      setCopiedItem({ id, field });
      // Reset after 2 seconds
      setTimeout(() => {
        setCopiedItem(null);
      }, 2000);
    }, []);

    // Open in IPFS explorer
    const openInIPFS = useCallback((cid: string) => {
      window.open(`https://ipfs.io/ipfs/${cid}`, '_blank');
    }, []);

    // Handle share record
    const handleShareRecord = useCallback((record: HealthRecord) => {
      setSharingRecord(record);
    }, []);

    // Handle share form submission
    const onShareSubmit = useCallback(
      async (values: any) => {
        if (!sharingRecord) return;

        try {
          const accessDurationInSeconds = values.accessDuration * 24 * 60 * 60; // Convert days to seconds

          if (values.shareType === 'consumer') {
            await shareData.mutateAsync({
              recordId: sharingRecord.recordId,
              consumerAddress: values.targetAddress as `0x${string}`,
              accessDuration: accessDurationInSeconds,
            });

            toast.success(`Record shared successfully`, {
              description: `The record has been shared with consumer ${values.targetAddress}`,
            });
          } else {
            await shareToProvider.mutateAsync({
              recordId: sharingRecord.recordId,
              provider: values.targetAddress as `0x${string}`,
              accessDuration: accessDurationInSeconds,
              accessLevel: 1, // Read access
            });

            toast.success(`Record shared with provider`, {
              description: `The record has been shared with provider ${values.targetAddress}`,
            });
          }

          // Close the dialog
          setSharingRecord(null);
        } catch (error) {
          console.error('Error sharing record:', error);
          toast.error(`Failed to share record`, {
            description: error instanceof Error ? error.message : 'An unknown error occurred',
          });
        }
      },
      [sharingRecord, shareData, shareToProvider]
    );

    // Handle reveal record button click
    const handleRevealRecord = useCallback((record: HealthRecord) => {
      setRevealingRecord(record);
    }, []);

    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!records || records.healthRecords.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-xl font-semibold mb-2">No Health Records Found</h3>
          <p className="text-muted-foreground max-w-md">
            You don't have any health records yet. Use the "Add Health Record" button to create your first record.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Filters and search section */}
        <div className="flex flex-col sm:flex-row gap-4">
          <SearchInput value={searchTerm} onChange={setSearchTerm} />
          <div className="flex gap-2">
            <FilterSelector
              value={selectedResourceType}
              onValueChange={setSelectedResourceType}
              resourceTypes={resourceTypes as string[]}
            />
            {(searchTerm || selectedResourceType !== 'all') && (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Stats and View Toggle */}
        <div className="flex flex-wrap justify-between items-center mb-6">
          <RecordStats
            totalRecords={records.total}
            resourceTypesCount={resourceTypes.length}
            verifiedCount={records.healthRecords.filter((r: HealthRecord) => r.isVerified).length}
          />
          <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
        </div>

        {/* Display content based on view mode */}
        {viewMode === 'grid' ? (
          <HealthRecordGrid
            filteredRecords={filteredRecords}
            ipfsDataMap={ipfsDataMap}
            onRecordClick={handleRecordClick}
            onShareRecord={handleShareRecord}
            onRevealRecord={handleRevealRecord}
          />
        ) : (
          <HealthRecordTable
            filteredRecords={filteredRecords}
            ipfsDataMap={ipfsDataMap}
            onRecordClick={handleRecordClick}
            onOpenInIPFS={openInIPFS}
            onShareRecord={handleShareRecord}
            onRevealRecord={handleRevealRecord}
            copyToClipboard={copyToClipboard}
            copiedItem={copiedItem}
          />
        )}

        {/* Record Detail Dialog */}
        <RecordDetailDialog
          selectedRecord={selectedRecord}
          setSelectedRecord={setSelectedRecord}
          ipfsDataMap={ipfsDataMap}
          copyToClipboard={copyToClipboard}
          copiedItem={copiedItem}
          openInIPFS={openInIPFS}
        />

        {/* Reveal Data Dialog */}
        <RevealDataDialog
          revealingRecord={revealingRecord}
          setRevealingRecord={setRevealingRecord}
          recordId={revealingRecord?.recordId as string}
          copyToClipboard={copyToClipboard}
          copiedItem={copiedItem}
        />

        {/* Share Record Dialog */}
        <ShareRecordDialog
          sharingRecord={sharingRecord}
          setSharingRecord={setSharingRecord}
          onShareSubmit={onShareSubmit}
          shareData={shareData}
          shareToProvider={shareToProvider}
        />
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function for memo to prevent unnecessary re-renders
    if (prevProps.isLoading !== nextProps.isLoading) {
      return false; // Re-render
    }

    const prevHasRecords = !!prevProps.records?.healthRecords?.length;
    const nextHasRecords = !!nextProps.records?.healthRecords?.length;
    if (prevHasRecords !== nextHasRecords) {
      return false; // Re-render
    }

    if (!prevHasRecords && !nextHasRecords) {
      return true; // Don't re-render
    }

    if (prevProps.records?.total !== nextProps.records?.total) {
      return false; // Re-render
    }

    const prevRecordIds = prevProps.records?.recordIds || [];
    const nextRecordIds = nextProps.records?.recordIds || [];

    if (prevRecordIds.length !== nextRecordIds.length) {
      return false; // Re-render
    }

    for (let i = 0; i < prevRecordIds.length; i++) {
      if (prevRecordIds[i] !== nextRecordIds[i]) {
        return false; // Re-render
      }
    }

    return true; // Don't re-render - props are considered equal
  }
);

// Main PatientRecordsPage component
export const PatientRecordsPage = () => {
  const { address } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [dataLoaded, setDataLoaded] = useState(false);

  // Define all callback functions before any conditional returns
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Define the ConsentManager component outside conditional rendering
  const ConsentManager = React.lazy(() => import('./ConsentManager').then((mod) => ({ default: mod.ConsentManager })));

  // Define all hooks before any conditional returns
  const {
    data: records,
    isLoading,
    error,
  } = useProducerRecordsWithIPFSData(address as Address, {
    enabled: !!address && dataLoaded,
    fetchIPFS: true,
    // Don't use options that aren't supported by the hook
  });

  // Use effect to delay data loading to prevent role hash logging issue
  useEffect(() => {
    if (address) {
      const timer = setTimeout(() => {
        setDataLoaded(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [address]);

  // Helper function to check if a record matches the search query
  const recordMatchesSearch = useCallback(
    (record: any): boolean => {
      if (!searchQuery) return true;

      const query = searchQuery.toLowerCase();

      // Check resourceType which we know exists
      if (record.resourceType.toLowerCase().includes(query)) {
        return true;
      }

      // Check IPFS data if available
      if (record.ipfsData) {
        // Search through IPFS data strings
        return Object.entries(record.ipfsData).some(([_, value]) => {
          if (typeof value === 'string') {
            return value.toLowerCase().includes(query);
          }
          // If the value is an object, search through its string properties
          if (typeof value === 'object' && value !== null) {
            return Object.values(value).some(
              (subValue) => typeof subValue === 'string' && subValue.toLowerCase().includes(query)
            );
          }
          return false;
        });
      }

      // Generic search through all string properties
      return Object.entries(record).some(([_, value]) => {
        if (typeof value === 'string') {
          return value.toLowerCase().includes(query);
        }
        return false;
      });
    },
    [searchQuery]
  );

  // Filter records based on search query - always define memoized values, even if records is undefined
  const filteredRecords = useMemo(() => {
    if (!records) return undefined;

    const filteredHealthRecords = records.healthRecords.filter(recordMatchesSearch);

    return {
      ...records,
      healthRecords: filteredHealthRecords,
      recordIds: records.recordIds.filter(
        (_, i) => records.healthRecords[i] && recordMatchesSearch(records.healthRecords[i])
      ),
      total: filteredHealthRecords.length,
    };
  }, [records, recordMatchesSearch]);

  // Filter records based on active tab - always define memoized values, even if filteredRecords is undefined
  const tabRecords = useMemo(() => {
    if (!filteredRecords) return undefined;

    switch (activeTab) {
      case 'verified':
        return {
          ...filteredRecords,
          healthRecords: filteredRecords.healthRecords.filter((record) => record.isVerified),
          recordIds: filteredRecords.recordIds.filter((_, i) => filteredRecords.healthRecords[i]?.isVerified),
          total: filteredRecords.healthRecords.filter((record) => record.isVerified).length,
        };
      case 'pending':
        return {
          ...filteredRecords,
          healthRecords: filteredRecords.healthRecords.filter((record) => !record.isVerified),
          recordIds: filteredRecords.recordIds.filter((_, i) => !filteredRecords.healthRecords[i]?.isVerified),
          total: filteredRecords.healthRecords.filter((record) => !record.isVerified).length,
        };
      default:
        return filteredRecords;
    }
  }, [filteredRecords, activeTab]);

  // Get record counts for tabs - always define memoized values, even if records is undefined
  const recordCounts = useMemo(
    () => ({
      all: records?.healthRecords?.length || 0,
      verified: records?.healthRecords?.filter((r) => r.isVerified)?.length || 0,
      pending: records?.healthRecords?.filter((r) => !r.isVerified)?.length || 0,
    }),
    [records?.healthRecords]
  );

  // Now we can have conditional returns after all hooks have been defined
  if (!dataLoaded) {
    return (
      <div className="container max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 mb-12">
        <PatientRecordsHeader />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // If error occurred during data fetch
  if (error) {
    return (
      <div className="container max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 mb-12">
        <PatientRecordsHeader />
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800">
          <h3 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-2">Error Loading Records</h3>
          <p className="text-red-600 dark:text-red-300">
            {error instanceof Error ? error.message : 'An unknown error occurred'}
          </p>
          <button
            className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 mb-12">
      <PatientRecordsHeader />

      <React.Suspense fallback={<div className="h-10" />}>
        <PatientRecordsTabs
          activeTab={activeTab}
          handleTabChange={handleTabChange}
          recordCounts={recordCounts}
          ConsentManager={ConsentManager}
        />
      </React.Suspense>

      {/* Filter badges - only show if search is active */}
      {searchQuery && (
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Badge variant="outline" className="flex items-center gap-1 bg-primary/10">
            {searchQuery}
            <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 p-0" onClick={() => handleSearchChange('')}>
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        </div>
      )}

      <PatientRecordsContent records={tabRecords} isLoading={isLoading} />
    </div>
  );
};

// Set display names for debugging
PatientRecordsContent.displayName = 'PatientRecordsContent';

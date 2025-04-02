'use client';

import { useState, useCallback } from 'react';
import { ResourceType } from '../types';
import { getResourceTypeName } from '../utils/index';
import { formatDistanceToNow } from 'date-fns';
import * as React from 'react';

// Icons
import {
  Search,
  CalendarClock,
  BarChart,
  Stethoscope,
  Pill,
  FileText,
  HelpCircle,
  Shield,
  ShieldAlert,
  Filter,
  Eye,
  Download,
  Share2,
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Type for record item passed to the component
export interface RecordItem {
  id: string;
  resourceType: ResourceType;
  isVerified: boolean;
  metadataCid?: string;
  producer?: string;
  dataSize?: number;
  sharedCount?: number;
  updatedAt?: number;
  metadata?: any;
  error?: string;
}

interface RecordsListProps {
  records: RecordItem[];
  loading: boolean;
  error?: string | null;
  onViewRecord?: (recordId: string) => void;
  onDownloadRecord?: (recordId: string) => void;
  onShareRecord?: (recordId: string) => void;
}

// Map of resource types to their icons
const resourceTypeIcons: Record<ResourceType, React.ElementType> = {
  [ResourceType.Patient]: FileText,
  [ResourceType.Observation]: BarChart,
  [ResourceType.Condition]: Stethoscope,
  [ResourceType.Procedure]: Stethoscope,
  [ResourceType.Encounter]: CalendarClock,
  [ResourceType.Medication]: Pill,
  [ResourceType.MedicationStatement]: Pill,
  [ResourceType.MedicationRequest]: Pill,
  [ResourceType.DiagnosticReport]: FileText,
  [ResourceType.Immunization]: Shield,
  [ResourceType.AllergyIntolerance]: ShieldAlert,
  [ResourceType.CarePlan]: FileText,
  [ResourceType.CareTeam]: FileText,
  [ResourceType.Basic]: FileText,
  [ResourceType.Other]: HelpCircle,
};

export function RecordsList({
  records,
  loading,
  error,
  onViewRecord,
  onDownloadRecord,
  onShareRecord,
}: RecordsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Filter records based on search query and selected tab
  const getFilteredRecords = useCallback(() => {
    let filtered = [...records];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((record) => {
        const title = record.metadata?.title?.toLowerCase() || '';
        const description = record.metadata?.description?.toLowerCase() || '';
        const keywords = record.metadata?.keywords?.map((k: string) => k.toLowerCase()) || [];

        return (
          record.id.toLowerCase().includes(query) ||
          title.includes(query) ||
          description.includes(query) ||
          keywords.some((k: string) => k.includes(query))
        );
      });
    }

    // Filter by resource type
    if (activeTab !== 'all') {
      const resourceType = parseInt(activeTab, 10);
      filtered = filtered.filter((record) => record.resourceType === resourceType);
    }

    return filtered;
  }, [records, searchQuery, activeTab]);

  const filteredRecords = getFilteredRecords();

  // Get unique resource types from the records
  const resourceTypes = [...new Set(records.map((record) => record.resourceType))];

  // Loading state
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-12 w-full" />
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // Empty state
  if (!records || records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <FileText className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">No Records Found</h3>
        <p className="text-muted-foreground">There are no health records available for this producer.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold tracking-tight">Health Records</h2>
        <Button className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search records by title, description or keywords..."
          className="pl-9 w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Tabs for resource types */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="flex overflow-auto pb-px">
          <TabsTrigger value="all">All Types</TabsTrigger>
          {resourceTypes.map((type) => (
            <TabsTrigger key={type} value={type.toString()} className="flex items-center gap-1">
              {React.createElement(resourceTypeIcons[type] || HelpCircle, { className: 'h-4 w-4' })}
              <span>{getResourceTypeName(type)}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Search className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No Matching Records</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            filteredRecords.map((record) => (
              <Card key={record.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {record.metadata?.title || `Record ${record.id.slice(0, 8)}...`}
                      </CardTitle>
                      <CardDescription>
                        ID: {record.id.slice(0, 10)}...{record.id.slice(-6)}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Badge
                        variant={record.isVerified ? 'default' : 'outline'}
                        className={record.isVerified ? 'bg-green-600' : ''}
                      >
                        {record.isVerified ? 'Verified' : 'Unverified'}
                      </Badge>
                      <Badge variant="outline">{getResourceTypeName(record.resourceType)}</Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <p className="text-sm">
                    {record.metadata?.description || 'No description available for this record.'}
                  </p>

                  {record.metadata?.keywords && record.metadata.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {record.metadata.keywords.map((keyword: string, i: number) => (
                        <Badge key={i} variant="secondary" className="font-normal">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                    <div className="text-sm">
                      <p className="text-muted-foreground">Data Size</p>
                      <p className="font-medium">{record.dataSize || 0} bytes</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-muted-foreground">Shared</p>
                      <p className="font-medium">{record.sharedCount || 0} times</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-muted-foreground">Updated</p>
                      <p className="font-medium">
                        {record.updatedAt
                          ? formatDistanceToNow(new Date(record.updatedAt * 1000), { addSuffix: true })
                          : 'Unknown'}
                      </p>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex justify-end gap-2 border-t bg-muted/20 pt-4">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => onViewRecord?.(record.id)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>View Details</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => onDownloadRecord?.(record.id)}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Download Record</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => onShareRecord?.(record.id)}>
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Share Record</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardFooter>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

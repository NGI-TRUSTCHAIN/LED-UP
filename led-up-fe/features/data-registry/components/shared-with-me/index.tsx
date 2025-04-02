'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/features/auth/contexts/auth-provider';
import { DataRegistryEvents, AccessGrantedEvent, AccessRevokedEvent } from '@/lib/events/DataRegistryEvents';
import { ParsedEvent } from '@/lib/events/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Search, Filter, RefreshCw, Calendar } from 'lucide-react';
import { formatDistanceToNow, startOfDay, endOfDay } from 'date-fns';
import { useSonner } from '@/hooks/use-sonner';
import { useContractAddress } from '@/hooks/use-contract-address';
import { Address, isAddress } from 'viem';
import { DateRange } from 'react-day-picker';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface SharedRecord {
  recordId: string;
  consumerDid: string;
  expiration: bigint;
  accessLevel: number;
  isRevoked: boolean;
  revokedBy?: Address;
  grantedAt: Date;
}

export default function SharedWithMe() {
  const { address, did, isAuthenticated, hasRole } = useAuth();
  const { toast } = useSonner();
  const { dataRegistryAddress } = useContractAddress();

  const [isLoading, setIsLoading] = useState(true);
  const [records, setRecords] = useState<SharedRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showExpired, setShowExpired] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Admin view states
  const [targetAddress, setTargetAddress] = useState<string>('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
    to: new Date(),
  });
  const [isValidAddress, setIsValidAddress] = useState(false);

  // Initialize event listener
  const eventListener = useMemo(() => {
    if (!dataRegistryAddress) return null;
    return new DataRegistryEvents();
  }, [dataRegistryAddress]);

  // Validate address
  useEffect(() => {
    setIsValidAddress(isAddress(targetAddress));
  }, [targetAddress]);

  // Load data for specific address and date range
  const loadAddressData = async (targetAddr: Address, fromDate: Date, toDate: Date) => {
    if (!eventListener) return;

    try {
      setIsLoading(true);

      const fromBlock = BigInt(Math.floor(fromDate.getTime() / 1000));
      const toBlock = BigInt(Math.floor(toDate.getTime() / 1000));

      const [grantedEvents, revokedEvents] = await Promise.all([
        eventListener.queryAccessGrantedEvents(dataRegistryAddress, fromBlock, toBlock),
        eventListener.queryAccessRevokedEvents(dataRegistryAddress, fromBlock, toBlock),
      ]);

      const sharedRecords = processEvents(grantedEvents, revokedEvents, targetAddr);
      setRecords(sharedRecords);

      toast.success('Records loaded successfully');
    } catch (error) {
      console.error('Error loading records:', error);
      toast.error('Failed to load records. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Process events to create records
  const processEvents = (
    grantedEvents: ParsedEvent<AccessGrantedEvent>[],
    revokedEvents: ParsedEvent<AccessRevokedEvent>[],
    targetAddr: Address
  ): SharedRecord[] => {
    const revokedMap = new Map<string, Address>();
    revokedEvents.forEach((event) => {
      if (event.args.consumer === targetAddr) {
        revokedMap.set(event.args.recordId, event.args.revoker);
      }
    });

    return grantedEvents
      .filter((event) => event.args.consumer === targetAddr)
      .map((event) => ({
        recordId: event.args.recordId,
        consumerDid: event.args.consumerDid,
        expiration: event.args.expiration,
        accessLevel: event.args.accessLevel,
        isRevoked: revokedMap.has(event.args.recordId),
        revokedBy: revokedMap.get(event.args.recordId),
        grantedAt: new Date(Number(event.args.expiration) * 1000 - 30 * 24 * 60 * 60 * 1000),
      }));
  };

  // Load initial data
  useEffect(() => {
    if (!eventListener || !address || !isAuthenticated) return;

    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        const [grantedEvents, revokedEvents] = await Promise.all([
          eventListener.queryAccessGrantedEvents(dataRegistryAddress, 0n, 'latest'),
          eventListener.queryAccessRevokedEvents(dataRegistryAddress, 0n, 'latest'),
        ]);

        const sharedRecords = processEvents(grantedEvents, revokedEvents, address);
        setRecords(sharedRecords);
      } catch (error) {
        console.error('Error loading initial records:', error);
        toast.error('Failed to load records. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    // Set up real-time event listeners
    const setupEventListeners = async () => {
      await eventListener.listenToAccessGranted(dataRegistryAddress, (event) => {
        if (event.args.consumer === address) {
          setRecords((prev) => [
            ...prev,
            {
              recordId: event.args.recordId,
              consumerDid: event.args.consumerDid,
              expiration: event.args.expiration,
              accessLevel: event.args.accessLevel,
              isRevoked: false,
              grantedAt: new Date(),
            },
          ]);
        }
      });

      await eventListener.listenToAccessRevoked(dataRegistryAddress, (event) => {
        if (event.args.consumer === address) {
          setRecords((prev) =>
            prev.map((record) =>
              record.recordId === event.args.recordId
                ? { ...record, isRevoked: true, revokedBy: event.args.revoker }
                : record
            )
          );
        }
      });
    };

    loadInitialData();
    setupEventListeners();

    return () => {
      eventListener.unsubscribe(dataRegistryAddress);
    };
  }, [eventListener, address, dataRegistryAddress, isAuthenticated, toast]);

  // Filter records based on search and expiration
  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchesSearch = record.recordId.toLowerCase().includes(searchTerm.toLowerCase());
      const isExpired = BigInt(Date.now()) / 1000n >= record.expiration;
      return matchesSearch && (showExpired || !isExpired);
    });
  }, [records, searchTerm, showExpired]);

  // Refresh data
  const handleRefresh = async () => {
    if (!eventListener || isRefreshing) return;

    setIsRefreshing(true);
    try {
      if (hasRole('ADMIN') && isValidAddress && dateRange?.from && dateRange?.to) {
        await loadAddressData(
          targetAddress as Address,
          startOfDay(dateRange.from),
          endOfDay(dateRange.to || dateRange.from)
        );
      } else {
        const [grantedEvents, revokedEvents] = await Promise.all([
          eventListener.queryAccessGrantedEvents(dataRegistryAddress, 0n, 'latest'),
          eventListener.queryAccessRevokedEvents(dataRegistryAddress, 0n, 'latest'),
        ]);

        const sharedRecords = processEvents(grantedEvents, revokedEvents, address as Address);
        setRecords(sharedRecords);
      }

      toast.success('Records refreshed successfully');
    } catch (error) {
      console.error('Error refreshing records:', error);
      toast.error('Failed to refresh records. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle address search
  const handleAddressSearch = async () => {
    if (!isValidAddress || !dateRange?.from) return;

    await loadAddressData(
      targetAddress as Address,
      startOfDay(dateRange.from),
      endOfDay(dateRange.to || dateRange.from)
    );
  };

  if (!isAuthenticated || (!hasRole('CONSUMER') && !hasRole('ADMIN') && false)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Unauthorized Access</CardTitle>
          <CardDescription>You must be authenticated as a consumer or admin to view shared records.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Shared With Me</CardTitle>
            <CardDescription>View and manage data shared with you</CardDescription>
          </div>
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
            {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {(hasRole('ADMIN') || true) && (
          <div className="mb-6 space-y-4">
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Target Address</label>
                <Input
                  placeholder="Enter address to view shared records..."
                  value={targetAddress}
                  onChange={(e) => setTargetAddress(e.target.value)}
                  className={cn(targetAddress && !isValidAddress && 'border-red-500 focus-visible:ring-red-500')}
                />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Date Range</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !dateRange && 'text-muted-foreground'
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, 'LLL dd, y')} - {format(dateRange.to, 'LLL dd, y')}
                          </>
                        ) : (
                          format(dateRange.from, 'LLL dd, y')
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <Button onClick={handleAddressSearch} disabled={!isValidAddress || !dateRange?.from || isLoading}>
                Search
              </Button>
            </div>
          </div>
        )}

        <div className="mb-4 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button variant="outline" onClick={() => setShowExpired(!showExpired)} className="gap-2">
            <Filter className="h-4 w-4" />
            {showExpired ? 'Hide Expired' : 'Show Expired'}
          </Button>
        </div>

        {isLoading ? (
          <div className="flex h-[200px] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center text-muted-foreground">No records found</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Record ID</TableHead>
                <TableHead>Access Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expiration</TableHead>
                <TableHead>Granted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => {
                const isExpired = BigInt(Date.now()) / 1000n >= record.expiration;
                return (
                  <TableRow key={record.recordId}>
                    <TableCell className="font-mono">{record.recordId}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">Level {record.accessLevel}</Badge>
                    </TableCell>
                    <TableCell>
                      {record.isRevoked ? (
                        <Badge variant="destructive">Revoked</Badge>
                      ) : isExpired ? (
                        <Badge variant="outline">Expired</Badge>
                      ) : (
                        <Badge variant="secondary">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(Number(record.expiration) * 1000), {
                        addSuffix: true,
                      })}
                    </TableCell>
                    <TableCell>{formatDistanceToNow(record.grantedAt, { addSuffix: true })}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

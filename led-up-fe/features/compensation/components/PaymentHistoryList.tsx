'use client';

import { useState, useEffect } from 'react';
import { usePaymentHistory } from '../hooks';
import { formatDate, formatTokenAmount, shortenAddress } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  DownloadCloud,
  FileBarChart,
  Search,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PaymentHistoryListProps {
  producerAddress: `0x${string}`;
}

// Define payment type to match what comes from usePaymentHistory
interface Payment {
  transactionHash: `0x${string}`;
  blockNumber: number;
  from: `0x${string}`;
  to: `0x${string}`;
  amount: bigint;
  recordsCount: number;
  success: boolean;
  timestamp: number;
}

export function PaymentHistoryList({ producerAddress }: PaymentHistoryListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSort, setSelectedSort] = useState('date-desc');
  const [pageSize, setPageSize] = useState(5);
  const [pageIndex, setPageIndex] = useState(0);
  const [copiedFields, setCopiedFields] = useState<Record<string, boolean>>({});

  // Log producer address for debugging
  useEffect(() => {
    console.log('Producer Address in PaymentHistoryList:', producerAddress);
  }, [producerAddress]);

  // Fetch payment history with pagination
  const {
    data: payments,
    isLoading,
    error,
    totalEvents,
    pageCount,
    goToNextPage,
    goToPreviousPage,
    setPageIndex: setHistoryPageIndex,
    hasNextPage,
    hasPreviousPage,
  } = usePaymentHistory(producerAddress, undefined, {
    pageSize,
    pageIndex,
  });

  // Filter payments based on search query
  const filteredPayments = payments?.filter((payment: Payment) => {
    if (!searchQuery) return true;

    const lowercaseQuery = searchQuery.toLowerCase();
    return (
      payment.from.toLowerCase().includes(lowercaseQuery) ||
      payment.to.toLowerCase().includes(lowercaseQuery) ||
      payment.transactionHash.toLowerCase().includes(lowercaseQuery)
    );
  });

  // Sort payments based on selected sorting option
  const sortedPayments = filteredPayments
    ? [...filteredPayments].sort((a: Payment, b: Payment) => {
        if (selectedSort === 'date-desc') {
          return b.timestamp - a.timestamp;
        } else if (selectedSort === 'date-asc') {
          return a.timestamp - b.timestamp;
        } else if (selectedSort === 'amount-desc') {
          return Number(b.amount - a.amount);
        } else if (selectedSort === 'amount-asc') {
          return Number(a.amount - b.amount);
        }
        return 0;
      })
    : [];

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPageIndex(0); // Reset to first page on new search
  };

  // Handle sort selection change
  const handleSortChange = (value: string) => {
    setSelectedSort(value);
  };

  // Handle page change
  const handlePageChange = (newPageIndex: number) => {
    setPageIndex(newPageIndex);
    setHistoryPageIndex(newPageIndex);
  };

  // Change page size
  const handlePageSizeChange = (value: string) => {
    const newSize = parseInt(value);
    setPageSize(newSize);
    setPageIndex(0); // Reset to first page when changing page size
  };

  // Copy text to clipboard with animation
  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedFields({ ...copiedFields, [fieldId]: true });

      // Reset the copied status after 2 seconds
      setTimeout(() => {
        setCopiedFields((prev) => ({ ...prev, [fieldId]: false }));
      }, 2000);
    });
  };

  // Format token amount to show only 2-3 decimal places
  const formatCompactTokenAmount = (amount: bigint): string => {
    // Convert to string with 18 decimals (full precision)
    const fullAmount = formatTokenAmount(amount, 18, '');

    // Split by decimal point
    const [whole, fraction] = fullAmount.split('.');

    // If fraction is too short, use it all, otherwise limit to 3 decimal places
    const decimals =
      fraction && fraction.length > 0 ? (fraction.length <= 3 ? fraction : fraction.substring(0, 3)) : '0';

    return `${whole}.${decimals} LDTK`;
  };

  // Render loading skeletons
  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-9 w-24" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border py-3 px-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-24" />
            </div>
            <div className="mt-2 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-56" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/30">
        <p className="text-red-600 dark:text-red-400">Error: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
        <h2 className="text-lg font-semibold">Payment History</h2>
        <div className="flex items-center gap-2 ml-auto">
          <Button variant="outline" size="sm">
            <DownloadCloud className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <FileBarChart className="mr-2 h-4 w-4" />
            Reports
          </Button>
        </div>
      </div>

      <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
        <div className="relative w-full flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search payments..."
            className="pl-9 h-9"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        <Select value={selectedSort} onValueChange={handleSortChange}>
          <SelectTrigger className="w-full h-9 sm:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-desc">Newest first</SelectItem>
            <SelectItem value="date-asc">Oldest first</SelectItem>
            <SelectItem value="amount-desc">Amount (high to low)</SelectItem>
            <SelectItem value="amount-asc">Amount (low to high)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-xs">
        <div className="text-muted-foreground">
          {searchQuery
            ? `Found ${filteredPayments?.length || 0} matching records`
            : `Showing ${pageIndex * pageSize + 1}-${Math.min(
                (pageIndex + 1) * pageSize,
                totalEvents
              )} of ${totalEvents} records`}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Rows per page:</span>
          <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
            <SelectTrigger className="w-[70px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {sortedPayments.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-6 px-4 text-center">
          <div className="rounded-full bg-muted/30 p-3">
            <FileBarChart className="h-5 w-5 text-muted-foreground" />
          </div>
          <h3 className="mt-3 text-base font-medium">No payment records found</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {searchQuery ? 'No payments match your search criteria.' : "You don't have any payment records yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <TooltipProvider>
            {sortedPayments.map((payment: Payment, index) => (
              <div
                key={`${payment.transactionHash}-${index}`}
                className="rounded-lg border py-3 px-4 shadow-sm transition-colors hover:bg-muted/40 dark:border-muted bg-primary/5"
              >
                <div className="flex flex-wrap items-start justify-between gap-1">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">Payment</span>
                      <Badge
                        variant={payment.success ? 'outline' : 'destructive'}
                        className="text-xs px-2 rounded-full text-primary border-primary/40 bg-primary/10"
                      >
                        {payment.success ? 'Success' : 'Failed'}
                      </Badge>
                    </div>

                    <div className="mt-2 flex flex-col space-y-1 text-xs">
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground w-12">From:</span>
                        <code className="font-mono">{shortenAddress(payment.from, 6, 4)}</code>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={() => copyToClipboard(payment.from, `from-${index}`)}
                            >
                              {copiedFields[`from-${index}`] ? (
                                <Check className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3 text-muted-foreground" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="text-xs">
                            {copiedFields[`from-${index}`] ? 'Copied!' : 'Copy address'}
                          </TooltipContent>
                        </Tooltip>
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground w-12">To:</span>
                        <code className="font-mono">{shortenAddress(payment.to, 6, 4)}</code>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={() => copyToClipboard(payment.to, `to-${index}`)}
                            >
                              {copiedFields[`to-${index}`] ? (
                                <Check className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3 text-muted-foreground" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="text-xs">
                            {copiedFields[`to-${index}`] ? 'Copied!' : 'Copy address'}
                          </TooltipContent>
                        </Tooltip>
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground w-12">Tx:</span>
                        <code className="font-mono">{shortenAddress(payment.transactionHash, 8, 8)}</code>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={() => copyToClipboard(payment.transactionHash, `tx-${index}`)}
                            >
                              {copiedFields[`tx-${index}`] ? (
                                <Check className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3 text-muted-foreground" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="text-xs">
                            {copiedFields[`tx-${index}`] ? 'Copied!' : 'Copy transaction hash'}
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={() =>
                                window.open(`https://etherscan.io/tx/${payment.transactionHash}`, '_blank')
                              }
                            >
                              <ExternalLink className="h-3 w-3 text-muted-foreground" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="text-xs">
                            View on Etherscan
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <div className="text-right">
                      <p className="text-base font-semibold">{formatCompactTokenAmount(payment.amount)}</p>
                      <p className="text-xs text-muted-foreground">
                        For {payment.recordsCount} record{payment.recordsCount === 1 ? '' : 's'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 mt-5">
                      <span className="text-xs text-muted-foreground">
                        {formatDate(new Date(payment.timestamp * 1000))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </TooltipProvider>
        </div>
      )}

      {!searchQuery && pageCount > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => handlePageChange(0)}
                disabled={pageIndex === 0}
              >
                <ChevronLeft className="h-4 w-4" />
                <ChevronLeft className="h-4 w-4 -ml-2" />
                <span className="sr-only">Go to first page</span>
              </Button>
            </PaginationItem>
            <PaginationItem>
              {hasPreviousPage ? (
                <PaginationPrevious onClick={() => handlePageChange(pageIndex - 1)} />
              ) : (
                <PaginationPrevious className="cursor-not-allowed opacity-50 pointer-events-none" />
              )}
            </PaginationItem>

            {/* First page */}
            {pageIndex > 1 && (
              <PaginationItem>
                <PaginationLink onClick={() => handlePageChange(0)}>1</PaginationLink>
              </PaginationItem>
            )}

            {/* Ellipsis for many previous pages */}
            {pageIndex > 2 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            {/* Previous page if not first */}
            {pageIndex > 0 && (
              <PaginationItem>
                <PaginationLink onClick={() => handlePageChange(pageIndex - 1)}>{pageIndex}</PaginationLink>
              </PaginationItem>
            )}

            {/* Current page */}
            <PaginationItem>
              <PaginationLink isActive>{pageIndex + 1}</PaginationLink>
            </PaginationItem>

            {/* Next page if not last */}
            {pageIndex < pageCount - 1 && (
              <PaginationItem>
                <PaginationLink onClick={() => handlePageChange(pageIndex + 1)}>{pageIndex + 2}</PaginationLink>
              </PaginationItem>
            )}

            {/* Ellipsis for many next pages */}
            {pageIndex < pageCount - 3 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            {/* Last page */}
            {pageIndex < pageCount - 2 && (
              <PaginationItem>
                <PaginationLink onClick={() => handlePageChange(pageCount - 1)}>{pageCount}</PaginationLink>
              </PaginationItem>
            )}

            <PaginationItem>
              {hasNextPage ? (
                <PaginationNext onClick={() => handlePageChange(pageIndex + 1)} />
              ) : (
                <PaginationNext className="cursor-not-allowed opacity-50 pointer-events-none" />
              )}
            </PaginationItem>
            <PaginationItem>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => handlePageChange(pageCount - 1)}
                disabled={pageIndex === pageCount - 1}
              >
                <ChevronRight className="h-4 w-4" />
                <ChevronRight className="h-4 w-4 -ml-2" />
                <span className="sr-only">Go to last page</span>
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}

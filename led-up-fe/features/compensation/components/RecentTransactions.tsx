'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatTokenAmount, formatDate, shortenAddress } from '@/lib/utils';
import { usePaymentHistory } from '../hooks';
import { ArrowUpRight, ExternalLink, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface RecentTransactionsProps {
  producerAddress: `0x${string}`;
  limit?: number;
}

export function RecentTransactions({ producerAddress, limit = 5 }: RecentTransactionsProps) {
  const { data: transactions, isLoading } = usePaymentHistory(producerAddress);
  const [showAll, setShowAll] = useState(false);

  const displayedTransactions = transactions ? (showAll ? transactions : transactions.slice(0, limit)) : [];

  const getStatusIcon = (success: boolean) => {
    if (success) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusBadge = (success: boolean) => {
    return (
      <Badge
        variant="outline"
        className={`${
          success
            ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400'
            : 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400'
        }`}
      >
        {success ? 'Successful' : 'Failed'}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest payment activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-3 w-[100px]" />
                </div>
                <Skeleton className="h-8 w-[100px]" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest payment activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Clock className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No Transactions Yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Your recent transactions will appear here once you start receiving payments.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest payment activities</CardDescription>
          </div>
          {transactions.length > limit && (
            <Button variant="ghost" size="sm" onClick={() => setShowAll(!showAll)}>
              {showAll ? 'Show Less' : 'View All'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayedTransactions.map((tx) => (
            <div
              key={tx.transactionHash}
              className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {getStatusIcon(tx.success)}
                  <span className="font-medium">{formatTokenAmount(tx.amount, 18, 'LDTK')}</span>
                  {getStatusBadge(tx.success)}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>From: {shortenAddress(tx.from)}</span>
                  <ArrowUpRight className="h-3 w-3" />
                  <span>To: {shortenAddress(tx.to)}</span>
                </div>
                <p className="text-xs text-muted-foreground">{formatDate(new Date(tx.timestamp * 1000))}</p>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => window.open(`https://etherscan.io/tx/${tx.transactionHash}`, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View on Etherscan</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

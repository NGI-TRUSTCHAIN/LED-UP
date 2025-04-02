'use client';

import { formatTokenAmount, cn } from '@/lib/utils';
import { Coins, BarChart3, Activity, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface SystemStatusCardProps {
  serviceFee?: number;
  unitPrice?: bigint;
  isPaused?: boolean;
  minimumWithdrawAmount?: bigint;
  isLoading: boolean;
}

export function SystemStatusCard({
  serviceFee,
  unitPrice,
  isPaused,
  minimumWithdrawAmount,
  isLoading,
}: SystemStatusCardProps) {
  return (
    <Card className="p-6">
      <h2 className="mb-4 text-lg font-semibold">System Information</h2>

      {isPaused && (
        <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-950/50">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-400">System Paused</h3>
          </div>
          <p className="mt-2 text-sm text-yellow-700 dark:text-yellow-300/80">
            The compensation system is currently paused. Some operations may not be available.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col rounded-xl border bg-card/80 p-5 shadow-sm transition-all hover:shadow-md dark:border-muted dark:bg-card/70">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Service Fee</h3>
            <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/30">
              <Coins className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          {isLoading ? (
            <div className="mt-3 h-7 w-16 animate-pulse rounded-md bg-muted"></div>
          ) : (
            <p className="mt-3 text-2xl font-bold tracking-tight">{serviceFee}%</p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">Platform fee applied to transactions</p>
        </div>

        <div className="flex flex-col rounded-xl border bg-card/80 p-5 shadow-sm transition-all hover:shadow-md dark:border-muted dark:bg-card/70">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Unit Price</h3>
            <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/30">
              <BarChart3 className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </div>
          {isLoading ? (
            <div className="mt-3 h-7 w-24 animate-pulse rounded-md bg-muted"></div>
          ) : (
            <p className="mt-3 text-2xl font-bold tracking-tight">{formatTokenAmount(unitPrice, 18, 'LDTK')}</p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">Current price per data unit</p>
        </div>

        <div className="flex flex-col rounded-xl border bg-card/80 p-5 shadow-sm transition-all hover:shadow-md dark:border-muted dark:bg-card/70">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Minimum Withdrawal</h3>
            <div className="rounded-full bg-orange-100 p-2 dark:bg-orange-900/30">
              <Coins className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          {isLoading ? (
            <div className="mt-3 h-7 w-24 animate-pulse rounded-md bg-muted"></div>
          ) : (
            <p className="mt-3 text-2xl font-bold tracking-tight">
              {formatTokenAmount(minimumWithdrawAmount, 18, 'LDTK')}
            </p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">Minimum amount for withdrawal</p>
        </div>

        <div className="flex flex-col rounded-xl border bg-card/80 p-5 shadow-sm transition-all hover:shadow-md dark:border-muted dark:bg-card/70">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">System Status</h3>
            <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900/30">
              <Activity className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          {isLoading ? (
            <div className="mt-3 h-7 w-16 animate-pulse rounded-md bg-muted"></div>
          ) : (
            <p
              className={cn(
                'mt-3 text-2xl font-bold tracking-tight',
                isPaused ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
              )}
            >
              {isPaused ? 'Paused' : 'Active'}
            </p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">Current operational status</p>
        </div>
      </div>
    </Card>
  );
}

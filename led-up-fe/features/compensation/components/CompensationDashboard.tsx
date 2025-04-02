import { useAccount } from 'wagmi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { formatTokenAmount } from '@/lib/utils';
import { useProducerBalance, useServiceFee, useUnitPrice, useMinimumWithdrawAmount } from '../hooks/use-compensation';
import { WithdrawBalanceForm } from './WithdrawBalanceForm';
import { Coins, AlertCircle, TrendingUp, BarChart4, ArrowDown, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/features/auth/contexts/auth-provider';

export function CompensationDashboard() {
  const { address } = useAuth();

  const { data: balance, isLoading: isBalanceLoading } = useProducerBalance(address as `0x${string}`);
  const { data: serviceFee, isLoading: isServiceFeeLoading } = useServiceFee();
  const { data: unitPrice, isLoading: isUnitPriceLoading } = useUnitPrice();
  const { data: minWithdraw, isLoading: isMinWithdrawLoading } = useMinimumWithdrawAmount();

  if (!address) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Not Connected</AlertTitle>
        <AlertDescription>Please connect your wallet to view compensation details.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-8"
      >
        {/* Stats Cards */}
        <Card className="bg-card border shadow-sm overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg">Financial Overview</CardTitle>
            <CardDescription>Key metrics for your LED-UP compensation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="bg-primary/10 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Coins className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-medium">Available Balance</h3>
                  </div>
                  {isBalanceLoading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                </div>
                <div className="mt-1 text-2xl font-bold">
                  {isBalanceLoading ? <Skeleton className="h-8 w-28" /> : formatTokenAmount(balance, 18, 'LED')}
                </div>
              </div>

              <div className="bg-primary/10 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-medium">Service Fee</h3>
                  </div>
                  {isServiceFeeLoading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                </div>
                <div className="mt-1 text-2xl font-bold">
                  {isServiceFeeLoading ? <Skeleton className="h-8 w-28" /> : `${serviceFee?.toString()}%`}
                </div>
              </div>

              <div className="bg-primary/10 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <BarChart4 className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-medium">Unit Price</h3>
                  </div>
                  {isUnitPriceLoading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                </div>
                <div className="mt-1 text-2xl font-bold">
                  {isUnitPriceLoading ? <Skeleton className="h-8 w-28" /> : formatTokenAmount(unitPrice, 18, 'LED/KB')}
                </div>
              </div>

              <div className="bg-primary/10 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ArrowDown className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-medium">Minimum Withdrawal</h3>
                  </div>
                  {isMinWithdrawLoading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                </div>
                <div className="mt-1 text-2xl font-bold">
                  {isMinWithdrawLoading ? <Skeleton className="h-8 w-28" /> : formatTokenAmount(minWithdraw, 18, 'LED')}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Withdraw Balance */}
        <div className="w-full max-w-md">
          <WithdrawBalanceForm
            balance={balance}
            minWithdraw={minWithdraw}
            isLoading={isBalanceLoading || isMinWithdrawLoading}
          />
        </div>
      </motion.div>
    </div>
  );
}

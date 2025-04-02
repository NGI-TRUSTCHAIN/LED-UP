'use client';

import { useState, useEffect } from 'react';
import { useProducerBalance, useWithdrawProducerBalance } from '../hooks';
import { formatTokenAmount } from '@/lib/utils';
import { Wallet, ArrowRight, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ProducerBalanceViewProps {
  producerAddress: `0x${string}`;
}

export function ProducerBalanceView({ producerAddress }: ProducerBalanceViewProps) {
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [inputError, setInputError] = useState<string | null>(null);

  // Log producer address for debugging
  useEffect(() => {
    console.log('Producer Address in ProducerBalanceView:', producerAddress);
  }, [producerAddress]);

  // Fetch producer balance using default configuration
  const { data: balance, isLoading: isBalanceLoading, error: balanceError } = useProducerBalance(producerAddress);

  // Withdrawal mutation using default configuration
  const {
    mutate: withdrawBalance,
    isPending: isWithdrawing,
    error: withdrawError,
    data: withdrawResult,
  } = useWithdrawProducerBalance(producerAddress);

  // Handle input validation and conversion
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setWithdrawAmount(value);

    // Clear previous errors
    setInputError(null);

    // Basic validation
    if (value && (isNaN(Number(value)) || Number(value) <= 0)) {
      setInputError('Please enter a valid positive number');
    }
  };

  // Handle form submission
  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAmount || inputError) return;

    try {
      // Convert from tokens to wei (assuming 18 decimals)
      // For example, if user enters 1.5, we need to convert to 1500000000000000000
      const floatAmount = parseFloat(withdrawAmount);
      if (isNaN(floatAmount) || floatAmount <= 0) {
        setInputError('Please enter a valid positive number');
        return;
      }

      // Convert to BigInt with 18 decimals
      const amount = BigInt(Math.floor(floatAmount * 10 ** 18));

      // Validate against minimum amount
      if (amount <= 0n) {
        setInputError('Amount must be greater than 0');
        return;
      }

      // Send the withdrawal request
      withdrawBalance({ amount });
    } catch (error) {
      setInputError('Invalid amount format');
      console.error('Error processing withdrawal amount:', error);
    }
  };

  if (isBalanceLoading) {
    return (
      <div className="rounded-xl border bg-card/70 p-6 shadow-sm dark:border-muted">
        <div className="flex justify-center">
          <div className="h-8 w-32 animate-pulse rounded-md bg-muted"></div>
        </div>
      </div>
    );
  }

  if (balanceError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-950/30">
        <p className="text-sm text-red-600 dark:text-red-400">Error: {balanceError.message}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm dark:border-muted dark:bg-card/70">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Producer Balance</h2>
        <div className="rounded-full bg-indigo-100 p-2 dark:bg-indigo-900/30">
          <Wallet className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 p-6 dark:from-indigo-950/30 dark:to-blue-950/30">
        <h3 className="text-sm font-medium text-muted-foreground">Available Balance</h3>
        <p className="mt-2 text-3xl font-bold tracking-tight">{formatTokenAmount(balance, 18, 'LDTK')}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Available for withdrawal. Minimum withdrawal amount applies.
        </p>
      </div>

      <div className="mt-6">
        <h3 className="mb-3 text-sm font-medium">Withdraw Funds</h3>
        <form onSubmit={handleWithdraw} className="space-y-4">
          <div className="rounded-lg border bg-muted/40 p-4 dark:bg-muted/10">
            <div className="flex items-center gap-3">
              <Input
                type="number"
                value={withdrawAmount}
                onChange={handleInputChange}
                placeholder="Amount to withdraw"
                className="border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                disabled={isWithdrawing}
                step="0.000001"
                min="0"
              />
              <span className="text-sm font-medium text-muted-foreground">LDTK</span>
            </div>
          </div>

          {inputError && (
            <div className="flex items-start gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800 dark:border-yellow-900 dark:bg-yellow-950/30 dark:text-yellow-400">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{inputError}</span>
            </div>
          )}

          <Button type="submit" disabled={isWithdrawing || !withdrawAmount || !!inputError} className="w-full gap-2">
            {isWithdrawing ? 'Processing...' : 'Withdraw Funds'}
            {!isWithdrawing && <ArrowRight className="h-4 w-4" />}
          </Button>

          {withdrawError && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
              {withdrawError.message}
            </div>
          )}

          {withdrawResult && withdrawResult.success && (
            <div className="mt-3 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-600 dark:border-green-900 dark:bg-green-950/30 dark:text-green-400">
              Withdrawal successful! Transaction hash:{' '}
              <span className="font-mono">
                {withdrawResult.hash ? `${withdrawResult.hash.slice(0, 10)}...` : 'N/A'}
              </span>
            </div>
          )}

          {withdrawResult && !withdrawResult.success && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
              Withdrawal failed: {withdrawResult.error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

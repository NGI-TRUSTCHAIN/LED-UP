'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatTokenAmount } from '@/lib/utils';
import { useTokenBalance, useTokenAllowance, useTokenApproval } from '../hooks/use-token';
import { Coins, RefreshCw, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface TokenBalanceCardProps {
  address: `0x${string}`;
  spenderAddress: `0x${string}`;
  requiredAmount?: bigint;
  onApprovalStatusChange?: (isApproved: boolean, isApproving: boolean) => void;
}

export function TokenBalanceCard({
  address,
  spenderAddress,
  requiredAmount,
  onApprovalStatusChange,
}: TokenBalanceCardProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [balance, setBalance] = useState<bigint>(BigInt(0));
  const [allowance, setAllowance] = useState<bigint>(BigInt(0));
  const [isLoading, setIsLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);

  const tokenBalance = useTokenBalance(address);
  const tokenAllowance = useTokenAllowance(address, spenderAddress);
  const tokenApproval = useTokenApproval();

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      setIsLoading(true);

      const [newBalance, newAllowance] = await Promise.all([tokenBalance.getBalance(), tokenAllowance.getAllowance()]);

      setBalance(newBalance as bigint);
      setAllowance(newAllowance as bigint);
    } catch (error) {
      console.error('Failed to refresh token data:', error);
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  };

  // Initial data fetch and refresh event listener
  useEffect(() => {
    handleRefresh();

    // Listen for refresh requests from parent component
    const refreshListener = () => {
      console.log('Received refresh request from parent');
      handleRefresh();
    };

    window.addEventListener('approval-refresh', refreshListener);

    return () => {
      window.removeEventListener('approval-refresh', refreshListener);
    };
  }, [address, spenderAddress]);

  // Separate effect to report status changes
  useEffect(() => {
    const reportStatus = async () => {
      // Ensure we have the latest data
      if (isLoading) return;

      if (onApprovalStatusChange) {
        const isApproved = requiredAmount && allowance ? allowance >= requiredAmount : false;
        console.log('TokenBalanceCard reporting approval status:', {
          isApproved,
          isApproving,
          allowance: allowance ? allowance.toString() : 'null',
          requiredAmount: requiredAmount ? requiredAmount.toString() : 'null',
        });
        onApprovalStatusChange(isApproved, isApproving);
      }
    };

    reportStatus();
  }, [allowance, requiredAmount, isApproving, onApprovalStatusChange, isLoading]);

  const handleApprove = async () => {
    if (!requiredAmount) return;

    try {
      setIsApproving(true);
      // Notify parent component about approval status
      if (onApprovalStatusChange) {
        onApprovalStatusChange(false, true);
      }

      // Use max uint256 for "infinite" approval instead of exact amount
      const maxApproval = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');

      console.log('Approving tokens:', {
        spender: spenderAddress,
        amount: maxApproval.toString(),
        requiredAmount: requiredAmount.toString(),
      });

      const result = await tokenApproval.approve({
        spender: spenderAddress,
        amount: maxApproval, // Use max approval to avoid needing multiple approvals
      });

      if (!result.success) {
        throw new Error(result.error || 'Approval failed');
      }

      console.log('Approval transaction successful:', result);

      // Wait a moment for the blockchain to process before refreshing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Refresh allowance after successful approval
      await handleRefresh();

      // Double-check the new allowance value
      console.log('New allowance after approval:', allowance.toString());

      // If allowance still doesn't reflect the approval, force it
      if (allowance < requiredAmount) {
        console.log('Allowance still insufficient after approval, forcing refresh...');
        await handleRefresh();
      }
    } catch (error) {
      console.error('Failed to approve tokens:', error);
    } finally {
      setIsApproving(false);
      // Notify parent about approval status change
      if (onApprovalStatusChange) {
        const isApproved = requiredAmount && allowance ? allowance >= requiredAmount : false;
        onApprovalStatusChange(isApproved, false);
      }
    }
  };

  // Add a button to recheck allowance and display debugging info
  const debugAllowance = async () => {
    try {
      const currentAllowance = await tokenAllowance.getAllowance();

      // Ensure currentAllowance is treated as bigint
      const allowanceBigInt = typeof currentAllowance === 'bigint' ? currentAllowance : BigInt(0);
      setAllowance(allowanceBigInt);

      // Force update parent
      if (onApprovalStatusChange && requiredAmount) {
        const isApproved = allowanceBigInt >= requiredAmount;
        onApprovalStatusChange(isApproved, false);
      }
    } catch (error) {
      console.error('DEBUG: Error checking allowance', error);
    }
  };

  // Function to force approve max amount
  const forceMaxApprove = async () => {
    try {
      setIsApproving(true);

      // Use max uint256 for "infinite" approval instead of exact amount
      const maxApproval = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');

      console.log('FORCE MAX APPROVAL for tokens:', {
        spender: spenderAddress,
        amount: 'MAX_UINT256',
      });

      // Get token contract address from config
      const tokenAddress = process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS;
      console.log('Using token address:', tokenAddress);

      const result = await tokenApproval.approve({
        spender: spenderAddress,
        amount: maxApproval,
      });

      console.log('Approval result:', result);

      if (!result.success) {
        throw new Error(result.error || 'Approval failed');
      }

      // Wait for transaction to be mined
      console.log('Waiting for transaction confirmation...');
      await new Promise((resolve) => setTimeout(resolve, 5000));

      // Refresh data
      await handleRefresh();
    } catch (error) {
      console.error('Force approval error:', error);
      alert('Error approving tokens: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsApproving(false);
    }
  };

  const needsApproval = requiredAmount && allowance ? allowance < requiredAmount : false;

  // Add a function to format token allowance display
  const formatAllowanceDisplay = (allowance: bigint): string => {
    // Check if allowance is close to max uint256 (unlimited approval)
    const maxUint256 = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
    // If allowance is at least 99% of max value, show it as MAX
    if (allowance >= (maxUint256 * BigInt(99)) / BigInt(100)) {
      return 'MAX (Unlimited)';
    }

    // Otherwise, use the regular token formatting
    return formatTokenAmount(allowance, 18, 'LED');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Token Balance</CardTitle>
            <CardDescription>Your LED token balance and allowance</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={isRefreshing || isLoading}>
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Balance Display */}
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-primary" />
                <span className="font-medium">Available Balance</span>
              </div>
              {isLoading ? (
                <Skeleton className="h-6 w-24" />
              ) : (
                <span className="text-lg font-bold">{formatTokenAmount(balance, 18, 'LED')}</span>
              )}
            </div>
          </div>

          {/* Allowance Display */}
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="flex items-center gap-2">
                    <span className="font-medium">Contract Allowance</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Amount of tokens the contract is allowed to spend on your behalf</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              {isLoading ? (
                <Skeleton className="h-6 w-24" />
              ) : (
                <span className="text-lg font-bold">{formatAllowanceDisplay(allowance)}</span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button variant="default" size="sm" className="text-xs" onClick={debugAllowance}>
              Recheck Allowance
            </Button>

            <Button
              variant="secondary"
              size="sm"
              className="text-xs border border-primary"
              onClick={forceMaxApprove}
              disabled={isApproving}
            >
              {isApproving ? 'Approving...' : 'Force Approve MAX'}
            </Button>
          </div>

          {allowance === BigInt(0) && balance > BigInt(0) && (
            <Alert className="bg-destructive/20 dark:bg-destructive/20 text-destructive dark:text-foreground border-destructive/50 dark:border-destructive/50">
              <AlertTitle className="flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-destructive" />
                No Allowance Set
              </AlertTitle>
              <AlertDescription className="text-sm dark:text-foreground">
                <p>
                  Your balance is {formatTokenAmount(balance, 18, 'LED')} but you haven't approved any tokens for
                  spending.
                </p>
                <p className="font-medium mt-1">Click "Force Approve MAX" above to approve token spending.</p>
              </AlertDescription>
            </Alert>
          )}

          {/* Token Approval Button - Always visible when needed */}
          {needsApproval && requiredAmount && (
            <div className="mt-4 flex flex-col">
              <div className="bg-yellow-100 dark:bg-yellow-900/30 px-4 py-3 rounded-t-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                  <span className="font-medium text-yellow-800 dark:text-yellow-200">Token Approval Needed</span>
                </div>
                <p className="text-sm mt-1 text-yellow-700 dark:text-yellow-300">
                  To proceed with payment, approve the contract to spend {formatTokenAmount(requiredAmount, 18, 'LED')}
                </p>
                <div className="text-xs mt-1 text-yellow-600">
                  Current allowance: {formatAllowanceDisplay(allowance)}
                </div>
              </div>
              <Button
                size="lg"
                className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-t-none rounded-b-lg h-12 text-base font-medium transition-all duration-200 shadow-sm"
                onClick={handleApprove}
                disabled={isApproving}
              >
                {isApproving ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Approving...
                  </>
                ) : (
                  <>Approve Unlimited Token Spending</>
                )}
              </Button>
            </div>
          )}

          {/* Approved Confirmation */}
          {!needsApproval && requiredAmount && !isLoading && (
            <Alert className="bg-success text-success-foreground">
              <div className="flex items-center text-success">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <span className="ml-2 font-medium">Tokens Approved</span>
              </div>
              <p className="text-sm mt-1 text-green-700 dark:text-green-300">You can now proceed with the payment</p>
            </Alert>
          )}

          {/* Insufficient Balance Warning - keep at the bottom */}
          {balance && requiredAmount && balance < requiredAmount && (
            <Alert variant="destructive" className="bg-error text-error-foreground">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Insufficient Balance</AlertTitle>
              <AlertDescription>
                You need {formatTokenAmount(requiredAmount, 18, 'LED')} but only have{' '}
                {formatTokenAmount(balance, 18, 'LED')} available.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

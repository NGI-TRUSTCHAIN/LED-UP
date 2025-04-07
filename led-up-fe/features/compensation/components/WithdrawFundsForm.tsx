'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useSonner } from '@/hooks/use-sonner';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { formatTokenAmount } from '@/lib/utils';
import { useProducerBalance, useWithdrawProducerBalance, useMinimumWithdrawAmount } from '../hooks';
import { WithdrawalAmountSchema } from '../schema';
import { useAccount } from 'wagmi';

interface WithdrawFundsFormProps {
  producerAddress: `0x${string}`;
}

// Form schema from our Zod schema
const formSchema = WithdrawalAmountSchema;

export function WithdrawFundsForm({ producerAddress }: WithdrawFundsFormProps) {
  const [withdrawalStatus, setWithdrawalStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { address } = useAccount();
  const { toast } = useSonner();

  // Get the producer's current balance and minimum withdrawal amount
  const { data: balance, isLoading: isBalanceLoading } = useProducerBalance(producerAddress);
  const { data: minimumWithdrawAmount, isLoading: isMinWithdrawLoading } = useMinimumWithdrawAmount();

  // Hook for withdrawing funds
  const { mutateAsync: withdrawFunds, isPending: isWithdrawing } = useWithdrawProducerBalance(address as `0x${string}`);

  // Setup form with react-hook-form and zod validation
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: '',
    },
  });

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setWithdrawalStatus('processing');
      setErrorMessage(null);

      // Convert amount to BigInt with 18 decimals (token precision)
      const amountWithDecimals = BigInt(Math.floor(parseFloat(values.amount) * 10 ** 18));

      // Check if withdrawal amount is greater than available balance
      if (balance && amountWithDecimals > balance) {
        throw new Error(`Insufficient balance. Available: ${formatTokenAmount(balance, 18, 'LDTK')}`);
      }

      // Check if withdrawal amount is less than minimum allowed
      if (minimumWithdrawAmount && amountWithDecimals < minimumWithdrawAmount) {
        throw new Error(
          `Amount below minimum withdrawal limit of ${formatTokenAmount(minimumWithdrawAmount, 18, 'LDTK')}`
        );
      }

      // Execute withdrawal
      await withdrawFunds({
        amount: amountWithDecimals,
      });

      // Update status on success
      setWithdrawalStatus('success');
      toast.success('Withdrawal Successful', {
        description: `Successfully withdrew ${values.amount} LDTK`,
      });

      // Reset the form
      form.reset();

      // Return to idle state after 3 seconds
      setTimeout(() => {
        setWithdrawalStatus('idle');
      }, 3000);
    } catch (error) {
      // Handle errors
      setWithdrawalStatus('error');
      const errorMsg = error instanceof Error ? error.message : 'An unknown error occurred';
      setErrorMessage(errorMsg);

      toast.error('Withdrawal Failed', {
        description: errorMsg,
      });
    }
  };

  const isLoading = isBalanceLoading || isMinWithdrawLoading || isWithdrawing || withdrawalStatus === 'processing';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Withdraw Funds</CardTitle>
        <CardDescription>Withdraw your earned tokens to your wallet</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Show available balance */}
        <div className="mb-4">
          <p className="text-sm font-medium">Available Balance</p>
          <p className="text-2xl font-bold">
            {isBalanceLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </span>
            ) : balance ? (
              formatTokenAmount(balance, 18, 'LDTK')
            ) : (
              '0 LDTK'
            )}
          </p>
          {minimumWithdrawAmount && (
            <p className="text-xs text-muted-foreground mt-1">
              Minimum withdrawal: {formatTokenAmount(minimumWithdrawAmount, 18, 'LDTK')}
            </p>
          )}
        </div>

        {/* Show success message */}
        {withdrawalStatus === 'success' && (
          <Alert className="mb-4 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertTitle>Withdrawal Successful</AlertTitle>
            <AlertDescription>Your tokens have been successfully withdrawn to your wallet.</AlertDescription>
          </Alert>
        )}

        {/* Show error message */}
        {withdrawalStatus === 'error' && errorMessage && (
          <Alert className="mb-4 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertTitle>Withdrawal Failed</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {/* Withdrawal form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Withdrawal Amount</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        placeholder="0.00"
                        type="number"
                        step="0.000001"
                        min="0"
                        disabled={isLoading || !balance || balance === BigInt(0)}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <span className="text-sm text-muted-foreground">LDTK</span>
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription>Enter the amount of tokens you wish to withdraw</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <CardFooter className="flex justify-end px-0 pb-0">
              <Button
                type="submit"
                disabled={isLoading || !balance || balance === BigInt(0)}
                className="w-full sm:w-auto"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {withdrawalStatus === 'processing' ? 'Processing...' : 'Loading...'}
                  </>
                ) : (
                  'Withdraw'
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

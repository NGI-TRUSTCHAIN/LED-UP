'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useWithdrawProducerBalance, useProducerBalance } from '../hooks/use-compensation';
import { formatTokenAmount } from '@/lib/utils';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle, Loader2, Coins, ArrowDown, CreditCard } from 'lucide-react';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

// Create schema with dynamic validation for amount
const createFormSchema = (minWithdraw?: bigint, balance?: bigint) => {
  return z.object({
    amount: z
      .string()
      .min(1, 'Amount is required')
      .refine((val) => !isNaN(Number(val)), {
        message: 'Must be a valid number',
      })
      .refine((val) => Number(val) > 0, {
        message: 'Amount must be greater than 0',
      })
      .refine(
        (val) => {
          if (!minWithdraw) return true;
          return BigInt(val) >= minWithdraw;
        },
        {
          message: minWithdraw ? `Minimum withdrawal is ${formatTokenAmount(minWithdraw, 18, 'LED')}` : '',
        }
      )
      .refine(
        (val) => {
          if (!balance) return true;
          return BigInt(val) <= balance;
        },
        {
          message: balance ? `Cannot exceed available balance of ${formatTokenAmount(balance, 18, 'LED')}` : '',
        }
      ),
  });
};

type WithdrawBalanceFormProps = {
  balance?: bigint;
  minWithdraw?: bigint;
  isLoading: boolean;
};

export function WithdrawBalanceForm({ balance, minWithdraw, isLoading }: WithdrawBalanceFormProps) {
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>();
  const [percentage, setPercentage] = useState<number>(0);
  const { address } = useAccount();

  // Use the hook directly to refresh balance after withdrawal
  const {
    data: latestBalance,
    isLoading: isBalanceLoading,
    refetch: refetchBalance,
  } = useProducerBalance(address as `0x${string}`);

  // Get withdraw function from the hook
  const { withdrawBalance } = useWithdrawProducerBalance();

  // Current balance to display (use prop or fetched value)
  const currentBalance = balance || latestBalance;

  // Use dynamic schema based on props
  const formSchema = createFormSchema(minWithdraw, currentBalance);
  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: '',
    },
  });

  // Watch amount to update percentage
  const enteredAmount = form.watch('amount');

  // Update percentage when amount changes
  useEffect(() => {
    if (enteredAmount && currentBalance && currentBalance > 0n) {
      try {
        const amount = BigInt(enteredAmount || '0');
        const percentage = Number((amount * 100n) / currentBalance);
        setPercentage(Math.min(percentage, 100));
      } catch (e) {
        setPercentage(0);
      }
    } else {
      setPercentage(0);
    }
  }, [enteredAmount, currentBalance]);

  async function onSubmit(values: FormValues) {
    try {
      setStatus('processing');
      setErrorMessage(undefined);

      const amount = BigInt(values.amount);

      const result = await withdrawBalance({ amount });

      if (!result.success) {
        throw new Error(result.error || 'Failed to withdraw balance');
      }

      // Success handling
      setStatus('success');
      toast.success('Withdrawal Successful', {
        description: `Successfully withdrawn ${formatTokenAmount(amount, 18, 'LED')} to your wallet`,
      });

      // Refetch balance to show updated amount
      await refetchBalance();

      form.reset();

      // Return to idle state after 3 seconds
      setTimeout(() => {
        setStatus('idle');
      }, 3000);
    } catch (err) {
      setStatus('error');
      const message = err instanceof Error ? err.message : 'An error occurred';
      setErrorMessage(message);
      toast.error('Withdrawal Failed', {
        description: message,
      });
    }
  }

  const isFormDisabled = isLoading || isBalanceLoading || status === 'processing';

  // Preset amount buttons
  const presetAmounts = currentBalance
    ? [
        { label: '25%', value: (currentBalance * 25n) / 100n },
        { label: '50%', value: (currentBalance * 50n) / 100n },
        { label: '75%', value: (currentBalance * 75n) / 100n },
        { label: 'Max', value: currentBalance },
      ]
    : [];

  const handlePresetAmount = (amount: bigint) => {
    form.setValue('amount', amount.toString());
  };

  return (
    <Card className="overflow-hidden border-2">
      <CardHeader className="bg-gradient-to-r from-muted/50 to-background pb-8">
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-primary" />
          Withdraw Funds
        </CardTitle>
        <CardDescription>Withdraw your earned LED tokens to your connected wallet</CardDescription>
      </CardHeader>

      <CardContent className="px-6 pt-6 pb-2">
        <div className="space-y-6">
          {/* Balance display with visual indicator */}
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Available Balance</h3>

            {isFormDisabled ? (
              <Skeleton className="h-8 w-32 mb-2" />
            ) : (
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold">
                  {currentBalance !== undefined ? formatTokenAmount(currentBalance, 18) : '0.00'}
                </span>
                <span className="text-sm font-medium text-muted-foreground">LED</span>
              </div>
            )}

            <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
              <span>Min: {minWithdraw ? formatTokenAmount(minWithdraw, 18, 'LED') : '...'}</span>
              <span>Network: {process.env.NEXT_PUBLIC_CHAIN_ID === '31337' ? 'Local' : 'Sepolia Testnet'}</span>
            </div>
          </div>

          {/* Success alert */}
          {status === 'success' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertTitle>Withdrawal Successful</AlertTitle>
                <AlertDescription>Your funds have been withdrawn to your wallet.</AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Error alert */}
          {status === 'error' && errorMessage && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Withdrawal Failed</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Form with improved UI */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <FormLabel>Amount</FormLabel>
                  <span className="text-xs text-muted-foreground">
                    {percentage > 0 ? `${percentage}% of balance` : ''}
                  </span>
                </div>

                <Progress value={percentage} className="h-1 mb-3" />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <CreditCard className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <span className="text-sm font-medium text-muted-foreground">LED</span>
                        </div>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            placeholder="0.00"
                            disabled={isFormDisabled}
                            style={{ paddingLeft: '2.5rem', paddingRight: '3.5rem' }}
                            className="h-14 text-lg"
                          />
                        </FormControl>
                      </div>
                      <FormDescription>Amount of LED tokens to withdraw to your wallet</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Quick amount selector */}
                <div className="flex gap-2 mt-3">
                  {presetAmounts.map((preset) => (
                    <Button
                      key={preset.label}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handlePresetAmount(preset.value)}
                      disabled={isFormDisabled}
                      className="flex-1"
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12"
                disabled={isFormDisabled || !currentBalance || currentBalance === 0n}
              >
                {isFormDisabled ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing Withdrawal...
                  </>
                ) : !currentBalance || currentBalance === 0n ? (
                  'No Funds Available'
                ) : (
                  <>
                    <ArrowDown className="mr-2 h-4 w-4" />
                    Withdraw Funds
                  </>
                )}
              </Button>
            </form>
          </Form>
        </div>
      </CardContent>

      <CardFooter className="bg-muted/10 px-6 py-4 text-xs text-muted-foreground">
        <div className="w-full flex justify-between items-center">
          <span>
            Contract: {process.env.NEXT_PUBLIC_COMPENSATION_CONTRACT_ADDRESS?.slice(0, 6)}...
            {process.env.NEXT_PUBLIC_COMPENSATION_CONTRACT_ADDRESS?.slice(-4)}
          </span>
          <span>
            Token: {process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS?.slice(0, 6)}...
            {process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS?.slice(-4)}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}

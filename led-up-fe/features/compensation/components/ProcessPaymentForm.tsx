'use client';

import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Loader2, AlertCircle, CheckCircle, Info, CreditCard, Coins, FileText, User } from 'lucide-react';
import { formatTokenAmount } from '@/lib/utils';
import { useProcessPayment, useUnitPrice, useVerifyPayment } from '../hooks/use-compensation';
import { TokenBalanceCard } from './TokenBalanceCard';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { Separator } from '@/components/ui/separator';
import { useRecordInfo } from '@/features/data-registry/hooks/use-data-registry';
import { getRecordInfo } from '@/features/data-registry/actions/query';
import { useAuth } from '@/features/auth/contexts/auth-provider';
import { useWalletClient, usePublicClient } from 'wagmi';
import { ERC20ABI } from '@/abi/erc20.abi';
import { CompensationABI } from '@/abi/compensation.abi';

// Create a modified schema without dataSize - it will be fetched automatically
const formSchema = z.object({
  recordId: z.string().min(1, 'Record ID is required').trim(),
  producerAddress: z
    .string()
    .min(1, 'Producer address is required')
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address format')
    .transform((val) => val.toLowerCase()),
  dataSize: z.number().min(0, 'Data size should be greater than 0').optional(),
});

interface ProcessPaymentFormProps {
  unitPrice?: bigint;
  serviceFee?: number;
  isLoading: boolean;
}

export function ProcessPaymentForm({ unitPrice, serviceFee, isLoading: isParentLoading }: ProcessPaymentFormProps) {
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dataSize, setDataSize] = useState<bigint | null>(null);
  const [isLoadingDataSize, setIsLoadingDataSize] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const { address, did } = useAuth();
  console.log('did', did);

  // Setup form with react-hook-form and zod validation
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recordId: '',
      producerAddress: '',
      dataSize: 0,
    },
  });

  // Contract addresses from env
  const compensationAddress = process.env.NEXT_PUBLIC_COMPENSATION_CONTRACT_ADDRESS as `0x${string}`;

  // Hook for processing payment
  const { processPayment } = useProcessPayment();

  // Watch the recordId field to verify payment status
  const recordId = form.watch('recordId');
  const { data: paymentInfo, refetch: refetchPaymentStatus } = useVerifyPayment(recordId);
  console.log('paymentInfo', paymentInfo);

  // Boolean to track if payment is already made
  const isAlreadyPaid = !!paymentInfo?.isPaid;

  // Calculate total cost based on unit price and data size
  const calculateTotalCost = (): bigint | null => {
    if (!unitPrice || !dataSize) return null;
    const baseAmount = unitPrice * dataSize;
    if (serviceFee === undefined) return baseAmount;
    const feeAmount = (baseAmount * BigInt(serviceFee)) / 100n;
    return baseAmount + feeAmount;
  };

  const totalCost = calculateTotalCost();

  // Calculate percentage of total for the progress bar
  const getProgressValue = (): number => {
    if (!dataSize) return 0;
    const value = Math.min(Number(dataSize) * 10, 100);
    return value;
  };

  // Effect to check payment status when recordId changes
  useEffect(() => {
    if (recordId) {
      refetchPaymentStatus();

      // Fetch data size when recordId changes
      const fetchDataSize = async () => {
        try {
          setIsLoadingDataSize(true);
          const record = await getRecordInfo(recordId);
          console.log('record', record);

          if (record) {
            if (record.metadata.producer) {
              form.setValue('producerAddress', record.metadata.producer);
            } else {
              form.setValue('producerAddress', '');
            }

            // Check metadata first
            if (record.metadata && typeof record.metadata.dataSize === 'number') {
              setDataSize(BigInt(record.metadata.dataSize));
            } else {
              setDataSize(null);
              toast.error('Data size not found', {
                description: 'Could not retrieve data size for this record',
              });
            }
          }
        } catch (error) {
          console.error('Error fetching record data:', error);
          setDataSize(null);
        } finally {
          setIsLoadingDataSize(false);
        }
      };

      fetchDataSize();
    } else {
      setDataSize(null);
    }
  }, [recordId, refetchPaymentStatus]);

  // Callback function to be passed to TokenBalanceCard
  const handleApprovalStatus = (approved: boolean, approving: boolean) => {
    console.log('Approval status changed:', { approved, approving });
    setIsApproved(approved);
    setIsApproving(approving);

    // Force re-render to ensure UI is updated
    if (approved) {
      // If approval is successful, refresh the button state after a short delay
      setTimeout(() => {
        setIsApproved(true);
        console.log('Forced approval state refresh: true');
      }, 500);
    }
  };

  // Debug logging for approval state
  useEffect(() => {
    console.log('Current approval state:', { isApproved, isApproving });
  }, [isApproved, isApproving]);

  // Add a manual refresh button for approval status
  const forceRefreshApprovalStatus = () => {
    if (!address || !compensationAddress || !totalCost) return;

    console.log('Manually refreshing approval status');
    // This will trigger a re-check through the TokenBalanceCard
    setIsApproved(false);
    setTimeout(() => {
      // Force the TokenBalanceCard to re-evaluate
      const event = new CustomEvent('approval-refresh', { detail: { timestamp: Date.now() } });
      window.dispatchEvent(event);
    }, 100);
  };

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (!dataSize) {
        toast.error('Data size required', {
          description: 'Unable to determine data size for this record.',
        });
        return;
      }

      // Double-check approval status before proceeding
      if (!isApproved) {
        toast.error('Token approval required', {
          description: 'Please approve token spending before making a payment.',
        });
        forceRefreshApprovalStatus();
        return;
      }

      setPaymentStatus('processing');
      setErrorMessage(null);

      // Check if payment is already made
      if (isAlreadyPaid) {
        toast.info('Payment Already Made', {
          description: `This record has already been paid for.`,
        });
        setPaymentStatus('idle');
        return;
      }

      const result = await processPayment({
        producer: values.producerAddress as `0x${string}`,
        recordId: values.recordId,
        consumerDid: did,
        dataSize: dataSize,
      });

      if (!result.success) {
        // Handle specific error messages with more user-friendly notifications
        if (result.error?.includes('data size') || result.error?.includes('InvalidDataSize')) {
          throw new Error('The data size from the record is invalid or incompatible with the contract');
        } else if (result.error?.includes('Insufficient') || result.error?.includes('balance')) {
          throw new Error(
            'Insufficient token balance. Please check your balance and approve enough tokens for this transaction.'
          );
        } else {
          throw new Error(result.error || 'Failed to process payment');
        }
      }

      // Update status on success
      setPaymentStatus('success');
      toast.success('Payment Successful', {
        description: `Successfully processed payment for record ${values.recordId}`,
      });

      // Reset the form
      form.reset();
      setDataSize(null);

      // Return to idle state after 3 seconds
      setTimeout(() => {
        setPaymentStatus('idle');
      }, 3000);
    } catch (error) {
      // Handle errors
      setPaymentStatus('error');
      const errorMsg = error instanceof Error ? error.message : 'An unknown error occurred';
      setErrorMessage(errorMsg);

      toast.error('Payment Failed', {
        description: errorMsg,
      });
    }
  };

  const isFormLoading = isParentLoading || paymentStatus === 'processing' || isLoadingDataSize || isApproving;

  const DirectTokenApproval = () => {
    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient();
    const [error, setError] = useState<string | null>(null);
    const [tokenAddress, setTokenAddress] = useState<`0x${string}` | null>(null);
    const [isLoadingToken, setIsLoadingToken] = useState(false);

    const compensationAddress = process.env.NEXT_PUBLIC_COMPENSATION_CONTRACT_ADDRESS as `0x${string}`;
    const envTokenAddress = process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS as `0x${string}`;

    // Get the token address from the contract
    useEffect(() => {
      const getTokenAddress = async () => {
        if (!publicClient) return;

        try {
          setIsLoadingToken(true);
          // Get the token address directly from the contract
          const contractTokenAddress = (await publicClient.readContract({
            address: compensationAddress,
            abi: CompensationABI, // Use Compensation ABI instead of ERC20ABI
            functionName: 'getPaymentTokenAddress',
            args: [],
          })) as `0x${string}`;

          console.log('Token address from contract:', contractTokenAddress);
          console.log('Token address from env:', envTokenAddress);

          if (contractTokenAddress.toLowerCase() !== envTokenAddress.toLowerCase()) {
            console.warn('⚠️ WARNING: Token address mismatch between contract and environment variable');
            console.warn('Contract token:', contractTokenAddress);
            console.warn('Env token:', envTokenAddress);
          }

          setTokenAddress(contractTokenAddress);
        } catch (error) {
          console.error('Error getting token address from contract:', error);
          // Fallback to environment variable
          console.log('Falling back to environment variable token address:', envTokenAddress);
          setTokenAddress(envTokenAddress);
        } finally {
          setIsLoadingToken(false);
        }
      };

      getTokenAddress();
    }, [publicClient, compensationAddress, envTokenAddress]);

    const handleDirectApproval = async () => {
      if (!walletClient || !publicClient || !address) {
        toast.error('Wallet not connected');
        return;
      }

      // Use the token address from the contract, or fall back to env if not available
      const targetTokenAddress = tokenAddress || envTokenAddress;

      if (!targetTokenAddress) {
        toast.error('Token address not available');
        return;
      }

      try {
        setIsApproving(true);
        setError(null);

        // Use maximum possible value for approval
        const maxApproval = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');

        console.log('Approving tokens directly:', {
          token: targetTokenAddress,
          spender: compensationAddress,
          owner: address,
          amount: 'MAX_UINT256',
        });

        // Check current allowance first
        const currentAllowance = await publicClient.readContract({
          address: targetTokenAddress,
          abi: ERC20ABI,
          functionName: 'allowance',
          args: [address, compensationAddress],
        });

        console.log('Current allowance before approval:', (currentAllowance as bigint).toString());

        // Simulate the approval first
        const { request } = await publicClient.simulateContract({
          address: targetTokenAddress,
          abi: ERC20ABI,
          functionName: 'approve',
          args: [compensationAddress, maxApproval],
          account: address,
        });

        // Execute the transaction
        const hash = await walletClient.writeContract(request);

        console.log('Approval transaction hash:', hash);
        toast.info('Approval transaction submitted. Waiting for confirmation...');

        // Wait for transaction confirmation
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        console.log('Approval transaction confirmed:', receipt);

        if (receipt.status === 'success') {
          // Verify the allowance was updated
          const newAllowance = await publicClient.readContract({
            address: targetTokenAddress,
            abi: ERC20ABI,
            functionName: 'allowance',
            args: [address, compensationAddress],
          });

          console.log('New allowance after approval:', (newAllowance as bigint).toString());

          toast.success('Tokens approved successfully!');

          // Force UI update
          setTimeout(() => {
            setIsApproved(true);
          }, 500);
        } else {
          toast.error('Approval transaction failed!');
        }
      } catch (err) {
        console.error('Direct approval error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        toast.error('Approval failed', {
          description: errorMessage,
        });
      } finally {
        setIsApproving(false);
      }
    };

    return (
      <div className="mt-4 p-4 border-2 border-red-500 rounded-md bg-red-50 dark:bg-red-900/20">
        <h3 className="font-bold text-red-700 dark:text-red-400 mb-2">Emergency Token Approval</h3>
        <p className="text-sm mb-3">If the normal approval process isn't working, use this direct method:</p>

        <Button
          onClick={handleDirectApproval}
          disabled={isApproving || isLoadingToken}
          className="w-full bg-red-600 hover:bg-red-700 text-white"
        >
          {isApproving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Direct Token Approval...
            </>
          ) : isLoadingToken ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading Token Address...
            </>
          ) : (
            'Approve Tokens Directly'
          )}
        </Button>

        {error && <p className="text-xs text-red-600 mt-2 break-all">{error}</p>}

        <div className="text-xs mt-2">
          <div>
            <strong>Token:</strong> {tokenAddress || envTokenAddress || 'Loading...'}
          </div>
          <div>
            <strong>Spender:</strong> {compensationAddress}
          </div>
          {tokenAddress && envTokenAddress && tokenAddress.toLowerCase() !== envTokenAddress.toLowerCase() && (
            <div className="text-red-600 font-bold mt-1">⚠️ WARNING: Token address mismatch detected!</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 w-full">
      {/* Balance section - conditional rendering */}
      {address && compensationAddress && totalCost && (
        <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-muted/50 to-background pb-8">
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-primary" />
              Token Balance & Approval
            </CardTitle>
            <CardDescription>Your LED token balance and approval status</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <TokenBalanceCard
              address={address}
              spenderAddress={compensationAddress}
              requiredAmount={totalCost}
              onApprovalStatusChange={handleApprovalStatus}
            />

            <DirectTokenApproval />

            {!isApproved && totalCost && (
              <Alert className="mt-4 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <AlertTitle>Token Approval Required</AlertTitle>
                <AlertDescription className="flex flex-col">
                  <span>You need to approve the contract to spend your tokens before making a payment.</span>
                  <div className="flex items-center mt-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-amber-600 dark:text-amber-400 animate-bounce"
                    >
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <polyline points="19 12 12 19 5 12"></polyline>
                    </svg>
                    <span className="ml-2 font-medium">Look for the "Approve Tokens" button above</span>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </div>
      )}

      {/* Main payment section in two columns for larger screens */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Left column: Form */}
        <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Process Payment
            </CardTitle>
            <CardDescription>Pay for access to data records</CardDescription>
          </CardHeader>

          <CardContent className="p-6">
            {/* Status alerts */}
            {recordId && isAlreadyPaid && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-4"
              >
                <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertTitle>Already Paid</AlertTitle>
                  <AlertDescription>
                    This record has already been paid for. No further payment is required.
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}

            {paymentStatus === 'success' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-4"
              >
                <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertTitle>Payment Successful</AlertTitle>
                  <AlertDescription>
                    Your payment has been processed successfully. You now have access to the data.
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}

            {paymentStatus === 'error' && errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-4"
              >
                <Alert className="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <AlertTitle>Payment Failed</AlertTitle>
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              </motion.div>
            )}

            {recordId && !isAlreadyPaid && dataSize !== null && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-4"
              >
                <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <AlertTitle>Record Data Size</AlertTitle>
                  <AlertDescription>Detected data size: {dataSize.toString()} units</AlertDescription>
                </Alert>
              </motion.div>
            )}

            {/* Payment form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="recordId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Record ID</FormLabel>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter the record ID"
                            disabled={isFormLoading}
                            style={{ paddingLeft: '2.5rem' }}
                          />
                        </FormControl>
                      </div>
                      <FormDescription>The unique identifier of the data record</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="producerAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Producer Address</FormLabel>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="0x..."
                            disabled={isFormLoading}
                            style={{ paddingLeft: '2.5rem' }}
                          />
                        </FormControl>
                      </div>
                      <FormDescription>The Ethereum address of the data producer</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Display data size info field (read-only) */}
                <FormItem>
                  <div className="flex items-center justify-between mb-1">
                    <FormLabel>Data Size</FormLabel>
                    <span className="text-xs text-muted-foreground">
                      {isLoadingDataSize
                        ? 'Loading...'
                        : dataSize
                        ? `${dataSize.toString()} units`
                        : 'Enter record ID first'}
                    </span>
                  </div>
                  <Progress value={getProgressValue()} className="h-1 mb-2" />
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Coins className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input
                      type="text"
                      value={dataSize ? dataSize.toString() : ''}
                      disabled={true}
                      placeholder="Auto-detected from blockchain"
                      style={{ paddingLeft: '2.5rem' }}
                    />
                  </div>
                  <FormDescription>Size of the data in units (auto-detected)</FormDescription>
                </FormItem>

                <Button
                  type="submit"
                  className="w-full h-11 mt-2"
                  disabled={isFormLoading || isAlreadyPaid || !totalCost || !dataSize || !isApproved}
                >
                  {isFormLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isLoadingDataSize ? 'Loading data...' : isApproving ? 'Approving...' : 'Processing...'}
                    </>
                  ) : isAlreadyPaid ? (
                    'Already Paid'
                  ) : !isApproved && totalCost ? (
                    <>
                      <AlertCircle className="mr-2 h-4 w-4" />
                      Check Token Approval Section Above
                      <button
                        type="button"
                        className="text-xs underline ml-2 text-blue-500 hover:text-blue-700"
                        onClick={(e) => {
                          e.preventDefault();
                          forceRefreshApprovalStatus();
                        }}
                      >
                        Refresh Status
                      </button>
                    </>
                  ) : (
                    `Pay ${totalCost ? formatTokenAmount(totalCost, 18, 'LED') : '0 LED'}`
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </div>

        {/* Right column: Payment info */}
        <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              Payment Details
            </CardTitle>
            <CardDescription>Information about your payment</CardDescription>
          </CardHeader>

          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Cost breakdown */}
              <div>
                <h3 className="text-sm font-medium mb-3">Cost Breakdown</h3>
                <ul className="space-y-4">
                  <li className="flex items-center justify-between py-2 border-b">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-xs">1</span>
                      </div>
                      <span>Base Price</span>
                    </div>
                    <span className="font-medium">
                      {isParentLoading ? (
                        <Loader2 className="inline h-3 w-3 animate-spin mr-1" />
                      ) : unitPrice ? (
                        formatTokenAmount(unitPrice, 18, 'LED')
                      ) : (
                        'N/A'
                      )}
                    </span>
                  </li>

                  <li className="flex items-center justify-between py-2 border-b">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-xs">2</span>
                      </div>
                      <span>Service Fee</span>
                    </div>
                    <span className="font-medium">{serviceFee !== undefined ? `${serviceFee}%` : 'N/A'}</span>
                  </li>

                  <li className="flex items-center justify-between py-2 border-b">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-xs">3</span>
                      </div>
                      <span>Data Size</span>
                    </div>
                    <span className="font-medium">
                      {isLoadingDataSize ? (
                        <Loader2 className="inline h-3 w-3 animate-spin mr-1" />
                      ) : dataSize ? (
                        `${dataSize.toString()} units`
                      ) : (
                        'Not detected'
                      )}
                    </span>
                  </li>
                </ul>
              </div>

              <Separator />

              {/* Total amount */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Total Cost</span>
                  <span className="text-xl font-bold">
                    {isParentLoading || isLoadingDataSize ? (
                      <Loader2 className="inline h-4 w-4 animate-spin mr-1" />
                    ) : totalCost ? (
                      formatTokenAmount(totalCost, 18, 'LED')
                    ) : (
                      '0 LED'
                    )}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Network: {process.env.NEXT_PUBLIC_CHAIN_ID === '31337' ? 'Local Development' : 'Sepolia Testnet'}
                </p>
              </div>

              {/* Contract info */}
              <div className="bg-muted/30 rounded-lg p-4 text-xs space-y-2">
                <p className="flex items-center justify-between">
                  <span className="text-muted-foreground">Contract:</span>
                  <span className="font-mono">
                    {compensationAddress?.slice(0, 6)}...{compensationAddress?.slice(-4)}
                  </span>
                </p>
                <p className="flex items-center justify-between">
                  <span className="text-muted-foreground">Token:</span>
                  <span className="font-mono">
                    {process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS?.slice(0, 6)}...
                    {process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS?.slice(-4)}
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </div>
      </div>
    </div>
  );
}

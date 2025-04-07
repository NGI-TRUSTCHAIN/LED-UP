'use client';

import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CompensationDashboard } from '@/features/compensation/components';
import { RecentTransactions } from '@/features/compensation/components/RecentTransactions';
import { ProcessPaymentForm } from '@/features/compensation/components/ProcessPaymentForm';
import { ProtectedRoute } from '@/components/protected-route';
import { Toaster } from 'sonner';
import { Coins, History, ArrowRight, RefreshCcw, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useUnitPrice, useServiceFee } from '@/features/compensation/hooks/use-compensation';

export default function CompensationPage() {
  const { address, isConnected } = useAccount();

  // Fetch data for ProcessPaymentForm
  const { data: unitPrice, isLoading: isUnitPriceLoading } = useUnitPrice();
  const { data: serviceFee, isLoading: isServiceFeeLoading } = useServiceFee();
  const isPaymentDataLoading = isUnitPriceLoading || isServiceFeeLoading;

  // Debug log
  useEffect(() => {
    console.log('Compensation Page - Wallet connected:', isConnected);
    console.log('Compensation Page - Address:', address);
  }, [isConnected, address]);

  if (!isConnected || !address) {
    return (
      <div className="container max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <Alert variant="destructive" className="max-w-lg mx-auto">
          <AlertTitle className="flex items-center gap-2">
            <RefreshCcw className="h-4 w-4" /> Wallet Not Connected
          </AlertTitle>
          <AlertDescription>Please connect your wallet to access the compensation features.</AlertDescription>
          <Button className="mt-4 w-full">Connect Wallet</Button>
        </Alert>
      </div>
    );
  }

  return (
    <ProtectedRoute redirectTo="/auth/signin">
      <Toaster position="top-right" closeButton />
      <div className="bg-gradient-to-b from-background to-muted/20 min-h-screen">
        <div className="container max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:py-12 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 mb-2">
              <Coins className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold tracking-tight">Compensation Management</h1>
            </div>
            <p className="text-muted-foreground max-w-2xl">
              Manage payments, track your earnings, and withdraw funds from the LED-UP platform. View transaction
              history and monitor your compensation status.
            </p>
          </motion.div>

          <Tabs defaultValue="dashboard" className="space-y-8">
            <div className="border-b">
              <div className="flex justify-between">
                <TabsList className="bg-transparent h-12 p-0">
                  <TabsTrigger
                    value="dashboard"
                    className="data-[state=active]:bg-primary/5 data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-none border-b-2 border-transparent data-[state=active]:border-primary h-12 px-6"
                  >
                    <Coins className="mr-2 h-4 w-4" />
                    Dashboard
                  </TabsTrigger>
                  <TabsTrigger
                    value="process-payment"
                    className="data-[state=active]:bg-primary/5 data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-none border-b-2 border-transparent data-[state=active]:border-primary h-12 px-6"
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Process Payment
                  </TabsTrigger>
                  <TabsTrigger
                    value="history"
                    className="data-[state=active]:bg-primary/5 data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-none border-b-2 border-transparent data-[state=active]:border-primary h-12 px-6"
                  >
                    <History className="mr-2 h-4 w-4" />
                    Payment History
                  </TabsTrigger>
                </TabsList>

                <Button variant="outline" size="sm" className="hidden sm:flex">
                  Documentation <ArrowRight className="ml-2 h-3 w-3" />
                </Button>
              </div>
            </div>

            <TabsContent value="dashboard" className="mt-6 w-full">
              <CompensationDashboard />
            </TabsContent>

            <TabsContent value="process-payment" className="mt-6 w-full">
              <ProcessPaymentForm unitPrice={unitPrice} serviceFee={serviceFee} isLoading={isPaymentDataLoading} />
            </TabsContent>

            <TabsContent value="history" className="mt-6 w-full">
              <div className="w-full">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Recent Transactions</h2>
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <RefreshCcw className="mr-2 h-3 w-3" /> Refresh
                  </Button>
                </div>
                <RecentTransactions producerAddress={address} limit={10} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
}

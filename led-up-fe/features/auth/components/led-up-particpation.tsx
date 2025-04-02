'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RecordStatus, ConsentStatus } from '@/features/data-registry/types';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertCircle, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRegisterProducer } from '@/features/data-registry/hooks/use-data-registry';
import { useAccount } from 'wagmi';
import { useSigninFlow } from '../contexts/signin-flow-context';

interface LedUpParticipationProps {
  onPrevious: () => void;
  onNext: () => void;
  onRegister: (e: React.FormEvent) => void;
  isProcessing: boolean;
  showRoleDialog: boolean;
  setShowRoleDialog: (show: boolean) => void;
}

const LedUpParticipation = ({
  onPrevious,
  onNext,
  onRegister,
  isProcessing,
  showRoleDialog,
  setShowRoleDialog,
}: LedUpParticipationProps) => {
  const {
    status,
    consent,
    setStatus,
    setConsent,
    setIsProcessing,
    producerError,
    producerTransactionHash,
    producerIsSuccess,
    setProducerError,
    setProducerTransactionHash,
    setProducerIsSuccess,
  } = useSigninFlow();

  // Use wagmi hooks for wallet connection
  const { address, isConnected } = useAccount();

  // Use the registerProducer mutation hook
  const { mutate: registerProducer, isPending: isSubmitting } = useRegisterProducer();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProducerError('');
    setProducerTransactionHash(null);
    setProducerIsSuccess(false);

    if (!isConnected || !address) {
      setProducerError('Please connect your wallet first');
      return;
    }

    try {
      registerProducer(
        {
          status,
          consent,
        },
        {
          onSuccess: (data: any) => {
            setProducerIsSuccess(true);
            setProducerTransactionHash(data.hash || null);
            toast.success('Producer registered successfully', {
              description: `Transaction hash: ${data.hash}`,
            });
            // Call the parent's onRegister to handle authentication
            onRegister(e);
          },
          onError: (err) => {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            setProducerError(errorMessage);
            toast.error('Registration failed', {
              description: errorMessage,
            });
          },
        }
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setProducerError(errorMessage);
      toast.error('Error', {
        description: errorMessage,
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-none">
        <CardHeader>
          <CardTitle>Register Yourself as a Producer</CardTitle>
          <CardDescription>Register as a data producer in the LED-UP data registry</CardDescription>
        </CardHeader>

        <Alert className="mb-4 bg-primary/10 border-blue-200 text-primary dark:bg-blue-900/20 dark:border-primary">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <AlertTitle>Secure Registration</AlertTitle>
          <AlertDescription className="text-sm">
            This form uses your connected wallet to securely sign transactions. No private keys are required.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Record Status</Label>
                <Select
                  value={status.toString()}
                  onValueChange={(value) => setStatus(Number(value) as RecordStatus)}
                  disabled={isSubmitting || isProcessing}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={RecordStatus.Active.toString()}>Active</SelectItem>
                    <SelectItem value={RecordStatus.Inactive.toString()}>Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">The initial status of your producer record</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="consent">Consent Status</Label>
                <Select
                  value={consent?.toString() ?? ConsentStatus.NotSet.toString()}
                  onValueChange={(value) => setConsent(Number(value) as ConsentStatus)}
                  disabled={isSubmitting || isProcessing}
                >
                  <SelectTrigger id="consent">
                    <SelectValue placeholder="Select consent status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ConsentStatus.NotSet.toString()}>Not Set</SelectItem>
                    <SelectItem value={ConsentStatus.Allowed.toString()}>Allowed</SelectItem>
                    <SelectItem value={ConsentStatus.Denied.toString()}>Denied</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">Your consent for data sharing</p>
              </div>
            </div>

            {producerError && (
              <Alert
                variant="default"
                className="bg-red-50 border-red-200 text-red-300 dark:bg-red-900/30 dark:border-red-900 max-w-full overflow-x-auto"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{producerError}</AlertDescription>
              </Alert>
            )}

            {producerIsSuccess && producerTransactionHash && (
              <Alert className="bg-green-50 border-green-200 dark:bg-green-900 dark:border-green-800">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>
                  Producer registered successfully!
                  <div className="mt-2">
                    <p className="text-xs font-medium">Transaction Hash:</p>
                    <code className="text-xs bg-gray-100 p-1 rounded break-all">{producerTransactionHash}</code>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-between pt-4">
              <Button type="button" variant="outline" onClick={onPrevious}>
                <ChevronLeft className="mr-2 h-4 w-4" /> Previous
              </Button>
              <Button type="submit" disabled={isSubmitting || isProcessing || !isConnected}>
                {isSubmitting || isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    Register as Producer <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
};

export default LedUpParticipation;

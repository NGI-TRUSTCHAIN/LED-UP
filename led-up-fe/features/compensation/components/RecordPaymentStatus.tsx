'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useVerifyPayment } from '../hooks';
import { CreditCard, Check, XCircle, AlertTriangle } from 'lucide-react';

interface RecordPaymentStatusProps {
  recordId: string;
  onPayClick?: () => void;
  showPayButton?: boolean;
}

/**
 * Component to display the payment status for a specific data record
 */
export function RecordPaymentStatus({ recordId, onPayClick, showPayButton = true }: RecordPaymentStatusProps) {
  // Check if payment has been processed for this record
  const { data: isPaid, isLoading, error } = useVerifyPayment(recordId);

  // Handle pay button click
  const handlePayClick = () => {
    if (onPayClick) {
      onPayClick();
    }
  };

  // Determine the status to display
  const getStatusDisplay = () => {
    if (isLoading) {
      return (
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-24" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <span className="text-sm text-yellow-500">Error checking status</span>
        </div>
      );
    }

    if (isPaid) {
      return (
        <div className="flex items-center gap-2">
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 px-2 py-0.5 hover:bg-green-200 dark:hover:bg-green-800/30">
            <Check className="mr-1 h-3 w-3" />
            Paid
          </Badge>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <Badge variant="destructive" className="px-2 py-0.5">
          <XCircle className="mr-1 h-3 w-3" />
          Not Paid
        </Badge>
      </div>
    );
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/20 pb-4">
        <CardTitle className="text-base flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          Payment Status
        </CardTitle>
        <CardDescription>Record ID: {recordId}</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Payment Status:</span>
            {getStatusDisplay()}
          </div>
        </div>
      </CardContent>
      {showPayButton && !isPaid && !isLoading && (
        <CardFooter className="border-t bg-muted/10 pt-4">
          <Button onClick={handlePayClick} className="w-full" variant="secondary" disabled={isLoading || isPaid}>
            <CreditCard className="mr-2 h-4 w-4" />
            Pay for Access
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

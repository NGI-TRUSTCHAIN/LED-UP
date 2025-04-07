'use client';

import { useEffect } from 'react';
import { ProducerBalanceView } from './ProducerBalanceView';
import { SystemStatusCard } from './SystemStatusCard';
import { DashboardStats } from './DashboardStats';
import { RecentTransactions } from './RecentTransactions';
import { useServiceFee, useUnitPrice, useIsPaused, useMinimumWithdrawAmount } from '../hooks';

interface CompensationPageProps {
  producerAddress: `0x${string}`;
}

export function CompensationPage({ producerAddress }: CompensationPageProps) {
  // Debug log producer address
  useEffect(() => {
    console.log('Producer Address in CompensationPage:', producerAddress);
  }, [producerAddress]);

  // Use hooks with default configuration
  const { data: serviceFee } = useServiceFee();
  const { data: unitPrice } = useUnitPrice();
  const { data: isPaused } = useIsPaused();
  const { data: minimumWithdrawAmount } = useMinimumWithdrawAmount();

  return (
    <div className="space-y-6">
      {/* Dashboard Stats */}
      <DashboardStats producerAddress={producerAddress} />

      <div className="grid gap-6 md:grid-cols-2">
        {/* System Status */}
        <SystemStatusCard
          serviceFee={serviceFee}
          unitPrice={unitPrice}
          isPaused={isPaused}
          minimumWithdrawAmount={minimumWithdrawAmount}
          isLoading={false}
        />

        {/* Producer Balance */}
        <ProducerBalanceView producerAddress={producerAddress} />
      </div>

      {/* Recent Transactions */}
      <RecentTransactions producerAddress={producerAddress} limit={5} />
    </div>
  );
}

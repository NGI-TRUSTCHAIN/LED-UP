'use client';

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatTokenAmount } from '@/lib/utils';
import { Coins, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { useProducerBalance, usePaymentHistory } from '../hooks';
import { useState, useEffect } from 'react';

interface DashboardStatsProps {
  producerAddress: `0x${string}`;
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  isLoading?: boolean;
}

function StatCard({ title, value, icon, description, trend, isLoading }: StatCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {isLoading ? (
            <Skeleton className="h-8 w-24 mt-1" />
          ) : (
            <h3 className="text-2xl font-bold tracking-tight mt-1">{value}</h3>
          )}
        </div>
        <div className="rounded-full bg-primary/10 p-3">{icon}</div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{description}</p>
      {trend && !isLoading && (
        <div className="mt-3 flex items-center gap-1">
          <span
            className={`text-xs font-medium ${
              trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}
          >
            {trend.isPositive ? '+' : '-'}
            {Math.abs(trend.value)}%
          </span>
          <span className="text-xs text-muted-foreground">vs last period</span>
        </div>
      )}
    </Card>
  );
}

export function DashboardStats({ producerAddress }: DashboardStatsProps) {
  const { data: balance, isLoading: isBalanceLoading } = useProducerBalance(producerAddress);
  const { data: payments, isLoading: isPaymentsLoading } = usePaymentHistory(producerAddress);

  const [stats, setStats] = useState({
    totalEarnings: BigInt(0),
    pendingPayments: 0,
    successRate: 0,
    averageAmount: BigInt(0),
  });

  useEffect(() => {
    if (payments && payments.length > 0) {
      const total = payments.reduce((acc, payment) => acc + payment.amount, BigInt(0));
      const pending = payments.filter((p) => !p.success).length;
      const successful = payments.filter((p) => p.success).length;
      const rate = (successful / payments.length) * 100;
      const avg = total / BigInt(payments.length);

      setStats({
        totalEarnings: total,
        pendingPayments: pending,
        successRate: rate,
        averageAmount: avg,
      });
    }
  }, [payments]);

  const isLoading = isBalanceLoading || isPaymentsLoading;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Available Balance"
        value={formatTokenAmount(balance || BigInt(0), 18, 'LDTK')}
        icon={<Coins className="h-5 w-5 text-primary" />}
        description="Current available balance for withdrawal"
        isLoading={isLoading}
        trend={{ value: 12.5, isPositive: true }}
      />

      <StatCard
        title="Total Earnings"
        value={formatTokenAmount(stats.totalEarnings, 18, 'LDTK')}
        icon={<TrendingUp className="h-5 w-5 text-primary" />}
        description="Total earnings from all transactions"
        isLoading={isLoading}
        trend={{ value: 8.2, isPositive: true }}
      />

      <StatCard
        title="Pending Payments"
        value={stats.pendingPayments.toString()}
        icon={<Clock className="h-5 w-5 text-primary" />}
        description="Number of payments awaiting confirmation"
        isLoading={isLoading}
      />

      <StatCard
        title="Success Rate"
        value={`${stats.successRate.toFixed(1)}%`}
        icon={<AlertCircle className="h-5 w-5 text-primary" />}
        description="Transaction success rate"
        isLoading={isLoading}
        trend={{ value: 2.1, isPositive: true }}
      />
    </div>
  );
}

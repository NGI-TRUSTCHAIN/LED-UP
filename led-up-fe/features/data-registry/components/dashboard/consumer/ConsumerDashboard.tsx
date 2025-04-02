'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useContractRead } from 'wagmi';
import { DataRegistryABI } from '@/abi/data-registry.abi';
import { DidAuthABI } from '@/abi/did-auth.abi';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FileText, Clock, Eye, Download, History, Shield, ArrowUpRight, Activity, Lock, Share2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';

interface SharedRecord {
  id: string;
  name: string;
  type: string;
  sharedBy: string;
  sharedDate: string;
  status: string;
}

interface AccessHistory {
  id: string;
  recordName: string;
  accessType: string;
  timestamp: string;
  status: string;
}

const ConsumerDashboard: React.FC = () => {
  const { address } = useAccount();
  const router = useRouter();
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [sharedRecords, setSharedRecords] = useState<SharedRecord[]>([]);
  const [accessHistory, setAccessHistory] = useState<AccessHistory[]>([]);

  // Contract read hooks
  const { data: consumerDid } = useContractRead({
    address: process.env.NEXT_PUBLIC_DID_AUTH_ADDRESS as `0x${string}`,
    abi: DidAuthABI,
    functionName: 'getDidFromAddress',
    args: address ? [address] : undefined,
  });

  const { data: accessibleRecords } = useContractRead({
    address: process.env.NEXT_PUBLIC_DATA_REGISTRY_ADDRESS as `0x${string}`,
    abi: DataRegistryABI,
    functionName: 'getAccessibleRecords',
    args: consumerDid ? [consumerDid as string] : undefined,
  });

  // Load consumer data
  useEffect(() => {
    const loadConsumerData = async () => {
      try {
        // Mock data for demo
        setSharedRecords([
          {
            id: '1',
            name: 'Medical Report 2024',
            type: 'Health Record',
            sharedBy: 'Dr. Smith',
            sharedDate: '2024-03-20',
            status: 'Available',
          },
          {
            id: '2',
            name: 'Lab Results Q1',
            type: 'Lab Report',
            sharedBy: 'City Hospital',
            sharedDate: '2024-03-15',
            status: 'Available',
          },
        ]);

        setAccessHistory([
          {
            id: '1',
            recordName: 'Medical Report 2024',
            accessType: 'View',
            timestamp: '2 hours ago',
            status: 'Success',
          },
          {
            id: '2',
            recordName: 'Lab Results Q1',
            accessType: 'Download',
            timestamp: '1 day ago',
            status: 'Success',
          },
        ]);

        setIsPageLoading(false);
      } catch (error) {
        console.error('Error loading consumer data:', error);
        setIsPageLoading(false);
      }
    };

    loadConsumerData();
  }, []);

  // Enhanced stats with consistent colors
  const stats = [
    {
      title: 'Shared Records',
      value: accessibleRecords?.toString() || '0',
      icon: FileText,
      gradient: 'from-primary/50 to-primary',
      darkGradient: 'dark:from-primary dark:to-primary/50',
      ringColor: 'ring-primary/50 dark:ring-primary',
      iconColor: 'text-primary dark:text-primary',
    },
    {
      title: 'Recent Access',
      value: accessHistory.length.toString(),
      icon: Eye,
      gradient: 'from-emerald-500/50 to-emerald-500',
      darkGradient: 'dark:from-emerald-500 dark:to-emerald-500/50',
      ringColor: 'ring-emerald-500/50',
      iconColor: 'text-emerald-500 dark:text-emerald-400',
    },
    {
      title: 'Downloads',
      value: '5',
      icon: Download,
      gradient: 'from-violet-500/50 to-violet-500',
      darkGradient: 'dark:from-violet-500 dark:to-violet-500/50',
      ringColor: 'ring-violet-500/50',
      iconColor: 'text-violet-500 dark:text-violet-400',
    },
    {
      title: 'Access Level',
      value: 'Consumer',
      icon: Shield,
      gradient: 'from-amber-500/50 to-amber-500',
      darkGradient: 'dark:from-amber-500 dark:to-amber-500/50',
      ringColor: 'ring-amber-500/50',
      iconColor: 'text-amber-500 dark:text-amber-400',
    },
  ];

  return (
    <main className="container max-w-7xl mx-auto py-6 space-y-8 relative mb-12">
      {/* Header Section with Gradient Background */}
      <Card className="relative overflow-hidden rounded-lg bg-gradient-to-r from-muted to-muted/80 p-8 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-muted/10 to-muted/30 mix-blend-overlay"></div>
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2 text-foreground">Consumer Dashboard</h1>
              <p className="text-muted-foreground">View your shared records and access history</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Link href="/records/shared">
                <Button className="text-primary bg-primary/10 hover:bg-primary/20">
                  <Eye className="w-4 h-4 mr-1" />
                  View Records
                  <ArrowUpRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden">
            <div
              className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} ${stat.darkGradient} opacity-10`}
            ></div>
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                  <h3 className="text-2xl font-bold text-foreground">{stat.value}</h3>
                </div>
                <div
                  className={`p-3 rounded-full bg-background/80 backdrop-blur-sm ring-2 ring-offset-2 ${stat.ringColor}`}
                >
                  <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Shared Records Card */}
        <Card className="border-none shadow-lg">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-lg font-medium flex items-center text-foreground">
              <Share2 className="w-4 h-4 mr-2 text-primary" /> Shared Records
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {isPageLoading ? (
              <div className="animate-pulse space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-14 bg-muted rounded-lg"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {sharedRecords.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div className="bg-primary/10 text-primary p-2 rounded-lg">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-foreground">{record.name}</p>
                        <p className="text-xs text-muted-foreground">Shared by: {record.sharedBy}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={'outline'} className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary">
                        {record.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {record.sharedDate}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-3">
            <Button variant="ghost" className="text-sm text-primary hover:text-primary/80 hover:bg-primary/10">
              View all records →
            </Button>
          </CardFooter>
        </Card>

        {/* Access History Card */}
        <Card className="border-none shadow-lg">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-lg font-medium flex items-center text-foreground">
              <History className="w-4 h-4 mr-2 text-primary" /> Access History
            </CardTitle>
            <CardDescription>Your recent record access activity</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {accessHistory.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors gap-2"
                >
                  <div className="bg-primary/10 text-primary p-2 rounded-lg">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-foreground">{activity.recordName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={'outline'} className="text-xs px-2 py-1 rounded-full">
                        {activity.accessType}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                      <Badge
                        className={`text-xs px-2 py-1 rounded-full ${
                          activity.status === 'Success'
                            ? 'bg-green-100 text-green-700 dark:bg-green-500 dark:text-green-400 hover:bg-green-900'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 hover:bg-amber-900'
                        }`}
                      >
                        {activity.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Privacy Notice Card */}
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-medium flex items-center text-foreground">
            <Lock className="w-4 h-4 mr-2 text-primary" /> Privacy & Security
          </CardTitle>
          <CardDescription>Important information about your data access</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <div className="mt-1 w-2 h-2 rounded-full bg-primary"></div>
                <p className="text-sm text-muted-foreground">Your access to shared records is secure and tracked</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-1 w-2 h-2 rounded-full bg-emerald-500"></div>
                <p className="text-sm text-muted-foreground">
                  All data access is encrypted and compliant with privacy regulations
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <div className="mt-1 w-2 h-2 rounded-full bg-violet-500"></div>
                <p className="text-sm text-muted-foreground">
                  Contact your healthcare provider for questions about shared records
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-1 w-2 h-2 rounded-full bg-amber-500"></div>
                <p className="text-sm text-muted-foreground">Report any unauthorized access attempts immediately</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default ConsumerDashboard;

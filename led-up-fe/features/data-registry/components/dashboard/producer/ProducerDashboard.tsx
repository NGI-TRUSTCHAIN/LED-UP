'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useContractRead } from 'wagmi';
import { DataRegistryABI } from '@/abi/data-registry.abi';
import { DidAuthABI } from '@/abi/did-auth.abi';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Clock,
  ArrowUpRight,
  Activity,
  Settings,
  Share2,
  ChartBar,
  Sparkles,
  Plus,
  Eye,
  History,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';

interface ProducedRecord {
  id: string;
  name: string;
  type: string;
  createdDate: string;
  status: string;
  accessCount: number;
}

interface RecordActivity {
  id: string;
  recordName: string;
  action: string;
  timestamp: string;
  status: string;
}

const ProducerDashboard: React.FC = () => {
  const { address } = useAccount();
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [producedRecords, setProducedRecords] = useState<ProducedRecord[]>([]);
  const [recordActivities, setRecordActivities] = useState<RecordActivity[]>([]);

  // Contract read hooks
  const { data: producerDid } = useContractRead({
    address: process.env.NEXT_PUBLIC_DID_AUTH_ADDRESS as `0x${string}`,
    abi: DidAuthABI,
    functionName: 'getDidFromAddress',
    args: address ? [address] : undefined,
  });

  const { data: totalProducedRecords } = useContractRead({
    address: process.env.NEXT_PUBLIC_DATA_REGISTRY_ADDRESS as `0x${string}`,
    abi: DataRegistryABI,
    functionName: 'getProducerRecordCount',
    args: producerDid ? [producerDid as string] : undefined,
  });

  // Load producer data
  useEffect(() => {
    const loadProducerData = async () => {
      try {
        // Mock data for demo
        setProducedRecords([
          {
            id: '1',
            name: 'Patient Health Record',
            type: 'Medical Data',
            createdDate: '2024-03-20',
            status: 'Active',
            accessCount: 5,
          },
          {
            id: '2',
            name: 'Clinical Trial Data',
            type: 'Research Data',
            createdDate: '2024-03-15',
            status: 'Active',
            accessCount: 3,
          },
        ]);

        setRecordActivities([
          {
            id: '1',
            recordName: 'Patient Health Record',
            action: 'Record Created',
            timestamp: '2 hours ago',
            status: 'Success',
          },
          {
            id: '2',
            recordName: 'Clinical Trial Data',
            action: 'Access Granted',
            timestamp: '1 day ago',
            status: 'Success',
          },
        ]);

        setIsPageLoading(false);
      } catch (error) {
        console.error('Error loading producer data:', error);
        setIsPageLoading(false);
      }
    };

    loadProducerData();
  }, []);

  // Enhanced stats with consistent colors
  const stats = [
    {
      title: 'Total Records',
      value: totalProducedRecords?.toString() || '0',
      icon: FileText,
      gradient: 'from-primary/50 to-primary',
      darkGradient: 'dark:from-primary dark:to-primary/50',
      ringColor: 'ring-primary/50 dark:ring-primary',
      iconColor: 'text-primary dark:text-primary',
    },
    {
      title: 'Active Shares',
      value: '8',
      icon: Share2,
      gradient: 'from-emerald-500/50 to-emerald-500',
      darkGradient: 'dark:from-emerald-500 dark:to-emerald-500/50',
      ringColor: 'ring-emerald-500/50',
      iconColor: 'text-emerald-500 dark:text-emerald-400',
    },
    {
      title: 'Total Access',
      value: '15',
      icon: Eye,
      gradient: 'from-violet-500/50 to-violet-500',
      darkGradient: 'dark:from-violet-500 dark:to-violet-500/50',
      ringColor: 'ring-violet-500/50',
      iconColor: 'text-violet-500 dark:text-violet-400',
    },
    {
      title: 'Producer Status',
      value: 'Active',
      icon: ChartBar,
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
              <h1 className="text-3xl font-bold tracking-tight mb-2 text-foreground">Producer Dashboard</h1>
              <p className="text-muted-foreground">Manage and track your produced records</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Button className="bg-primary/10 hover:bg-primary/20 text-primary">
                <Plus className="w-4 h-4 mr-1" />
                Create Record
                <ArrowUpRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden hover:shadow-2xl hover:shadow-primary/20">
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
        {/* Produced Records Card */}
        <Card className="border-none shadow-lg">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-lg font-medium flex items-center text-foreground">
              <FileText className="w-4 h-4 mr-2 text-primary" /> Produced Records
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {isPageLoading ? (
              <div className="animate-pulse space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 bg-muted rounded-lg"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {producedRecords.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="bg-primary/10 text-primary p-2 rounded-lg">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-foreground">{record.name}</p>
                        <p className="text-xs text-muted-foreground">Type: {record.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={'outline'}
                        className={`text-xs px-3 py-1 rounded-full ${
                          record.status === 'Active'
                            ? 'bg-green-100 text-green-700 dark:bg-green-500 dark:text-green-400 hover:bg-green-900'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 hover:bg-amber-900'
                        } font-medium`}
                      >
                        {record.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {record.createdDate}
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

        {/* Quick Actions Card */}
        <Card className="border-none shadow-lg">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-lg font-medium flex items-center text-foreground">
              <Sparkles className="w-4 h-4 mr-2 text-primary" /> Quick Actions
            </CardTitle>
            <CardDescription>Common tasks and operations</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-4 grid-cols-2">
              <Button className="w-full justify-start bg-primary/10 hover:bg-primary/20 text-primary">
                <Plus className="w-4 h-4 mr-2" /> Create New Record
              </Button>
              <Button className="w-full justify-start bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <Share2 className="w-4 h-4 mr-2" /> Share Records
              </Button>
              <Button className="w-full justify-start bg-violet-500/10 hover:bg-violet-500/20 text-violet-600 dark:text-violet-400">
                <Settings className="w-4 h-4 mr-2" /> Manage Settings
              </Button>
              <Button className="w-full justify-start bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400">
                <History className="w-4 h-4 mr-2" /> View History
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Log Card */}
      <Card className="border-none shadow-lg">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-lg font-medium flex items-center text-foreground">
            <Activity className="w-4 h-4 mr-2 text-primary" /> Activity Log
          </CardTitle>
          <CardDescription>Recent actions and updates</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {recordActivities.map((activity, index) => (
              <div key={index} className="flex items-start p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="bg-primary/10 text-primary p-2 rounded-lg">
                  <Activity className="w-4 h-4" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-foreground">{activity.recordName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground">
                      {activity.action}
                    </span>
                    <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                    <Badge
                      variant={'outline'}
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
    </main>
  );
};

export default ProducerDashboard;

'use client';

import { useState, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import { useContractRead, useContractWrite } from 'wagmi';
import { ResourceType, AccessLevel } from '@/features/data-registry/types/contract/data-registry';
import { DataRegistryABI } from '@/abi/data-registry.abi';
import { DidAuthABI } from '@/abi/did-auth.abi';
import { CompensationABI } from '@/abi/compensation.abi';
import { formatEther } from 'viem';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Shield,
  Upload,
  Download,
  Clock,
  Lock,
  FileText,
  Activity,
  ArrowUpRight,
  Users,
  Settings,
  AlertTriangle,
  CheckCircle,
  Database,
  DollarSign,
  Network,
  History,
  User,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SystemRecord {
  id: string;
  type: string;
  status: string;
  timestamp: string;
  details: string;
}

interface ActivityRecord {
  action: string;
  time: string;
  type: string;
  status: string;
}

const AdminDashboard: React.FC = () => {
  const { address } = useAccount();
  const router = useRouter();
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [systemRecords, setSystemRecords] = useState<SystemRecord[]>([]);
  const [activities, setActivities] = useState<ActivityRecord[]>([]);

  // Contract read hooks
  const { data: adminDid } = useContractRead({
    address: process.env.NEXT_PUBLIC_DID_AUTH_ADDRESS as `0x${string}`,
    abi: DidAuthABI,
    functionName: 'getDidFromAddress',
    args: address ? [address] : undefined,
  });

  const { data: totalRecords } = useContractRead({
    address: process.env.NEXT_PUBLIC_DATA_REGISTRY_ADDRESS as `0x${string}`,
    abi: DataRegistryABI,
    functionName: 'getTotalRecords',
  });

  const { data: serviceFee } = useContractRead({
    address: process.env.NEXT_PUBLIC_COMPENSATION_ADDRESS as `0x${string}`,
    abi: CompensationABI,
    functionName: 'getServiceFee',
  });

  // Load system data
  useEffect(() => {
    const loadSystemData = async () => {
      try {
        // Mock data for demo
        setSystemRecords([
          {
            id: '1',
            type: 'Record Registration',
            status: 'Success',
            timestamp: '2024-03-15',
            details: 'Patient record registered',
          },
          {
            id: '2',
            type: 'Access Control',
            status: 'Pending',
            timestamp: '2024-03-14',
            details: 'Provider access request',
          },
        ]);

        setActivities([
          {
            action: 'New Provider Registration',
            time: '2 hours ago',
            type: 'System',
            status: 'Success',
          },
          {
            action: 'Record Access Update',
            time: '1 day ago',
            type: 'Security',
            status: 'Success',
          },
          {
            action: 'System Maintenance',
            time: '3 days ago',
            type: 'System',
            status: 'Completed',
          },
        ]);

        setIsPageLoading(false);
      } catch (error) {
        console.error('Error loading system data:', error);
        setIsPageLoading(false);
      }
    };

    loadSystemData();
  }, []);

  // Enhanced stats with consistent colors
  const stats = [
    {
      title: 'Total Users',
      value: totalRecords?.toString() || '0',
      icon: Users,
      gradient: 'from-primary/50 to-primary',
      darkGradient: 'dark:from-primary dark:to-primary/50',
      ringColor: 'ring-primary/50 dark:ring-primary',
      iconColor: 'text-primary dark:text-primary',
    },
    {
      title: 'Active Records',
      value: totalRecords?.toString() || '0',
      icon: FileText,
      gradient: 'from-emerald-500/50 to-emerald-500',
      darkGradient: 'dark:from-emerald-500 dark:to-emerald-500/50',
      ringColor: 'ring-emerald-500/50',
      iconColor: 'text-emerald-500 dark:text-emerald-400',
    },
    {
      title: 'System Health',
      value: '98%',
      icon: Activity,
      gradient: 'from-violet-500/50 to-violet-500',
      darkGradient: 'dark:from-violet-500 dark:to-violet-500/50',
      ringColor: 'ring-violet-500/50',
      iconColor: 'text-violet-500 dark:text-violet-400',
    },
    {
      title: 'Network Status',
      value: 'Optimal',
      icon: Network,
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
              <h1 className="text-3xl font-bold tracking-tight mb-2 text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground">Monitor and manage system operations</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Button className="text-primary bg-primary/10 hover:bg-primary/20">
                <Settings className="w-4 h-4 mr-1" />
                System Settings
                <ArrowUpRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden shadow-lg border">
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
        {/* System Records */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-medium flex items-center">
              <Database className="w-4 h-4 mr-2 text-muted-foreground" /> System Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isPageLoading ? (
              <div className="animate-pulse space-y-3">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-14 bg-gray-200 dark:bg-gray-800 dark:border dark:border-gray-700 rounded-md"
                  ></div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {systemRecords.map((record) => (
                  <div key={record.id} className="flex items-center justify-between border-b pb-3">
                    <div className="flex items-center gap-2">
                      <div className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary p-2 rounded">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium">{record.type}</p>
                        <p className="text-xs text-muted-foreground">{record.details}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-50 py-1 px-3 rounded-full">
                        {record.status}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {record.timestamp}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="link" className="text-sm text-primary hover:underline">
              View all records
            </Button>
          </CardFooter>
        </Card>

        {/* System Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center">
              <Settings className="w-4 h-4 mr-2" /> System Controls
            </CardTitle>
            <CardDescription>Manage system settings and controls</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button className="w-full justify-start" variant="outline">
                <Lock className="w-4 h-4 mr-2" /> Update Access Controls
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <DollarSign className="w-4 h-4 mr-2" /> Adjust Service Fees
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Shield className="w-4 h-4 mr-2" /> Security Settings
              </Button>
              <Button
                className="w-full justify-start text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-600"
                variant="outline"
              >
                <AlertTriangle className="w-4 h-4 mr-2" /> Emergency Controls
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Log */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium flex items-center">
            <Activity className="w-4 h-4 mr-2" /> System Activity
          </CardTitle>
          <CardDescription>Recent system activities and events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div key={index} className="flex items-start border-b last:border-b-0 pb-3 last:pb-0 gap-2">
                <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 py-1 px-2 rounded-full">
                      {activity.type}
                    </span>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                    <span
                      className={`text-xs ${
                        activity.status === 'Success'
                          ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-50'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-50'
                      } py-1 px-3 rounded-full`}
                    >
                      {activity.status}
                    </span>
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

export default AdminDashboard;

'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useContractRead } from 'wagmi';
import { DataRegistryABI } from '@/abi/data-registry.abi';
import { DidAuthABI } from '@/abi/did-auth.abi';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  FileText,
  Clock,
  Users,
  Shield,
  ArrowUpRight,
  Activity,
  Search,
  Settings,
  UserPlus,
  ClipboardList,
  Share2,
  UserCheck,
  Stethoscope,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';

interface PatientRecord {
  id: string;
  patientName: string;
  recordType: string;
  lastAccessed: string;
  status: string;
}

interface AccessRequest {
  id: string;
  patientName: string;
  recordType: string;
  requestDate: string;
  status: string;
}

const ProviderDashboard: React.FC = () => {
  const { address } = useAccount();
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [patientRecords, setPatientRecords] = useState<PatientRecord[]>([]);
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);

  // Contract read hooks
  const { data: providerDid } = useContractRead({
    address: process.env.NEXT_PUBLIC_DID_AUTH_ADDRESS as `0x${string}`,
    abi: DidAuthABI,
    functionName: 'getDidFromAddress',
    args: address ? [address] : undefined,
  });

  const { data: totalAccessibleRecords } = useContractRead({
    address: process.env.NEXT_PUBLIC_DATA_REGISTRY_ADDRESS as `0x${string}`,
    abi: DataRegistryABI,
    functionName: 'getProviderAccessibleRecords',
    args: providerDid ? [providerDid as string] : undefined,
  });

  // Load provider data
  useEffect(() => {
    const loadProviderData = async () => {
      try {
        // Mock data for demo
        setPatientRecords([
          {
            id: '1',
            patientName: 'John Doe',
            recordType: 'Medical History',
            lastAccessed: '2024-03-20',
            status: 'Active',
          },
          {
            id: '2',
            patientName: 'Jane Smith',
            recordType: 'Lab Results',
            lastAccessed: '2024-03-15',
            status: 'Active',
          },
        ]);

        setAccessRequests([
          {
            id: '1',
            patientName: 'Alice Johnson',
            recordType: 'Medical History',
            requestDate: '2 hours ago',
            status: 'Pending',
          },
          {
            id: '2',
            patientName: 'Bob Wilson',
            recordType: 'Treatment Plan',
            requestDate: '1 day ago',
            status: 'Approved',
          },
        ]);

        setIsPageLoading(false);
      } catch (error) {
        console.error('Error loading provider data:', error);
        setIsPageLoading(false);
      }
    };

    loadProviderData();
  }, []);

  // Enhanced stats with consistent colors
  const stats = [
    {
      title: 'Active Patients',
      value: '45',
      icon: Users,
      gradient: 'from-primary/50 to-primary',
      darkGradient: 'dark:from-primary dark:to-primary/50',
      ringColor: 'ring-primary/50 dark:ring-primary',
      iconColor: 'text-primary dark:text-primary',
    },
    {
      title: 'Accessible Records',
      value: totalAccessibleRecords?.toString() || '0',
      icon: FileText,
      gradient: 'from-emerald-500/50 to-emerald-500',
      darkGradient: 'dark:from-emerald-500 dark:to-emerald-500/50',
      ringColor: 'ring-emerald-500/50',
      iconColor: 'text-emerald-500 dark:text-emerald-400',
    },
    {
      title: 'Pending Requests',
      value: '3',
      icon: ClipboardList,
      gradient: 'from-amber-500/50 to-amber-500',
      darkGradient: 'dark:from-amber-500 dark:to-amber-500/50',
      ringColor: 'ring-amber-500/50',
      iconColor: 'text-amber-500 dark:text-amber-400',
    },
    {
      title: 'Provider Status',
      value: 'Licensed',
      icon: Shield,
      gradient: 'from-violet-500/50 to-violet-500',
      darkGradient: 'dark:from-violet-500 dark:to-violet-500/50',
      ringColor: 'ring-violet-500/50',
      iconColor: 'text-violet-500 dark:text-violet-400',
    },
  ];

  return (
    <main className="container max-w-7xl mx-auto py-6 space-y-8 relative mb-12">
      {/* Header Section with Gradient Background */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-muted to-muted/80 p-8 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-muted/10 to-muted/30 mix-blend-overlay"></div>
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2 text-muted-foreground">Provider Dashboard</h1>
              <p className="text-muted-foreground">Manage patient records and access requests</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Link href="/patients/search">
                <Button className="text-primary bg-primary/10 hover:bg-primary/20">
                  <Search className="w-4 h-4 mr-1" />
                  Find Patient
                  <ArrowUpRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden border-none shadow-lg">
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
        {/* Recent Patients Card */}
        <Card className="border-none shadow-lg">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-lg font-medium flex items-center text-foreground">
              <UserCheck className="w-4 h-4 mr-2 text-primary" /> Recent Patients
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
                {patientRecords.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div className="bg-primary/10 text-primary p-2 rounded-lg">
                        <Stethoscope className="w-4 h-4" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-foreground">{record.patientName}</p>
                        <p className="text-xs text-muted-foreground">{record.recordType}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={'outline'} className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary">
                        {record.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {record.lastAccessed}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>

          <CardFooter className="pt-3">
            <Button variant="ghost" className="text-sm text-primary hover:text-primary/80 hover:bg-primary/10">
              View all patients →
            </Button>
          </CardFooter>
        </Card>

        {/* Quick Actions Card */}
        <Card className="border-none shadow-lg">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-lg font-medium flex items-center text-foreground">
              <Settings className="w-4 h-4 mr-2 text-primary" /> Quick Actions
            </CardTitle>
            <CardDescription>Common provider tasks</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4">
              <Button className="w-full justify-start bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
                <UserPlus className="w-4 h-4 mr-2" /> Add New Patient
              </Button>
              <Button className="w-full justify-start bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white dark:text-emerald-400 dark:hover:text-white transition-colors">
                <Share2 className="w-4 h-4 mr-2" /> Request Access
              </Button>
              <Button className="w-full justify-start bg-amber-500/10 text-amber-600 hover:bg-amber-500 hover:text-white dark:text-amber-400 dark:hover:text-white transition-colors">
                <ClipboardList className="w-4 h-4 mr-2" /> View Requests
              </Button>
              <Button className="w-full justify-start bg-violet-500/10 text-violet-600 hover:bg-violet-500 hover:text-white dark:text-violet-400 dark:hover:text-white transition-colors">
                <Settings className="w-4 h-4 mr-2" /> Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Access Requests Card */}
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-medium flex items-center text-foreground">
            <Activity className="w-4 h-4 mr-2 text-primary" /> Access Requests
          </CardTitle>
          <CardDescription>Recent patient record access requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {accessRequests.map((request, index) => (
              <div
                key={index}
                className="flex items-start p-4 rounded-lg bg-muted/50 backdrop-blur-sm border border-border gap-2"
              >
                <div className="bg-primary/10 text-primary p-2 rounded-lg">
                  <ClipboardList className="w-4 h-4" />
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">{request.patientName}</p>
                    <span className="text-xs text-muted-foreground">{request.requestDate}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground">
                      {request.recordType}
                    </span>
                    <Badge
                      variant={'default'}
                      className={`text-xs px-2 py-1 rounded-full ${
                        request.status === 'Approved'
                          ? 'bg-green-100 text-green-700 dark:bg-green-500 dark:text-green-400 hover:bg-green-900'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 hover:bg-amber-900'
                      }`}
                    >
                      {request.status}
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

export default ProviderDashboard;

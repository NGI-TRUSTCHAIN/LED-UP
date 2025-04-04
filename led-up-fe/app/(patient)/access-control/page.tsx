'use client';

import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EnhancedPermissionDashboard } from '@/features/access-control/components/EnhancedPermissionDashboard';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Lock, UserCog, FileKey, Users, Settings } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

/**
 * Loading skeleton for the permission dashboard
 */
function PermissionDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96 mt-2" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <Skeleton className="h-12 w-full rounded-lg" />

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-72 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

/**
 * Access Control Page
 */
export default function AccessControlPage() {
  return (
    <div className="bg-gradient-to-b from-background to-muted/20 min-h-screen">
      <div className="container max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:py-12 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">Access Control</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Manage who can access your data and what actions they can perform. Configure permissions for individual
            users and resources to ensure secure data sharing.
          </p>
        </motion.div>

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="flex items-center p-2 rounded-full bg-primary/10"
            >
              <Settings className="h-5 w-5 text-primary" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="text-xl font-semibold"
            >
              Permission Management Dashboard
            </motion.h2>
          </div>
          <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
            Documentation <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <Card className="border bg-white/50 dark:bg-gray-900/50 hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-full">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-medium text-sm">User-Based</h3>
                <p className="text-sm text-muted-foreground">Control access by identity</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border bg-white/50 dark:bg-gray-900/50 hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-amber-100 dark:bg-amber-900/20 p-3 rounded-full">
                <FileKey className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="font-medium text-sm">Resource-Level</h3>
                <p className="text-sm text-muted-foreground">Manage access per record</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border bg-white/50 dark:bg-gray-900/50 hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-full">
                <Lock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-medium text-sm">Permission Types</h3>
                <p className="text-sm text-muted-foreground">Set granular permissions</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Separator className="my-8" />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-md overflow-hidden bg-background shadow-sm"
        >
          <Suspense fallback={<PermissionDashboardSkeleton />}>
            <EnhancedPermissionDashboard />
          </Suspense>
        </motion.div>
      </div>
    </div>
  );
}

'use client';

import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EnhancedPermissionDashboard } from '@/features/access-control/components/EnhancedPermissionDashboard';

/**
 * Loading skeleton for the permission dashboard
 */
function PermissionDashboardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-64 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Access Control Page
 */
export default function AccessControlPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Access Control</h1>
        <Button variant="outline">View Documentation</Button>
      </div>

      <div className="mb-6">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Granular Access Control</CardTitle>
            <CardDescription>
              Manage who can access your data and what actions they can perform. Configure permissions for individual
              users and resources to ensure secure data sharing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center p-4 border rounded-md">
                <div className="mr-4 bg-blue-100 p-2 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-blue-500"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">User-Based Permissions</h3>
                  <p className="text-sm text-gray-500">Manage access by user identity</p>
                </div>
              </div>
              <div className="flex items-center p-4 border rounded-md">
                <div className="mr-4 bg-green-100 p-2 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-green-500"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <line x1="10" y1="9" x2="8" y2="9" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Resource-Level Control</h3>
                  <p className="text-sm text-gray-500">Set permissions per data resource</p>
                </div>
              </div>
              <div className="flex items-center p-4 border rounded-md">
                <div className="mr-4 bg-purple-100 p-2 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-purple-500"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Action-Based Rules</h3>
                  <p className="text-sm text-gray-500">Control specific operations on data</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Suspense fallback={<PermissionDashboardSkeleton />}>
        <EnhancedPermissionDashboard />
      </Suspense>
    </div>
  );
}

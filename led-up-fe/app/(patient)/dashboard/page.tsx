'use client';

import { useAuth } from '@/features/auth/contexts/auth-provider';
import AdminDashboard from '@/features/data-registry/components/dashboard/admin/AdminDashboard';
import ConsumerDashboard from '@/features/data-registry/components/dashboard/consumer/ConsumerDashboard';
import ProducerDashboard from '@/features/data-registry/components/dashboard/producer/ProducerDashboard';
import ProviderDashboard from '@/features/data-registry/components/dashboard/provider/ProviderDashboard';
import { Toaster } from 'sonner';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const Page = () => {
  const { userRoles, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  // Render dashboards based on roles priority
  // Admin dashboard takes precedence if user has admin role
  if (userRoles.includes('ADMIN')) {
    return <AdminDashboard />;
  }

  // Render all applicable dashboards or default to Consumer
  return (
    <div className="space-y-8">
      {userRoles.includes('PROVIDER') && <ProviderDashboard />}
      {userRoles.includes('PRODUCER') && <ProducerDashboard />}
      {(userRoles.includes('CONSUMER') || userRoles.length === 0) && <ConsumerDashboard />}
    </div>
  );
};

export default Page;

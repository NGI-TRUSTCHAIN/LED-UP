'use client';

import HealthDashboard from '@/components/dashboard';
import { ProtectedRoute } from '@/components/protected-route';
import React from 'react';

const DashboardPage = () => {
  return (
    <ProtectedRoute redirectTo="/auth/signin">
      <HealthDashboard />
    </ProtectedRoute>
  );
};

export default DashboardPage;

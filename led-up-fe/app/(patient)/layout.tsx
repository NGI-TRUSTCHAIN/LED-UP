import { ProtectedRoute } from '@/components/protected-route';
import PatientRecordsLayout from '@/features/data-registry/components/patient-records/layout';
import React from 'react';
import { Toaster } from 'sonner';

const PatientLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProtectedRoute redirectTo="/auth/signin">
      <PatientRecordsLayout>
        {children}
        <Toaster />
      </PatientRecordsLayout>
    </ProtectedRoute>
  );
};

export default PatientLayout;

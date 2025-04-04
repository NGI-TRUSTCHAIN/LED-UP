'use client';

import { PatientRecordsPage } from '@/features/data-registry/components/patient-records';
import { ProtectedRoute } from '@/components/protected-route';
import React, { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

// Loading component
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-[70vh]">
    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
  </div>
);

// Error fallback
const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <div className="flex flex-col items-center justify-center h-[70vh] p-6 text-center">
    <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
    <p className="text-gray-700 dark:text-gray-300 mb-6 max-w-md">{error.message}</p>
    <button
      onClick={resetErrorBoundary}
      className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
    >
      Try again
    </button>
  </div>
);

const PatientRecordsWrapper = () => {
  return <PatientRecordsPage />;
};

const PatientRecordsRoute = () => {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.reload()}
      onError={(error) => {
        console.error('Patient Records Error:', error);
      }}
    >
      <ProtectedRoute redirectTo="/auth/signin">
        <Suspense fallback={<LoadingFallback />}>
          <PatientRecordsWrapper />
        </Suspense>
      </ProtectedRoute>
    </ErrorBoundary>
  );
};

export default PatientRecordsRoute;

// import { Header } from '@/components/header';
// import Sidebar from '@/components/sidebar';

// const PatientLayout = ({ children }: { children: React.ReactNode }) => {
//   return (
//     <div className="flex h-screen">
//       <Sidebar />
//       <main className="flex-1 flex flex-col">
//         <Header />

//         <div className="flex-1">{children}</div>
//       </main>
//     </div>
//   );
// };

// export default PatientLayout;

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

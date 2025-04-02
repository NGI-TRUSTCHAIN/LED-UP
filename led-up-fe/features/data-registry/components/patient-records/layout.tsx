'use client';

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/sidebar';
import DashboardHeader from '@/components/DashboardHeader';

interface PatientRecordsLayoutProps {
  children: React.ReactNode;
}

export default function PatientRecordsLayout({ children }: PatientRecordsLayoutProps) {
  const pathname = usePathname();
  const isHomePage = pathname === '/' || pathname === '/home';

  return (
    <div className="flex flex-col min-h-screen flex-1 ml-16">
      <DashboardHeader />
      {!isHomePage && <Sidebar />}
      <main className={`flex-1 ${!isHomePage ? 'ml-64' : ''}`}>{children}</main>
    </div>
  );
}

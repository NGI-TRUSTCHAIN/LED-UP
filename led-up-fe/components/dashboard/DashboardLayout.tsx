'use client';

/**
 * DashboardLayout.tsx
 *
 * A responsive layout component for the doctor dashboard that includes
 * a sidebar, header, and main content area.
 */
import React, { ReactNode, useState } from 'react';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';

interface DashboardLayoutProps {
  children: ReactNode;
}

/**
 * DashboardLayout component
 *
 * Provides a consistent layout structure for all dashboard pages with
 * responsive behavior for different screen sizes.
 *
 * @param {ReactNode} children - The main content to display in the dashboard
 */
const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - hidden on mobile by default */}
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content area */}
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        {/* Dashboard header */}
        <DashboardHeader onMenuClick={toggleSidebar} />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="container mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

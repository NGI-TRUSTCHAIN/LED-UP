'use client';

/**
 * DashboardSidebar.tsx
 *
 * Sidebar navigation component for the doctor dashboard that provides
 * access to different sections and features.
 */
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Home, Users, Calendar, FileText, BarChart2, MessageSquare, Settings, HelpCircle, X } from 'lucide-react';

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// Navigation items for the sidebar
const navItems = [
  {
    name: 'Dashboard',
    href: '/doctor-dashboard',
    icon: Home,
  },
  {
    name: 'Patients',
    href: '/doctor-dashboard/patients',
    icon: Users,
  },
  {
    name: 'Appointments',
    href: '/doctor-dashboard/appointments',
    icon: Calendar,
  },
  {
    name: 'Medical Records',
    href: '/doctor-dashboard/records',
    icon: FileText,
  },
  {
    name: 'Analytics',
    href: '/doctor-dashboard/analytics',
    icon: BarChart2,
  },
  {
    name: 'Messages',
    href: '/doctor-dashboard/messages',
    icon: MessageSquare,
  },
  {
    name: 'Settings',
    href: '/doctor-dashboard/settings',
    icon: Settings,
  },
  {
    name: 'Help & Support',
    href: '/doctor-dashboard/help',
    icon: HelpCircle,
  },
];

/**
 * DashboardSidebar component
 *
 * Provides navigation for the dashboard with responsive behavior.
 * On mobile, it appears as a slide-out drawer.
 * On desktop, it's a fixed sidebar.
 *
 * @param {boolean} isOpen - Whether the sidebar is open (for mobile view)
 * @param {Function} onClose - Handler to close the sidebar (for mobile view)
 */
const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();

  // Sidebar content shared between mobile and desktop views
  const sidebarContent = (
    <>
      <div className="px-3 py-4">
        <div className="mb-8 flex items-center px-2">
          <div className="text-2xl font-bold text-primary">MedCare</div>
        </div>
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={(e) => {
                  // Prevent navigation during development if the route doesn't exist yet
                  if (item.href !== '/doctor-dashboard') {
                    e.preventDefault();
                  }
                }}
              >
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start',
                    isActive ? 'bg-secondary text-secondary-foreground' : 'hover:bg-secondary/50'
                  )}
                >
                  <item.icon className="mr-2 h-5 w-5" />
                  {item.name}
                </Button>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile sidebar (drawer) */}
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="left" className="p-0 w-[280px]">
          <Button variant="ghost" size="icon" className="absolute right-4 top-4" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
          <ScrollArea className="h-full">{sidebarContent}</ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar (fixed) */}
      <div className="hidden md:block w-[280px] border-r border-border h-screen">
        <ScrollArea className="h-full">{sidebarContent}</ScrollArea>
      </div>
    </>
  );
};

export default DashboardSidebar;

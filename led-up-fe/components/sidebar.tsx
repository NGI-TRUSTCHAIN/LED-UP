'use client';

import React, { useState } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { Button } from './ui/button';
import {
  Home,
  Settings,
  LogOut,
  // Users,
  FileText,
  Trello,
  Hash,
  NotebookPen,
  CheckSquare,
  BarChart2,
  Shield,
  Database,
  Menu,
  X,
  Users,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { DashboardIcon } from '@radix-ui/react-icons';
import { useAuth } from '@/features/auth/contexts/auth-provider';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';

const patientLinks = [
  {
    label: 'Home',
    href: '/',
    icon: Home,
  },
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: DashboardIcon,
  },
  {
    label: 'Health Records',
    href: '/patient-records',
    icon: FileText,
  },
  {
    label: 'Compensation',
    href: '/compensation',
    icon: BarChart2,
  },
  {
    label: 'Access Control',
    href: '/access-control',
    icon: Shield,
  },
  {
    label: 'Verification',
    href: '/verification',
    icon: CheckSquare,
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

const providerLinks = [
  {
    label: 'Home',
    href: '/',
    icon: Home,
  },
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: DashboardIcon,
  },
  {
    label: 'Shared with me',
    href: '/shared-with-me',
    icon: Database,
  },
  {
    label: 'Compensation',
    href: '/compensation',
    icon: BarChart2,
  },
  {
    label: 'Access Control',
    href: '/access-control',
    icon: Shield,
  },
  {
    label: 'Verification',
    href: '/verification',
    icon: CheckSquare,
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

const Sidebar = () => {
  const { logout, userRoles } = useAuth();
  const role = userRoles[0];

  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const links = role === 'PROVIDER' || role === 'CONSUMER' ? providerLinks : patientLinks;

  const SidebarContent = ({ isMobile = false }) => (
    <>
      <Link
        href="/"
        className={cn(
          'text-2xl font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-2 p-1',
          isMobile ? 'w-full px-4' : 'flex-col'
        )}
      >
        <Image
          src="/logo.png"
          alt="LED-UP Logo"
          width={32}
          height={32}
          className="bg-gray-100/5 dark:bg-gray-100/40 rounded-xl"
        />
        {isMobile && <span className="text-lg">LED-UP</span>}
      </Link>
      <nav className={cn('flex flex-col', isMobile ? 'w-full px-2 space-y-1' : 'items-center space-y-6')}>
        {links.map((item) => {
          const isActive = pathname === item.href;

          if (isMobile) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  'hover:bg-primary/10 hover:text-primary',
                  isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          }

          return (
            <Tooltip key={item.href}>
              <TooltipTrigger
                asChild
                className={cn(
                  'hover:shadow-lg w-12 h-12 hover:bg-primary/10 hover:text-primary hover:border hover:border-b-4 hover:border-r-4 hover:border-primary/50 hover:border-b-primary rounded p-1 mx-1',
                  isActive &&
                    'bg-primary/10 text-primary border border-b-4 border-r-4 border-primary/50 border-b-primary'
                )}
              >
                <Link
                  href={item.href}
                  className={cn('text-muted-foreground flex items-center justify-center', isActive && 'text-primary')}
                >
                  <item.icon className="h-6 w-6" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          );
        })}
      </nav>

      {isMobile ? (
        <Button
          variant="ghost"
          onClick={logout}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 mt-auto text-sm font-medium',
            'text-destructive hover:bg-destructive/10'
          )}
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </Button>
      ) : (
        <Tooltip>
          <TooltipTrigger
            asChild
            className="self-end hover:shadow-lg w-12 h-12 hover:bg-destructive/10 hover:text-destructive hover:border hover:border-b-4 hover:border-r-4 hover:border-destructive/50 hover:border-b-destructive rounded p-1 mx-1"
          >
            <Button variant="ghost" size="icon" className="text-muted-foreground mt-auto" onClick={logout}>
              <LogOut className="h-6 w-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-destructive">
            Logout
          </TooltipContent>
        </Tooltip>
      )}
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed top-0 left-0 h-screen bg-gray-100 dark:bg-gray-800 flex-col items-center py-4 space-y-8 z-50">
        <SidebarContent />
      </aside>

      {/* Mobile Menu */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="bg-gray-100 dark:bg-gray-800">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 bg-gray-100 dark:bg-gray-800 w-64 flex flex-col">
            <div className="flex flex-col h-full py-4 space-y-4">
              <SidebarContent isMobile={true} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};

export default Sidebar;

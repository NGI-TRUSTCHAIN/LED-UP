import React from 'react';
import { Button } from './ui/button';
import { ChevronLeft, Bell } from 'lucide-react';
import { HeaderSearch } from './header-search';
import { AddRecordDropdown } from '@/features/data-registry/components/patient-records/AddRecordDropdown';
import { ModeToggle } from './mode-toggle';
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';

const DashboardHeader = () => {
  return (
    <header className="flex justify-between items-center mb-8 mt-2 mx-16">
      <Button variant="ghost" className="text-muted-foreground">
        <ChevronLeft className="h-5 w-5 mr-2" />
        Back
      </Button>
      <HeaderSearch />
      <div className="flex items-center gap-2">
        <AddRecordDropdown />
        <ModeToggle />

        <Tooltip>
          <TooltipTrigger asChild className="cursor-pointer relative">
            <Button variant="ghost" className="pl-3 pr-1">
              <Bell className="h-6 w-6 mr-2" />
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                9
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Notifications</TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
};

export default DashboardHeader;

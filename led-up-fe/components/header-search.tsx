'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronDown, Search } from 'lucide-react';
import { useId, useState } from 'react';

const pages = [
  {
    value: 'patient-records',
    label: 'Patient Records',
  },
  {
    value: 'health-records',
    label: 'Health Records',
  },
  {
    value: 'data-registry',
    label: 'Data Registry',
  },
  {
    value: 'notifications',
    label: 'Notifications',
  },
  {
    value: 'settings',
    label: 'Settings',
  },
];

function HeaderSearch() {
  const id = useId();
  const [open, setOpen] = useState<boolean>(false);
  const [value, setValue] = useState<string>('');

  return (
    <div className="space-y-2 min-w-[300px]">
      <Label htmlFor={id} className="sr-only">
        Select with search
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild className="hover:shadow-2xl hover:shadow-primary/20">
          <Button
            id={id}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="relative w-full justify-between bg-background px-10 font-normal outline-offset-0 hover:bg-background focus-visible:border-ring focus-visible:outline-[3px] focus-visible:outline-ring/20 rounded-full py-5 data-[state=open]:bg-background hover:border-primary hover:text-primary"
          >
            <span className={cn('truncate', !value && 'text-muted-foreground')}>
              {value ? pages.find((page) => page.value === value)?.label : 'Search ...'}
            </span>
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <ChevronDown
              size={16}
              strokeWidth={2}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 shrink-0 text-muted-foreground/80"
              aria-hidden="true"
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full min-w-[var(--radix-popper-anchor-width)] border-input p-0" align="start">
          <Command>
            <CommandInput placeholder="Search framework..." />
            <CommandList>
              <CommandEmpty>No framework found.</CommandEmpty>
              <CommandGroup>
                {pages.map((page) => (
                  <CommandItem
                    key={page.value}
                    value={page.value}
                    onSelect={(currentValue) => {
                      setValue(currentValue === value ? '' : currentValue);
                      setOpen(false);
                    }}
                  >
                    {page.label}
                    {value === page.value && <Check size={16} strokeWidth={2} className="ml-auto" />}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export { HeaderSearch };

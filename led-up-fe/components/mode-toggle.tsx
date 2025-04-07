'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function ModeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Ensure component is mounted to avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Handle theme toggle
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" className="rounded-full">
        <Sun className="h-[1.2rem] w-[1.2rem] opacity-0" />
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn(
        'rounded-full relative overflow-hidden',
        'border border-input hover:bg-accent hover:text-accent-foreground',
        'transition-colors duration-300'
      )}
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {/* Sun icon */}
      <Sun
        className={cn(
          'h-[1.2rem] w-[1.2rem] absolute inset-0 m-auto',
          'transition-all duration-500 ease-in-out',
          theme === 'dark' ? 'rotate-0 scale-100 text-yellow-400' : 'rotate-90 scale-0 text-yellow-400'
        )}
      />

      {/* Moon icon */}
      <Moon
        className={cn(
          'h-[1.2rem] w-[1.2rem] absolute inset-0 m-auto',
          'transition-all duration-500 ease-in-out',
          theme === 'light' ? 'rotate-0 scale-100 text-slate-900' : 'rotate-90 scale-0 text-slate-900'
        )}
      />
    </Button>
  );
}

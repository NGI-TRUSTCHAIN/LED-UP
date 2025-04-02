'use client';
import { ConnectKitButton } from 'connectkit';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { WalletIcon } from 'lucide-react';

type Mode = 'light' | 'dark' | 'auto';

export function ConnectButton({ className }: { className?: string }) {
  const { theme } = useTheme();

  const getMode = (theme: string): Mode => {
    switch (theme) {
      case 'light':
        return 'light';
      case 'dark':
        return 'dark';
      default:
        return 'auto';
    }
  };

  return (
    <div
      className={cn(
        'relative group flex items-center gap-2',
        'w-full md:w-auto',
        'overflow-hidden',
        'rounded-lg',
        'bg-gradient-to-br from-primary/80 via-primary to-primary/90',
        'p-[1px]', // Creates border effect with gradient
        'transition-all duration-300 ease-in-out',
        'hover:shadow-lg hover:shadow-primary/20',
        'hover:scale-[1.02]',
        className
      )}
    >
      {/* Animated background effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Button container */}
      <div className="relative bg-background/95 backdrop-blur-sm rounded-[7px] flex items-center px-3">
        <WalletIcon className="w-6 h-6" />
        <ConnectKitButton
          label="CONNECT TO LED-UP"
          mode={getMode(theme as string)}
          customTheme={{
            '--ck-connectbutton-background': 'transparent',
            '--ck-connectbutton-hover-background': 'transparent',
            '--ck-connectbutton-active-background': 'transparent',
            '--ck-connectbutton-border-radius': '0px',
          }}
        />
      </div>
    </div>
  );
}

export default ConnectButton;

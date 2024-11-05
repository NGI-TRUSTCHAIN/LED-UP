'use client';
import { ConnectKitButton } from 'connectkit';
import { color } from 'framer-motion';
import { useTheme } from 'next-themes';

type Mode = 'light' | 'dark' | 'auto';
const ConnectButton = () => {
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
    <div className="w-full md:w-auto border rounded-lg border-primary/40 flex items-center justify-center">
      <ConnectKitButton label="CONNECT TO LED-UP" mode={getMode(theme as string)} />
    </div>
  );
};

export default ConnectButton;

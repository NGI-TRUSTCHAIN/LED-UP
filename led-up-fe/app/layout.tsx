import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Web3Provider } from '@/components/web3-provider';
import { AuthProvider } from '@/features/auth/contexts/auth-provider';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { GlobalSearch } from '@/components/ui/search';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LED-UP - Blockchain-based File Sharing',
  description: 'Secure file sharing platform using blockchain and IPFS',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={`${inter.className} bg-background`} suppressHydrationWarning={true}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Web3Provider>
            <AuthProvider>
              <TooltipProvider>
                <Header />
                {children}
                <Footer />
                <Toaster />
                <GlobalSearch />
                <ReactQueryDevtools initialIsOpen={false} />
              </TooltipProvider>
            </AuthProvider>
          </Web3Provider>
        </ThemeProvider>
      </body>
    </html>
  );
}

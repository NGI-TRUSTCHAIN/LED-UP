import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Web3Provider } from '@/components/web3-provider';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LED-UP - Blockchain-based File Sharing',
  description: 'Secure file sharing platform using blockchain and IPFS',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={inter.className} suppressHydrationWarning={true}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Web3Provider>
            <Header />
            {children}
            <Footer />
          </Web3Provider>
        </ThemeProvider>
      </body>
    </html>
  );
}

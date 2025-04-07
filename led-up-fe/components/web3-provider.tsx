'use client';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { sepolia, hardhat } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConnectKitProvider, getDefaultConfig } from 'connectkit';
import { useEffect, useState } from 'react';

// Create a new query client for TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      retry: false,
      staleTime: 60 * 60 * 1000, // Consider data fresh for 1 hour (increased from 5 minutes)
      gcTime: 120 * 60 * 1000, // Cache for 2 hours (increased from 1 hour)
    },
  },
});

// Create Wagmi config using the latest v2 API
const config = createConfig(
  getDefaultConfig({
    // Define supported chains
    chains: [
      hardhat,
      sepolia,
      // mainnet (uncomment if needed)
    ],
    // Configure transports for each chain
    transports: {
      [hardhat.id]: http(process.env.NEXT_PUBLIC_RPC_URL || 'http://localhost:8545'),
      // [localhost.id]: http(process.env.NEXT_PUBLIC_RPC_URL || 'http://127.0.0.1:8545'),
      [sepolia.id]: http(`https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`),
      // [mainnet.id]: http(`https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`),
    },

    // WalletConnect configuration
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!,

    // App metadata
    appName: 'LED-UP Healthcare',
    appDescription: 'LED-UP Healthcare platform that provides secure file sharing.',
    appUrl: 'https://led-up-docs.vercel.app',
    appIcon: '/logo.png',
  })
);

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null; // or a loading spinner
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

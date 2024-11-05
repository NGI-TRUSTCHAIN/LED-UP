'use client';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { sepolia, mainnet } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConnectKitProvider, getDefaultConfig } from 'connectkit';

const config = createConfig(
  getDefaultConfig({
    chains: [
      sepolia,
      // mainnet
    ],
    transports: {
      // [mainnet.id]: http(`https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`),
      [sepolia.id]: http(`https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`),
    },

    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,

    appName: 'LED-UP Healthcare',
    appDescription: 'LED-UP Healthcare platform that provides secure file sharing.',
    appUrl: 'https://led-up-docs.vercel.app',
    appIcon: '/logo.png', // your app's icon, no bigger than 1024x1024px (max. 1MB)
  })
);

const queryClient = new QueryClient();

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

# Wagmi v2 with React Query and Server Actions in Next.js

## Introduction

This guide provides a comprehensive overview of integrating Wagmi v2 with React Query and Next.js Server Actions to build robust, type-safe blockchain applications. Wagmi v2 is a collection of React Hooks for Ethereum that makes it easy to "Connect Wallet," interact with contracts, sign messages, and much more.

## Table of Contents

1. [Setting Up Wagmi v2 in Next.js](#setting-up-wagmi-v2-in-next-js)
2. [Integrating TanStack Query](#integrating-tanstack-query)
3. [Using Server Actions with Wagmi](#using-server-actions-with-wagmi)
4. [Best Practices](#best-practices)
5. [Example: Compensation Contract Integration](#example-compensation-contract-integration)

## Setting Up Wagmi v2 in Next.js

### Installation

```bash
npm install wagmi viem@2.x @tanstack/react-query
# Optional: If you need wallet connection UI
npm install @rainbow-me/rainbowkit
```

### Basic Configuration

Create a Wagmi configuration file:

```typescript
// lib/wagmi.ts
import { http, createConfig } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';

export const config = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

// If you need a wallet client for write operations
export const walletClient = createWalletClient({
  chain: mainnet,
  transport: custom(window.ethereum),
});
```

### Setting Up Providers

Create a client component to wrap your application with the necessary providers:

```typescript
// app/providers.tsx
'use client';

import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '@/lib/wagmi';
import { useState } from 'react';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
```

### Hydration with Cookies

For proper server-side rendering, you'll need to handle hydration with cookies:

```typescript
// app/layout.tsx
import { headers } from 'next/headers';
import Providers from './providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const cookie = headers().get('cookie');

  return (
    <html lang="en">
      <body>
        <Providers cookie={cookie}>{children}</Providers>
      </body>
    </html>
  );
}
```

Update your providers component to use the cookie:

```typescript
// app/providers.tsx
'use client';

import { WagmiProvider, cookieToInitialState } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '@/lib/wagmi';
import { useState } from 'react';

export default function Providers({ children, cookie }: { children: React.ReactNode; cookie?: string | null }) {
  const [queryClient] = useState(() => new QueryClient());
  const initialState = cookieToInitialState(config, cookie);

  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
```

## Integrating TanStack Query

Wagmi v2 is built on top of TanStack Query (formerly React Query), which provides powerful data fetching, caching, and state management capabilities.

### Using Hooks

Wagmi provides hooks that leverage TanStack Query under the hood:

```typescript
'use client';

import { useReadContract, useWriteContract } from 'wagmi';
import { abi } from './abi';

function MyComponent() {
  // Read contract data
  const { data, isLoading, error } = useReadContract({
    address: '0x...',
    abi,
    functionName: 'balanceOf',
    args: ['0x...'],
  });

  // Write to contract
  const { writeContract, isPending, error: writeError } = useWriteContract();

  const handleWrite = () => {
    writeContract({
      address: '0x...',
      abi,
      functionName: 'transfer',
      args: ['0x...', 100n],
    });
  };

  return (
    <div>
      {isLoading ? 'Loading...' : `Balance: ${data}`}
      <button onClick={handleWrite} disabled={isPending}>
        {isPending ? 'Processing...' : 'Transfer'}
      </button>
    </div>
  );
}
```

### Custom Query Hooks

You can create custom hooks for specific contract interactions:

```typescript
// hooks/useTokenBalance.ts
'use client';

import { useReadContract } from 'wagmi';
import { tokenAbi } from '@/lib/abis';

export function useTokenBalance(tokenAddress: `0x${string}`, account: `0x${string}`) {
  return useReadContract({
    address: tokenAddress,
    abi: tokenAbi,
    functionName: 'balanceOf',
    args: [account],
    query: {
      // TanStack Query options
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchInterval: 30 * 1000, // 30 seconds
    },
  });
}
```

## Using Server Actions with Wagmi

Next.js Server Actions allow you to run code on the server from client components. When combined with Wagmi, they provide a powerful way to interact with blockchain data.

### Creating Server Actions

```typescript
// actions/contract.ts
'use server';

import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { abi } from '@/lib/abis';

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

export async function getTokenBalance(address: `0x${string}`, account: `0x${string}`) {
  try {
    const balance = await publicClient.readContract({
      address,
      abi,
      functionName: 'balanceOf',
      args: [account],
    });

    return { balance };
  } catch (error) {
    console.error('Error fetching token balance:', error);
    return { error: 'Failed to fetch token balance' };
  }
}
```

### Using Server Actions in Components

```typescript
// app/balance/page.tsx
'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { getTokenBalance } from '@/actions/contract';

export default function BalancePage() {
  const { address } = useAccount();
  const [balance, setBalance] = useState<bigint | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchBalance = async () => {
    if (!address) return;

    setLoading(true);
    try {
      const result = await getTokenBalance('0x...', address);
      if ('balance' in result) {
        setBalance(result.balance);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={fetchBalance} disabled={loading || !address}>
        {loading ? 'Loading...' : 'Fetch Balance'}
      </button>
      {balance !== null && <p>Balance: {balance.toString()}</p>}
    </div>
  );
}
```

### Server-Side Data Fetching

For server components, you can fetch data directly:

```typescript
// app/token/[address]/page.tsx
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { abi } from '@/lib/abis';

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

export default async function TokenPage({ params }: { params: { address: string } }) {
  const address = params.address as `0x${string}`;

  const [name, symbol, totalSupply] = await Promise.all([
    publicClient.readContract({
      address,
      abi,
      functionName: 'name',
    }),
    publicClient.readContract({
      address,
      abi,
      functionName: 'symbol',
    }),
    publicClient.readContract({
      address,
      abi,
      functionName: 'totalSupply',
    }),
  ]);

  return (
    <div>
      <h1>
        {name} ({symbol})
      </h1>
      <p>Total Supply: {totalSupply.toString()}</p>
    </div>
  );
}
```

## Best Practices

### 1. Separate Client and Server Code

Always keep client and server code separate. Use the "use client" directive only where necessary.

### 2. Handle Loading and Error States

Always handle loading and error states for a better user experience:

```typescript
'use client';

import { useReadContract } from 'wagmi';

function TokenInfo({ address }: { address: `0x${string}` }) {
  const { data, isLoading, error } = useReadContract({
    address,
    abi,
    functionName: 'name',
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>Token Name: {data}</div>;
}
```

### 3. Optimize Caching

Use TanStack Query's caching capabilities to reduce unnecessary network requests:

```typescript
const { data } = useReadContract({
  address,
  abi,
  functionName: 'balanceOf',
  args: [account],
  query: {
    staleTime: 30_000, // Data is fresh for 30 seconds
    cacheTime: 1000 * 60 * 5, // Keep in cache for 5 minutes
  },
});
```

### 4. Use Suspense for Loading States

Leverage React Suspense for cleaner loading states:

```typescript
// app/page.tsx
import { Suspense } from 'react';
import TokenInfo from '@/components/TokenInfo';

export default function Home() {
  return (
    <Suspense fallback={<div>Loading token info...</div>}>
      <TokenInfo address="0x..." />
    </Suspense>
  );
}
```

### 5. Revalidate Data

For server components, use Next.js revalidation to keep data fresh:

```typescript
// app/token/[address]/page.tsx
export const revalidate = 60; // Revalidate every 60 seconds
```

## Example: Compensation Contract Integration

Let's apply these concepts to integrate with a compensation contract:

### 1. Define Contract ABI and Address

```typescript
// lib/contract-addresses.ts
export function getCompensationContractAddress() {
  return process.env.NEXT_PUBLIC_COMPENSATION_CONTRACT_ADDRESS as `0x${string}`;
}

// features/compensation/abi.ts
export const compensationAbi = [
  // ABI definition here
] as const;
```

### 2. Create Server Actions for Contract Interactions

```typescript
// actions/compensation/mutation.ts
'use server';

import { createWalletClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { compensationAbi } from '@/features/compensation/abi';
import { getCompensationContractAddress } from '@/lib/contract-addresses';
import { privateKeyToAccount } from 'viem/accounts';

// For server-side transactions, you'd typically use a private key
// In production, use secure environment variables
const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);

const walletClient = createWalletClient({
  account,
  chain: mainnet,
  transport: http(),
});

export async function changeServiceFee(fee: bigint) {
  try {
    const contractAddress = getCompensationContractAddress();
    if (!contractAddress) {
      throw new Error('Compensation contract address not found');
    }

    const hash = await walletClient.writeContract({
      address: contractAddress,
      abi: compensationAbi,
      functionName: 'changeServiceFee',
      args: [fee],
    });

    const receipt = await walletClient.waitForTransactionReceipt({ hash });
    return { hash, receipt };
  } catch (error) {
    console.error('Error changing service fee', { error, fee });
    throw error;
  }
}

// Additional server actions for other contract functions...
```

### 3. Create Client Hooks for Contract Interactions

```typescript
// hooks/useCompensation.ts
'use client';

import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { compensationAbi } from '@/features/compensation/abi';
import { getCompensationContractAddress } from '@/lib/contract-addresses';
import { useState } from 'react';

export function useChangeServiceFee() {
  const contractAddress = getCompensationContractAddress();
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const changeServiceFee = (fee: bigint, account: `0x${string}`) => {
    if (!contractAddress) throw new Error('Contract address not found');

    writeContract({
      address: contractAddress,
      abi: compensationAbi,
      functionName: 'changeServiceFee',
      args: [fee],
      account,
    });
  };

  return {
    changeServiceFee,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

export function useServiceFee() {
  const contractAddress = getCompensationContractAddress();

  return useReadContract({
    address: contractAddress,
    abi: compensationAbi,
    functionName: 'serviceFee',
  });
}

// Additional hooks for other contract functions...
```

### 4. Create UI Components

```typescript
// components/ServiceFeeManager.tsx
'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useChangeServiceFee, useServiceFee } from '@/hooks/useCompensation';
import { parseUnits } from 'viem';

export default function ServiceFeeManager() {
  const { address } = useAccount();
  const [newFee, setNewFee] = useState('');
  const { data: currentFee, isLoading: isLoadingFee } = useServiceFee();
  const { changeServiceFee, isPending, isConfirming, isSuccess, error } = useChangeServiceFee();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !newFee) return;

    const feeInWei = parseUnits(newFee, 18);
    changeServiceFee(feeInWei, address);
  };

  return (
    <div>
      <h2>Service Fee Management</h2>

      {isLoadingFee ? (
        <p>Loading current fee...</p>
      ) : (
        <p>Current Fee: {currentFee ? (Number(currentFee) / 10 ** 18).toString() : 'N/A'}</p>
      )}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={newFee}
          onChange={(e) => setNewFee(e.target.value)}
          placeholder="New fee (ETH)"
          disabled={isPending || isConfirming}
        />
        <button type="submit" disabled={!address || isPending || isConfirming || !newFee}>
          {isPending ? 'Submitting...' : isConfirming ? 'Confirming...' : 'Change Fee'}
        </button>
      </form>

      {isSuccess && <p className="success">Fee updated successfully!</p>}
      {error && <p className="error">Error: {error.message}</p>}
    </div>
  );
}
```

### 5. Implement Server-Side Data Fetching

```typescript
// app/compensation/page.tsx
import { Suspense } from 'react';
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { compensationAbi } from '@/features/compensation/abi';
import { getCompensationContractAddress } from '@/lib/contract-addresses';
import ServiceFeeManager from '@/components/ServiceFeeManager';

// For static or server-side rendering
const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

async function CompensationStats() {
  const contractAddress = getCompensationContractAddress();

  if (!contractAddress) {
    return <div>Contract address not configured</div>;
  }

  const [serviceFee, isPaused, tokenAddress] = await Promise.all([
    publicClient.readContract({
      address: contractAddress,
      abi: compensationAbi,
      functionName: 'serviceFee',
    }),
    publicClient.readContract({
      address: contractAddress,
      abi: compensationAbi,
      functionName: 'paused',
    }),
    publicClient.readContract({
      address: contractAddress,
      abi: compensationAbi,
      functionName: 'tokenAddress',
    }),
  ]);

  return (
    <div>
      <h1>Compensation Contract Stats</h1>
      <p>Service Fee: {(Number(serviceFee) / 10 ** 18).toString()} ETH</p>
      <p>Status: {isPaused ? 'Paused' : 'Active'}</p>
      <p>Token Address: {tokenAddress}</p>
    </div>
  );
}

export default function CompensationPage() {
  return (
    <div>
      <Suspense fallback={<div>Loading contract stats...</div>}>
        <CompensationStats />
      </Suspense>

      <ServiceFeeManager />
    </div>
  );
}
```

## Conclusion

By combining Wagmi v2, React Query, and Next.js Server Actions, you can build powerful, type-safe blockchain applications with excellent user experiences. This approach provides:

1. **Type safety** throughout your application
2. **Efficient data fetching** with caching and revalidation
3. **Separation of concerns** between client and server code
4. **Improved performance** through server-side rendering and optimistic updates
5. **Better developer experience** with React hooks and TypeScript integration

Remember to always handle loading and error states appropriately, and consider the security implications of your implementation, especially when dealing with private keys and sensitive operations.

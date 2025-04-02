'use client';

import { Hex } from 'viem';
import { useWalletClient } from 'wagmi';
import { useMutation } from '@tanstack/react-query';
import { useSonner } from '@/hooks/use-sonner';

export const useSignData = () => {
  const { data: walletClient } = useWalletClient();
  const { toast } = useSonner();

  // Always call useMutation regardless of wallet state
  return useMutation({
    mutationKey: ['signData'],
    mutationFn: async (data: Hex | string) => {
      if (!walletClient) {
        toast.error('Wallet not connected');
        throw new Error('Wallet not connected');
      }
      return await walletClient.signMessage({ message: data });
    },
  });
};

// Create a hook for verification that can be used in components
export const useVerifySignature = () => {
  const { data: walletClient } = useWalletClient();
  const { toast } = useSonner();

  return useMutation({
    mutationKey: ['verifySignature'],
    mutationFn: async ({ signature, data }: { signature: string; data: any }) => {
      if (!walletClient) {
        toast.error('Wallet not connected');
        throw new Error('Wallet not connected');
      }

      // Implement proper verification logic here
      // This is just a placeholder - actual verification would compare signatures
      const verified = await walletClient.signMessage({ message: data });
      return verified === signature;
    },
  });
};

// if I have private key, how can I sign without using walletClient?
export async function signDataWithPrivateKey(data: any, privateKey: CryptoKey) {
  const signature = await crypto.subtle.sign('EdDSA', privateKey, data);
  return signature;
}

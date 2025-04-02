'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useSonner } from '@/hooks/use-sonner';
import { Loader2, Check, AlertCircle } from 'lucide-react';
import { formatTokenAmount } from '@/lib/utils';
import { useAccount } from 'wagmi';
import { usePublicClient, useWalletClient } from 'wagmi';
import { getContract, type Address } from 'viem';
import { erc20Abi } from 'abitype/abis';

interface TokenApprovalButtonProps {
  amount: bigint;
  spenderAddress?: Address; // Optional: the contract that will spend tokens
  tokenAddress?: Address; // Optional: the token contract address
  onApprovalSuccess?: () => void;
  onApprovalError?: (error: Error) => void;
  className?: string;
}

export function TokenApprovalButton({
  amount,
  spenderAddress,
  tokenAddress,
  onApprovalSuccess,
  onApprovalError,
  className = '',
}: TokenApprovalButtonProps) {
  const [approvalStatus, setApprovalStatus] = useState<'idle' | 'checking' | 'approving' | 'approved' | 'error'>(
    'idle'
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { toast } = useSonner();
  const { address: userAddress } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  // Use environment variables with fallbacks
  const contractSpender = spenderAddress || (process.env.NEXT_PUBLIC_COMPENSATION_CONTRACT_ADDRESS as Address);

  const contractToken = tokenAddress || (process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS as Address);

  const handleApproval = async () => {
    if (!userAddress || !contractSpender || !contractToken || !walletClient || !publicClient) {
      const error = new Error('Missing required parameters for token approval');
      setErrorMessage(error.message);
      onApprovalError?.(error);
      toast.error('Approval Error', {
        description: error.message,
      });
      return;
    }

    try {
      setApprovalStatus('checking');
      setErrorMessage(null);

      // Check current allowance
      const currentAllowance = await checkAllowance(userAddress, contractSpender, contractToken);

      // If allowance is already sufficient, consider it approved
      if (currentAllowance >= amount) {
        setApprovalStatus('approved');
        onApprovalSuccess?.();
        toast.success('Already Approved', {
          description: `You have already approved the required tokens`,
        });
        return;
      }

      // Set approval status to approving
      setApprovalStatus('approving');

      // Execute approval (using max uint256 value for unlimited approval)
      const maxApproval = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');

      const { request } = await publicClient.simulateContract({
        address: contractToken,
        abi: erc20Abi,
        functionName: 'approve',
        args: [contractSpender, maxApproval],
        account: userAddress,
      });

      const hash = await walletClient.writeContract(request);

      // Wait for transaction to be mined
      await publicClient.waitForTransactionReceipt({ hash });

      // Update status on success
      setApprovalStatus('approved');
      onApprovalSuccess?.();

      toast.success('Approval Successful', {
        description: `Successfully approved tokens for spending`,
      });
    } catch (error) {
      // Handle errors
      setApprovalStatus('error');
      const errorMsg = error instanceof Error ? error.message : 'An unknown error occurred';
      setErrorMessage(errorMsg);

      onApprovalError?.(error instanceof Error ? error : new Error(errorMsg));

      toast.error('Approval Failed', {
        description: errorMsg,
      });
    }
  };

  // Helper function to check current token allowance
  const checkAllowance = async (owner: Address, spender: Address, tokenAddress: Address): Promise<bigint> => {
    try {
      if (!publicClient) return BigInt(0);

      const allowance = await publicClient.readContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [owner, spender],
      });

      return allowance;
    } catch (error) {
      console.error('Error checking allowance:', error);
      return BigInt(0);
    }
  };

  // Determine button variant and content based on status
  const getButtonConfig = () => {
    switch (approvalStatus) {
      case 'checking':
        return {
          variant: 'secondary' as const,
          content: (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Checking Allowance...
            </>
          ),
          disabled: true,
        };
      case 'approving':
        return {
          variant: 'secondary' as const,
          content: (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Approving...
            </>
          ),
          disabled: true,
        };
      case 'approved':
        return {
          variant: 'outline' as const,
          content: (
            <>
              <Check className="mr-2 h-4 w-4 text-green-500" />
              Approved
            </>
          ),
          disabled: true,
        };
      case 'error':
        return {
          variant: 'destructive' as const,
          content: (
            <>
              <AlertCircle className="mr-2 h-4 w-4" />
              Retry Approval
            </>
          ),
          disabled: false,
        };
      default:
        return {
          variant: 'outline' as const,
          content: `Approve ${formatTokenAmount(amount, 18, 'LDTK')}`,
          disabled: false,
        };
    }
  };

  const { variant, content, disabled } = getButtonConfig();

  return (
    <Button
      variant={variant}
      onClick={handleApproval}
      disabled={disabled || !userAddress || !contractSpender || !contractToken}
      className={className}
    >
      {content}
    </Button>
  );
}

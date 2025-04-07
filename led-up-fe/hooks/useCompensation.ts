'use client';

import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import compensationAbi from '@/features/data-registry/abi/compensation.abi';
import { useState } from 'react';

// Get contract address from environment
const getCompensationContractAddress = (): `0x${string}` | undefined => {
  const address = process.env.NEXT_PUBLIC_COMPENSATION_CONTRACT_ADDRESS;
  return address as `0x${string}` | undefined;
};

/**
 * Hook for changing service fee
 * @returns Functions and state for changing service fee
 */
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

/**
 * Hook for getting service fee
 * @returns Service fee data and loading state
 */
export function useServiceFee() {
  const contractAddress = getCompensationContractAddress();

  return useReadContract({
    address: contractAddress,
    abi: compensationAbi,
    functionName: 'serviceFee',
  });
}

/**
 * Hook for changing token address
 * @returns Functions and state for changing token address
 */
export function useChangeTokenAddress() {
  const contractAddress = getCompensationContractAddress();
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const changeTokenAddress = (tokenAddress: `0x${string}`, account: `0x${string}`) => {
    if (!contractAddress) throw new Error('Contract address not found');

    writeContract({
      address: contractAddress,
      abi: compensationAbi,
      functionName: 'changeTokenAddress',
      args: [tokenAddress],
      account,
    });
  };

  return {
    changeTokenAddress,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

/**
 * Hook for getting token address
 * @returns Token address data and loading state
 */
export function useTokenAddress() {
  const contractAddress = getCompensationContractAddress();

  return useReadContract({
    address: contractAddress,
    abi: compensationAbi,
    functionName: 'tokenAddress',
  });
}

/**
 * Hook for changing unit price
 * @returns Functions and state for changing unit price
 */
export function useChangeUnitPrice() {
  const contractAddress = getCompensationContractAddress();
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const changeUnitPrice = (price: bigint, account: `0x${string}`) => {
    if (!contractAddress) throw new Error('Contract address not found');

    writeContract({
      address: contractAddress,
      abi: compensationAbi,
      functionName: 'changeUnitPrice',
      args: [price],
      account,
    });
  };

  return {
    changeUnitPrice,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

/**
 * Hook for getting unit price
 * @returns Unit price data and loading state
 */
export function useUnitPrice() {
  const contractAddress = getCompensationContractAddress();

  return useReadContract({
    address: contractAddress,
    abi: compensationAbi,
    functionName: 'unitPrice',
  });
}

/**
 * Hook for pausing service
 * @returns Functions and state for pausing service
 */
export function usePauseService() {
  const contractAddress = getCompensationContractAddress();
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const pauseService = (account: `0x${string}`) => {
    if (!contractAddress) throw new Error('Contract address not found');

    writeContract({
      address: contractAddress,
      abi: compensationAbi,
      functionName: 'pause',
      account,
    });
  };

  return {
    pauseService,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

/**
 * Hook for unpausing service
 * @returns Functions and state for unpausing service
 */
export function useUnpauseService() {
  const contractAddress = getCompensationContractAddress();
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const unpauseService = (account: `0x${string}`) => {
    if (!contractAddress) throw new Error('Contract address not found');

    writeContract({
      address: contractAddress,
      abi: compensationAbi,
      functionName: 'unpause',
      account,
    });
  };

  return {
    unpauseService,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

/**
 * Hook for checking if service is paused
 * @returns Paused state data and loading state
 */
export function usePaused() {
  const contractAddress = getCompensationContractAddress();

  return useReadContract({
    address: contractAddress,
    abi: compensationAbi,
    functionName: 'paused',
  });
}

/**
 * Hook for processing payment
 * @returns Functions and state for processing payment
 */
export function useProcessPayment() {
  const contractAddress = getCompensationContractAddress();
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const processPayment = (
    producer: `0x${string}`,
    recordId: string,
    dataSize: bigint,
    consumerDid: string,
    account: `0x${string}`
  ) => {
    if (!contractAddress) throw new Error('Contract address not found');

    writeContract({
      address: contractAddress,
      abi: compensationAbi,
      functionName: 'processPayment',
      args: [producer, recordId, dataSize, consumerDid],
      account,
    });
  };

  return {
    processPayment,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

/**
 * Hook for registering consumer
 * @returns Functions and state for registering consumer
 */
export function useRegisterConsumer() {
  const contractAddress = getCompensationContractAddress();
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const registerConsumer = (consumer: `0x${string}`, did: string, account: `0x${string}`) => {
    if (!contractAddress) throw new Error('Contract address not found');

    writeContract({
      address: contractAddress,
      abi: compensationAbi,
      functionName: 'registerConsumer',
      args: [consumer, did],
      account,
    });
  };

  return {
    registerConsumer,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

/**
 * Hook for checking if an address is a consumer
 * @param address The address to check
 * @returns Consumer state data and loading state
 */
export function useIsConsumer(address?: `0x${string}`) {
  const contractAddress = getCompensationContractAddress();

  return useReadContract({
    address: contractAddress,
    abi: compensationAbi,
    functionName: 'isConsumer',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });
}

/**
 * Hook for getting consumer DID
 * @param address The consumer address
 * @returns Consumer DID data and loading state
 */
export function useConsumerDid(address?: `0x${string}`) {
  const contractAddress = getCompensationContractAddress();

  return useReadContract({
    address: contractAddress,
    abi: compensationAbi,
    functionName: 'consumerDid',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });
}

/**
 * Hook for registering producer
 * @returns Functions and state for registering producer
 */
export function useRegisterProducer() {
  const contractAddress = getCompensationContractAddress();
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const registerProducer = (producer: `0x${string}`, did: string, account: `0x${string}`) => {
    if (!contractAddress) throw new Error('Contract address not found');

    writeContract({
      address: contractAddress,
      abi: compensationAbi,
      functionName: 'registerProducer',
      args: [producer, did],
      account,
    });
  };

  return {
    registerProducer,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

/**
 * Hook for removing producer
 * @returns Functions and state for removing producer
 */
export function useRemoveProducer() {
  const contractAddress = getCompensationContractAddress();
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const removeProducer = (producer: `0x${string}`, account: `0x${string}`) => {
    if (!contractAddress) throw new Error('Contract address not found');

    writeContract({
      address: contractAddress,
      abi: compensationAbi,
      functionName: 'removeProducer',
      args: [producer],
      account,
    });
  };

  return {
    removeProducer,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

/**
 * Hook for checking if an address is a producer
 * @param address The address to check
 * @returns Producer state data and loading state
 */
export function useIsProducer(address?: `0x${string}`) {
  const contractAddress = getCompensationContractAddress();

  return useReadContract({
    address: contractAddress,
    abi: compensationAbi,
    functionName: 'isProducer',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });
}

/**
 * Hook for getting producer DID
 * @param address The producer address
 * @returns Producer DID data and loading state
 */
export function useProducerDid(address?: `0x${string}`) {
  const contractAddress = getCompensationContractAddress();

  return useReadContract({
    address: contractAddress,
    abi: compensationAbi,
    functionName: 'producerDid',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });
}

/**
 * Hook for getting producer balance
 * @param address The producer address
 * @returns Producer balance data and loading state
 */
export function useProducerBalance(address?: `0x${string}`) {
  const contractAddress = getCompensationContractAddress();

  return useReadContract({
    address: contractAddress,
    abi: compensationAbi,
    functionName: 'producerBalance',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });
}

/**
 * Hook for withdrawing producer balance
 * @returns Functions and state for withdrawing producer balance
 */
export function useWithdrawProducerBalance() {
  const contractAddress = getCompensationContractAddress();
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const withdrawProducerBalance = (amount: bigint, account: `0x${string}`) => {
    if (!contractAddress) throw new Error('Contract address not found');

    writeContract({
      address: contractAddress,
      abi: compensationAbi,
      functionName: 'withdrawProducerBalance',
      args: [amount],
      account,
    });
  };

  return {
    withdrawProducerBalance,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

/**
 * Hook for getting service fee balance
 * @returns Service fee balance data and loading state
 */
export function useServiceFeeBalance() {
  const contractAddress = getCompensationContractAddress();

  return useReadContract({
    address: contractAddress,
    abi: compensationAbi,
    functionName: 'serviceFeeBalance',
  });
}

/**
 * Hook for withdrawing service fee
 * @returns Functions and state for withdrawing service fee
 */
export function useWithdrawServiceFee() {
  const contractAddress = getCompensationContractAddress();
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const withdrawServiceFee = (amount: bigint, account: `0x${string}`) => {
    if (!contractAddress) throw new Error('Contract address not found');

    writeContract({
      address: contractAddress,
      abi: compensationAbi,
      functionName: 'withdrawServiceFee',
      args: [amount],
      account,
    });
  };

  return {
    withdrawServiceFee,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

/**
 * Hook for getting minimum withdraw amount
 * @returns Minimum withdraw amount data and loading state
 */
export function useMinimumWithdrawAmount() {
  const contractAddress = getCompensationContractAddress();

  return useReadContract({
    address: contractAddress,
    abi: compensationAbi,
    functionName: 'minimumWithdrawAmount',
  });
}

/**
 * Hook for setting minimum withdraw amount
 * @returns Functions and state for setting minimum withdraw amount
 */
export function useSetMinimumWithdrawAmount() {
  const contractAddress = getCompensationContractAddress();
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const setMinimumWithdrawAmount = (amount: bigint, account: `0x${string}`) => {
    if (!contractAddress) throw new Error('Contract address not found');

    writeContract({
      address: contractAddress,
      abi: compensationAbi,
      functionName: 'setMinimumWithdrawAmount',
      args: [amount],
      account,
    });
  };

  return {
    setMinimumWithdrawAmount,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

/**
 * Hook for getting DID Auth address
 * @returns DID Auth address data and loading state
 */
export function useDidAuthAddress() {
  const contractAddress = getCompensationContractAddress();

  return useReadContract({
    address: contractAddress,
    abi: compensationAbi,
    functionName: 'didAuthAddress',
  });
}

/**
 * Hook for updating DID Auth address
 * @returns Functions and state for updating DID Auth address
 */
export function useUpdateDidAuthAddress() {
  const contractAddress = getCompensationContractAddress();
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const updateDidAuthAddress = (didAuthAddress: `0x${string}`, account: `0x${string}`) => {
    if (!contractAddress) throw new Error('Contract address not found');

    writeContract({
      address: contractAddress,
      abi: compensationAbi,
      functionName: 'updateDidAuthAddress',
      args: [didAuthAddress],
      account,
    });
  };

  return {
    updateDidAuthAddress,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

/**
 * Hook for getting owner address
 * @returns Owner address data and loading state
 */
export function useOwner() {
  const contractAddress = getCompensationContractAddress();

  return useReadContract({
    address: contractAddress,
    abi: compensationAbi,
    functionName: 'owner',
  });
}

/**
 * Hook for transferring ownership
 * @returns Functions and state for transferring ownership
 */
export function useTransferOwnership() {
  const contractAddress = getCompensationContractAddress();
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const transferOwnership = (newOwner: `0x${string}`, account: `0x${string}`) => {
    if (!contractAddress) throw new Error('Contract address not found');

    writeContract({
      address: contractAddress,
      abi: compensationAbi,
      functionName: 'transferOwnership',
      args: [newOwner],
      account,
    });
  };

  return {
    transferOwnership,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

/**
 * Hook for renouncing ownership
 * @returns Functions and state for renouncing ownership
 */
export function useRenounceOwnership() {
  const contractAddress = getCompensationContractAddress();
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const renounceOwnership = (account: `0x${string}`) => {
    if (!contractAddress) throw new Error('Contract address not found');

    writeContract({
      address: contractAddress,
      abi: compensationAbi,
      functionName: 'renounceOwnership',
      account,
    });
  };

  return {
    renounceOwnership,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useChangeServiceFee, useServiceFee } from '@/hooks/useCompensation';
import { parseUnits, formatUnits } from 'viem';

export default function ServiceFeeManager() {
  const { address } = useAccount();
  const [newFee, setNewFee] = useState('');
  const { data: currentFee, isLoading: isLoadingFee } = useServiceFee();
  const { changeServiceFee, isPending, isConfirming, isSuccess, error } = useChangeServiceFee();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !newFee) return;

    try {
      const feeInWei = parseUnits(newFee, 18);
      changeServiceFee(feeInWei, address);
    } catch (error) {
      console.error('Error parsing fee:', error);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">Service Fee Management</h2>

      {isLoadingFee ? (
        <p className="text-gray-500">Loading current fee...</p>
      ) : (
        <p className="mb-4">
          <span className="font-semibold">Current Fee:</span>{' '}
          {currentFee ? formatUnits(currentFee as bigint, 18) : 'N/A'} ETH
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="fee" className="block text-sm font-medium text-gray-700">
            New Fee (ETH)
          </label>
          <input
            id="fee"
            type="text"
            value={newFee}
            onChange={(e) => setNewFee(e.target.value)}
            placeholder="e.g. 0.01"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            disabled={isPending || isConfirming}
          />
        </div>

        <button
          type="submit"
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            !address || isPending || isConfirming || !newFee
              ? 'bg-indigo-300 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
          }`}
          disabled={!address || isPending || isConfirming || !newFee}
        >
          {isPending ? 'Submitting...' : isConfirming ? 'Confirming...' : 'Change Fee'}
        </button>
      </form>

      {isSuccess && <div className="mt-4 p-2 bg-green-100 text-green-800 rounded">Fee updated successfully!</div>}

      {error && <div className="mt-4 p-2 bg-red-100 text-red-800 rounded">Error: {error.message}</div>}

      {!address && (
        <div className="mt-4 p-2 bg-yellow-100 text-yellow-800 rounded">
          Please connect your wallet to change the service fee.
        </div>
      )}
    </div>
  );
}

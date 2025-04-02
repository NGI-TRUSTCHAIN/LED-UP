# Frontend Integration Plan for Data Registry and Compensation

This document outlines the comprehensive plan for integrating the DataRegistry and Compensation smart contracts with the frontend application. We'll use viem and wagmi libraries for blockchain interactions, replacing any existing ethers.js implementations.

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Smart Contract Integration](#smart-contract-integration)
4. [Frontend Components](#frontend-components)
5. [Implementation Tasks](#implementation-tasks)
6. [Testing Strategy](#testing-strategy)

## System Overview

The system integrates two main smart contracts:

1. **DataRegistry1**: Manages data records for health information with DID-based authentication
2. **Compensation1**: Handles payments for data access and distribution of funds to data producers

These contracts interact with the existing DID infrastructure (DidRegistry, DidAuth1) which provides authentication and authorization.

## Architecture

We'll implement the following architecture for the frontend integration:

```
frontend/
├── features/
│   ├── data-registry/           # Existing DataRegistry feature (to be updated)
│   │   ├── actions/
│   │   │   ├── mutation.ts      # DataRegistry contract write functions
│   │   │   └── query.ts         # DataRegistry contract read functions
│   │   ├── components/          # UI components
│   │   ├── hooks/               # React hooks for DataRegistry
│   │   └── types/               # TypeScript type definitions
│   │
│   └── compensation/            # New Compensation feature (to be created)
│       ├── actions/
│       │   ├── mutation.ts      # Compensation contract write functions
│       │   └── query.ts         # Compensation contract read functions
│       ├── components/          # UI components
│       ├── hooks/               # React hooks for Compensation
│       └── types/               # TypeScript type definitions
│
├── abi/                        # Contract ABIs
│   ├── data-registry.abi.ts     # Updated DataRegistry ABI
│   └── compensation.abi.ts      # Compensation ABI
│
└── utils/                       # Utility functions
    └── contract-interaction.ts  # Contract interaction helpers
```

## Smart Contract Integration

### 1. ABI Files

First, we need to create/update the ABI files for both contracts:

```typescript
// compensation.abi.ts
export const CompensationABI = [...] // ABI from Compensation1.sol

// data-registry.abi.ts
export const DataRegistryABI = [...] // Updated ABI from DataRegistry1.sol
```

### 2. Contract Types

Update types to include Compensation specific types:

```typescript
// features/compensation/types/index.ts
export interface Payment {
  amount: bigint;
  isPayed: boolean;
}

export enum CompensationActions {
  ProcessPayment = 'processPayment',
  VerifyPayment = 'verifyPayment',
  WithdrawProducerBalance = 'withdrawProducerBalance',
  WithdrawServiceFee = 'withdrawServiceFee',
  RemoveProducer = 'removeProducer',
  ChangeServiceFee = 'changeServiceFee',
  ChangeUnitPrice = 'changeUnitPrice',
  SetMinimumWithdrawAmount = 'setMinimumWithdrawAmount',
  ChangeTokenAddress = 'changeTokenAddress',
  PauseService = 'pauseService',
  UnpauseService = 'unpauseService',
}

export interface ProcessPaymentParams {
  producer: string;
  recordId: string;
  dataSize: number;
  consumerDid: string;
}

export interface WithdrawBalanceParams {
  amount: bigint;
}
```

## Frontend Components

### 1. DataRegistry Components (Update Existing)

The existing DataRegistry components need to be updated to use viem/wagmi:

- `DataRegistryPage.tsx` - Main page for data registry interactions
- `RegisterProducerForm.tsx` - Form for registering producers
- `ProducerRecordsList.tsx` - List of producer records
- `RecordDetailsView.tsx` - Detailed view of a record

### 2. Compensation Components (New)

Create new components for the Compensation contract:

- `CompensationPage.tsx` - Main page for compensation
- `ProcessPaymentForm.tsx` - Form for processing payments
- `ProducerBalanceView.tsx` - View for checking producer balances
- `WithdrawFundsForm.tsx` - Form for withdrawing balances
- `AdminControlPanel.tsx` - Admin operations for service fees, etc.

## Implementation Tasks

### 1. DataRegistry Contract Integration Updates

1. **Update ABIs**:

   - Update the DataRegistry ABI to match DataRegistry1.sol

2. **Update Mutation Actions**:

   - Update the existing `mutation.ts` to support new methods from DataRegistry1

3. **Update Query Actions**:

   - Update `query.ts` with new read methods from DataRegistry1

4. **Update React Hooks**:
   - Refactor hooks to use viem/wagmi instead of ethers
   - Add new hooks for new contract functionality

### 2. Compensation Contract Integration

1. **Create Compensation ABI**:

   - Extract ABI from Compensation1.sol

2. **Create Compensation Mutation Actions**:

```typescript
// compensation/actions/mutation.ts
export async function processPayment(params: ProcessPaymentParams): Promise<ContractWriteResponse> {
  return withContractWrite(
    async () => {
      // Validate parameters
      if (!params.producer) throw new Error('Producer address is required');
      if (!params.recordId) throw new Error('Record ID is required');
      if (params.dataSize <= 0) throw new Error('Data size must be greater than 0');
      if (!params.consumerDid) throw new Error('Consumer DID is required');

      // Check if the contract is paused
      await validateContractConditions(ContractName.Compensation);

      // Prepare request
      return prepareContractWriteRequest(
        'processPayment',
        [params.producer, params.recordId, params.dataSize, params.consumerDid],
        ContractName.Compensation
      );
    },
    { contractName: ContractName.Compensation }
  );
}

export async function withdrawProducerBalance(amount: bigint): Promise<ContractWriteResponse> {
  return withContractWrite(
    async () => {
      // Validate parameters
      if (amount <= 0n) throw new Error('Amount must be greater than 0');

      // Check if the contract is paused
      await validateContractConditions(ContractName.Compensation);

      // Prepare request
      return prepareContractWriteRequest('withdrawProducerBalance', [amount], ContractName.Compensation);
    },
    { contractName: ContractName.Compensation }
  );
}

// Add similar functions for other write operations
```

3. **Create Compensation Query Actions**:

```typescript
// compensation/actions/query.ts
export async function verifyPayment(recordId: string): Promise<boolean> {
  try {
    const publicClient = getPublicClient();
    const result = await publicClient.readContract({
      address: defaultConfig.compensationContractAddress,
      abi: CompensationABI,
      functionName: 'verifyPayment',
      args: [recordId],
    });

    return result as boolean;
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw new Error('Failed to verify payment');
  }
}

export async function getProducerBalance(producer?: string): Promise<bigint> {
  try {
    const publicClient = getPublicClient();

    // If no producer is provided, use the getProducerBalance() function (no args)
    if (!producer) {
      const result = await publicClient.readContract({
        address: defaultConfig.compensationContractAddress,
        abi: CompensationABI,
        functionName: 'getProducerBalance',
        args: [],
      });
      return result as bigint;
    }

    // Otherwise use getProducerBalance(address)
    const result = await publicClient.readContract({
      address: defaultConfig.compensationContractAddress,
      abi: CompensationABI,
      functionName: 'getProducerBalance',
      args: [producer],
    });
    return result as bigint;
  } catch (error) {
    console.error('Error getting producer balance:', error);
    throw new Error('Failed to get producer balance');
  }
}

// Add similar functions for other read operations
```

4. **Create Compensation React Hooks**:

```typescript
// compensation/hooks/use-compensation.ts
export function useVerifyPayment(recordId?: string) {
  return useQuery({
    queryKey: ['verifyPayment', recordId],
    queryFn: () => (recordId ? verifyPayment(recordId) : Promise.resolve(false)),
    enabled: !!recordId,
  });
}

export function useProducerBalance(producer?: string) {
  return useQuery({
    queryKey: ['producerBalance', producer],
    queryFn: () => getProducerBalance(producer),
  });
}

export function useProcessPayment() {
  const queryClient = useQueryClient();
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const errorHandler = new CompensationErrorHandler(CompensationABI as Abi);

  return useMutation({
    mutationFn: async (params: ProcessPaymentParams) => {
      if (!address || !walletClient) {
        throw new Error('Wallet not connected');
      }

      // Get transaction data from server action
      const response = await processPayment(params);

      if (!response.success || !response.request) {
        throw new Error(response.error || 'Failed to prepare transaction');
      }

      const { contractAddress, abi, functionName, args } = response.request;

      // Execute the contract write
      return handleContractWrite(
        async () =>
          walletClient.writeContract({
            address: contractAddress,
            abi,
            functionName,
            args,
          }),
        {
          errorHandler,
          revalidatePath: '/compensation',
        }
      );
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['producerBalance'] });
      queryClient.invalidateQueries({ queryKey: ['verifyPayment'] });
    },
  });
}

// Add similar hooks for other operations
```

5. **Implement UI Components**:

```tsx
// compensation/components/ProcessPaymentForm.tsx
export function ProcessPaymentForm() {
  const [producer, setProducer] = useState('');
  const [recordId, setRecordId] = useState('');
  const [dataSize, setDataSize] = useState(1);
  const [consumerDid, setConsumerDid] = useState('');

  const { mutate, isPending, isSuccess, isError, error } = useProcessPayment();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate({
      producer,
      recordId,
      dataSize,
      consumerDid,
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Process Payment</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Producer Address</label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            value={producer}
            onChange={(e) => setProducer(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Record ID</label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            value={recordId}
            onChange={(e) => setRecordId(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Data Size</label>
          <input
            type="number"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            value={dataSize}
            onChange={(e) => setDataSize(parseInt(e.target.value))}
            min="1"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Consumer DID</label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            value={consumerDid}
            onChange={(e) => setConsumerDid(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={isPending}
        >
          {isPending ? 'Processing...' : 'Process Payment'}
        </button>
      </form>

      {isSuccess && (
        <div className="bg-green-50 p-4 rounded-md">
          <p className="text-green-800">Payment processed successfully!</p>
        </div>
      )}

      {isError && (
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-800">{error?.message || 'An error occurred'}</p>
        </div>
      )}
    </div>
  );
}
```

### 3. Integration Between DataRegistry and Compensation

1. **Create integration hook to tie the two contracts together**:

```typescript
// features/data-sharing/hooks/use-data-sharing.ts
export function useShareDataWithPayment() {
  const queryClient = useQueryClient();
  const { mutateAsync: shareDataAsync } = useShareData();
  const { mutateAsync: processPaymentAsync } = useProcessPayment();

  return useMutation({
    mutationFn: async ({
      recordId,
      consumerDid,
      ownerDid,
      producer,
      dataSize,
    }: {
      recordId: string;
      consumerDid: string;
      ownerDid: string;
      producer: string;
      dataSize: number;
    }) => {
      // First process the payment
      await processPaymentAsync({
        producer,
        recordId,
        dataSize,
        consumerDid,
      });

      // Then share the data
      return shareDataAsync({
        recordId,
        consumerDid,
        ownerDid,
      });
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['producerBalance'] });
      queryClient.invalidateQueries({ queryKey: ['verifyPayment'] });
      queryClient.invalidateQueries({ queryKey: ['producerRecords'] });
    },
  });
}
```

## Testing Strategy

1. **Unit Tests**:

   - Test each React hook in isolation
   - Mock blockchain interactions

2. **Integration Tests**:

   - Test components that integrate multiple hooks
   - Ensure proper state updates

3. **E2E Tests**:
   - Test complete user flows using a local blockchain
   - Verify interactions between contracts

## Implementation Order

1. Setup ABIs and type definitions
2. Implement Compensation read actions and hooks
3. Implement Compensation write actions and hooks
4. Create Compensation UI components
5. Update DataRegistry integration to use Compensation
6. Test the complete system

## Conclusion

This plan provides a comprehensive approach to integrating the DataRegistry and Compensation contracts with the frontend application. By following this implementation plan, we can ensure a smooth integration of both contracts while maintaining code quality and user experience.

The use of viem and wagmi for blockchain interactions will provide a more modern and efficient implementation compared to ethers.js, and will align with the project's technical requirements.

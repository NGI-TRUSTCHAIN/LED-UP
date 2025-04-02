# DID Access Control Actions

This directory contains server actions for interacting with the DID Access Control smart contract. These actions are designed to be used with React Query for efficient data fetching and mutations.

## Structure

- `index.ts` - Exports all query and mutation functions
- `query.ts` - Contains server actions for reading data from the contract
- `mutation.ts` - Contains server actions for writing data to the contract

## Usage with React Query

The server actions are designed to be used with React Query hooks, which are implemented in the `features/did-access-control/hooks` directory. These hooks provide a seamless way to fetch and mutate data from the contract.

### Example: Checking if a DID has a role

```tsx
import { useHasDidRole } from '@/features/did-access-control/hooks';

function DidRoleCheck({ did, role }) {
  const { data: hasRole, isLoading } = useHasDidRole({ did, role });

  if (isLoading) return <div>Loading...</div>;

  return <div>{hasRole ? 'Has role' : 'Does not have role'}</div>;
}
```

### Example: Granting a role to a DID

```tsx
import { useGrantDidRole } from '@/features/did-access-control/hooks';

function GrantDidRole() {
  const { mutate, isPending } = useGrantDidRole();

  const handleGrantRole = () => {
    mutate({
      did: 'did:ethr:0x1234567890abcdef',
      role: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      privateKey: 'your-private-key', // In a real app, this would be securely managed
    });
  };

  return (
    <button onClick={handleGrantRole} disabled={isPending}>
      {isPending ? 'Granting role...' : 'Grant role'}
    </button>
  );
}
```

## Server Actions

### Query Actions

- `getAdminRole(): Promise<0x${string}>` - Get the ADMIN role
- `getDefaultAdminRole(): Promise<0x${string}>` - Get the DEFAULT_ADMIN_ROLE
- `getOperatorRole(): Promise<0x${string}>` - Get the OPERATOR role
- `getDidRegistryAddress(): Promise<0x${string}>` - Get the DID Registry contract address
- `getRoleAdmin(role: 0x${string}): Promise<0x${string}>` - Get the admin role for a role
- `getRoleRequirement(role: 0x${string}): Promise<string>` - Get the requirement for a role
- `hasDidRole(did: string, role: 0x${string}): Promise<boolean>` - Check if a DID has a role
- `hasRole(role: 0x${string}, account: 0x${string}): Promise<boolean>` - Check if an account has a role
- `supportsInterface(interfaceId: 0x${string}): Promise<boolean>` - Check if the contract supports an interface

### Mutation Actions

- `grantDidRole(did: string, role: 0x${string}, privateKey: string): Promise<TransactionResponse>` - Grant a role to a DID
- `grantRole(role: 0x${string}, account: 0x${string}, privateKey: string): Promise<TransactionResponse>` - Grant a role to an account
- `renounceRole(role: 0x${string}, callerConfirmation: 0x${string}, privateKey: string): Promise<TransactionResponse>` - Renounce a role
- `revokeDidRole(did: string, role: 0x${string}, privateKey: string): Promise<TransactionResponse>` - Revoke a role from a DID
- `revokeRole(role: 0x${string}, account: 0x${string}, privateKey: string): Promise<TransactionResponse>` - Revoke a role from an account
- `setRoleRequirement(role: 0x${string}, requirement: string, privateKey: string): Promise<TransactionResponse>` - Set a requirement for a role
- `processTransactionResponse(txHash: 0x${string}, path?: string): Promise<{ success: boolean; error?: string }>` - Process a transaction response

## React Query Hooks

The React Query hooks are implemented in the `features/did-access-control/hooks/use-did-access-control.ts` file. These hooks provide a seamless way to fetch and mutate data from the contract.

### Query Hooks

- `useAdminRole()` - Get the ADMIN role
- `useDefaultAdminRole()` - Get the DEFAULT_ADMIN_ROLE
- `useOperatorRole()` - Get the OPERATOR role
- `useDidRegistryAddress()` - Get the DID Registry contract address
- `useRoleAdmin({ role?: 0x${string} })` - Get the admin role for a role
- `useRoleRequirement({ role?: 0x${string} })` - Get the requirement for a role
- `useHasDidRole({ did?: string, role?: 0x${string} })` - Check if a DID has a role
- `useHasRole({ role?: 0x${string}, account?: 0x${string} })` - Check if an account has a role
- `useSupportsInterface({ interfaceId?: 0x${string} })` - Check if the contract supports an interface

### Mutation Hooks

- `useGrantDidRole()` - Grant a role to a DID
- `useGrantRole()` - Grant a role to an account
- `useRenounceRole()` - Renounce a role
- `useRevokeDidRole()` - Revoke a role from a DID
- `useRevokeRole()` - Revoke a role from an account
- `useSetRoleRequirement()` - Set a requirement for a role
- `useProcessTransactionResponse()` - Process a transaction response

## Configuration

The server actions use environment variables for configuration:

- `DID_ACCESS_CONTROL_CONTRACT_ADDRESS` - The address of the DID Access Control contract
- `CHAIN_ID` - The ID of the blockchain network
- `RPC_URL` - The URL of the RPC endpoint

These can be set in your `.env` file or overridden in the code.

## Implementation Details

The server actions use Viem for interacting with the blockchain, which provides a more modern and type-safe API compared to ethers.js. The key components are:

- `getPublicClient` - Creates a public client for reading from the blockchain
- `getWalletClient` - Creates a wallet client for writing to the blockchain
- `processTransactionReceipt` - Processes a transaction receipt and returns a standardized response

These functions are used internally by the server actions to provide a consistent interface for interacting with the DID Access Control contract.

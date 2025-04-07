"RULE - IF YOU WANT THE FILE CONTENT ASK ME I WILL ATTACH IT TO YOU"

# Frontend Data Registry & Compensation Implementation Tasks

This document provides a detailed breakdown of tasks required to implement the Data Registry and Compensation smart contract integration with the frontend. Tasks are organized by phase and include checklists for tracking progress.

## Phase 1: Setup and Preparation

### 1.1 Project Setup

- [x] Review existing codebase structure
- [x] Create folder structure for compensation feature
- [ ] Update any project configuration files if necessary

### 1.2 ABI Configuration

- [x] Extract ABI from Compensation1.sol
- [x] Create `compensation.abi.ts` in the abi directory
- [x] Update `data-registry.abi.ts` with latest contract ABI

### 1.3 Type Definitions

- [x] Create `features/compensation/types/index.ts`
- [x] Define interface for `Payment`
- [x] Create `CompensationActions` enum
- [x] Define parameter interfaces for all actions
- [x] Update any existing types in data-registry as needed
- [x] Create contract type definitions in `types/contract/index.ts`
- [x] Define error types in `types/contract/errors.ts`
- [x] Implement event handling utilities in `types/contract/events.ts`
- [x] Create Zod schemas for validation

## Phase 2: Compensation Contract Integration

### 2.1 Query Actions Implementation

- [x] Create `features/compensation/actions/query.ts`
- [x] Implement `verifyPayment`
- [x] Implement `getProducerBalance` (with and without address)
- [x] Implement `getServiceFee`
- [x] Implement `getProviderBalance`
- [x] Implement `getMinimumWithdrawAmount`
- [x] Implement `getUnitPrice`
- [x] Create error handling utilities specific to Compensation contract

### 2.2 Mutation Actions Implementation

- [x] Create `features/compensation/actions/mutation.ts`
- [x] Implement `processPayment`
- [x] Implement `withdrawProducerBalance`
- [x] Implement `withdrawServiceFee` (admin only)
- [x] Implement `removeProducer` (admin only)
- [x] Implement `changeServiceFee` (admin only)
- [x] Implement `changeUnitPrice` (admin only)
- [x] Implement `setMinimumWithdrawAmount` (admin only)
- [x] Implement `changeTokenAddress` (admin only)
- [x] Implement `pauseService` and `unpauseService` (admin only)

### 2.3 React Hooks Implementation

- [x] Create `features/compensation/hooks/use-compensation.ts`
- [x] Implement `useVerifyPayment` hook
- [x] Implement `useProducerBalance` hook
- [x] Implement `useProcessPayment` hook
- [x] Implement `useWithdrawProducerBalance` hook
- [x] Implement `useServiceFee` hook
- [x] Implement admin action hooks
- [x] Create `features/compensation/hooks/index.ts` to export all hooks

## Phase 3: UI Components Implementation

### 3.1 Basic Components

- [x] Create `features/compensation/components/index.ts`
- [x] Create `CompensationPage.tsx` main component
- [ ] Implement page routing and navigation

### 3.2 Producer-focused Components

- [x] Create `ProducerBalanceView.tsx` to display balance information
- [x] Create `WithdrawFundsForm.tsx` for producers to withdraw funds
- [x] Create `PaymentHistoryList.tsx` to display payment history
- [x] Enhance PaymentHistoryList with copy buttons, compact layout, and formatted token values

### 3.3 Consumer-focused Components

- [x] Create `ProcessPaymentForm.tsx` for consumers to pay for data access
- [x] Create `RecordPaymentStatus.tsx` to display payment status per record
- [x] Create `TokenApprovalButton.tsx` for ERC20 token approvals

### 3.4 Admin Components

- [x] Create `AdminControlPanel.tsx` for admin operations
- [x] Implement service fee and unit price management UI
- [x] Implement contract pause/unpause controls

## Phase 4: DataRegistry Contract Integration Updates

### 4.1 Update Query Actions

- [x] Review and update `data-registry/actions/query.ts`
- [x] Add any new methods from DataRegistry1 contract
- [x] Update error handling for new error types

### 4.2 Update Mutation Actions

- [x] Review and update `data-registry/actions/mutation.ts`
- [x] Add any new methods from DataRegistry1 contract
- [x] Ensure proper validation and error handling

### 4.3 Update React Hooks

- [x] Refactor existing hooks to use viem/wagmi instead of ethers
- [x] Add new hooks for any new contract functionality
- [x] Update hook dependencies and query invalidations
- [x] Create centralized query keys for better management

### 4.4 Type Definitions

- [x] Create contract type definitions in `types/contract/index.ts`
- [x] Define error types in `types/contract/errors.ts`
- [x] Implement event handling utilities in `types/contract/events.ts`
- [x] Update exports to make types accessible

## Phase 5: Integration & Cross-Contract Communication

### 5.1 Create Integration Layer

- [x] Create `features/data-sharing` directory for cross-contract features
- [x] Implement `use-data-sharing.ts` hook for combined operations
- [x] Create `useShareDataWithPayment` hook

### 5.2 Update UI for Integrated Flows

- [x] Update data sharing UI to incorporate payment flow
- [x] Add payment verification indicators to record displays
- [x] Implement verification of payment before data access

### 5.3 Token Approval Integration

- [x] Implement ERC20 token approval UI for payments
- [x] Create `TokenApprovalButton.tsx` component
- [x] Add token balance display for consumers

## Phase 6: Testing & Validation

### 6.1 Unit Testing

- [ ] Write tests for Compensation hooks in isolation
- [ ] Write tests for updated DataRegistry hooks
- [ ] Test contract write preparation logic
- [ ] Test error handling and validation

### 6.2 Integration Testing

- [ ] Test payment and data sharing flow
- [ ] Test withdrawal and balance management
- [ ] Test admin operations

### 6.3 End-to-End Testing

- [ ] Implement Cypress or similar for E2E tests
- [ ] Create test flows for complete user journeys
- [ ] Test with a local blockchain environment

## Phase 7: Documentation & Cleanup

### 7.1 Code Documentation

- [x] Add detailed JSDoc comments to all functions
- [x] Document component props and state management
- [x] Create type definitions for all props and returns

### 7.2 User Documentation

- [ ] Create user guide for data sharing with payment
- [ ] Document admin operations and controls
- [ ] Add inline help text to UI components

### 7.3 Final Review & Cleanup

- [ ] Perform code review and refactoring
- [ ] Remove any deprecated or unused code
- [ ] Ensure consistent error handling throughout
- [ ] Verify all validation logic is complete and consistent

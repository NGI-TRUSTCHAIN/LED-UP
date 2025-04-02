/**
 * Data Registry Hooks
 *
 * This file exports all the hooks for interacting with the data registry contract.
 * These hooks use React Query and Next.js Server Actions to provide a seamless
 * data fetching and mutation experience.
 */

// Data Registry Hooks
export * from './use-data-registry';

// Custom hook for IPFS uploads
export * from './useIPFSUpload';

// IPFS Mutation Hooks
export {
  useUploadToIPFS,
  useDeleteIPFSData,
  useUpdateBlockchain,
  useCreateRecordWithIPFS,
  useUpdateRecordWithIPFS,
} from './use-ipfs-mutations';

// IPFS Query Hooks
export { useIPFSData, useRawIPFSData, useRecordWithIPFSData, useProducerRecordsWithIPFSData } from './use-ipfs-queries';

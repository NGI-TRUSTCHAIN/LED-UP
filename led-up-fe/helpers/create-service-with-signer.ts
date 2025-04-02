'use client';

import { Contract, Signer } from 'ethers';
import { ContractHandlerFactory, ContractType } from '@/helpers/ContractHandlerFactory';

/**
 * Creates a contract instance with the provided signer
 * @param address The contract address
 * @param abi The contract ABI
 * @param signer The signer to use
 * @returns A contract instance with the provided signer
 */
export function createContractWithSigner(address: string, abi: any, signer: Signer): Contract {
  return new Contract(address, abi, signer);
}

/**
 * Creates a service instance with the provided signer
 * @param ServiceClass The service class to instantiate
 * @param address The contract address
 * @param abi The contract ABI
 * @param signer The signer to use
 * @param contractType The contract type for error handling and event parsing
 * @returns A service instance with the provided signer
 */
export function createServiceWithSigner<T>(
  ServiceClass: new (address: string, abi: any, contract: Contract) => T,
  address: string,
  abi: any,
  signer: Signer,
  contractType: ContractType
): T {
  // Create a contract with the provided signer
  const contract = createContractWithSigner(address, abi, signer);

  // Create error handler and event parser
  const errorHandler = ContractHandlerFactory.createErrorHandler(contractType, contract);
  const eventParser = ContractHandlerFactory.createEventParser(contractType, contract);

  // Create the service instance
  return new ServiceClass(address, abi, contract);
}

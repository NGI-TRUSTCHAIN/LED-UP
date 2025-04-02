'use client';

import { Contract, ContractRunner, Signer } from 'ethers';
import { ContractHandlerFactory, ContractType } from '@/helpers/ContractHandlerFactory';
import { signer as defaultSigner } from '@/helpers/get-signer';

/**
 * Base class for blockchain service classes
 */
export abstract class ServiceBase {
  public contract: Contract;
  protected errorHandler: any;
  protected eventParser: any;
  protected contractType!: ContractType; // Using definite assignment assertion

  /**
   * Creates a new instance of the ServiceBase class
   * @param contractAddress The contract address
   * @param abi The contract ABI
   * @param signerOrContract The signer to use or a contract instance
   */
  constructor(contractAddress: string, abi: any, signerOrContract?: Signer | Contract | ContractRunner) {
    // Set the contract type - this should be overridden by subclasses
    this.initializeContractType();

    // If a contract is provided, use it
    if (signerOrContract instanceof Contract) {
      this.contract = signerOrContract;
    }
    // If a signer is provided, create a contract with it
    else if (signerOrContract) {
      this.contract = new Contract(contractAddress, abi, signerOrContract);
    }
    // Otherwise, use the default signer
    else {
      this.contract = new Contract(contractAddress, abi, defaultSigner);
    }

    // Initialize error handler and event parser
    this.errorHandler = ContractHandlerFactory.createErrorHandler(this.contractType, this.contract);

    this.eventParser = ContractHandlerFactory.createEventParser(this.contractType, this.contract);
  }

  /**
   * Initialize the contract type - must be implemented by subclasses
   */
  protected abstract initializeContractType(): void;

  /**
   * Formats a transaction receipt with events
   * @param receipt The transaction receipt
   * @returns The formatted transaction receipt
   */
  protected formatTransactionReceipt(receipt: any): Record<string, any> {
    return this.eventParser.formatTransactionReceipt(receipt);
  }
}

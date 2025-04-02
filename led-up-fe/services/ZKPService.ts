import { Contract, ContractRunner } from 'ethers';

import { ContractHandlerFactory, ContractType } from '@/helpers/ContractHandlerFactory';
import { ZKPErrorHandler } from '@/helpers/error-handler/ZKPErrorHandler';
import { ZKPEventParser } from '@/helpers/event-parser/ZKPEventParser';

/**
 * Service class for interacting with the ZKP (Zero-Knowledge Proof) smart contract.
 * This class provides methods for verifying zero-knowledge proofs.
 */
export class ZKPService {
  private contract: Contract;
  private errorHandler: ZKPErrorHandler;
  private eventParser: ZKPEventParser;

  /**
   * Creates a new instance of the ZKPService.
   * @param contractAddress The address of the ZKP contract.
   * @param abi The ABI of the ZKP contract.
   */
  constructor(contractAddress: string, abi: any, signer: ContractRunner) {
    this.contract = new Contract(contractAddress, abi, signer);

    // Initialize error handler and event parser
    this.errorHandler = ContractHandlerFactory.createErrorHandler(ContractType.ZKP, this.contract) as ZKPErrorHandler;

    this.eventParser = ContractHandlerFactory.createEventParser(ContractType.ZKP, this.contract) as ZKPEventParser;
  }

  /**
   * Verifies a zero-knowledge proof.
   * @param pA The first part of the proof.
   * @param pB The second part of the proof.
   * @param pC The third part of the proof.
   * @param pubSignals The public signals.
   * @returns A promise that resolves to a boolean indicating if the proof is valid.
   */
  async verifyProof(
    pA: [bigint, bigint],
    pB: [[bigint, bigint], [bigint, bigint]],
    pC: [bigint, bigint],
    pubSignals: [bigint]
  ): Promise<boolean> {
    try {
      return await this.contract.verifyProof(pA, pB, pC, pubSignals);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Checks if a specific error occurred
   * @param error The error to check
   * @param errorName The name of the error to check for
   * @returns True if the error matches the specified name
   */
  isErrorType(error: any, errorName: string): boolean {
    return this.errorHandler.isErrorType(error, errorName);
  }

  /**
   * Listens for events from the contract
   * @param eventName The name of the event to listen for
   * @param filter Optional filter for the event
   * @param callback Callback function to handle the parsed event
   * @returns A function to remove the event listener
   */
  listenForEvents(eventName: string, filter: any = {}, callback: (event: any) => void): () => void {
    return this.eventParser.listenForEvents(eventName, filter, callback);
  }
}

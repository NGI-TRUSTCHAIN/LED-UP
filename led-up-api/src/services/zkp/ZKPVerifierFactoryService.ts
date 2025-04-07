import { Contract, ethers } from 'ethers';

import { ContractHandlerFactory, ContractType } from '../../helpers/ContractHandlerFactory';
import { ZKPErrorHandler } from '../../helpers/error-handler/ZKPErrorHandler';
import { ZKPEventParser } from '../../helpers/event-parser/ZKPEventParser';
import { signer } from '../../helpers/get-signer';

/**
 * Service class for interacting with the ZKP Verifier Factory smart contract.
 * This class provides methods for deploying and managing different types of ZKP verifiers.
 */
export class ZKPVerifierFactoryService {
  private contract: Contract;
  private errorHandler: ZKPErrorHandler;
  private eventParser: ZKPEventParser;

  // Constants for verifier types
  public static readonly AGE_VERIFIER_TYPE = ethers.keccak256(ethers.toUtf8Bytes('AGE_VERIFIER'));
  public static readonly HASH_VERIFIER_TYPE = ethers.keccak256(ethers.toUtf8Bytes('HASH_VERIFIER'));
  public static readonly ENHANCED_HASH_VERIFIER_TYPE = ethers.keccak256(
    ethers.toUtf8Bytes('ENHANCED_HASH_VERIFIER')
  );
  public static readonly FHIR_VERIFIER_TYPE = ethers.keccak256(ethers.toUtf8Bytes('FHIR_VERIFIER'));

  /**
   * Creates a new instance of the ZKPVerifierFactoryService.
   * @param contractAddress The address of the ZKP Verifier Factory contract.
   * @param abi The ABI of the ZKP Verifier Factory contract.
   */
  constructor(contractAddress: string, abi: any) {
    this.contract = new Contract(contractAddress, abi, signer);

    // Initialize error handler and event parser
    this.errorHandler = ContractHandlerFactory.createErrorHandler(
      ContractType.ZKP,
      this.contract
    ) as ZKPErrorHandler;

    this.eventParser = ContractHandlerFactory.createEventParser(
      ContractType.ZKP,
      this.contract
    ) as ZKPEventParser;
  }

  /**
   * Deploys an Age Verifier contract.
   * @param verifierAddress The address of the ZoKrates-generated verifier contract.
   * @returns A promise that resolves to the address of the deployed Age Verifier contract.
   */
  async deployAgeVerifier(verifierAddress: string): Promise<string> {
    try {
      const tx = await this.contract.deployAgeVerifier(verifierAddress);
      const receipt = await tx.wait();

      // Extract the deployed verifier address from the event
      const event = receipt.logs
        .map((log: any) => {
          try {
            return this.contract.interface.parseLog(log);
          } catch (e) {
            return null;
          }
        })
        .filter((event: any) => event && event.name === 'VerifierDeployed')
        .pop();

      if (!event) {
        throw new Error('Failed to extract verifier address from event');
      }

      return event.args.verifierAddress;
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Deploys a Hash Verifier contract.
   * @param verifierAddress The address of the ZoKrates-generated verifier contract.
   * @returns A promise that resolves to the address of the deployed Hash Verifier contract.
   */
  async deployHashVerifier(verifierAddress: string): Promise<string> {
    try {
      const tx = await this.contract.deployHashVerifier(verifierAddress);
      const receipt = await tx.wait();

      // Extract the deployed verifier address from the event
      const event = receipt.logs
        .map((log: any) => {
          try {
            return this.contract.interface.parseLog(log);
          } catch (e) {
            return null;
          }
        })
        .filter((event: any) => event && event.name === 'VerifierDeployed')
        .pop();

      if (!event) {
        throw new Error('Failed to extract verifier address from event');
      }

      return event.args.verifierAddress;
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Deploys an Enhanced Hash Verifier contract.
   * @param verifierAddress The address of the ZoKrates-generated verifier contract.
   * @returns A promise that resolves to the address of the deployed Enhanced Hash Verifier contract.
   */
  async deployEnhancedHashVerifier(verifierAddress: string): Promise<string> {
    try {
      const tx = await this.contract.deployEnhancedHashVerifier(verifierAddress);
      const receipt = await tx.wait();

      // Extract the deployed verifier address from the event
      const event = receipt.logs
        .map((log: any) => {
          try {
            return this.contract.interface.parseLog(log);
          } catch (e) {
            return null;
          }
        })
        .filter((event: any) => event && event.name === 'VerifierDeployed')
        .pop();

      if (!event) {
        throw new Error('Failed to extract verifier address from event');
      }

      return event.args.verifierAddress;
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Deploys a FHIR Verifier contract.
   * @param verifierAddress The address of the ZoKrates-generated verifier contract.
   * @returns A promise that resolves to the address of the deployed FHIR Verifier contract.
   */
  async deployFHIRVerifier(verifierAddress: string): Promise<string> {
    try {
      const tx = await this.contract.deployFHIRVerifier(verifierAddress);
      const receipt = await tx.wait();

      // Extract the deployed verifier address from the event
      const event = receipt.logs
        .map((log: any) => {
          try {
            return this.contract.interface.parseLog(log);
          } catch (e) {
            return null;
          }
        })
        .filter((event: any) => event && event.name === 'VerifierDeployed')
        .pop();

      if (!event) {
        throw new Error('Failed to extract verifier address from event');
      }

      return event.args.verifierAddress;
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Gets the address of a verifier from the registry.
   * @param verifierType The type of the verifier.
   * @returns A promise that resolves to the address of the verifier.
   */
  async getVerifier(verifierType: string): Promise<string> {
    try {
      const verifierTypeBytes = ethers.keccak256(ethers.toUtf8Bytes(verifierType));
      return await this.contract.getVerifier(verifierTypeBytes);
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

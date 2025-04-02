import { Contract, ContractRunner, ethers } from 'ethers';

import { ContractHandlerFactory, ContractType } from '@/helpers/ContractHandlerFactory';
import { DidAuthErrorHandler } from '@/helpers/error-handler/DidAuthErrorHandler';
import { DidAuthEventParser } from '@/helpers/event-parser/DidAuthEventParser';

/**
 * Service class for interacting with the DID Auth smart contract.
 * This class provides methods for authentication and authorization using DIDs.
 */
export class DidAuthService {
  private contract: Contract;
  private errorHandler: DidAuthErrorHandler;
  private eventParser: DidAuthEventParser;

  // Role constants to match the contract
  public readonly PRODUCER_ROLE = ethers.keccak256(ethers.toUtf8Bytes('PRODUCER'));
  public readonly CONSUMER_ROLE = ethers.keccak256(ethers.toUtf8Bytes('CONSUMER'));
  public readonly SERVICE_PROVIDER_ROLE = ethers.keccak256(ethers.toUtf8Bytes('SERVICE_PROVIDER'));

  /**
   * Creates a new instance of the DidAuthService.
   * @param contractAddress The address of the DID Auth contract.
   * @param abi The ABI of the DID Auth contract.
   */
  constructor(contractAddress: string, abi: any, signer: ContractRunner) {
    this.contract = new Contract(contractAddress, abi, signer);

    // Initialize error handler and event parser
    this.errorHandler = ContractHandlerFactory.createErrorHandler(
      ContractType.DID_AUTH,
      this.contract
    ) as DidAuthErrorHandler;

    this.eventParser = ContractHandlerFactory.createEventParser(
      ContractType.DID_AUTH,
      this.contract
    ) as DidAuthEventParser;
  }

  /**
   * Authenticates a DID with a specific role.
   * @param did The DID to authenticate.
   * @param role The role to authenticate the DID with (bytes32 hash).
   * @returns A promise that resolves to a boolean indicating if the authentication was successful.
   */
  async authenticate(did: string, role: string): Promise<boolean> {
    try {
      return await this.contract.authenticate(did, role);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Gets the DID for an Ethereum address.
   * @param address The Ethereum address to get the DID for.
   * @returns A promise that resolves to the DID string.
   */
  async getDid(address: string): Promise<string> {
    try {
      return await this.contract.getDid(address);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Gets the required credential type for a role.
   * @param role The role to get the credential type for (bytes32 hash).
   * @returns A promise that resolves to the credential type string.
   */
  async getRequiredCredentialForRole(role: string): Promise<string> {
    try {
      return await this.contract.getRequiredCredentialForRole(role);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Verifies a credential for a specific action.
   * @param did The DID to verify the credential for.
   * @param credentialType The type of credential to verify.
   * @param credentialId The ID of the credential to verify.
   * @returns A promise that resolves to a boolean indicating if the credential is valid.
   */
  async verifyCredentialForAction(did: string, credentialType: string, credentialId: string): Promise<boolean> {
    try {
      return await this.contract.verifyCredentialForAction(did, credentialType, credentialId);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Checks if a DID has the required roles and credentials.
   * @param did The DID to check.
   * @param roles An array of roles to check (bytes32 hashes).
   * @param credentialIds An array of credential IDs to check.
   * @returns A promise that resolves to a boolean indicating if the DID has all required roles and credentials.
   */
  async hasRequiredRolesAndCredentials(did: string, roles: string[], credentialIds: string[]): Promise<boolean> {
    try {
      return await this.contract.hasRequiredRolesAndCredentials(did, roles, credentialIds);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Helper method to authenticate a DID with a specific role (alias for authenticate).
   * @param did The DID to authenticate.
   * @param role The role to authenticate the DID with (string role name).
   * @returns A promise that resolves to a boolean indicating if the authentication was successful.
   */
  async authenticateDid(did: string, role: string): Promise<boolean> {
    try {
      // Convert role string to bytes32 hash if needed
      const roleHash = this.getRoleHash(role);
      return await this.authenticate(did, roleHash);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Helper method to convert a role string to a bytes32 hash.
   * @param role The role string to convert.
   * @returns The bytes32 hash of the role.
   */
  private getRoleHash(role: string): string {
    switch (role.toUpperCase()) {
      case 'PRODUCER':
        return this.PRODUCER_ROLE;
      case 'CONSUMER':
        return this.CONSUMER_ROLE;
      case 'SERVICE_PROVIDER':
        return this.SERVICE_PROVIDER_ROLE;
      default:
        return ethers.keccak256(ethers.toUtf8Bytes(role));
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

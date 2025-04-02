import { Contract } from 'ethers';

import { ContractHandlerFactory, ContractType } from '../../helpers/ContractHandlerFactory';
import { DidAccessControlErrorHandler } from '../../helpers/error-handler/DidAccessControlErrorHandler';
import { DidAccessControlEventParser } from '../../helpers/event-parser/DidAccessControlEventParser';
import { signer } from '../../helpers/get-signer';
import { UserRole } from '../../types/auth-types';

/**
 * Service class for interacting with the DID Access Control smart contract.
 * This class provides methods to manage role-based access control for DIDs.
 */
export class DidAccessControlService {
  private contract: Contract;
  private errorHandler: DidAccessControlErrorHandler;
  private eventParser: DidAccessControlEventParser;

  // Define role constants
  private readonly PRODUCER_ROLE = 'PRODUCER';
  private readonly CONSUMER_ROLE = 'CONSUMER';
  private readonly PROVIDER_ROLE = 'PROVIDER';
  private readonly ADMIN_ROLE = 'ADMIN';

  /**
   * Creates a new instance of the DidAccessControlService.
   * @param contractAddress The address of the DID Access Control contract.
   * @param abi The ABI of the DID Access Control contract.
   */
  constructor(contractAddress: string, abi: any) {
    this.contract = new Contract(contractAddress, abi, signer);

    // Initialize error handler and event parser
    this.errorHandler = ContractHandlerFactory.createErrorHandler(
      ContractType.DID_ACCESS_CONTROL,
      this.contract
    ) as DidAccessControlErrorHandler;

    this.eventParser = ContractHandlerFactory.createEventParser(
      ContractType.DID_ACCESS_CONTROL,
      this.contract
    ) as DidAccessControlEventParser;
  }

  /**
   * Grants a role to an address.
   * @param address The address to grant the role to.
   * @param role The role to grant.
   * @returns A promise that resolves to the formatted transaction receipt.
   */
  async grantRole(address: string, role: string): Promise<Record<string, any>> {
    try {
      const tx = await this.contract.grantRole(role, address);
      const receipt = await tx.wait();

      // Format the receipt with events
      return this.eventParser.formatTransactionReceipt(receipt);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Revokes a role from an address.
   * @param address The address to revoke the role from.
   * @param role The role to revoke.
   * @returns A promise that resolves to the formatted transaction receipt.
   */
  async revokeRole(address: string, role: string): Promise<Record<string, any>> {
    try {
      const tx = await this.contract.revokeRole(role, address);
      const receipt = await tx.wait();

      // Format the receipt with events
      return this.eventParser.formatTransactionReceipt(receipt);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Checks if an address has a specific role.
   * @param address The address to check.
   * @param role The role to check for.
   * @returns A promise that resolves to a boolean indicating if the address has the role.
   */
  async hasRole(address: string, role: string): Promise<boolean> {
    try {
      return await this.contract.hasRole(role, address);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Checks if an address has the producer role.
   * @param address The address to check.
   * @returns A promise that resolves to a boolean indicating if the address has the producer role.
   */
  async isProducer(address: string): Promise<boolean> {
    try {
      return await this.hasRole(address, this.PRODUCER_ROLE);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Checks if an address has the consumer role.
   * @param address The address to check.
   * @returns A promise that resolves to a boolean indicating if the address has the consumer role.
   */
  async isConsumer(address: string): Promise<boolean> {
    try {
      return await this.hasRole(address, this.CONSUMER_ROLE);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Checks if an address has the service provider role.
   * @param address The address to check.
   * @returns A promise that resolves to a boolean indicating if the address has the service provider role.
   */
  async isServiceProvider(address: string): Promise<boolean> {
    try {
      return await this.hasRole(address, this.PROVIDER_ROLE);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Checks if an address has the admin role.
   * @param address The address to check.
   * @returns A promise that resolves to a boolean indicating if the address has the admin role.
   */
  async isAdmin(address: string): Promise<boolean> {
    try {
      return await this.hasRole(address, this.ADMIN_ROLE);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Gets the role for an address.
   * @param address The address to check.
   * @returns A promise that resolves to the user role, or null if no role is found.
   */
  async getRoleForAddress(address: string): Promise<UserRole | null> {
    try {
      if (await this.isProducer(address)) {
        return UserRole.PRODUCER;
      } else if (await this.isConsumer(address)) {
        return UserRole.CONSUMER;
      } else if (await this.isServiceProvider(address)) {
        return UserRole.PROVIDER;
      } else if (await this.isAdmin(address)) {
        return UserRole.ADMIN;
      } else {
        return null;
      }
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Transfers ownership of the contract to a new owner.
   * @param newOwner The address of the new owner.
   * @returns A promise that resolves to the formatted transaction receipt.
   */
  async transferOwnership(newOwner: string): Promise<Record<string, any>> {
    try {
      const tx = await this.contract.transferOwnership(newOwner);
      const receipt = await tx.wait();

      // Format the receipt with events
      return this.eventParser.formatTransactionReceipt(receipt);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Renounces ownership of the contract.
   * @returns A promise that resolves to the formatted transaction receipt.
   */
  async renounceOwnership(): Promise<Record<string, any>> {
    try {
      const tx = await this.contract.renounceOwnership();
      const receipt = await tx.wait();

      // Format the receipt with events
      return this.eventParser.formatTransactionReceipt(receipt);
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

import { Contract, ethers } from 'ethers';

import { ContractHandlerFactory, ContractType } from '../../helpers/ContractHandlerFactory';
import { DidAuthErrorHandler } from '../../helpers/error-handler/DidAuthErrorHandler';
import { DidAuthEventParser } from '../../helpers/event-parser/DidAuthEventParser';
import { signer } from '../../helpers/get-signer';

/**
 * Service class for interacting with the DID Auth smart contract.
 * This class provides methods for authentication and authorization using DIDs.
 */
export class DidAuthService {
  private contract: Contract;
  private errorHandler: DidAuthErrorHandler;
  private eventParser: DidAuthEventParser;

  // Role constants to match the contract
  public readonly ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes('ADMIN'));
  public readonly PRODUCER_ROLE = ethers.keccak256(ethers.toUtf8Bytes('PRODUCER'));
  public readonly CONSUMER_ROLE = ethers.keccak256(ethers.toUtf8Bytes('CONSUMER'));
  public readonly PROVIDER_ROLE = ethers.keccak256(ethers.toUtf8Bytes('PROVIDER'));
  public readonly ISSUER_ROLE = ethers.keccak256(ethers.toUtf8Bytes('ISSUER'));
  public readonly OPERATOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes('OPERATOR'));
  public readonly VERIFIER_ROLE = ethers.keccak256(ethers.toUtf8Bytes('VERIFIER'));
  public readonly DEFAULT_ADMIN_ROLE = ethers.ZeroHash;

  // Credential type constants
  public readonly PRODUCER_CREDENTIAL = 'PRODUCER_CREDENTIAL';
  public readonly CONSUMER_CREDENTIAL = 'CONSUMER_CREDENTIAL';
  public readonly PROVIDER_CREDENTIAL = 'PROVIDER_CREDENTIAL';

  /**
   * Creates a new instance of the DidAuthService.
   * @param contractAddress The address of the DID Auth contract.
   * @param abi The ABI of the DID Auth contract.
   */
  constructor(contractAddress: string, abi: any) {
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
  async getDidFromAddress(address: string): Promise<string> {
    try {
      return await this.contract.getDidFromAddress(address);
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
  async verifyCredentialForAction(
    did: string,
    credentialType: string,
    credentialId: string
  ): Promise<boolean> {
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
  async hasRequiredRolesAndCredentials(
    did: string,
    roles: string[],
    credentialIds: string[]
  ): Promise<boolean> {
    try {
      return await this.contract.hasRequiredRolesAndCredentials(did, roles, credentialIds);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Checks if a DID has a specific role.
   * @param did The DID to check.
   * @param role The role to check for (bytes32 hash).
   * @returns A promise that resolves to a boolean indicating if the DID has the role.
   */
  async hasDidRole(did: string, role: string): Promise<boolean> {
    try {
      return await this.contract.hasDidRole(did, role);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Grants a role to a DID.
   * @param did The DID to grant the role to.
   * @param role The role to grant (bytes32 hash).
   * @returns A promise that resolves to the formatted transaction receipt.
   */
  async grantDidRole(did: string, role: string): Promise<Record<string, any>> {
    try {
      const tx = await this.contract.grantDidRole(did, role);
      const receipt = await tx.wait();
      return this.eventParser.formatTransactionReceipt(receipt);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Revokes a role from a DID.
   * @param did The DID to revoke the role from.
   * @param role The role to revoke (bytes32 hash).
   * @returns A promise that resolves to the formatted transaction receipt.
   */
  async revokeDidRole(did: string, role: string): Promise<Record<string, any>> {
    try {
      const tx = await this.contract.revokeDidRole(did, role);
      const receipt = await tx.wait();
      return this.eventParser.formatTransactionReceipt(receipt);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Sets the requirement for a role.
   * @param role The role to set the requirement for (bytes32 hash).
   * @param requirement The requirement string.
   * @returns A promise that resolves to the formatted transaction receipt.
   */
  async setRoleRequirement(role: string, requirement: string): Promise<Record<string, any>> {
    try {
      const tx = await this.contract.setRoleRequirement(role, requirement);
      const receipt = await tx.wait();
      return this.eventParser.formatTransactionReceipt(receipt);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Gets the requirement for a role.
   * @param role The role to get the requirement for (bytes32 hash).
   * @returns A promise that resolves to the requirement string.
   */
  async getRoleRequirement(role: string): Promise<string> {
    try {
      return await this.contract.getRoleRequirement(role);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Checks if an issuer is trusted for a credential type.
   * @param credentialType The type of credential.
   * @param issuer The address of the issuer.
   * @returns A promise that resolves to a boolean indicating if the issuer is trusted.
   */
  async isTrustedIssuer(credentialType: string, issuer: string): Promise<boolean> {
    try {
      return await this.contract.isTrustedIssuer(credentialType, issuer);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Sets whether an issuer is trusted for a credential type.
   * @param credentialType The type of credential.
   * @param issuer The address of the issuer.
   * @param trusted Whether the issuer should be trusted.
   * @returns A promise that resolves to the formatted transaction receipt.
   */
  async setTrustedIssuer(
    credentialType: string,
    issuer: string,
    trusted: boolean
  ): Promise<Record<string, any>> {
    try {
      const tx = await this.contract.setTrustedIssuer(credentialType, issuer, trusted);
      const receipt = await tx.wait();
      return this.eventParser.formatTransactionReceipt(receipt);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Issues a credential to a DID.
   * @param credentialType The type of credential to issue.
   * @param did The DID to issue the credential to.
   * @param credentialId The ID of the credential.
   * @returns A promise that resolves to the formatted transaction receipt.
   */
  async issueCredential(
    credentialType: string,
    did: string,
    credentialId: string
  ): Promise<Record<string, any>> {
    try {
      const tx = await this.contract.issueCredential(credentialType, did, credentialId);
      const receipt = await tx.wait();
      return this.eventParser.formatTransactionReceipt(receipt);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Gets the DID of the caller.
   * @returns A promise that resolves to the caller's DID.
   */
  async getCallerDid(): Promise<string> {
    try {
      return await this.contract.getCallerDid();
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Resolves a DID to its associated address.
   * @param did The DID to resolve.
   * @returns A promise that resolves to the associated address.
   */
  async resolveDid(did: string): Promise<string> {
    try {
      return await this.contract.resolveDid(did);
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
      const roleHash = this.getRoleHash(role);
      return await this.authenticate(did, roleHash);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Get user roles by did
   * @param did The did to get the roles for
   * @returns A promise that resolves to an array of roles
   */
  async getUserRolesByDid(did: string): Promise<string[]> {
    try {
      return await this.contract.getUserRoles(did);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Get user roles by address
   * @param address The address to get the roles for
   * @returns A promise that resolves to an array of roles
   */
  async getUserRolesByAddress(address: string): Promise<string[]> {
    try {
      return await this.contract.getUserRolesByAddress(address);
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
      case 'ADMIN':
        return this.ADMIN_ROLE;
      case 'PRODUCER':
        return this.PRODUCER_ROLE;
      case 'CONSUMER':
        return this.CONSUMER_ROLE;
      case 'PROVIDER':
        return this.PROVIDER_ROLE;
      case 'ISSUER':
        return this.ISSUER_ROLE;
      case 'OPERATOR':
        return this.OPERATOR_ROLE;
      case 'VERIFIER':
        return this.VERIFIER_ROLE;
      case 'DEFAULT_ADMIN':
        return this.DEFAULT_ADMIN_ROLE;
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

import { Contract, ContractRunner } from 'ethers';

import { ContractHandlerFactory, ContractType } from '@/helpers/ContractHandlerFactory';
import { TokenErrorHandler } from '@/helpers/error-handler/TokenErrorHandler';
import { TokenEventParser } from '@/helpers/event-parser/TokenEventParser';

/**
 * Service class for interacting with the Token smart contract.
 * This class provides methods for managing the LedUp ERC20 token.
 */
export class TokenService {
  private contract: Contract;
  private errorHandler: TokenErrorHandler;
  private eventParser: TokenEventParser;

  /**
   * Creates a new instance of the TokenService.
   * @param contractAddress The address of the Token contract.
   * @param abi The ABI of the Token contract.
   */
  constructor(contractAddress: string, abi: any, signer: ContractRunner) {
    this.contract = new Contract(contractAddress, abi, signer);

    // Initialize error handler and event parser
    this.errorHandler = ContractHandlerFactory.createErrorHandler(
      ContractType.TOKEN,
      this.contract
    ) as TokenErrorHandler;

    this.eventParser = ContractHandlerFactory.createEventParser(ContractType.TOKEN, this.contract) as TokenEventParser;
  }

  /**
   * Gets the name of the token.
   * @returns A promise that resolves to the name of the token.
   */
  async name(): Promise<string> {
    try {
      return await this.contract.name();
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Gets the symbol of the token.
   * @returns A promise that resolves to the symbol of the token.
   */
  async symbol(): Promise<string> {
    try {
      return await this.contract.symbol();
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Gets the decimals of the token.
   * @returns A promise that resolves to the decimals of the token.
   */
  async decimals(): Promise<number> {
    try {
      return await this.contract.decimals();
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Gets the total supply of the token.
   * @returns A promise that resolves to the total supply of the token.
   */
  async totalSupply(): Promise<bigint> {
    try {
      return await this.contract.totalSupply();
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Gets the balance of an account.
   * @param account The address of the account.
   * @returns A promise that resolves to the balance of the account.
   */
  async balanceOf(account: string): Promise<bigint> {
    try {
      return await this.contract.balanceOf(account);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Gets the allowance of a spender for an owner.
   * @param owner The address of the owner.
   * @param spender The address of the spender.
   * @returns A promise that resolves to the allowance of the spender.
   */
  async allowance(owner: string, spender: string): Promise<bigint> {
    try {
      return await this.contract.allowance(owner, spender);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Approves a spender to spend tokens.
   * @param spender The address of the spender.
   * @param amount The amount to approve.
   * @returns A promise that resolves to the formatted transaction receipt.
   */
  async approve(spender: string, amount: bigint): Promise<Record<string, any>> {
    try {
      const tx = await this.contract.approve(spender, amount);
      const receipt = await tx.wait();

      // Format the receipt with events
      return this.eventParser.formatTransactionReceipt(receipt);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Transfers tokens to a recipient.
   * @param recipient The address of the recipient.
   * @param amount The amount to transfer.
   * @returns A promise that resolves to the formatted transaction receipt.
   */
  async transfer(recipient: string, amount: bigint): Promise<Record<string, any>> {
    try {
      const tx = await this.contract.transfer(recipient, amount);
      const receipt = await tx.wait();

      // Format the receipt with events
      return this.eventParser.formatTransactionReceipt(receipt);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Transfers tokens from one account to another.
   * @param sender The address of the sender.
   * @param recipient The address of the recipient.
   * @param amount The amount to transfer.
   * @returns A promise that resolves to the formatted transaction receipt.
   */
  async transferFrom(sender: string, recipient: string, amount: bigint): Promise<Record<string, any>> {
    try {
      const tx = await this.contract.transferFrom(sender, recipient, amount);
      const receipt = await tx.wait();

      // Format the receipt with events
      return this.eventParser.formatTransactionReceipt(receipt);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Mints tokens to an account.
   * @param to The address of the recipient.
   * @param amount The amount to mint.
   * @returns A promise that resolves to the formatted transaction receipt.
   */
  async mint(to: string, amount: bigint): Promise<Record<string, any>> {
    try {
      const tx = await this.contract.mint(to, amount);
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

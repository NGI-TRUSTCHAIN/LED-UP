import { ethers, EventLog, Log } from 'ethers';

/**
 * Configuration for blockchain connectivity
 */
export interface BlockchainConfig {
  /** The RPC provider URL (e.g., Infura, Alchemy) */
  providerUrl: string;
  /** Main contract address for data access verification */
  contractAddress: string;
  /** Network name or ID */
  network?: string;
  /** Additional configuration options */
  options?: Record<string, any>;
}

/**
 * Common contract interactions for data access management
 */
export const CONTRACT_ABI = [
  // Access verification
  'function checkAccess(address consumer, string memory dataId) external view returns (bool)',
  // Data publishing
  'function publishData(string memory dataId, uint256 price, string memory metadata) external returns (bool)',
  // Payment functions
  'function purchaseAccess(string memory dataId) external payable returns (bool)',
  // Owner functions
  'function updateDataPrice(string memory dataId, uint256 newPrice) external returns (bool)',
  // Extra functions for data details
  'function getDataDetails(string memory dataId) external view returns (address owner, uint256 price, string memory metadata)',
  // Events
  'event DataPublished(address indexed publisher, string dataId, uint256 price, uint256 timestamp)',
  'event PaymentReceived(address indexed consumer, string indexed dataId)',
  'event AccessPurchased(address indexed consumer, string dataId, uint256 price, uint256 timestamp)',
];

/**
 * Service for blockchain interactions related to data access
 *
 * This service provides an interface to interact with Ethereum smart contracts
 * for verifying data access rights, publishing data, and managing payments.
 */
export class BlockchainService {
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract;
  private signer: ethers.Signer | null = null;
  private isInitialized = false;

  /**
   * Create a new blockchain service instance
   *
   * @param config Configuration for connecting to the blockchain
   */
  constructor(private config: BlockchainConfig) {
    // Provider and contract will be initialized in the init method
    if (process.env.NODE_ENV !== 'test') {
      this.provider = new ethers.JsonRpcProvider(config.providerUrl);
      this.contract = new ethers.Contract(config.contractAddress, CONTRACT_ABI, this.provider);
    }
  }

  /**
   * Initialize the service with optional wallet key for transactions
   *
   * @param privateKey Optional private key for signing transactions
   */
  async init(privateKey?: string): Promise<void> {
    try {
      // Ensure the provider is connected
      await this.provider.getBlockNumber();

      // If private key is provided, create a wallet signer
      if (privateKey) {
        this.signer = new ethers.Wallet(privateKey, this.provider);
        // Use any to work around TypeScript issues with ethers.js v6
        this.contract = this.contract.connect(this.signer) as any;
      }

      this.isInitialized = true;
    } catch (error) {
      throw new Error(`Failed to initialize blockchain service: ${(error as Error).message}`);
    }
  }

  /**
   * Verify if a user has access to specific data
   *
   * @param userAddress Ethereum address of the user
   * @param dataId Unique identifier for the data
   * @returns True if the user has access, false otherwise
   */
  async verifyAccess(userAddress: string, dataId: string): Promise<boolean> {
    this.ensureInitialized();

    try {
      return await this.contract.checkAccess(userAddress, dataId);
    } catch (error) {
      console.error('Error verifying blockchain access:', error);
      return false;
    }
  }

  /**
   * Publish new data to the marketplace
   *
   * @param dataId Unique identifier for the data
   * @param price Price in wei
   * @param metadata Additional metadata for the data (usually a JSON string or IPFS hash)
   * @returns Transaction receipt
   */
  async publishData(
    dataId: string,
    price: bigint,
    metadata: string
  ): Promise<ethers.TransactionReceipt> {
    this.ensureInitialized();
    this.ensureSigner();

    const tx = await this.contract.publishData(dataId, price, metadata);
    return await tx.wait();
  }

  /**
   * Purchase access to data
   *
   * @param dataId Unique identifier for the data
   * @param price Price to pay in wei
   * @returns Transaction receipt
   */
  async purchaseAccess(dataId: string, price: bigint): Promise<ethers.TransactionReceipt> {
    this.ensureInitialized();
    this.ensureSigner();

    const tx = await this.contract.purchaseAccess(dataId, { value: price });
    return await tx.wait();
  }

  /**
   * Update the price of existing data
   *
   * @param dataId Unique identifier for the data
   * @param newPrice New price in wei
   * @returns Transaction receipt
   */
  async updateDataPrice(dataId: string, newPrice: bigint): Promise<ethers.TransactionReceipt> {
    this.ensureInitialized();
    this.ensureSigner();

    const tx = await this.contract.updateDataPrice(dataId, newPrice);
    return await tx.wait();
  }

  /**
   * Get data details from the contract
   *
   * @param dataId Unique identifier for the data
   * @returns Object containing data details
   */
  async getDataDetails(
    dataId: string
  ): Promise<{ owner: string; price: bigint; metadata: string }> {
    this.ensureInitialized();

    try {
      const result = await this.contract.getDataDetails(dataId);
      return {
        owner: result.owner,
        price: result.price,
        metadata: result.metadata,
      };
    } catch (error) {
      throw new Error(`Failed to get data details: ${(error as Error).message}`);
    }
  }

  /**
   * Get the current gas price
   *
   * @returns Current gas price in wei
   */
  async getGasPrice(): Promise<bigint> {
    return await this.provider.getFeeData().then(data => data.gasPrice || 0n);
  }

  /**
   * Estimate gas cost for a transaction
   *
   * @param methodName Name of the contract method
   * @param params Parameters for the method
   * @returns Estimated gas in wei
   */
  async estimateGas(methodName: string, ...params: any[]): Promise<bigint> {
    this.ensureInitialized();

    try {
      const gasEstimate = await this.contract[methodName].estimateGas(...params);
      return gasEstimate;
    } catch (error) {
      throw new Error(`Failed to estimate gas: ${(error as Error).message}`);
    }
  }

  /**
   * Get events emitted by the contract
   *
   * @param eventName Name of the event
   * @param filter Optional filter conditions
   * @param fromBlock Starting block number
   * @param toBlock Ending block number or 'latest'
   * @returns Array of event objects
   */
  async getEvents(
    eventName: string,
    filter: Record<string, any> = {},
    fromBlock: number = 0,
    toBlock: number | 'latest' = 'latest'
  ): Promise<any[]> {
    this.ensureInitialized();

    try {
      const events = await this.contract.queryFilter(
        this.contract.filters[eventName](filter),
        fromBlock,
        toBlock
      );

      return events.map(event => {
        // Handle both Log and EventLog types
        const eventData: any = event;
        return {
          // Use optional chaining to safely access args
          ...(eventData.args || {}),
          transactionHash: event.transactionHash,
          blockNumber: event.blockNumber,
        };
      });
    } catch (error) {
      throw new Error(`Failed to get events: ${(error as Error).message}`);
    }
  }

  /**
   * Get recent blockchain events that need to be processed
   * @param fromBlock Starting block number (defaults to last 1000 blocks)
   * @returns Array of events to process
   */
  async getRecentEvents(fromBlock?: number): Promise<any[]> {
    this.ensureInitialized();

    try {
      // If fromBlock is not provided, use the last 1000 blocks
      const currentBlock = await this.provider.getBlockNumber();
      if (!fromBlock) {
        fromBlock = Math.max(0, currentBlock - 1000);
      }

      // Get payment events using pagination to avoid "Range exceeds limit" errors
      let paymentEvents: (Log | EventLog)[] = [];
      try {
        // Use pagination with a maximum of 500 blocks per query
        const MAX_BLOCK_RANGE = 500;
        let startBlock = fromBlock;

        while (startBlock <= currentBlock) {
          const endBlock = Math.min(startBlock + MAX_BLOCK_RANGE - 1, currentBlock);
          console.log(`Querying PaymentReceived events from block ${startBlock} to ${endBlock}`);

          const events = await this.contract.queryFilter('PaymentReceived', startBlock, endBlock);
          paymentEvents = [...paymentEvents, ...events];

          // Move to next block range
          startBlock = endBlock + 1;

          // If we've reached the current block, exit the loop
          if (startBlock > currentBlock) {
            break;
          }
        }
      } catch (error) {
        console.warn('Error fetching PaymentReceived events:', error);
      }

      // Get revocation events (if the contract has them) with the same pagination approach
      let revocationEvents: (Log | EventLog)[] = [];
      try {
        // Use pagination with a maximum of 500 blocks per query
        const MAX_BLOCK_RANGE = 500;
        let startBlock = fromBlock;

        while (startBlock <= currentBlock) {
          const endBlock = Math.min(startBlock + MAX_BLOCK_RANGE - 1, currentBlock);
          console.log(`Querying AccessRevoked events from block ${startBlock} to ${endBlock}`);

          const events = await this.contract.queryFilter('AccessRevoked', startBlock, endBlock);
          revocationEvents = [...revocationEvents, ...events];

          // Move to next block range
          startBlock = endBlock + 1;

          // If we've reached the current block, exit the loop
          if (startBlock > currentBlock) {
            break;
          }
        }
      } catch (error) {
        // If the contract doesn't have the AccessRevoked event, ignore this error
        console.warn('No AccessRevoked events found in contract');
      }

      // Convert to our standard event format
      const formattedPaymentEvents = paymentEvents.map(event => {
        // We need to cast the event to a type that has args
        const typedEvent = event as unknown as {
          args: { consumer: string; dataId: string; value: bigint };
          transactionHash: string;
        };

        return {
          eventType: 'PaymentReceived' as const,
          userAddress: typedEvent.args.consumer,
          dataId: typedEvent.args.dataId,
          transactionHash: typedEvent.transactionHash,
          paymentAmount: typedEvent.args.value?.toString() || '0',
        };
      });

      const formattedRevocationEvents = revocationEvents.map(event => {
        // We need to cast the event to a type that has args
        const typedEvent = event as unknown as {
          args: { user: string; dataId: string };
          transactionHash: string;
        };

        return {
          eventType: 'AccessRevoked' as const,
          userAddress: typedEvent.args.user,
          dataId: typedEvent.args.dataId,
          transactionHash: typedEvent.transactionHash,
        };
      });

      // Combine all events
      return [...formattedPaymentEvents, ...formattedRevocationEvents];
    } catch (error) {
      console.error('Error getting recent events:', error);
      return [];
    }
  }

  /**
   * Ensure the service is initialized
   */
  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('Blockchain service is not initialized. Call init() first.');
    }
  }

  /**
   * Ensure a signer is available for transactions
   */
  private ensureSigner(): void {
    if (!this.signer) {
      throw new Error('No signer available. Initialize with a private key to enable transactions.');
    }
  }

  /**
   * Get the JSON RPC provider instance
   * @returns The ethers.js provider instance
   */
  getProvider(): ethers.JsonRpcProvider {
    this.ensureInitialized();
    return this.provider;
  }
}

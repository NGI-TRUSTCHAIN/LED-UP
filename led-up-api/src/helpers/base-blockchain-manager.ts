/**
 * Blockchain manager for interacting with Ethereum blockchain.
 */
import { ethers } from 'ethers';

// Import ABIs for DID contracts
import { DidAuthABI, DidRegistryABI } from '../abi';
import {
  OWNER_PRIVATE_KEY,
  RPC_URL,
  DID_AUTH_CONTRACT_ADDRESS,
  DID_REGISTRY_CONTRACT_ADDRESS,
} from '../constants';

export class BaseBlockchainManager {
  protected provider: ethers.JsonRpcProvider;
  protected signer: ethers.Wallet;
  protected didAuthContract: ethers.Contract | null = null;
  protected didRegistryContract: ethers.Contract | null = null;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(RPC_URL);
    this.signer = new ethers.Wallet(OWNER_PRIVATE_KEY || '', this.provider);

    // Initialize contracts only if addresses are provided
    const didAuthAddress = DID_AUTH_CONTRACT_ADDRESS;
    const didRegistryAddress = DID_REGISTRY_CONTRACT_ADDRESS;

    if (didAuthAddress && didAuthAddress.trim() !== '') {
      this.didAuthContract = new ethers.Contract(didAuthAddress, DidAuthABI, this.signer);
    }

    if (didRegistryAddress && didRegistryAddress.trim() !== '') {
      this.didRegistryContract = new ethers.Contract(
        didRegistryAddress,
        DidRegistryABI,
        this.signer
      );
    }
  }

  /**
   * Ensures that a contract is initialized before use
   * @param contract The contract to check
   * @param contractName The name of the contract for error messages
   * @throws Error if the contract is not initialized
   */
  protected ensureContractInitialized(
    contract: ethers.Contract | null,
    contractName: string
  ): ethers.Contract {
    if (!contract) {
      throw new Error(
        `${contractName} is not initialized. Please check your environment variables.`
      );
    }
    return contract;
  }
}

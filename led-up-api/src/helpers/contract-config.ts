/**
 * Helper functions to get contract addresses and ABIs.
 */
import { getContractConfig } from '../config/contract-config';

/**
 * Get the address of a contract by its name.
 * @param contractName The name of the contract.
 * @returns The address of the contract.
 */
export function getContractAddress(contractName: string): string {
  const config = getContractConfig();

  switch (contractName) {
    case 'DID_REGISTRY':
      return config.didRegistry.address;
    case 'DID_AUTH':
      return config.didAuth.address;
    case 'DID_VERIFIER':
      return config.didVerifier.address;
    case 'DID_ISSUER':
      return config.didIssuer.address;
    case 'DID_ACCESS_CONTROL':
      return config.didAccessControl.address;
    case 'DATA_REGISTRY':
      return config.dataRegistry.address;
    case 'COMPENSATION':
      return config.compensation.address;
    case 'CONSENT':
      return config.consent.address;
    case 'TOKEN':
      return config.token.address;
    case 'ZKP':
      return config.zkp.address;
    default:
      throw new Error(`Unknown contract name: ${contractName}`);
  }
}

/**
 * Get the ABI of a contract by its name.
 * @param contractName The name of the contract.
 * @returns The ABI of the contract.
 */
export function getContractAbi(contractName: string): any {
  const config = getContractConfig();

  switch (contractName) {
    case 'DID_REGISTRY':
      return config.didRegistry.abi;
    case 'DID_AUTH':
      return config.didAuth.abi;
    case 'DID_VERIFIER':
      return config.didVerifier.abi;
    case 'DID_ISSUER':
      return config.didIssuer.abi;
    case 'DID_ACCESS_CONTROL':
      return config.didAccessControl.abi;
    case 'DATA_REGISTRY':
      return config.dataRegistry.abi;
    case 'COMPENSATION':
      return config.compensation.abi;
    case 'CONSENT':
      return config.consent.abi;
    case 'TOKEN':
      return config.token.abi;
    case 'ZKP':
      return config.zkp.abi;
    default:
      throw new Error(`Unknown contract name: ${contractName}`);
  }
}

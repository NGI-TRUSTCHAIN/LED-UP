/**
 * Configuration for smart contract addresses and ABIs.
 * In a production environment, these should be loaded from environment variables.
 */

// Import contract ABIs
import {
  DidAccessControlABI,
  CompensationABI,
  ConsentManagementABI,
  DataRegistryABI,
  DidAuthABI,
  DidIssuerABI,
  DidRegistryABI,
  DidVerifierABI,
  ERC20ABI,
} from '../abi';
import {
  DID_AUTH_CONTRACT_ADDRESS,
  DID_ISSUER_CONTRACT_ADDRESS,
  DID_REGISTRY_CONTRACT_ADDRESS,
  DID_VERIFIER_CONTRACT_ADDRESS,
  DID_ACCESS_CONTROL_CONTRACT_ADDRESS,
  DATA_REGISTRY_CONTRACT_ADDRESS,
  COMPENSATION_CONTRACT_ADDRESS,
  CONSENT_MANAGEMENT_CONTRACT_ADDRESS,
  TOKEN_CONTRACT_ADDRESS,
  ZKP_CONTRACT_ADDRESS,
} from '../constants';

/**
 * Contract configuration interface
 */
interface ContractConfig {
  didRegistry: {
    address: string;
    abi: typeof DidRegistryABI;
  };
  didAuth: {
    address: string;
    abi: typeof DidAuthABI;
  };
  didVerifier: {
    address: string;
    abi: typeof DidVerifierABI;
  };
  didIssuer: {
    address: string;
    abi: typeof DidIssuerABI;
  };
  didAccessControl: {
    address: string;
    abi: typeof DidAccessControlABI;
  };
  dataRegistry: {
    address: string;
    abi: typeof DataRegistryABI;
  };
  compensation: {
    address: string;
    abi: typeof CompensationABI;
  };
  consent: {
    address: string;
    abi: typeof ConsentManagementABI;
  };
  token: {
    address: string;
    abi: typeof ERC20ABI;
  };
  zkp: {
    address: string;
    abi: any;
  };
}

/**
 * Get contract configuration from environment variables or default values
 * @returns Contract configuration object
 */
export function getContractConfig(): ContractConfig {
  return {
    didRegistry: {
      address: DID_REGISTRY_CONTRACT_ADDRESS,
      abi: DidRegistryABI,
    },
    didAuth: {
      address: DID_AUTH_CONTRACT_ADDRESS,
      abi: DidAuthABI,
    },
    didVerifier: {
      address: DID_VERIFIER_CONTRACT_ADDRESS,
      abi: DidVerifierABI,
    },
    didIssuer: {
      address: DID_ISSUER_CONTRACT_ADDRESS,
      abi: DidIssuerABI,
    },
    didAccessControl: {
      address: DID_ACCESS_CONTROL_CONTRACT_ADDRESS,
      abi: DidAccessControlABI,
    },
    dataRegistry: {
      address: DATA_REGISTRY_CONTRACT_ADDRESS,
      abi: DataRegistryABI,
    },
    compensation: {
      address: COMPENSATION_CONTRACT_ADDRESS,
      abi: CompensationABI,
    },
    consent: {
      address: CONSENT_MANAGEMENT_CONTRACT_ADDRESS,
      abi: ConsentManagementABI,
    },
    token: {
      address: TOKEN_CONTRACT_ADDRESS,
      abi: ERC20ABI,
    },
    zkp: {
      address: ZKP_CONTRACT_ADDRESS,
      abi: [],
    },
  };
}

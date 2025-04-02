import { Address, Abi } from 'viem';
import { ContractConfig, ContractConfigs, ContractName } from './types';

import { DidAuthABI, DidRegistryABI, CompensationABI, ERC20ABI, DataRegistryABI } from '@/abi';

const DEFAULT_POLLING_INTERVAL = 1000; // 1 second

export const getContractConfig = (
  contractName: ContractName,
  address: Address,
  pollingInterval: number = DEFAULT_POLLING_INTERVAL
): ContractConfig => {
  switch (contractName) {
    case 'DataRegistry':
      return {
        address,
        abi: DataRegistryABI as unknown as Abi,
        defaultPollingInterval: pollingInterval,
        name: contractName,
      };
    case 'Compensation':
      return {
        address,
        abi: CompensationABI as unknown as Abi,
        defaultPollingInterval: pollingInterval,
        name: contractName,
      };
    case 'ERC20':
      return {
        address,
        abi: ERC20ABI as unknown as Abi,
        defaultPollingInterval: pollingInterval,
        name: contractName,
      };

    case 'DidAuth':
      return {
        address,
        abi: DidAuthABI as unknown as Abi,
        defaultPollingInterval: pollingInterval,
        name: contractName,
      };

    case 'DidRegistry':
      return {
        address,
        abi: DidRegistryABI as unknown as Abi,
        defaultPollingInterval: pollingInterval,
        name: contractName,
      };
    default:
      throw new Error(`Unknown contract name: ${contractName}`);
  }
};

export const createContractConfigs = (addresses: {
  [K in ContractName]: Address;
}): ContractConfigs => {
  return {
    DataRegistry: getContractConfig('DataRegistry', addresses.DataRegistry),
    Compensation: getContractConfig('Compensation', addresses.Compensation),
    ERC20: getContractConfig('ERC20', addresses.ERC20),
    DidAuth: getContractConfig('DidAuth', addresses.DidAuth),
    DidRegistry: getContractConfig('DidRegistry', addresses.DidRegistry),
  };
};

// Event names for each contract
export const DataRegistryEvents = {
  DataShared: 'DataShared',
  ProducerRecordAdded: 'ProducerRecordAdded',
  ProducerRecordUpdated: 'ProducerRecordUpdated',
  ProducerConsentUpdated: 'ProducerConsentUpdated',
  ProducerRecordStatusUpdated: 'ProducerRecordStatusUpdated',
} as const;

export const CompensationEvents = {
  PaymentProcessed: 'PaymentProcessed',
  ProducerPaid: 'ProducerPaid',
  ServiceFeeWithdrawn: 'ServiceFeeWithdrawn',
} as const;

export const ERC20Events = {
  Transfer: 'Transfer',
  Approval: 'Approval',
} as const;

// Event names by contract
export const ContractEvents = {
  DataRegistry: DataRegistryEvents,
  Compensation: CompensationEvents,
  ERC20: ERC20Events,
} as const;

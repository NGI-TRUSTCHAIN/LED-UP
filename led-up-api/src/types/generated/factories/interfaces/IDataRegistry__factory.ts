/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Interface, type ContractRunner } from 'ethers';
import type { IDataRegistry, IDataRegistryInterface } from '../../interfaces/IDataRegistry';

const _abi = [
  {
    inputs: [],
    name: 'DataRegistry__ConsentAlreadyGranted',
    type: 'error',
  },
  {
    inputs: [],
    name: 'DataRegistry__ConsentAlreadyRevoked',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'recordId',
        type: 'string',
      },
      {
        internalType: 'address',
        name: 'producer',
        type: 'address',
      },
    ],
    name: 'DataRegistry__ConsentNotAllowed',
    type: 'error',
  },
  {
    inputs: [],
    name: 'DataRegistry__InvalidDID',
    type: 'error',
  },
  {
    inputs: [],
    name: 'DataRegistry__InvalidInputParam',
    type: 'error',
  },
  {
    inputs: [],
    name: 'DataRegistry__InvalidRecord',
    type: 'error',
  },
  {
    inputs: [],
    name: 'DataRegistry__PaymentNotVerified',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'producer',
        type: 'address',
      },
    ],
    name: 'DataRegistry__ProducerNotFound',
    type: 'error',
  },
  {
    inputs: [],
    name: 'DataRegistry__RecordAlreadyExists',
    type: 'error',
  },
  {
    inputs: [],
    name: 'DataRegistry__RecordNotActive',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'recordId',
        type: 'string',
      },
    ],
    name: 'DataRegistry__RecordNotFound',
    type: 'error',
  },
  {
    inputs: [],
    name: 'DataRegistry__ServicePaused',
    type: 'error',
  },
  {
    inputs: [],
    name: 'DataRegistry__Unauthorized',
    type: 'error',
  },
  {
    inputs: [],
    name: 'DataRegistry__UnauthorizedConsumer',
    type: 'error',
  },
  {
    inputs: [],
    name: 'DataRegistry__UnauthorizedProducer',
    type: 'error',
  },
  {
    inputs: [],
    name: 'DataRegistry__UnauthorizedServiceProvider',
    type: 'error',
  },
  {
    inputs: [],
    name: 'DataRegistry__UnauthorizedVerifier',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'string',
        name: 'recordId',
        type: 'string',
      },
      {
        indexed: true,
        internalType: 'string',
        name: 'consumerDid',
        type: 'string',
      },
    ],
    name: 'AccessNotAllowed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'string',
        name: 'recordId',
        type: 'string',
      },
      {
        indexed: true,
        internalType: 'string',
        name: 'ownerDid',
        type: 'string',
      },
      {
        indexed: true,
        internalType: 'string',
        name: 'consumerDid',
        type: 'string',
      },
    ],
    name: 'ConsumerAuthorized',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'string',
        name: 'recordId',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'consumerDid',
        type: 'string',
      },
    ],
    name: 'ConsumerDeauthorized',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'string',
        name: 'recordId',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'timestamp',
        type: 'uint256',
      },
    ],
    name: 'DataDeactivated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'string',
        name: 'recordId',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'ownerDid',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'cid',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'hash',
        type: 'bytes32',
      },
    ],
    name: 'DataRegistered',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'producer',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'string',
        name: 'recordId',
        type: 'string',
      },
    ],
    name: 'DataRemoved',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'producer',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'consumer',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'recordId',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'cid',
        type: 'string',
      },
    ],
    name: 'DataShared',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'producer',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'string',
        name: 'recordId',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'cid',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'hash',
        type: 'bytes32',
      },
    ],
    name: 'DataUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'string',
        name: 'recordId',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'verifierDid',
        type: 'string',
      },
    ],
    name: 'DataVerified',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'string',
        name: 'url',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'hash',
        type: 'bytes32',
      },
    ],
    name: 'MetadataUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'contractAddress',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'caller',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'isPaused',
        type: 'bool',
      },
    ],
    name: 'PauseStateUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'producer',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'enum IDataRegistry.ConsentStatus',
        name: 'status',
        type: 'uint8',
      },
    ],
    name: 'ProducerConsentUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'producer',
        type: 'address',
      },
    ],
    name: 'ProducerRecordRemoved',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'producer',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'enum IDataRegistry.RecordStatus',
        name: 'status',
        type: 'uint8',
      },
    ],
    name: 'ProducerRecordStatusUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'producer',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'string',
        name: 'recordId',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'cid',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'hash',
        type: 'bytes32',
      },
    ],
    name: 'ProducerRecordUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'string',
        name: 'url',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'hash',
        type: 'bytes32',
      },
    ],
    name: 'ProviderMetadataUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'string',
        name: 'url',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'hash',
        type: 'bytes32',
      },
    ],
    name: 'ProviderSchemaUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'string',
        name: 'recordId',
        type: 'string',
      },
      {
        indexed: true,
        internalType: 'string',
        name: 'producerDid',
        type: 'string',
      },
    ],
    name: 'SharingNotAllowed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'newAddress',
        type: 'address',
      },
    ],
    name: 'TokenAddressUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'oldAddress',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newAddress',
        type: 'address',
      },
    ],
    name: 'TokenUpdated',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'bool',
        name: '_pause',
        type: 'bool',
      },
    ],
    name: 'changePauseState',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_tokenAddress',
        type: 'address',
      },
    ],
    name: 'changeTokenAddress',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_address',
        type: 'address',
      },
    ],
    name: 'getProducerConsent',
    outputs: [
      {
        internalType: 'enum IDataRegistry.ConsentStatus',
        name: '',
        type: 'uint8',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_producer',
        type: 'address',
      },
      {
        internalType: 'string',
        name: '_recordId',
        type: 'string',
      },
    ],
    name: 'getProducerRecord',
    outputs: [
      {
        components: [
          {
            internalType: 'bytes',
            name: 'signature',
            type: 'bytes',
          },
          {
            internalType: 'string',
            name: 'resourceType',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'cid',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'url',
            type: 'string',
          },
          {
            internalType: 'bytes32',
            name: 'hash',
            type: 'bytes32',
          },
          {
            internalType: 'bool',
            name: 'isVerified',
            type: 'bool',
          },
        ],
        internalType: 'struct IDataRegistry.HealthRecord',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_producer',
        type: 'address',
      },
    ],
    name: 'getProducerRecordCount',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_producer',
        type: 'address',
      },
    ],
    name: 'getProducerRecordInfo',
    outputs: [
      {
        components: [
          {
            internalType: 'string',
            name: 'ownerDid',
            type: 'string',
          },
          {
            internalType: 'address',
            name: 'producer',
            type: 'address',
          },
          {
            internalType: 'enum IDataRegistry.RecordStatus',
            name: 'status',
            type: 'uint8',
          },
          {
            internalType: 'enum IDataRegistry.ConsentStatus',
            name: 'consent',
            type: 'uint8',
          },
          {
            internalType: 'bool',
            name: 'isActive',
            type: 'bool',
          },
          {
            internalType: 'uint256',
            name: 'updatedAt',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'nonce',
            type: 'uint256',
          },
        ],
        internalType: 'struct IDataRegistry.DataRecordCore',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_producer',
        type: 'address',
      },
    ],
    name: 'getProducerRecordStatus',
    outputs: [
      {
        internalType: 'enum IDataRegistry.RecordStatus',
        name: '',
        type: 'uint8',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_producer',
        type: 'address',
      },
    ],
    name: 'getProducerRecords',
    outputs: [
      {
        internalType: 'enum IDataRegistry.RecordStatus',
        name: 'status',
        type: 'uint8',
      },
      {
        internalType: 'enum IDataRegistry.ConsentStatus',
        name: 'consentStatus',
        type: 'uint8',
      },
      {
        components: [
          {
            internalType: 'bytes',
            name: 'signature',
            type: 'bytes',
          },
          {
            internalType: 'string',
            name: 'resourceType',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'cid',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'url',
            type: 'string',
          },
          {
            internalType: 'bytes32',
            name: 'hash',
            type: 'bytes32',
          },
          {
            internalType: 'bool',
            name: 'isVerified',
            type: 'bool',
          },
        ],
        internalType: 'struct IDataRegistry.HealthRecord[]',
        name: 'records',
        type: 'tuple[]',
      },
      {
        internalType: 'string[]',
        name: 'recordIds',
        type: 'string[]',
      },
      {
        internalType: 'uint256',
        name: 'nonce',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getProviderMetadata',
    outputs: [
      {
        components: [
          {
            internalType: 'string',
            name: 'url',
            type: 'string',
          },
          {
            internalType: 'bytes32',
            name: 'hash',
            type: 'bytes32',
          },
        ],
        internalType: 'struct IDataRegistry.Metadata',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'recordId',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'requesterDid',
        type: 'string',
      },
    ],
    name: 'getRecordCid',
    outputs: [
      {
        internalType: 'string',
        name: 'cid',
        type: 'string',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getRecordSchema',
    outputs: [
      {
        components: [
          {
            components: [
              {
                internalType: 'string',
                name: 'url',
                type: 'string',
              },
              {
                internalType: 'bytes32',
                name: 'hash',
                type: 'bytes32',
              },
            ],
            internalType: 'struct IDataRegistry.Metadata',
            name: 'schemaRef',
            type: 'tuple',
          },
        ],
        internalType: 'struct IDataRegistry.Schema',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getTotalRecordsCount',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_producer',
        type: 'address',
      },
    ],
    name: 'producerExists',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: '_ownerDid',
        type: 'string',
      },
      {
        internalType: 'string',
        name: '_recordId',
        type: 'string',
      },
      {
        internalType: 'address',
        name: '_producer',
        type: 'address',
      },
      {
        internalType: 'bytes',
        name: '_signature',
        type: 'bytes',
      },
      {
        internalType: 'string',
        name: '_resourceType',
        type: 'string',
      },
      {
        internalType: 'enum IDataRegistry.ConsentStatus',
        name: '_consent',
        type: 'uint8',
      },
      {
        components: [
          {
            internalType: 'string',
            name: 'cid',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'url',
            type: 'string',
          },
          {
            internalType: 'bytes32',
            name: 'hash',
            type: 'bytes32',
          },
        ],
        internalType: 'struct IDataRegistry.RecordMetadata',
        name: '_metadata',
        type: 'tuple',
      },
    ],
    name: 'registerProducerRecord',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_producer',
        type: 'address',
      },
    ],
    name: 'removeProducerRecord',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'recordId',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'consumerDid',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'ownerDid',
        type: 'string',
      },
    ],
    name: 'shareData',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_producer',
        type: 'address',
      },
      {
        internalType: 'enum IDataRegistry.ConsentStatus',
        name: '_status',
        type: 'uint8',
      },
    ],
    name: 'updateProducerConsent',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'recordId',
        type: 'string',
      },
      {
        internalType: 'address',
        name: '_producer',
        type: 'address',
      },
      {
        internalType: 'bytes',
        name: 'signature',
        type: 'bytes',
      },
      {
        internalType: 'string',
        name: 'resourceType',
        type: 'string',
      },
      {
        internalType: 'enum IDataRegistry.RecordStatus',
        name: '_status',
        type: 'uint8',
      },
      {
        internalType: 'enum IDataRegistry.ConsentStatus',
        name: '_consent',
        type: 'uint8',
      },
      {
        components: [
          {
            internalType: 'string',
            name: 'cid',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'url',
            type: 'string',
          },
          {
            internalType: 'bytes32',
            name: 'hash',
            type: 'bytes32',
          },
        ],
        internalType: 'struct IDataRegistry.RecordMetadata',
        name: '_recordMetadata',
        type: 'tuple',
      },
      {
        internalType: 'string',
        name: 'updaterDid',
        type: 'string',
      },
    ],
    name: 'updateProducerRecord',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_producer',
        type: 'address',
      },
      {
        internalType: 'string',
        name: '_recordId',
        type: 'string',
      },
      {
        components: [
          {
            internalType: 'string',
            name: 'cid',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'url',
            type: 'string',
          },
          {
            internalType: 'bytes32',
            name: 'hash',
            type: 'bytes32',
          },
        ],
        internalType: 'struct IDataRegistry.RecordMetadata',
        name: '_metadata',
        type: 'tuple',
      },
    ],
    name: 'updateProducerRecordMetadata',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_producer',
        type: 'address',
      },
      {
        internalType: 'enum IDataRegistry.RecordStatus',
        name: '_status',
        type: 'uint8',
      },
    ],
    name: 'updateProducerRecordStatus',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'string',
            name: 'url',
            type: 'string',
          },
          {
            internalType: 'bytes32',
            name: 'hash',
            type: 'bytes32',
          },
        ],
        internalType: 'struct IDataRegistry.Metadata',
        name: '_metadata',
        type: 'tuple',
      },
    ],
    name: 'updateProviderMetadata',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              {
                internalType: 'string',
                name: 'url',
                type: 'string',
              },
              {
                internalType: 'bytes32',
                name: 'hash',
                type: 'bytes32',
              },
            ],
            internalType: 'struct IDataRegistry.Metadata',
            name: 'schemaRef',
            type: 'tuple',
          },
        ],
        internalType: 'struct IDataRegistry.Schema',
        name: '_schemaRef',
        type: 'tuple',
      },
    ],
    name: 'updateProviderRecordSchema',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'recordId',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'verifierDid',
        type: 'string',
      },
    ],
    name: 'verifyData',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export class IDataRegistry__factory {
  static readonly abi = _abi;
  static createInterface(): IDataRegistryInterface {
    return new Interface(_abi) as IDataRegistryInterface;
  }
  static connect(address: string, runner?: ContractRunner | null): IDataRegistry {
    return new Contract(address, _abi, runner) as unknown as IDataRegistry;
  }
}

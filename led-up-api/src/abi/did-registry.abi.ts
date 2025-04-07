// This ABI has been updated to match the DidRegistry.sol contract
// The contract doesn't have a 'didExists' function, so we need to use other methods to check if a DID exists

export const DidRegistryABI = [
  {
    inputs: [],
    name: 'DidRegistry__DIDAlreadyRegistered',
    type: 'error',
  },
  {
    inputs: [],
    name: 'DidRegistry__DeactivatedDID',
    type: 'error',
  },
  {
    inputs: [],
    name: 'DidRegistry__InvalidDID',
    type: 'error',
  },
  {
    inputs: [],
    name: 'DidRegistry__Unauthorized',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'string',
        name: 'did',
        type: 'string',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'timestamp',
        type: 'uint256',
      },
    ],
    name: 'DIDDeactivated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'string',
        name: 'did',
        type: 'string',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'controller',
        type: 'address',
      },
    ],
    name: 'DIDRegistered',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'string',
        name: 'did',
        type: 'string',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'timestamp',
        type: 'uint256',
      },
    ],
    name: 'DIDUpdated',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'addr',
        type: 'address',
      },
    ],
    name: 'addressToDID',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'did',
        type: 'string',
      },
    ],
    name: 'deactivateDid',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'did',
        type: 'string',
      },
    ],
    name: 'getController',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'did',
        type: 'string',
      },
    ],
    name: 'getDocument',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'did',
        type: 'string',
      },
    ],
    name: 'getDocumentForDid',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'did',
        type: 'string',
      },
    ],
    name: 'getLastUpdated',
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
        internalType: 'string',
        name: 'did',
        type: 'string',
      },
    ],
    name: 'getLastUpdatedForDid',
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
        internalType: 'string',
        name: 'did',
        type: 'string',
      },
    ],
    name: 'getPublicKey',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'did',
        type: 'string',
      },
    ],
    name: 'getPublicKeyForDid',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'did',
        type: 'string',
      },
    ],
    name: 'getSubject',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'did',
        type: 'string',
      },
    ],
    name: 'getSubjectForDid',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'did',
        type: 'string',
      },
    ],
    name: 'isActive',
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
        name: 'did',
        type: 'string',
      },
    ],
    name: 'isActiveForDid',
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
        name: 'did',
        type: 'string',
      },
    ],
    name: 'reactivateDid',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'did',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'document',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'publicKey',
        type: 'string',
      },
    ],
    name: 'registerDid',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'did',
        type: 'string',
      },
    ],
    name: 'resolveDid',
    outputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'subject',
            type: 'address',
          },
          {
            internalType: 'uint40',
            name: 'lastUpdated',
            type: 'uint40',
          },
          {
            internalType: 'bool',
            name: 'active',
            type: 'bool',
          },
          {
            internalType: 'string',
            name: 'publicKey',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'document',
            type: 'string',
          },
        ],
        internalType: 'struct DidRegistry.DIDDocument',
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
        name: 'did',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'newDocument',
        type: 'string',
      },
    ],
    name: 'updateDidDocument',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'did',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'newPublicKey',
        type: 'string',
      },
    ],
    name: 'updateDidPublicKey',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

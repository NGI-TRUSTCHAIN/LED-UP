export const ConsentManagementABI = [
  {
    inputs: [
      {
        internalType: 'address',
        name: '_didRegistryAddress',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'authority',
        type: 'address',
      },
    ],
    name: 'AccessManagedInvalidAuthority',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'caller',
        type: 'address',
      },
      {
        internalType: 'uint32',
        name: 'delay',
        type: 'uint32',
      },
    ],
    name: 'AccessManagedRequiredDelay',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'caller',
        type: 'address',
      },
    ],
    name: 'AccessManagedUnauthorized',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ConsentManagement__AlreadyGranted',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ConsentManagement__InvalidDID',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ConsentManagement__NotFound',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ConsentManagement__Unauthorized',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'authority',
        type: 'address',
      },
    ],
    name: 'AuthorityUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'string',
        name: 'producerDid',
        type: 'string',
      },
      {
        indexed: true,
        internalType: 'string',
        name: 'providerDid',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'purpose',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'expiryTime',
        type: 'uint256',
      },
    ],
    name: 'ConsentGranted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'string',
        name: 'producerDid',
        type: 'string',
      },
      {
        indexed: true,
        internalType: 'string',
        name: 'providerDid',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'reason',
        type: 'string',
      },
    ],
    name: 'ConsentRevoked',
    type: 'event',
  },
  {
    inputs: [],
    name: 'authority',
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
        name: 'providerDid',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'purpose',
        type: 'string',
      },
      {
        internalType: 'uint256',
        name: 'expiryTime',
        type: 'uint256',
      },
    ],
    name: 'grantConsent',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'producerDid',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'providerDid',
        type: 'string',
      },
    ],
    name: 'hasValidConsent',
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
    inputs: [],
    name: 'isConsumingScheduledOp',
    outputs: [
      {
        internalType: 'bytes4',
        name: '',
        type: 'bytes4',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'producerDid',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'providerDid',
        type: 'string',
      },
    ],
    name: 'queryConsent',
    outputs: [
      {
        internalType: 'enum ConsentManagement.ConsentStatus',
        name: 'status',
        type: 'uint8',
      },
      {
        internalType: 'uint256',
        name: 'timestamp',
        type: 'uint256',
      },
      {
        internalType: 'string',
        name: 'purpose',
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
        name: 'providerDid',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'reason',
        type: 'string',
      },
    ],
    name: 'revokeConsent',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newAuthority',
        type: 'address',
      },
    ],
    name: 'setAuthority',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

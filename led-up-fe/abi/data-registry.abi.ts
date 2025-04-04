export const DataRegistryABI = [
  {
    inputs: [
      {
        internalType: 'address',
        name: '_tokenAddress',
        type: 'address',
      },
      {
        internalType: 'address payable',
        name: '_provider',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_serviceFee',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '_didAuthAddress',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [],
    name: 'AccessControlBadConfirmation',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        internalType: 'bytes32',
        name: 'neededRole',
        type: 'bytes32',
      },
    ],
    name: 'AccessControlUnauthorizedAccount',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'consumer',
        type: 'address',
      },
      {
        internalType: 'string',
        name: 'recordId',
        type: 'string',
      },
    ],
    name: 'DataRegistry__AccessDenied',
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
    name: 'DataRegistry__AlreadyRegistered',
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
    name: 'DataRegistry__DidAuthNotInitialized',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'consumer',
        type: 'address',
      },
      {
        internalType: 'string',
        name: 'recordId',
        type: 'string',
      },
      {
        internalType: 'uint256',
        name: 'expiration',
        type: 'uint256',
      },
    ],
    name: 'DataRegistry__ExpiredAccess',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'provided',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'min',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'max',
        type: 'uint256',
      },
    ],
    name: 'DataRegistry__InvalidAccessDuration',
    type: 'error',
  },
  {
    inputs: [],
    name: 'DataRegistry__InvalidContentHash',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'did',
        type: 'string',
      },
    ],
    name: 'DataRegistry__InvalidDID',
    type: 'error',
  },
  {
    inputs: [],
    name: 'DataRegistry__InvalidDidAuthAddress',
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
    name: 'DataRegistry__PaymentNotVerified',
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
    name: 'DataRegistry__RecordAlreadyExists',
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
    name: 'DataRegistry__Unauthorized',
    type: 'error',
  },
  {
    inputs: [],
    name: 'EnforcedPause',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ExpectedPause',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
    ],
    name: 'OwnableInvalidOwner',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'OwnableUnauthorizedAccount',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ReentrancyGuardReentrantCall',
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
        internalType: 'address',
        name: 'consumer',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'consumerDid',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'uint40',
        name: 'expiration',
        type: 'uint40',
      },
      {
        indexed: false,
        internalType: 'uint8',
        name: 'accessLevel',
        type: 'uint8',
      },
    ],
    name: 'AccessGranted',
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
        internalType: 'address',
        name: 'consumer',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'consumerDid',
        type: 'string',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'revoker',
        type: 'address',
      },
    ],
    name: 'AccessRevoked',
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
        internalType: 'address',
        name: 'consumer',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'consumerDid',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'enum DataRegistry.AccessLevel',
        name: 'accessLevel',
        type: 'uint8',
      },
    ],
    name: 'AccessTriggered',
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
    name: 'CompensationUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'provider',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'enum DataRegistry.ConsentStatus',
        name: 'status',
        type: 'uint8',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'updater',
        type: 'address',
      },
    ],
    name: 'ConsentStatusChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
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
        internalType: 'enum DataRegistry.AccessLevel',
        name: 'accessLevel',
        type: 'uint8',
      },
      {
        indexed: false,
        internalType: 'uint40',
        name: 'expiration',
        type: 'uint40',
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
    name: 'DidAuthUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'Paused',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'provider',
        type: 'address',
      },
    ],
    name: 'ProviderAdded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'provider',
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
        internalType: 'enum DataRegistry.AccessLevel',
        name: 'accessLevel',
        type: 'uint8',
      },
      {
        indexed: false,
        internalType: 'uint40',
        name: 'timestamp',
        type: 'uint40',
      },
    ],
    name: 'ProviderAuthorized',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'provider',
        type: 'address',
      },
    ],
    name: 'ProviderRemoved',
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
        name: 'did',
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
        name: 'contentHash',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'provider',
        type: 'address',
      },
    ],
    name: 'RecordRegistered',
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
        internalType: 'enum DataRegistry.RecordStatus',
        name: 'status',
        type: 'uint8',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'updater',
        type: 'address',
      },
    ],
    name: 'RecordStatusChanged',
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
        name: 'cid',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'contentHash',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'provider',
        type: 'address',
      },
    ],
    name: 'RecordUpdated',
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
        internalType: 'address',
        name: 'verifier',
        type: 'address',
      },
    ],
    name: 'RecordVerified',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'previousAdminRole',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'newAdminRole',
        type: 'bytes32',
      },
    ],
    name: 'RoleAdminChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
    ],
    name: 'RoleGranted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
    ],
    name: 'RoleRevoked',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'Unpaused',
    type: 'event',
  },
  {
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_provider',
        type: 'address',
      },
    ],
    name: 'addProvider',
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
        name: 'consumerAddress',
        type: 'address',
      },
    ],
    name: 'checkAccess',
    outputs: [
      {
        internalType: 'bool',
        name: 'hasAccess',
        type: 'bool',
      },
      {
        internalType: 'uint40',
        name: 'expiration',
        type: 'uint40',
      },
      {
        internalType: 'uint8',
        name: 'accessLevel',
        type: 'uint8',
      },
      {
        internalType: 'bool',
        name: 'isRevoked',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'didAuth',
    outputs: [
      {
        internalType: 'contract DidAuth',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getCompensationAddress',
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
        internalType: 'address',
        name: 'producer',
        type: 'address',
      },
    ],
    name: 'getProducerMetadata',
    outputs: [
      {
        internalType: 'string',
        name: 'did',
        type: 'string',
      },
      {
        internalType: 'uint8',
        name: 'consent',
        type: 'uint8',
      },
      {
        internalType: 'uint16',
        name: 'entries',
        type: 'uint16',
      },
      {
        internalType: 'bool',
        name: 'isActive',
        type: 'bool',
      },
      {
        internalType: 'uint40',
        name: 'lastUpdated',
        type: 'uint40',
      },
      {
        internalType: 'uint40',
        name: 'nonce',
        type: 'uint40',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'producer',
        type: 'address',
      },
    ],
    name: 'getProducerRecords',
    outputs: [
      {
        internalType: 'string[]',
        name: 'recordIds',
        type: 'string[]',
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
    ],
    name: 'getRecordInfo',
    outputs: [
      {
        internalType: 'bool',
        name: 'isVerified',
        type: 'bool',
      },
      {
        components: [
          {
            internalType: 'uint8',
            name: 'resourceType',
            type: 'uint8',
          },
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
          {
            internalType: 'uint32',
            name: 'sharedCount',
            type: 'uint32',
          },
          {
            internalType: 'uint40',
            name: 'updatedAt',
            type: 'uint40',
          },
          {
            internalType: 'uint24',
            name: 'dataSize',
            type: 'uint24',
          },
          {
            internalType: 'bytes32',
            name: 'contentHash',
            type: 'bytes32',
          },
          {
            internalType: 'string',
            name: 'cid',
            type: 'string',
          },
        ],
        internalType: 'struct DataRegistry.ResourceMetadata',
        name: 'metadata',
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
    ],
    name: 'getRecordProducer',
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
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
    ],
    name: 'getRoleAdmin',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getTotalRecords',
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
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'hasRole',
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
        internalType: 'address',
        name: '_provider',
        type: 'address',
      },
      {
        internalType: 'string',
        name: 'recordId',
        type: 'string',
      },
    ],
    name: 'isAuthorizedProvider',
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
        name: 'recordId',
        type: 'string',
      },
    ],
    name: 'isRecordVerified',
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
    name: 'owner',
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
    inputs: [],
    name: 'pause',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'paused',
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
        internalType: 'enum DataRegistry.RecordStatus',
        name: '_status',
        type: 'uint8',
      },
      {
        internalType: 'enum DataRegistry.ConsentStatus',
        name: '_consent',
        type: 'uint8',
      },
    ],
    name: 'registerProducer',
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
        name: 'cid',
        type: 'string',
      },
      {
        internalType: 'bytes32',
        name: 'contentHash',
        type: 'bytes32',
      },
      {
        internalType: 'enum DataRegistry.ResourceType',
        name: 'resourceType',
        type: 'uint8',
      },
      {
        internalType: 'uint24',
        name: 'dataSize',
        type: 'uint24',
      },
    ],
    name: 'registerRecord',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_provider',
        type: 'address',
      },
    ],
    name: 'removeProvider',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: 'callerConfirmation',
        type: 'address',
      },
    ],
    name: 'renounceRole',
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
        name: 'consumerAddress',
        type: 'address',
      },
    ],
    name: 'revokeAccess',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'revokeRole',
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
        name: 'consumerAddress',
        type: 'address',
      },
      {
        internalType: 'uint40',
        name: 'accessDuration',
        type: 'uint40',
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
        internalType: 'string',
        name: 'recordId',
        type: 'string',
      },
      {
        internalType: 'address',
        name: 'provider',
        type: 'address',
      },
      {
        internalType: 'uint40',
        name: 'accessDuration',
        type: 'uint40',
      },
      {
        internalType: 'enum DataRegistry.AccessLevel',
        name: 'accessLevel',
        type: 'uint8',
      },
    ],
    name: 'shareToProvider',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes4',
        name: 'interfaceId',
        type: 'bytes4',
      },
    ],
    name: 'supportsInterface',
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
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'transferOwnership',
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
    ],
    name: 'triggerAccess',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'unpause',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_compensationAddress',
        type: 'address',
      },
    ],
    name: 'updateCompensationAddress',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_didAuthAddress',
        type: 'address',
      },
    ],
    name: 'updateDidAuthAddress',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'producer',
        type: 'address',
      },
      {
        internalType: 'enum DataRegistry.ConsentStatus',
        name: 'consentStatus',
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
        internalType: 'string',
        name: 'cid',
        type: 'string',
      },
      {
        internalType: 'bytes32',
        name: 'contentHash',
        type: 'bytes32',
      },
    ],
    name: 'updateRecord',
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
    ],
    name: 'verifyRecord',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

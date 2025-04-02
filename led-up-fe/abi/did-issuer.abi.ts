export const DidIssuerABI = [
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
    inputs: [],
    name: 'DidIssuer__CredentialAlreadyIssued',
    type: 'error',
  },
  {
    inputs: [],
    name: 'DidIssuer__InvalidSubject',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'string',
        name: 'credentialType',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'subject',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'credentialId',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'timestamp',
        type: 'uint256',
      },
    ],
    name: 'CredentialIssued',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'credentialId',
        type: 'bytes32',
      },
    ],
    name: 'isCredentialValid',
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
        name: 'credentialType',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'subject',
        type: 'string',
      },
      {
        internalType: 'bytes32',
        name: 'credentialId',
        type: 'bytes32',
      },
    ],
    name: 'issueCredential',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

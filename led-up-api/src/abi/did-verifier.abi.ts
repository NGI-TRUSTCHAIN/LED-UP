export const DidVerifierABI = [
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
    name: 'DidVerifier__InvalidCredential',
    type: 'error',
  },
  {
    inputs: [],
    name: 'DidVerifier__InvalidIssuer',
    type: 'error',
  },
  {
    inputs: [],
    name: 'DidVerifier__UntrustedIssuer',
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
        internalType: 'address',
        name: 'issuer',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'trusted',
        type: 'bool',
      },
    ],
    name: 'IssuerTrustStatusUpdated',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'credentialType',
        type: 'string',
      },
      {
        internalType: 'address',
        name: 'issuer',
        type: 'address',
      },
    ],
    name: 'isIssuerTrusted',
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
        internalType: 'address',
        name: 'issuer',
        type: 'address',
      },
      {
        internalType: 'bool',
        name: 'trusted',
        type: 'bool',
      },
    ],
    name: 'setIssuerTrustStatus',
    outputs: [],
    stateMutability: 'nonpayable',
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
        internalType: 'address',
        name: 'issuer',
        type: 'address',
      },
      {
        internalType: 'string',
        name: 'subject',
        type: 'string',
      },
    ],
    name: 'verifyCredential',
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
];

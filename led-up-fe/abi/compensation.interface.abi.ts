export const CompensationInterfaceABI = [
  {
    inputs: [],
    name: 'Compensation__InsufficientBalance',
    type: 'error',
  },
  {
    inputs: [],
    name: 'Compensation__InvalidAddress',
    type: 'error',
  },
  {
    inputs: [],
    name: 'Compensation__InvalidConsumer',
    type: 'error',
  },
  {
    inputs: [],
    name: 'Compensation__InvalidConsumerDID',
    type: 'error',
  },
  {
    inputs: [],
    name: 'Compensation__InvalidInputParam',
    type: 'error',
  },
  {
    inputs: [],
    name: 'Compensation__InvalidProducer',
    type: 'error',
  },
  {
    inputs: [],
    name: 'Compensation__InvalidProducerDID',
    type: 'error',
  },
  {
    inputs: [],
    name: 'Compensation__InvalidRole',
    type: 'error',
  },
  {
    inputs: [],
    name: 'Compensation__LowDepositAmount',
    type: 'error',
  },
  {
    inputs: [],
    name: 'Compensation__MinimumWithdrawAmount',
    type: 'error',
  },
  {
    inputs: [],
    name: 'Compensation__NoBalanceToWithdraw',
    type: 'error',
  },
  {
    inputs: [],
    name: 'Compensation__OnlyOwnerCanWithdraw',
    type: 'error',
  },
  {
    inputs: [],
    name: 'Compensation__ProducerAlreadyExists',
    type: 'error',
  },
  {
    inputs: [],
    name: 'Compensation__TokenTransferFailed',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: '_producer',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: '_consumer',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'serviceFee',
        type: 'uint256',
      },
    ],
    name: 'PaymentProcessed',
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
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'timestamp',
        type: 'uint256',
      },
    ],
    name: 'ProducerPaid',
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
        internalType: 'uint256',
        name: 'timestamp',
        type: 'uint256',
      },
    ],
    name: 'ProducerRemoved',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'initiator',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'oldServiceFee',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'newServiceFee',
        type: 'uint256',
      },
    ],
    name: 'ServiceFeeChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'wallet',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'timestamp',
        type: 'uint256',
      },
    ],
    name: 'ServiceFeeWithdrawn',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'initiator',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'oldUnitPrice',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newUnitPrice',
        type: 'uint256',
      },
    ],
    name: 'UnitPriceChanged',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_newServiceFee',
        type: 'uint256',
      },
    ],
    name: 'changeServiceFee',
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
        internalType: 'uint256',
        name: '_newUnitPrice',
        type: 'uint256',
      },
    ],
    name: 'changeUnitPrice',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getMinimumWithdrawAmount',
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
    inputs: [],
    name: 'getPaymentTokenAddress',
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
    name: 'getProducerBalance',
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
    name: 'getProducerBalance',
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
    inputs: [],
    name: 'getProviderBalance',
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
    inputs: [],
    name: 'getServiceFee',
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
    inputs: [],
    name: 'getUnitPrice',
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
    inputs: [],
    name: 'pauseService',
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
        internalType: 'uint256',
        name: 'dataSize',
        type: 'uint256',
      },
      {
        internalType: 'string',
        name: 'consumerDid',
        type: 'string',
      },
    ],
    name: 'processPayment',
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
    name: 'producerExist',
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
        name: '_producer',
        type: 'address',
      },
    ],
    name: 'removeProducer',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_amount',
        type: 'uint256',
      },
    ],
    name: 'setMinimumWithdrawAmount',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'unpauseService',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: '_recordId',
        type: 'string',
      },
    ],
    name: 'verifyPayment',
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
        internalType: 'uint256',
        name: '_amount',
        type: 'uint256',
      },
    ],
    name: 'withdrawProducerBalance',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_amount',
        type: 'uint256',
      },
    ],
    name: 'withdrawServiceFee',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

export const verifierAddress = process.env.VERIFIER_CONTRACT_ADDRESS!;
export const verifierABI = [
  {
    type: 'function',
    name: 'verifyTx',
    inputs: [
      {
        name: 'proof',
        type: 'tuple',
        internalType: 'struct Verifier.Proof',
        components: [
          {
            name: 'a',
            type: 'tuple',
            internalType: 'struct Pairing.G1Point',
            components: [
              { name: 'X', type: 'uint256', internalType: 'uint256' },
              { name: 'Y', type: 'uint256', internalType: 'uint256' },
            ],
          },
          {
            name: 'b',
            type: 'tuple',
            internalType: 'struct Pairing.G2Point',
            components: [
              { name: 'X', type: 'uint256[2]', internalType: 'uint256[2]' },
              { name: 'Y', type: 'uint256[2]', internalType: 'uint256[2]' },
            ],
          },
          {
            name: 'c',
            type: 'tuple',
            internalType: 'struct Pairing.G1Point',
            components: [
              { name: 'X', type: 'uint256', internalType: 'uint256' },
              { name: 'Y', type: 'uint256', internalType: 'uint256' },
            ],
          },
        ],
      },
      { name: 'input', type: 'uint256[2]', internalType: 'uint256[2]' },
    ],
    outputs: [{ name: 'r', type: 'bool', internalType: 'bool' }],
    stateMutability: 'view',
  },
];

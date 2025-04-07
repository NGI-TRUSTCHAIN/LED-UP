import { ContractTypesMap } from 'hardhat/types/artifacts';

// Define the proof structure for ZKP verifiers
export type ZKProof = {
  a: readonly [bigint, bigint];
  b: readonly [readonly [bigint, bigint], readonly [bigint, bigint]];
  c: readonly [bigint, bigint];
};

// Define the input types for different verifiers
export type AgeVerifierInput = readonly [bigint]; // Age threshold
export type HashVerifierInput = readonly [bigint, bigint]; // Hash components
export type FHIRVerifierInput = readonly [bigint, bigint, bigint, bigint]; // ResourceType, Hash[0], Hash[1], RequiredField

// Type for the expected hash in FHIR and Hash verifiers
export type ExpectedHash = readonly [bigint, bigint];

// Helper function to convert arrays to tuple types
export function toTuple<T extends readonly any[], L extends number>(arr: T, length: L): T {
  if (arr.length !== length) {
    throw new Error(`Expected array of length ${length}, got ${arr.length}`);
  }
  return arr as T;
}

// Helper function to convert proof object to the expected format
export function formatProof(
  proof: ZKProof
): [
  readonly [bigint, bigint],
  readonly [readonly [bigint, bigint], readonly [bigint, bigint]],
  readonly [bigint, bigint]
] {
  return [proof.a, proof.b, proof.c];
}

// Viem contract interfaces
export interface AgeVerifierContract {
  address: string;
  read: {
    verify: (
      args: [
        readonly [bigint, bigint],
        readonly [readonly [bigint, bigint], readonly [bigint, bigint]],
        readonly [bigint, bigint],
        readonly bigint[]
      ]
    ) => Promise<boolean>;
    verifyAge: (
      args: [
        readonly [bigint, bigint],
        readonly [readonly [bigint, bigint], readonly [bigint, bigint]],
        readonly [bigint, bigint],
        bigint
      ]
    ) => Promise<boolean>;
  };
  write: {
    verify: (
      args: [
        readonly [bigint, bigint],
        readonly [readonly [bigint, bigint], readonly [bigint, bigint]],
        readonly [bigint, bigint],
        readonly bigint[]
      ],
      options?: any
    ) => Promise<`0x${string}`>;
    verifyAge: (
      args: [
        readonly [bigint, bigint],
        readonly [readonly [bigint, bigint], readonly [bigint, bigint]],
        readonly [bigint, bigint],
        bigint
      ],
      options?: any
    ) => Promise<`0x${string}`>;
  };
}

export interface HashVerifierContract {
  address: string;
  read: {
    verify: (
      args: [
        readonly [bigint, bigint],
        readonly [readonly [bigint, bigint], readonly [bigint, bigint]],
        readonly [bigint, bigint],
        readonly bigint[]
      ]
    ) => Promise<boolean>;
    verifyHash: (
      args: [
        readonly [bigint, bigint],
        readonly [readonly [bigint, bigint], readonly [bigint, bigint]],
        readonly [bigint, bigint],
        readonly [bigint, bigint]
      ]
    ) => Promise<boolean>;
  };
  write: {
    verify: (
      args: [
        readonly [bigint, bigint],
        readonly [readonly [bigint, bigint], readonly [bigint, bigint]],
        readonly [bigint, bigint],
        readonly bigint[]
      ],
      options?: any
    ) => Promise<`0x${string}`>;
    verifyHash: (
      args: [
        readonly [bigint, bigint],
        readonly [readonly [bigint, bigint], readonly [bigint, bigint]],
        readonly [bigint, bigint],
        readonly [bigint, bigint]
      ],
      options?: any
    ) => Promise<`0x${string}`>;
  };
}

export interface FHIRVerifierContract {
  address: string;
  read: {
    verify: (
      args: [
        readonly [bigint, bigint],
        readonly [readonly [bigint, bigint], readonly [bigint, bigint]],
        readonly [bigint, bigint],
        readonly bigint[]
      ]
    ) => Promise<boolean>;
    verifyFHIRResource: (
      args: [
        readonly [bigint, bigint],
        readonly [readonly [bigint, bigint], readonly [bigint, bigint]],
        readonly [bigint, bigint],
        number,
        readonly [bigint, bigint],
        bigint
      ]
    ) => Promise<boolean>;
    getResourceTypeString: (args: [number]) => Promise<string>;
  };
  write: {
    verify: (
      args: [
        readonly [bigint, bigint],
        readonly [readonly [bigint, bigint], readonly [bigint, bigint]],
        readonly [bigint, bigint],
        readonly bigint[]
      ],
      options?: any
    ) => Promise<`0x${string}`>;
    verifyFHIRResource: (
      args: [
        readonly [bigint, bigint],
        readonly [readonly [bigint, bigint], readonly [bigint, bigint]],
        readonly [bigint, bigint],
        number,
        readonly [bigint, bigint],
        bigint
      ],
      options?: any
    ) => Promise<`0x${string}`>;
  };
}

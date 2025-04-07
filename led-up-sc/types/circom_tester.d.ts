declare module 'circom_tester' {
  export interface CircomTester {
    calculateWitness: (input: Record<string, any>) => Promise<bigint[]>;
    checkConstraints: (witness: bigint[]) => Promise<void>;
  }

  export const wasm: {
    (path: string): Promise<CircomTester>;
  };

  export const c: {
    (path: string): Promise<CircomTester>;
  };
}

import * as fs from 'fs';
import { buildPoseidon } from 'circomlibjs';
import { groth16 } from 'snarkjs';

export async function generateProof(input: any, wasmPath: string, zkeyPath: string) {
  // Read the wasm and zkey files
  const wasm = fs.readFileSync(wasmPath);
  const zkey = fs.readFileSync(zkeyPath);

  // Generate the witness
  const { proof, publicSignals } = await groth16.fullProve(input, wasmPath, zkeyPath);

  return { proof, publicSignals };
}

export async function verifyProof(proof: any, publicSignals: any[], vkeyPath: string) {
  // Read the verification key
  const vKey = JSON.parse(fs.readFileSync(vkeyPath, 'utf8'));

  // Verify the proof
  return await groth16.verify(vKey, publicSignals, proof);
}

export async function calculatePoseidonHash(inputs: number[]): Promise<bigint> {
  const poseidon = await buildPoseidon();
  const hash = poseidon(inputs.map(BigInt));
  return BigInt(poseidon.F.toString(hash));
}

export function splitHashForCircuit(hash: bigint): [string, string] {
  // Convert the hash to a string and split it into two parts
  const hashStr = hash.toString();
  const midPoint = Math.floor(hashStr.length / 2);
  return [hashStr.slice(0, midPoint), hashStr.slice(midPoint)];
}

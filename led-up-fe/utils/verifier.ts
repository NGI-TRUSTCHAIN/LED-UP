import { ethers } from 'ethers';
import { initialize, ZoKratesProvider } from 'zokrates-js';
import crypto from 'crypto';
import { verifierABI, verifierAddress } from './constants';

interface FHIRData extends Record<string, any> {}

class FHIRVerifier {
  private provider: ethers.Provider;
  private verifierContract: ethers.Contract;
  private zokratesProvider: any;

  constructor(providerUrl: string) {
    this.provider = new ethers.JsonRpcProvider(providerUrl);
    this.verifierContract = new ethers.Contract(verifierAddress, verifierABI, this.provider);
  }

  async initialize() {
    this.zokratesProvider = (await initialize()) as ZoKratesProvider;
  }

  private hashFHIRData(fhirData: FHIRData): string {
    const fhirString = JSON.stringify(fhirData, Object.keys(fhirData).sort());
    return crypto.createHash('sha256').update(fhirString).digest('hex');
  }

  private async generateProof(fhirHash: string, expectedHash: string): Promise<any> {
    const source = `
      import "hashes/sha256/512bitPacked" as sha256packed;

      def main(private field[4] data, field expectedHash) -> field {
          field[2] dataHash = sha256packed(data);
          field result = if dataHash[0] == expectedHash { 1 } else { 0 };
          return result;
      }
    `;

    const artifacts = this.zokratesProvider.compile(source);

    // Convert hash to field elements
    const hashBigInt = BigInt(`0x${fhirHash}`);
    const data = [
      (hashBigInt >> BigInt(192)) & ((BigInt(1) << BigInt(64)) - BigInt(1)),
      (hashBigInt >> BigInt(128)) & ((BigInt(1) << BigInt(64)) - BigInt(1)),
      (hashBigInt >> BigInt(64)) & ((BigInt(1) << BigInt(64)) - BigInt(1)),
      hashBigInt & ((BigInt(1) << BigInt(64)) - BigInt(1)),
    ];

    const { witness, output } = this.zokratesProvider.computeWitness(artifacts, [data, expectedHash]);
    const proof = this.zokratesProvider.generateProof(artifacts.program, witness);

    return { proof, output };
  }

  async verifyFHIRData(fhirData: FHIRData, expectedHash: string): Promise<boolean> {
    const fhirHash = this.hashFHIRData(fhirData);
    const { proof, output } = await this.generateProof(fhirHash, expectedHash);

    const result = await this.verifierContract.verifyTx(proof.proof.a, proof.proof.b, proof.proof.c, proof.inputs);

    return result;
  }
}

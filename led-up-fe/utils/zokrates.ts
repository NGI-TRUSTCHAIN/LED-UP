import { initialize, VerificationKey, type ZoKratesProvider } from 'zokrates-js';
import { ethers } from 'ethers';
import { verifierABI, verifierAddress } from './constants';
// import { readFile } from 'fs/promises';
// const snarkjs = require('snarkjs');

// This path should be the path to your ZoKrates artifacts, like proving key and program
const PROVING_KEY = '/path/to/proving.key';
const PROGRAM = '/path/to/program';
type Field4 = [string, string, string, string];

export async function generateProof(
  secret: Field4,
  expectedHash: string,
  programHex: string,
  provingKeyHex: string,
  zkey: Uint8Array,
  verificationKey?: VerificationKey
) {
  // Initialize ZoKrates provider
  try {
    const zokratesProvider = await initialize();

    // const source = (await readFile('zkp/hashVerifier/hashCheck.zok')).toString();
    // const programHex = (await readFile('zkp/hashVerifier/hashCheck')).toString('hex');
    // const verificationKey = JSON.parse((await readFile('zkp/ageVerifier/verification.key')).toString());
    // const provingKeyHex = (await readFile('zkp/hashVerifier/proving.key')).toString('hex');

    // Convert hex strings to Uint8Array
    const program = Uint8Array.from(Buffer.from(programHex, 'hex'));
    // Compile the ZoKrates program
    // const { program } = await zokratesProvider.compile(PROGRAM_SOURCE);
    const provingKey = Uint8Array.from(Buffer.from(provingKeyHex, 'hex'));

    // Convert the inputs to BigInt strings as required by ZoKrates
    const formattedSecrets = secret.map((s) => BigInt(s).toString());

    const formattedExpectedHash = BigInt(expectedHash).toString();

    // Create input for ZoKrates program
    const inputs = [...formattedSecrets, formattedExpectedHash];

    // Compute witness using ZoKrates
    const { witness, output } = await zokratesProvider.computeWitness(program, inputs, {
      snarkjs: true, // optional to use snarkjs
    });

    // Generate proof using the proving key
    const zokratesProof = await zokratesProvider.generateProof(program, witness, provingKey);

    // generate a proof with snarkjs
    // const zkey = Uint8Array.from(
    //   Buffer.from((await readFile('zkp/hashVerifier/snarkjs/hashCheck.zkey')).toString('hex'), 'hex')
    // );

    // const snarkjsProof = await snarkjs.groth16.prove(zkey, witness);

    const isValid = await zokratesProvider.verify(verificationKey as VerificationKey, zokratesProof);

    return zokratesProof;
  } catch (e: any) {
    console.log(e);
  }
}

export async function verifyProofOffChainWithZokrates(proofData: any, zokratesProvider: ZoKratesProvider) {
  const { zokratesProof, snarkjsProof } = proofData;
  return await zokratesProvider.verify(proofData.verificationKey, zokratesProof);
}

// export async function verifyProofOffChainWithSnarkjs(proofData: any) {
//   const { snarkjsProof } = proofData;
//   return await snarkjs.groth16.verify(proofData.snarkjs.vkey, snarkjsProof.publicSignals, snarkjsProof.proof);
// }

// export const loadProvingKey = async (sourcePath: string, provingKeyPath: string) => {
//   const source = (await readFile(sourcePath)).toString();
//   const provingKey = (await readFile(provingKeyPath)).toString('hex');
//   const provingKeyArray = Uint8Array.from(Buffer.from(provingKey, 'hex'));

//   return { source, provingKey: provingKeyArray };
// };

export async function verifyProofOnChain(proofData: any) {
  let signer = null;
  let provider;
  if (window.ethereum === null) {
    provider = ethers.getDefaultProvider();
  } else {
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
  }

  const verifierContract = new ethers.Contract(verifierAddress, verifierABI, signer);

  const { proof, publicSignals } = proofData;

  const a = proof.proof.a;
  const b = proof.proof.b;
  const c = proof.proof.c;
  const input = publicSignals;

  const isValid = await verifierContract.verifyTx(a, b, c, input);

  return isValid;
}

export async function verifyProofOnChainV2(proofData: any) {
  let signer = null;
  let provider;
  if (window.ethereum === null) {
    provider = ethers.getDefaultProvider();
  } else {
    provider = new ethers.JsonRpcProvider('http://localhost:8545');
    signer = await provider.getSigner();
  }

  const verifierContract = new ethers.Contract(verifierAddress, verifierABI, signer);

  const { proof, publicSignals } = proofData;

  const a = proof.proof.a;
  const b = proof.proof.b;
  const c = proof.proof.c;
  const input = publicSignals;

  const isValid = await verifierContract.verifyTx(a, b, c, input);

  return isValid;
}

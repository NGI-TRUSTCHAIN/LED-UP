import { initialize } from 'zokrates-js';
import crypto from 'crypto';

async function runZokrates() {
  // Step 1: Initialize ZoKrates
  const zokratesProvider = await initialize();

  // Step 2: Load the ZoKrates program
  const source = `
        import "hashes/sha256/512bitPacked" as sha256packed;

        def main(private field[4] data, field expectedHash) -> field {
            // Hash the original health data
            field[2] dataHash = sha256packed(data);

            // Verify that the computed hash matches the expected hash stored on IPFS
              field result = if dataHash[0] == expectedHash { 1 } else { 0 };
            return result;
        }
    `;

  // Step 3: Compile the program
  const artifacts = zokratesProvider.compile(source);

  // Step 4: Define your input values
  // Simulate the concatenation of four field elements
  const data = [
    Buffer.from('01', 'hex'), // Field element 1
    Buffer.from('02', 'hex'), // Field element 2
    Buffer.from('03', 'hex'), // Field element 3
    Buffer.from('04', 'hex'), // Field element 4
  ];

  // Concatenate the data into a single buffer (simulating 512 bits or 64 bytes)
  const concatenatedData = Buffer.concat(data);

  // Hash the concatenated data using SHA-256
  const hash = crypto.createHash('sha256').update(concatenatedData).digest('hex');

  const expectedHashPart1Int = BigInt('0x' + hash).toString(); // Convert to decimal

  const sendData = ['0x00', '0x01', '0x02', '0x03'];
  const sendDataBigInt = sendData.map((s) => BigInt(s).toString());

  const { witness, output } = zokratesProvider.computeWitness(artifacts, [sendDataBigInt, expectedHashPart1Int]);

  // run setup
  const keypair = zokratesProvider.setup(artifacts.program);
  // Step 6: Generate the proof
  // const { proof, inputs } = await zokratesProvider.generateProof(zokratesProvider, compiledProgram, witness);

  // generate proof
  const proof = zokratesProvider.generateProof(artifacts.program, witness, keypair.pk);

  // export solidity verifier
  // const verifier = zokratesProvider.exportSolidityVerifier(keypair.vk);

  // or verify off-chain
  const isVerified = zokratesProvider.verify(keypair.vk, proof);
}

runZokrates().catch(console.error);

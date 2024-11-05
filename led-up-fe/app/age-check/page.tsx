import AgeProof from '@/components/zkp/ageZok';
import Verifier from '@/components/zkp/Verifier';
import { readFile } from 'fs/promises';
import React from 'react';

const Page = async () => {
  const source = (await readFile('zkp/ageVerifier/ageCheck.zok')).toString();
  const program = (await readFile('zkp/ageVerifier/ageCheck')).toString('hex');
  const verificationKey = JSON.parse((await readFile('zkp/ageVerifier/verification.key')).toString());
  const provingKey = (await readFile('zkp/ageVerifier/proving.key')).toString('hex');

  // snarkjs artifacts
  const zkey = (await readFile('zkp/ageVerifier/snarkjs/ageCheck.zkey')).toString('hex');
  const vkey = JSON.parse((await readFile('zkp/ageVerifier/snarkjs/verification_key.json')).toString());
  return (
    <div>
      <AgeProof
        source={source}
        program={program}
        verificationKey={verificationKey}
        provingKey={provingKey}
        snarkjs={{
          zkey,
          vkey,
        }}
      />

      {/* <Verifier /> */}
    </div>
  );
};

export default Page;

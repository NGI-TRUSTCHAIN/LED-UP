import HashProof from '@/components/zkp/HashCheck';
// import Verifier from '@/components/zkp/Verifier';
import { readFile } from 'fs/promises';
import React from 'react';

const Page = async () => {
  const source = (await readFile('zkp/hashVerifier/hashCheck.zok')).toString();
  const program = (await readFile('zkp/hashVerifier/hashCheck')).toString('hex');
  const verificationKey = JSON.parse((await readFile('zkp/hashVerifier/verification.key')).toString());
  const provingKey = (await readFile('zkp/hashVerifier/proving.key')).toString('hex');

  // snarkjs artifacts
  const zkey = (await readFile('zkp/hashVerifier/snarkjs/hashCheck.zkey')).toString('hex');
  const vkey = JSON.parse((await readFile('zkp/hashVerifier/snarkjs/verification_key.json')).toString());
  return (
    <div>
      {/* <Verifier /> */}
      <HashProof
        source={source}
        program={program}
        verificationKey={verificationKey}
        provingKey={provingKey}
        snarkjs={{
          zkey,
          vkey,
        }}
      />
    </div>
  );
};

export default Page;

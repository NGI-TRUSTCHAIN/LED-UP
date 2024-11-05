'use client';
import React, { useState } from 'react';
const snarkjs = require('snarkjs');

const Verifier = () => {
  const [proof, setProof] = useState('');
  const [verificationKey, setVerificationKey] = useState('');
  const [result, setResult] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      // Parse the proof and verification key JSON
      const proofData = JSON.parse(proof);
      const vKey = JSON.parse(verificationKey);

      // Verify the proof using snarkjs
      const res = await snarkjs.groth16.verify(vKey, proofData.inputs, proofData.proof);

      if (res === true) {
        setResult('Proof is valid!');
      } else {
        setResult('Proof is invalid!');
      }
    } catch (error) {
      console.error('Error:', error);
      setResult('An error occurred during verification.');
    }
  };

  return (
    <div>
      <h1>ZoKrates Proof Verifier</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <h3>Proof</h3>
          <textarea
            value={proof}
            onChange={(e) => setProof(e.target.value)}
            placeholder="Paste your proof JSON here"
            rows={10}
            cols={50}
          />
        </div>
        <div>
          <h3>Verification Key</h3>
          <textarea
            value={verificationKey}
            onChange={(e) => setVerificationKey(e.target.value)}
            placeholder="Paste your verification key JSON here"
            rows={10}
            cols={50}
          />
        </div>
        <br />
        <button type="submit">Verify Proof</button>
      </form>
      {result && <p>{result}</p>}
    </div>
  );
};

export default Verifier;

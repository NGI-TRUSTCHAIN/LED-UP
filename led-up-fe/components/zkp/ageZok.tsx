/* eslint-disable */
'use client';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { initialize, ZoKratesProvider } from 'zokrates-js';
import { cn } from '@/utils/utils';
import { Buffer } from 'buffer';

const snarkjs = require('snarkjs');

const makeProof = async (_proofInput: any, _wasm: string, _zkey: string) => {
  try {
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(_proofInput, _wasm, _zkey);
    return { proof, publicSignals };
  } catch (e: any) {
    throw e;
  }
};

const verifyProof = async (_verificationkey: string, signals: any, proof: any) => {
  try {
    const vkey = await fetch(_verificationkey).then(function (res) {
      return res.json();
    });

    const res = await snarkjs.groth16.verify(vkey, signals, proof);

    return res;
  } catch (e: any) {
    throw e;
  }
};

function AgeProof(props: any) {
  // @ts-ignore
  const [zokratesProvider, setZokratesProvider] = useState<ZoKratesProvider>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [values, setValues] = useState({
    age: '20',
    ageLimit: '18',
  });
  const [proof, setProof] = useState<any>(null);
  const [age, setAge] = useState('20');
  const [ageLimit, setAgeLimit] = useState('18');

  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const load = async () => {
      let provider = await initialize();
      setZokratesProvider(provider);
    };
    load();
  }, []);

  const changeAge = (e: ChangeEvent<HTMLInputElement>) => {
    setAge(e.target.value);
    setValues({ ...values, age: e.target.value });
  };

  const changeAgeLimit = (e: ChangeEvent<HTMLInputElement>) => {
    setAgeLimit(e.target.value);
    setValues({ ...values, ageLimit: e.target.value });
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsGenerating(true);
    setProof('');

    try {
      const program = Uint8Array.from(Buffer.from(props.program, 'hex'));
      const inputs = [age, ageLimit];

      const output = await zokratesProvider.computeWitness(program, inputs, {
        snarkjs: true,
      });

      const provingKey = Uint8Array.from(Buffer.from(props.provingKey, 'hex'));
      const zokratesProof = zokratesProvider.generateProof(program, output.witness, provingKey);

      // Optionally we can use snark.js
      const zkey = Uint8Array.from(Buffer.from(props.snarkjs.zkey, 'hex'));
      const snarkjsProof = await snarkjs.groth16.prove(zkey, output.snarkjs?.witness);

      setProof({
        zokratesProof,
        snarkjsProof,
      });
    } catch (error: any) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const verify = async () => {
    setIsVerifying(true);

    try {
      const { zokratesProof, snarkjsProof } = proof;
      const zokProved = await zokratesProvider.verify(props.verificationKey, zokratesProof);
      const snarkProved = await snarkjs.groth16.verify(
        props.snarkjs.vkey,
        snarkjsProof.publicSignals,
        snarkjsProof.proof
      );

      if (zokProved && snarkProved) {
        setIsValid(parseInt(zokratesProof.inputs[1]) === 1);
      } else {
        setIsValid(false);
      }
    } catch (error: any) {
      console.error('Error verifying proof:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="w-screen h-screen bg-gradient-to-r from-cyan-600 via-cyan-900 to-cyan-600 overflow-y-auto flex justify-center">
      <form
        className="bg-cyan-700 border w-1/2 h-auto flex flex-col items-start gap-3 rounded-lg py-5 px-10 my-5 shadow-2xl text-white"
        onSubmit={onSubmit}
      >
        <pre className="text-2xl font-bold">Witness Inputs</pre>
        <div className="flex flex-col items-start gap-2 w-full">
          <Label htmlFor="age" className="text-xl">
            Enter Your Age
          </Label>
          <Input
            type="text"
            required={true}
            value={age}
            onChange={changeAge}
            placeholder="e.g. 3"
            className="bg-cyan-700 text-white text-xl placeholder:text-gray-400 py-7 font-bold"
          />
        </div>
        <div className="flex flex-col items-start gap-2 w-full">
          <Label htmlFor="ageLimit" className="text-xl">
            Input b:
          </Label>
          <Input
            required={true}
            value={ageLimit}
            onChange={changeAgeLimit}
            placeholder="e.g. 11"
            className="bg-cyan-700 text-white text-xl placeholder:text-gray-400 py-7 font-bold"
          />
        </div>
        <Button className="py-7 text-lg font-bold " disabled={isGenerating} type="submit">
          {isGenerating ? 'Loading...' : 'Generate Proofs'}
        </Button>
        <div className="border w-full p-2 rounded flex flex-col gap-2 bg-cyan-950 text-white max-w-full overflow-x-scroll px-5 py-2">
          Proof: <pre className="max-w-full">{JSON.stringify(proof, null, 2)}</pre>
          {/* Signals: <pre className="max-w-full">{signals}</pre>
            Calldata: <pre className="max-w-full text-wrap">{calldata}</pre>
            Result:
            {signals.length > 0 && (
              <p
                className={cn(
                  'border rounded py-2 px-10 uppercase text-2xl font-bold',
                  isValid ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                )}
              >
                {isValid ? 'Above Age Limit' : 'Below Age Limit'}
              </p>
            )} */}
        </div>

        <Button onClick={verify} className="py-7 text-lg font-bold " disabled={isVerifying} type="button">
          {isVerifying ? 'Loading...' : 'Verify'}
        </Button>

        {proof?.zokratesProof?.inputs.length > 0 && !isVerifying && (
          <p
            className={cn(
              'border rounded py-2 px-10 uppercase text-2xl font-bold',
              isValid ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            )}
          >
            {isValid ? 'Above Age Limit' : 'Below Age Limit'}
          </p>
        )}
      </form>
    </div>
  );
}

export default AgeProof;

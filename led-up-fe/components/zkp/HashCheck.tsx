/* eslint-disable */
'use client';
import { ChangeEvent, FormEvent, useEffect, useState, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { initialize, ZoKratesProvider } from 'zokrates-js';
import { Textarea } from '@/components/ui/textarea';
import { prepareField } from '@/utils/hash';
import { generateProof } from '@/utils/zokrates';

// const snarkjs = require('snarkjs');

// const makeProof = async (_proofInput: any, _wasm: string, _zkey: string) => {
//   try {
//     const { proof, publicSignals } = await snarkjs.groth16.fullProve(_proofInput, _wasm, _zkey);
//     return { proof, publicSignals };
//   } catch (e: any) {
//     throw e;
//   }
// };

// const verifyProof = async (_verificationkey: string, signals: any, proof: any) => {
//   try {
//     const vkey = await fetch(_verificationkey).then(function (res) {
//       return res.json();
//     });

//     const res = await snarkjs.groth16.verify(vkey, signals, proof);

//     return res;
//   } catch (e: any) {
//     throw e;
//   }
// };

function HashProof(props: any) {
  // @ts-ignore
  const [zokratesProvider, setZokratesProvider] = useState<ZoKratesProvider>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [proof, setProof] = useState<any>(null);
  const [patientData, setPatientData] = useState(
    JSON.stringify(
      {
        resourceType: 'Patient',
        id: 'd0658787-9eeb-4b40-9053-09e1adacdf6a',
        meta: {
          versionId: '1',
          lastUpdated: '2024-04-19T04:55:59.038+00:00',
        },
        active: true,
        name: [
          {
            use: 'official',
            family: 'Smith',
            given: ['Lisa', 'Marie'],
          },
          {
            use: 'usual',
            given: ['Lisa'],
          },
        ],
        gender: 'female',
        birthDate: '1974-12-25',
      },
      null,
      2
    )
  );
  const [expectedHash, setExpectedHash] = useState(
    '0x1c438ce8a6cf867c55614d80239092dd70a148d5b0f247aaf627af7420fcbbf3'
  );
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const load = async () => {
      let provider = await initialize();
      setZokratesProvider(provider);
    };
    load();
  }, []);

  const changePatientData = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setPatientData(e.target.value);
  };

  const changeExpectedHash = (e: ChangeEvent<HTMLInputElement>) => {
    setExpectedHash(e.target.value);
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setProof(null);
    setIsValid(false);
    try {
      const secrets = await prepareField(patientData);

      const proof = await generateProof(
        secrets,
        expectedHash,
        props.program,
        props.provingKey,
        props.snarkjs.zkey,
        props.verificationKey
      );
      setProof({ zokratesProof: proof, snarkjsProof: proof });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  const verify = async () => {
    setIsLoading(true);
    try {
      const { zokratesProof } = proof;
      const isValid = await zokratesProvider.verify(props.verificationKey, zokratesProof);
      setIsValid(isValid);
      if (isValid) {
      } else {
      }
    } catch (error) {
      console.error('Error verifying proof:', error);
      // Optionally set an error message in state here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="w-screen min-h-screen bg-gradient-to-r from-cyan-600 via-cyan-900 to-cyan-600 flex items-center justify-center">
      <form
        className="bg-cyan-700 min-w-[50vw] text-white font-bold border flex flex-col items-start gap-3 rounded-lg py-5 px-10 shadow-2xl"
        onSubmit={onSubmit}
      >
        <div className="flex flex-col items-start gap-2 w-full">
          <Label htmlFor="patientData" className="text-xl">
            Patient Data
          </Label>

          <Textarea
            required={true}
            value={patientData}
            onChange={changePatientData}
            placeholder={JSON.stringify({ resourceType: 'Patient', id: 'patientId' }, null, 2)}
            rows={5}
            className="bg-cyan-900 text-white text-xl placeholder:text-gray-400 py-7 font-bold"
          />
        </div>

        <div className="flex flex-col items-start gap-2 w-full">
          <Label htmlFor="expectedHash" className="text-xl">
            Expected Hash
          </Label>

          <Input
            required={true}
            value={expectedHash}
            onChange={changeExpectedHash}
            placeholder="0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
            className="bg-cyan-700 text-white text-xl placeholder:text-gray-400 py-7 font-bold"
          />
        </div>
        <div className="flex gap-5 items-center">
          <Button className="py-7 text-lg font-bold " disabled={isLoading} type="submit">
            {isLoading ? 'Loading...' : 'Generate Proofs'}
          </Button>

          <Button onClick={verify} className="py-7 text-lg font-bold " disabled={isLoading} type="button">
            {isLoading ? 'Loading...' : 'Verify'}
          </Button>
        </div>

        <div className="border w-full p-2 rounded flex flex-col gap-2 bg-cyan-950 text-white max-w-full overflow-x-scroll px-5 py-2">
          Proof: <pre className="max-w-full">{JSON.stringify(proof?.zokratesProof, null, 2)}</pre>
        </div>

        {/* {proof?.snarkjsProof?.publicSignals.length > 0 && (
          <p
            className={cn(
              'border rounded py-2 px-10 uppercase text-2xl font-bold',
              proof?.snarkjsProof?.publicSignals[0] === '1' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            )}
          >
            {proof?.snarkjsProof?.publicSignals[0] === '1' ? 'Above Age Limit' : 'Below Age Limit'}
          </p>
        )} */}
      </form>
    </main>
  );
}

export default memo(HashProof);

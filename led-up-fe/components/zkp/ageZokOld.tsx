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
  const [isLoading, setIsLoading] = useState(false);
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
    setIsLoading(true);
    setProof('');

    setTimeout(async () => {
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
      } catch (e: any) {
        console.log(e);
      }

      setIsLoading(false);
    }, 1000);
  };

  const verify = () => {
    setIsLoading(true);
    setTimeout(async () => {
      try {
        const { zokratesProof, snarkjsProof } = proof;
        if (
          // verify using zokrates
          zokratesProvider.verify(props.verificationKey, zokratesProof) &&
          // // or with snarkjs
          (await snarkjs.groth16.verify(props.snarkjs.vkey, snarkjsProof.publicSignals, snarkjsProof.proof))
        ) {
          setIsValid(true);
        } else {
          setIsValid(false);
        }
      } catch (e: any) {
        console.log(e);
      } finally {
        setIsLoading(false);
      }
    }, 1000);
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
        <Button className="py-7 text-lg font-bold " disabled={isLoading} type="submit">
          {isLoading ? 'Loading...' : 'Generate Proofs'}
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

        <Button onClick={verify} className="py-7 text-lg font-bold " disabled={isLoading} type="button">
          {isLoading ? 'Loading...' : 'Verify'}
        </Button>

        {proof?.snarkjsProof?.publicSignals.length > 0 && (
          <p
            className={cn(
              'border rounded py-2 px-10 uppercase text-2xl font-bold',
              proof?.snarkjsProof?.publicSignals[0] === '1' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            )}
          >
            {proof?.snarkjsProof?.publicSignals[0] === '1' ? 'Above Age Limit' : 'Below Age Limit'}
          </p>
        )}
      </form>
    </div>
  );
}

export default AgeProof;

/* 
[0x06de5f8298332a4d861d87768e279abfbc837191228e585d30653b7d0ea7f073, 0x18252dcb1ab8fe00dea1ab1003593714e8cf1f938c8fe04c0c0194dfa5996946],[[0x29f4dfe30b6804d14157db1b3f8057b34d4e857e2fb27416af010426920bfa76, 0x265024ea9d90eadac57835eadd03b53d91d7942753ac2680c652f7c6490e45b0],[0x1fcff530d3f7524b8b785e3da3176639a4c51c8d2f340dfddcafc0fc34c48835, 0x117e83e4cfef545c9bfd7276eaeb0d96e54e0c69c554700dbd6e00da3a17c6c5]],[0x009958911ab4e378589693591ebfc7800a89bcfc9984dd16fc76e034f3177361, 0x10a43211e4b57ea8bd1734438b0918bf28637f91fd7e78641eb884c28a28dc47],[0x0000000000000000000000000000000000000000000000000000000000000000,0x0000000000000000000000000000000000000000000000000000000000000012] 
[0x05f3f23db184cc274f6a0327ad0112503f60975911589a9ab0f198862142ec9b, 0x1919bfcb31f91f6049cd6e486e44595c866ecce0f6a539f700ab6cb7fb4b20be],[[0x0fb4355066d6e05d1e053b4253eacbe2cf1c591608423f167aa484f6bc8369e8, 0x299bf3a4903d4bb85113abc8fe72ae8b28bbe38e6e020897374af481d82c09be],[0x293d542a9687c4727d261b9b19033be2ad8b2ea1f7e318dcf92592d56a342f8c, 0x23118d3883e462454766afe5c4385eadc602563036a75a0d967f7dac4f165e4c]],[0x1c7eba91e592ef2131c4203364a93e9424867a6bae6902156c4adecf462e8d50, 0x06ab47c45591fc7cfe467e5aba39a6ad446711cc8180f9802cf40186c50413bf],[0x0000000000000000000000000000000000000000000000000000000000000001,0x0000000000000000000000000000000000000000000000000000000000000012]

*/

/* eslint-disable */
import { ChangeEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { cn } from '@/utils/utils';

const snarkjs = require('snarkjs');

const getSolidityProofArray = (proof: any) => {
  const proofList = [
    proof['pi_a'][0],
    proof['pi_a'][1],
    proof['pi_b'][0][1],
    proof['pi_b'][0][0],
    proof['pi_b'][1][1],
    proof['pi_b'][1][0],
    proof['pi_c'][0],
    proof['pi_c'][1],
  ];
  return proofList;
};

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

function AgeProof() {
  const [age, setAge] = useState(20);
  const [ageLimit, setAgeLimit] = useState(18);

  const [proof, setProof] = useState('');
  const [signals, setSignals] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [calldata, setCalldata] = useState('');

  const wasmFile = 'http://localhost:3001/ageproof/ageCheck.wasm';
  const zkeyFile = 'http://localhost:3001/ageproof/ageCheck.zkey';
  const verificationKey = 'http://localhost:3001/ageproof/ageCheck.vkey.json';

  const runProofs = async () => {
    if (!age || !ageLimit) {
      return;
    }
    const proofInput = { age, ageLimit };

    try {
      const { proof: _proof, publicSignals: _signals } = await makeProof(proofInput, wasmFile, zkeyFile);

      setProof(JSON.stringify(_proof, null, 2));
      setSignals(JSON.stringify(_signals, null, 2));

      const calldata = await snarkjs.groth16.exportSolidityCallData(_proof, _signals);

      setCalldata(JSON.stringify(calldata, null, 2));

      const _isValid = await verifyProof(verificationKey, _signals, _proof);

      setIsValid(_isValid);
    } catch (e: any) {
      // setIsValid(false);
      console.log(e);
    }
  };

  const changeAge = (e: ChangeEvent<HTMLInputElement>) => {
    setAge(Number(e.target.value));
  };

  const changeAgeLimit = (e: ChangeEvent<HTMLInputElement>) => {
    setAgeLimit(Number(e.target.value));
  };

  return (
    <div className="w-screen h-screen">
      <header className="h-auto max-h-750px] bg-gradient-to-r from-cyan-600 via-cyan-900 to-cyan-600 text-white flex items-center justify-center ">
        <div className="bg-cyan-700 border w-1/2 h-full flex flex-col items-start gap-3 rounded-lg py-5 px-10  my-5 shadow-2xl">
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
              type="number"
              required={true}
              value={ageLimit}
              onChange={changeAgeLimit}
              placeholder="e.g. 11"
              className="bg-cyan-700 text-white text-xl placeholder:text-gray-400 py-7 font-bold"
            />
          </div>
          <Button onClick={runProofs} className="py-7 text-lg font-bold ">
            Generate Proof
          </Button>
          <div className="border w-full p-2 rounded flex flex-col gap-2 bg-cyan-950 text-white max-w-full overflow-x-scroll px-5 py-2">
            Proof: <pre className="max-w-full">{proof}</pre>
            Signals: <pre className="max-w-full">{signals}</pre>
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
            )}
          </div>
        </div>
      </header>
    </div>
  );
}

export default AgeProof;

/* 
[0x06de5f8298332a4d861d87768e279abfbc837191228e585d30653b7d0ea7f073, 0x18252dcb1ab8fe00dea1ab1003593714e8cf1f938c8fe04c0c0194dfa5996946],[[0x29f4dfe30b6804d14157db1b3f8057b34d4e857e2fb27416af010426920bfa76, 0x265024ea9d90eadac57835eadd03b53d91d7942753ac2680c652f7c6490e45b0],[0x1fcff530d3f7524b8b785e3da3176639a4c51c8d2f340dfddcafc0fc34c48835, 0x117e83e4cfef545c9bfd7276eaeb0d96e54e0c69c554700dbd6e00da3a17c6c5]],[0x009958911ab4e378589693591ebfc7800a89bcfc9984dd16fc76e034f3177361, 0x10a43211e4b57ea8bd1734438b0918bf28637f91fd7e78641eb884c28a28dc47],[0x0000000000000000000000000000000000000000000000000000000000000000,0x0000000000000000000000000000000000000000000000000000000000000012] 
[0x05f3f23db184cc274f6a0327ad0112503f60975911589a9ab0f198862142ec9b, 0x1919bfcb31f91f6049cd6e486e44595c866ecce0f6a539f700ab6cb7fb4b20be],[[0x0fb4355066d6e05d1e053b4253eacbe2cf1c591608423f167aa484f6bc8369e8, 0x299bf3a4903d4bb85113abc8fe72ae8b28bbe38e6e020897374af481d82c09be],[0x293d542a9687c4727d261b9b19033be2ad8b2ea1f7e318dcf92592d56a342f8c, 0x23118d3883e462454766afe5c4385eadc602563036a75a0d967f7dac4f165e4c]],[0x1c7eba91e592ef2131c4203364a93e9424867a6bae6902156c4adecf462e8d50, 0x06ab47c45591fc7cfe467e5aba39a6ad446711cc8180f9802cf40186c50413bf],[0x0000000000000000000000000000000000000000000000000000000000000001,0x0000000000000000000000000000000000000000000000000000000000000012]

*/

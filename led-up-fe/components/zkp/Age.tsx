/* eslint-disable */
'use client';
import { ChangeEvent, FormEvent, useState, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

function AgeProof() {
  const [isLoading, setIsLoading] = useState(false);
  const [proofStatus, setProofStatus] = useState<'none' | 'generated' | 'verified' | 'failed'>('none');
  const [age, setAge] = useState(25);
  const [ageLimit, setAgeLimit] = useState(18);
  const [birthYear, setBirthYear] = useState(1999);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const changeAge = (e: ChangeEvent<HTMLInputElement>) => {
    const newAge = parseInt(e.target.value);
    setAge(isNaN(newAge) ? 0 : newAge);
    // Calculate birth year based on age
    setBirthYear(currentYear - newAge);
    // Reset proof status when data changes
    setProofStatus('none');
  };

  const changeAgeLimit = (e: ChangeEvent<HTMLInputElement>) => {
    const newLimit = parseInt(e.target.value);
    setAgeLimit(isNaN(newLimit) ? 0 : newLimit);
    // Reset proof status when data changes
    setProofStatus('none');
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // In a real ZKP system, we would generate a proof here
      // For this demo, we'll just calculate the result directly
      
      // Set the proof status to 'generated' to indicate success
      setProofStatus('generated');
    } catch (error) {
      console.error(error);
      setProofStatus('failed');
    } finally {
      setIsLoading(false);
    }
  };

  const verify = () => {
    setIsLoading(true);
    
    try {
      // In a real ZKP system, this would verify the proof cryptographically
      // For this demo, we'll just do a simple comparison
      const isAboveAgeLimit = age >= ageLimit;
      
      // Set the proof status based on the verification result
      setProofStatus(isAboveAgeLimit ? 'verified' : 'failed');
    } catch (error) {
      console.error('Error verifying proof:', error);
      setProofStatus('failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-6">Zero-Knowledge Age Verification</h1>
      <p className="mb-8 text-muted-foreground">
        This demonstrates a simplified version of a zero-knowledge proof for age verification.
        In a real ZKP system, your actual age would remain private and only the verification result would be shared.
      </p>
      
      <form 
        className="bg-card border rounded-lg p-6 shadow-lg flex flex-col gap-6"
        onSubmit={onSubmit}
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="age" className="text-lg font-semibold">
            Your Age (Private Input)
          </Label>
          <Input
            id="age"
            type="number"
            required={true}
            value={age}
            onChange={changeAge}
            min="1"
            max="120"
            className="font-mono"
          />
          <p className="text-sm text-muted-foreground">
            Birth year (calculated): {birthYear}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="ageLimit" className="text-lg font-semibold">
            Age Limit (Public Input)
          </Label>
          <Input
            id="ageLimit"
            type="number"
            required={true}
            value={ageLimit}
            onChange={changeAgeLimit}
            min="1"
            max="100"
            className="font-mono"
          />
        </div>
        
        <div className="flex gap-4">
          <Button disabled={isLoading} type="submit" className="px-6">
            {isLoading ? 'Processing...' : 'Generate Proof'}
          </Button>

          <Button 
            onClick={verify} 
            disabled={isLoading || proofStatus !== 'generated'} 
            type="button" 
            variant="outline"
            className="px-6"
          >
            {isLoading ? 'Processing...' : 'Verify Proof'}
          </Button>
        </div>

        {proofStatus !== 'none' && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Proof Status:</h3>
            <div className={cn(
              "p-4 rounded-md",
              proofStatus === 'generated' && "bg-blue-100 dark:bg-blue-900",
              proofStatus === 'verified' && "bg-green-100 dark:bg-green-900",
              proofStatus === 'failed' && "bg-red-100 dark:bg-red-900"
            )}>
              {proofStatus === 'generated' && (
                <div>
                  <p className="font-semibold">Proof Generated Successfully</p>
                  <p className="text-sm mt-2">
                    A zero-knowledge proof has been generated that can verify if you are above the age limit,
                    without revealing your actual age.
                  </p>
                  <p className="text-sm mt-2">
                    Now click "Verify Proof" to check if you meet the age requirement.
                  </p>
                </div>
              )}
              {proofStatus === 'verified' && (
                <div>
                  <p className="font-semibold">Age Verification Successful! ✅</p>
                  <p className="text-sm mt-2">
                    The proof confirms you are {ageLimit} years or older, without revealing your exact age.
                  </p>
                </div>
              )}
              {proofStatus === 'failed' && (
                <div>
                  <p className="font-semibold">Age Verification Failed! ❌</p>
                  <p className="text-sm mt-2">
                    The proof indicates you do not meet the minimum age requirement of {ageLimit} years.
                  </p>
                </div>
              )}
            </div>
          </div>
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

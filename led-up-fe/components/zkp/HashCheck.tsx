/* eslint-disable */
'use client';
import { ChangeEvent, FormEvent, useState, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import crypto from 'crypto';

function HashProof() {
  const [isLoading, setIsLoading] = useState(false);
  const [proofStatus, setProofStatus] = useState<'none' | 'generated' | 'verified' | 'failed'>('none');
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
        ],
        gender: 'female',
        birthDate: '1974-12-25',
      },
      null,
      2
    )
  );
  const [expectedHash, setExpectedHash] = useState('');
  const [actualHash, setActualHash] = useState('');

  const changePatientData = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setPatientData(e.target.value);
    // Reset proof status when data changes
    setProofStatus('none');
  };

  const changeExpectedHash = (e: ChangeEvent<HTMLInputElement>) => {
    setExpectedHash(e.target.value);
    // Reset proof status when hash changes
    setProofStatus('none');
  };

  // Simplified hash calculation for demo
  const calculateHash = (data: string): string => {
    return '0x' + crypto.createHash('sha256').update(data).digest('hex');
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // In a real ZKP system, this would generate an actual proof
      // For this demo, we'll just calculate the hash directly
      const hash = calculateHash(patientData);
      setActualHash(hash);

      // In a real ZKP, this would be done privately and only the proof would be shared
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
      // In a real ZKP system, this would verify the proof without revealing the actual data
      // For this demo, we'll just compare the expected hash with our calculated hash
      const isValid = expectedHash.toLowerCase() === actualHash.toLowerCase();

      setProofStatus(isValid ? 'verified' : 'failed');
    } catch (error) {
      console.error('Error verifying proof:', error);
      setProofStatus('failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-6">Zero-Knowledge Hash Verification</h1>
      <p className="mb-8 text-muted-foreground">
        This demonstrates a simplified version of a zero-knowledge proof for hash verification. In a real ZKP system,
        the patient data would remain private and only the proof would be shared.
      </p>

      <form className="bg-card border rounded-lg p-6 shadow-lg flex flex-col gap-6" onSubmit={onSubmit}>
        <div className="flex flex-col gap-2">
          <Label htmlFor="patientData" className="text-lg font-semibold">
            Patient Data (Private Input)
          </Label>

          <Textarea
            required={true}
            value={patientData}
            onChange={changePatientData}
            placeholder={JSON.stringify({ resourceType: 'Patient', id: 'patientId' }, null, 2)}
            rows={5}
            className="font-mono"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="expectedHash" className="text-lg font-semibold">
            Expected Hash (Public Input)
          </Label>

          <Input
            required={true}
            value={expectedHash}
            onChange={changeExpectedHash}
            placeholder="0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
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
            <div
              className={cn(
                'p-4 rounded-md',
                proofStatus === 'generated' && 'bg-blue-100 dark:bg-blue-900',
                proofStatus === 'verified' && 'bg-green-100 dark:bg-green-900',
                proofStatus === 'failed' && 'bg-red-100 dark:bg-red-900'
              )}
            >
              {proofStatus === 'generated' && (
                <div>
                  <p className="font-semibold">Proof Generated Successfully</p>
                  <p className="text-sm mt-2">
                    Calculated Hash (normally this would be private):
                    <span className="font-mono ml-2">{actualHash}</span>
                  </p>
                  <p className="text-sm mt-2">
                    Now click "Verify Proof" to check if the data matches the expected hash.
                  </p>
                </div>
              )}
              {proofStatus === 'verified' && (
                <div>
                  <p className="font-semibold">Verification Successful! ✅</p>
                  <p className="text-sm mt-2">
                    The proof has been verified. This confirms that you know the data that produces the expected hash,
                    without revealing the actual data.
                  </p>
                </div>
              )}
              {proofStatus === 'failed' && (
                <div>
                  <p className="font-semibold">Verification Failed! ❌</p>
                  <p className="text-sm mt-2">The hash of the provided data does not match the expected hash.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

export default memo(HashProof);

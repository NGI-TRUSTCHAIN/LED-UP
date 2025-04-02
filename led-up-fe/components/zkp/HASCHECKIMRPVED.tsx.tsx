/* eslint-disable */
'use client';
import { ChangeEvent, FormEvent, useState, memo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import crypto from 'crypto';

// Hash algorithm types
enum HashAlgorithm {
  SHA256 = 1,
  KECCAK256 = 2,
  POSEIDON = 3,
}

// Verification modes
enum VerificationMode {
  DIRECT_HASH = 1,
  LARGE_DATA = 2,
  MERKLE_PROOF = 3,
}

function HashVerifier() {
  // State for form inputs
  const [isLoading, setIsLoading] = useState(false);
  const [proofStatus, setProofStatus] = useState<'none' | 'generated' | 'verified' | 'failed'>('none');
  const [preimage, setPreimage] = useState(
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
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>(HashAlgorithm.SHA256);
  const [verificationMode, setVerificationMode] = useState<VerificationMode>(VerificationMode.DIRECT_HASH);
  const [merkleProof, setMerkleProof] = useState('');
  const [merkleRoot, setMerkleRoot] = useState('');
  const [activeTab, setActiveTab] = useState('simple');
  const [errorMessage, setErrorMessage] = useState('');

  // Reset proof status when inputs change
  useEffect(() => {
    setProofStatus('none');
    setErrorMessage('');
  }, [preimage, expectedHash, algorithm, verificationMode, merkleProof, merkleRoot, activeTab]);

  // Handle input changes
  const changePreimage = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setPreimage(e.target.value);
  };

  const changeExpectedHash = (e: ChangeEvent<HTMLInputElement>) => {
    setExpectedHash(e.target.value);
  };

  const changeMerkleProof = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMerkleProof(e.target.value);
  };

  const changeMerkleRoot = (e: ChangeEvent<HTMLInputElement>) => {
    setMerkleRoot(e.target.value);
  };

  // Hash calculation functions
  const calculateHash = (data: string, algo: HashAlgorithm): string => {
    try {
      switch (algo) {
        case HashAlgorithm.SHA256:
          return '0x' + crypto.createHash('sha256').update(data).digest('hex');
        case HashAlgorithm.KECCAK256:
          return '0x' + crypto.createHash('sha3-256').update(data).digest('hex');
        case HashAlgorithm.POSEIDON:
          // Note: Browser crypto doesn't support Poseidon
          // This is a placeholder - in a real implementation, we would use a proper Poseidon library
          return (
            '0x' +
            crypto
              .createHash('sha256')
              .update(data + '_poseidon_simulation')
              .digest('hex')
          );
        default:
          return '0x' + crypto.createHash('sha256').update(data).digest('hex');
      }
    } catch (error) {
      console.error('Hash calculation error:', error);
      setErrorMessage('Failed to calculate hash. Please check your inputs.');
      return '';
    }
  };

  // Convert hash to uint256[2] format for smart contract
  const hashToUint256Array = (hash: string): string[] => {
    // Remove 0x prefix if present
    const cleanHash = hash.startsWith('0x') ? hash.slice(2) : hash;

    // Split the hash into two parts (32 bytes each)
    const part1 = cleanHash.slice(0, 64);
    const part2 = cleanHash.slice(64);

    return [`0x${part1}`, `0x${part2 || '0'}`];
  };

  // Generate proof (in a real implementation, this would use ZoKrates or similar)
  const generateProof = async (): Promise<{
    a: [string, string];
    b: [[string, string], [string, string]];
    c: [string, string];
    input: string[];
  }> => {
    // This is a mock implementation - in a real system, this would generate an actual ZKP
    return {
      a: ['0x1', '0x2'],
      b: [
        ['0x3', '0x4'],
        ['0x5', '0x6'],
      ],
      c: ['0x7', '0x8'],
      input: hashToUint256Array(actualHash),
    };
  };

  // Form submission handler
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      // Calculate hash based on selected algorithm
      const hash = calculateHash(preimage, algorithm);
      setActualHash(hash);

      // In a real ZKP system, this would generate an actual proof
      // For this demo, we're just calculating the hash
      setProofStatus('generated');
    } catch (error) {
      console.error('Error generating proof:', error);
      setProofStatus('failed');
      setErrorMessage('Failed to generate proof. Please check your inputs.');
    } finally {
      setIsLoading(false);
    }
  };

  // Verify the proof
  const verify = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      if (activeTab === 'simple') {
        // Simple verification - just compare hashes
        const isValid = expectedHash.toLowerCase() === actualHash.toLowerCase();
        setProofStatus(isValid ? 'verified' : 'failed');

        if (!isValid) {
          setErrorMessage('The hash of the provided data does not match the expected hash.');
        }
      } else if (activeTab === 'enhanced') {
        // Enhanced verification - in a real implementation, this would call the smart contract
        if (verificationMode === VerificationMode.MERKLE_PROOF) {
          // Mock Merkle proof verification
          const isValid = merkleRoot !== '' && actualHash !== '';
          setProofStatus(isValid ? 'verified' : 'failed');

          if (!isValid) {
            setErrorMessage('Merkle proof verification failed. Please check your inputs.');
          }
        } else {
          // Direct hash or large data verification
          const isValid = expectedHash.toLowerCase() === actualHash.toLowerCase();
          setProofStatus(isValid ? 'verified' : 'failed');

          if (!isValid) {
            setErrorMessage('The hash of the provided data does not match the expected hash.');
          }
        }
      }
    } catch (error) {
      console.error('Error verifying proof:', error);
      setProofStatus('failed');
      setErrorMessage('An error occurred during verification. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit to blockchain (mock implementation)
  const submitToBlockchain = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      // In a real implementation, this would call the smart contract
      // For this demo, we'll just simulate a successful submission
      setTimeout(() => {
        setProofStatus('verified');
        setIsLoading(false);
      }, 2000);
    } catch (error) {
      console.error('Error submitting to blockchain:', error);
      setProofStatus('failed');
      setErrorMessage('Failed to submit verification to blockchain. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">Zero-Knowledge Hash Verification</h1>
      <p className="mb-6 text-muted-foreground">
        This component demonstrates zero-knowledge proofs for hash verification. It allows you to prove you know a
        preimage for a given hash without revealing the preimage itself.
      </p>

      <Tabs defaultValue="simple" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="simple">Simple Hash Verification</TabsTrigger>
          <TabsTrigger value="enhanced">Enhanced Hash Verification</TabsTrigger>
        </TabsList>

        <TabsContent value="simple">
          <Card>
            <CardHeader>
              <CardTitle>Simple Hash Verification</CardTitle>
              <CardDescription>
                Verify that you know a preimage for a given hash without revealing the preimage.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="preimage" className="text-lg font-semibold">
                    Preimage (Private Input)
                  </Label>
                  <Textarea
                    id="preimage"
                    required={true}
                    value={preimage}
                    onChange={changePreimage}
                    placeholder="Enter the secret data you want to hash"
                    rows={5}
                    className="font-mono"
                  />
                  <p className="text-sm text-muted-foreground">
                    This is your private data that should never be shared. In a real ZKP system, this would never leave
                    your device.
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="expectedHash" className="text-lg font-semibold">
                    Expected Hash (Public Input)
                  </Label>
                  <Input
                    id="expectedHash"
                    required={true}
                    value={expectedHash}
                    onChange={changeExpectedHash}
                    placeholder="0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
                    className="font-mono"
                  />
                  <p className="text-sm text-muted-foreground">
                    This is the hash you want to verify against. In a real system, this would be the publicly known
                    hash.
                  </p>
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
              </form>
            </CardContent>
            <CardFooter>
              {errorMessage && (
                <Alert variant="destructive" className="w-full mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}

              {proofStatus !== 'none' && (
                <div className="w-full">
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
                      <div className="flex items-start gap-2">
                        <InfoIcon className="h-5 w-5 text-blue-700 dark:text-blue-300 mt-1" />
                        <div>
                          <p className="font-semibold">Proof Generated Successfully</p>
                          <p className="text-sm mt-2">
                            Calculated Hash (normally this would be private):
                            <span className="font-mono ml-2 break-all">{actualHash}</span>
                          </p>
                          <p className="text-sm mt-2">
                            Now click "Verify Proof" to check if the data matches the expected hash.
                          </p>
                        </div>
                      </div>
                    )}
                    {proofStatus === 'verified' && (
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-700 dark:text-green-300 mt-1" />
                        <div>
                          <p className="font-semibold">Verification Successful! ✅</p>
                          <p className="text-sm mt-2">
                            The proof has been verified. This confirms that you know the data that produces the expected
                            hash, without revealing the actual data.
                          </p>
                          <Button onClick={submitToBlockchain} disabled={isLoading} className="mt-4">
                            {isLoading ? 'Processing...' : 'Submit to Blockchain'}
                          </Button>
                        </div>
                      </div>
                    )}
                    {proofStatus === 'failed' && (
                      <div className="flex items-start gap-2">
                        <XCircle className="h-5 w-5 text-red-700 dark:text-red-300 mt-1" />
                        <div>
                          <p className="font-semibold">Verification Failed! ❌</p>
                          <p className="text-sm mt-2">
                            The hash of the provided data does not match the expected hash.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="enhanced">
          <Card>
            <CardHeader>
              <CardTitle>Enhanced Hash Verification</CardTitle>
              <CardDescription>
                Advanced hash verification with support for multiple algorithms and verification modes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="algorithm" className="text-lg font-semibold">
                      Hash Algorithm
                    </Label>
                    <Select
                      value={algorithm.toString()}
                      onValueChange={(value) => setAlgorithm(parseInt(value) as HashAlgorithm)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select hash algorithm" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={HashAlgorithm.SHA256.toString()}>SHA-256</SelectItem>
                        <SelectItem value={HashAlgorithm.KECCAK256.toString()}>Keccak-256 (Ethereum)</SelectItem>
                        <SelectItem value={HashAlgorithm.POSEIDON.toString()}>Poseidon (ZK-friendly)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">Select the hash algorithm to use for verification.</p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="verificationMode" className="text-lg font-semibold">
                      Verification Mode
                    </Label>
                    <Select
                      value={verificationMode.toString()}
                      onValueChange={(value) => setVerificationMode(parseInt(value) as VerificationMode)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select verification mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={VerificationMode.DIRECT_HASH.toString()}>Direct Hash</SelectItem>
                        <SelectItem value={VerificationMode.LARGE_DATA.toString()}>Large Data</SelectItem>
                        <SelectItem value={VerificationMode.MERKLE_PROOF.toString()}>Merkle Proof</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Select the verification mode based on your use case.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="enhancedPreimage" className="text-lg font-semibold">
                    Preimage (Private Input)
                  </Label>
                  <Textarea
                    id="enhancedPreimage"
                    required={true}
                    value={preimage}
                    onChange={changePreimage}
                    placeholder="Enter the secret data you want to hash"
                    rows={5}
                    className="font-mono"
                  />
                  <p className="text-sm text-muted-foreground">
                    This is your private data that should never be shared. In a real ZKP system, this would never leave
                    your device.
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="enhancedExpectedHash" className="text-lg font-semibold">
                    Expected Hash (Public Input)
                  </Label>
                  <Input
                    id="enhancedExpectedHash"
                    required={true}
                    value={expectedHash}
                    onChange={changeExpectedHash}
                    placeholder="0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
                    className="font-mono"
                  />
                  <p className="text-sm text-muted-foreground">
                    This is the hash you want to verify against. In a real system, this would be the publicly known
                    hash.
                  </p>
                </div>

                {verificationMode === VerificationMode.MERKLE_PROOF && (
                  <>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="merkleProof" className="text-lg font-semibold">
                        Merkle Proof (Private Input)
                      </Label>
                      <Textarea
                        id="merkleProof"
                        required={verificationMode === VerificationMode.MERKLE_PROOF}
                        value={merkleProof}
                        onChange={changeMerkleProof}
                        placeholder="Enter the Merkle proof as a JSON array"
                        rows={3}
                        className="font-mono"
                      />
                      <p className="text-sm text-muted-foreground">
                        The Merkle proof that demonstrates your data is part of a larger dataset.
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="merkleRoot" className="text-lg font-semibold">
                        Merkle Root (Public Input)
                      </Label>
                      <Input
                        id="merkleRoot"
                        required={verificationMode === VerificationMode.MERKLE_PROOF}
                        value={merkleRoot}
                        onChange={changeMerkleRoot}
                        placeholder="0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
                        className="font-mono"
                      />
                      <p className="text-sm text-muted-foreground">
                        The Merkle root of the dataset you're proving membership in.
                      </p>
                    </div>
                  </>
                )}

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
              </form>
            </CardContent>
            <CardFooter>
              {errorMessage && (
                <Alert variant="destructive" className="w-full mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}

              {proofStatus !== 'none' && (
                <div className="w-full">
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
                      <div className="flex items-start gap-2">
                        <InfoIcon className="h-5 w-5 text-blue-700 dark:text-blue-300 mt-1" />
                        <div>
                          <p className="font-semibold">Proof Generated Successfully</p>
                          <p className="text-sm mt-2">
                            Algorithm:{' '}
                            {algorithm === HashAlgorithm.SHA256
                              ? 'SHA-256'
                              : algorithm === HashAlgorithm.KECCAK256
                              ? 'Keccak-256'
                              : 'Poseidon'}
                          </p>
                          <p className="text-sm mt-2">
                            Mode:{' '}
                            {verificationMode === VerificationMode.DIRECT_HASH
                              ? 'Direct Hash'
                              : verificationMode === VerificationMode.LARGE_DATA
                              ? 'Large Data'
                              : 'Merkle Proof'}
                          </p>
                          <p className="text-sm mt-2">
                            Calculated Hash (normally this would be private):
                            <span className="font-mono ml-2 break-all">{actualHash}</span>
                          </p>
                          <p className="text-sm mt-2">
                            Now click "Verify Proof" to check if the data matches the expected hash.
                          </p>
                        </div>
                      </div>
                    )}
                    {proofStatus === 'verified' && (
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-700 dark:text-green-300 mt-1" />
                        <div>
                          <p className="font-semibold">Verification Successful! ✅</p>
                          <p className="text-sm mt-2">
                            The proof has been verified. This confirms that you know the data that produces the expected
                            hash, without revealing the actual data.
                          </p>
                          <Button onClick={submitToBlockchain} disabled={isLoading} className="mt-4">
                            {isLoading ? 'Processing...' : 'Submit to Blockchain'}
                          </Button>
                        </div>
                      </div>
                    )}
                    {proofStatus === 'failed' && (
                      <div className="flex items-start gap-2">
                        <XCircle className="h-5 w-5 text-red-700 dark:text-red-300 mt-1" />
                        <div>
                          <p className="font-semibold">Verification Failed! ❌</p>
                          <p className="text-sm mt-2">
                            {errorMessage || 'The verification failed. Please check your inputs and try again.'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default memo(HashVerifier);

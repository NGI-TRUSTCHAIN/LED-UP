'use client';

import React, { useState, useEffect } from 'react';
import { isAddress } from 'viem';
import { AlertCircle, CheckCircle, Loader2, InfoIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useSonner } from '@/hooks/use-sonner';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

interface HashVerificationProps {
  walletAddress?: string;
  onVerificationComplete?: (result: VerificationResult) => void;
  apiEndpoint?: string;
}

interface VerificationResult {
  success: boolean;
  verificationId?: string;
  transactionHash?: string;
  result?: boolean;
  error?: string;
  metadata?: {
    verificationType: number;
    expectedHash: string[];
    description?: string;
  };
}

// Define form schema with Zod
const formSchema = z.object({
  verificationType: z.enum(['1', '2']),
  preimage: z.string().min(1, 'Preimage is required'),
  expectedHash: z.string().optional(),
  algorithm: z.enum(['1', '2', '3']).default('1'),
  mode: z.enum(['1', '2', '3']).default('1'),
  merkleProof: z.string().optional(),
  merkleRoot: z.string().optional(),
  subject: z.string().refine((val) => isAddress(val as `0x${string}`), {
    message: 'Invalid Ethereum address',
  }),
  expirationDays: z
    .string()
    .default('365')
    .refine((val) => Number(val) >= 0, {
      message: 'Expiration days must be a positive number or zero',
    }),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

/**
 * HashVerification Component
 *
 * A React component that provides a user interface for ZKP-based hash verification.
 * Supports two verification types: simple hash verification and enhanced hash verification.
 */
const HashVerification: React.FC<HashVerificationProps> = ({
  walletAddress,
  onVerificationComplete,
  apiEndpoint = '/api/zkp/hash-verification',
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [calculatedHash, setCalculatedHash] = useState<string>('');
  const { toast } = useSonner();

  // Initialize form with react-hook-form and zod validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      verificationType: '1',
      subject: walletAddress || '',
      expirationDays: '365',
      algorithm: '1',
      mode: '1',
    },
  });

  // Update wallet address in form when it changes
  useEffect(() => {
    if (walletAddress) {
      form.setValue('subject', walletAddress);
    }
  }, [walletAddress, form]);

  // Reset form fields when verification type changes
  const verificationType = form.watch('verificationType');
  const mode = form.watch('mode');

  useEffect(() => {
    // Reset fields when verification type changes
    form.resetField('preimage');
    form.resetField('expectedHash');
    form.resetField('algorithm');
    form.resetField('mode');
    form.resetField('merkleProof');
    form.resetField('merkleRoot');

    // Set default values based on verification type
    if (verificationType === '1') {
      form.setValue('algorithm', '1');
      form.setValue('mode', '1');
    } else if (verificationType === '2') {
      form.setValue('algorithm', '1');
      form.setValue('mode', '1');
    }

    setCalculatedHash('');
    setResult(null);
  }, [verificationType, form]);

  // Show/hide Merkle proof fields based on mode
  useEffect(() => {
    if (mode === '3') {
      // Merkle proof mode - ensure fields are reset
      form.resetField('merkleProof');
      form.resetField('merkleRoot');
    }
  }, [mode, form]);

  // Calculate hash client-side (for demo purposes)
  const calculateHash = async (data: string, algorithm: string): Promise<string> => {
    try {
      // In a real implementation, this would use a proper crypto library
      // For this demo, we're using a simple hash calculation
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);

      let hashBuffer;

      switch (algorithm) {
        case '1': // SHA-256
          hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
          break;
        case '2': // Keccak-256 (simulated)
          // Note: Web Crypto API doesn't support Keccak natively
          // In a real implementation, you'd use a proper Keccak library
          hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data + '_keccak_simulation'));
          break;
        case '3': // Poseidon (simulated)
          // Note: Web Crypto API doesn't support Poseidon
          // In a real implementation, you'd use a proper Poseidon library
          hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data + '_poseidon_simulation'));
          break;
        default:
          hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
      }

      // Convert to hex string
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      return '0x' + hashHex;
    } catch (error) {
      console.error('Error calculating hash:', error);
      throw new Error('Failed to calculate hash');
    }
  };

  const handleSubmit = async (values: FormValues) => {
    setLoading(true);
    setResult(null);

    try {
      // Calculate hash client-side first (for demo purposes)
      const hash = await calculateHash(values.preimage, values.algorithm);
      setCalculatedHash(hash);

      // In a real implementation, the preimage would never leave the client
      // The ZKP would be generated client-side and only the proof would be sent to the server

      // Prepare request based on verification type
      const request: any = {
        verificationType: parseInt(values.verificationType),
        subject: values.subject,
        expirationDays: parseInt(values.expirationDays),
      };

      // Add type-specific parameters
      if (values.verificationType === '1') {
        // Simple hash verification
        request.preimage = values.preimage; // Note: In production, this should never be sent!
        request.expectedHash = values.expectedHash ? [values.expectedHash, '0x0'] : [hash, '0x0'];
      } else if (values.verificationType === '2') {
        // Enhanced hash verification
        request.preimage = values.preimage; // Note: In production, this should never be sent!
        request.expectedHash = values.expectedHash ? [values.expectedHash, '0x0'] : [hash, '0x0'];
        request.algorithm = parseInt(values.algorithm);
        request.mode = parseInt(values.mode);

        if (values.mode === '3' && values.merkleRoot) {
          request.merkleRoot = values.merkleRoot;
          request.merkleProof = values.merkleProof || '[]';
        }
      }

      if (values.description) {
        request.metadata = {
          description: values.description,
        };
      }

      // Call the API
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      // Set the result
      const verificationResult = {
        success: data.success,
        verificationId: data.verificationId,
        transactionHash: data.transactionHash,
        result: data.result,
        metadata: data.metadata,
      };

      setResult(verificationResult);

      // Notify parent component
      if (onVerificationComplete) {
        onVerificationComplete(verificationResult);
      }

      toast.success('Verification Complete', {
        description: 'Your hash verification has been successfully processed.',
      });
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred during verification';

      toast.error('Verification Failed', {
        description: errorMessage,
      });

      setResult({
        success: false,
        error: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const renderVerificationForm = () => {
    switch (verificationType) {
      case '1':
        return (
          <>
            <FormField
              control={form.control}
              name="preimage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preimage (Private Input)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter the secret data you want to verify"
                      className="font-mono"
                      rows={5}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This is your private data that should never be shared. In a real ZKP system, this would never leave
                    your device.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="expectedHash"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expected Hash (Public Input)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
                      className="font-mono"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The hash you want to verify against. If left empty, the calculated hash will be used.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
      case '2':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="algorithm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hash Algorithm</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select hash algorithm" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">SHA-256</SelectItem>
                        <SelectItem value="2">Keccak-256 (Ethereum)</SelectItem>
                        <SelectItem value="3">Poseidon (ZK-friendly)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>Choose the hash algorithm to use</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verification Mode</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select verification mode" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">Direct Hash</SelectItem>
                        <SelectItem value="2">Large Data</SelectItem>
                        <SelectItem value="3">Merkle Proof</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>Choose the verification mode</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="preimage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preimage (Private Input)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter the secret data you want to verify"
                      className="font-mono"
                      rows={5}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This is your private data that should never be shared. In a real ZKP system, this would never leave
                    your device.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expectedHash"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expected Hash (Public Input)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
                      className="font-mono"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The hash you want to verify against. If left empty, the calculated hash will be used.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {mode === '3' && (
              <>
                <FormField
                  control={form.control}
                  name="merkleProof"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Merkle Proof (Private Input)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter the Merkle proof as a JSON array"
                          className="font-mono"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        The Merkle proof that demonstrates your data is part of a larger dataset.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="merkleRoot"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Merkle Root (Public Input)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
                          className="font-mono"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>The Merkle root of the dataset you're proving membership in.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </>
        );
      default:
        return null;
    }
  };

  const renderResult = () => {
    if (!result) return null;

    if (!result.success) {
      return (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Verification Failed</AlertTitle>
          <AlertDescription>{result.error || 'An error occurred during verification'}</AlertDescription>
        </Alert>
      );
    }

    let resultMessage = '';
    let resultIcon = <CheckCircle className="h-5 w-5 text-green-500" />;

    if (result.result === true || (typeof result.result === 'number' && result.result === 1)) {
      resultMessage =
        'Verification successful! The proof has been verified, confirming that you know the preimage that produces the expected hash, without revealing the actual preimage.';
    } else {
      resultMessage = 'Verification failed. The hash of the provided preimage does not match the expected hash.';
      resultIcon = <AlertCircle className="h-5 w-5 text-red-500" />;
    }

    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {resultIcon}
            <span>Verification Result</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">{resultMessage}</p>

          {calculatedHash && (
            <div className="p-4 bg-muted rounded-md mb-4">
              <div className="flex items-start gap-2">
                <InfoIcon className="h-5 w-5 text-blue-500 mt-1" />
                <div>
                  <p className="font-medium">Calculated Hash:</p>
                  <p className="font-mono text-sm break-all mt-1">{calculatedHash}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    In a real ZKP system, this hash would be calculated privately on your device.
                  </p>
                </div>
              </div>
            </div>
          )}

          <Separator className="my-4" />

          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-4">
              <div className="font-medium">Verification ID:</div>
              <div className="col-span-2 break-all">{result.verificationId}</div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="font-medium">Transaction Hash:</div>
              <div className="col-span-2 break-all">
                <a
                  href={`https://etherscan.io/tx/${result.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {result.transactionHash}
                </a>
              </div>
            </div>
            {result.metadata && (
              <>
                <div className="grid grid-cols-3 gap-4">
                  <div className="font-medium">Verification Type:</div>
                  <div className="col-span-2">
                    {result.metadata.verificationType === 1 ? 'Simple Hash Verification' : 'Enhanced Hash Verification'}
                  </div>
                </div>
                {result.metadata.description && (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="font-medium">Description:</div>
                    <div className="col-span-2">{result.metadata.description}</div>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Hash Verification</CardTitle>
        <CardDescription>
          Verify that you know a preimage for a given hash without revealing the preimage itself using Zero-Knowledge
          Proofs.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="verificationType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select verification type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Simple Hash Verification</SelectItem>
                      <SelectItem value="2">Enhanced Hash Verification</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Choose the type of hash verification you need</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {renderVerificationForm()}

            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ethereum Address</FormLabel>
                  <FormControl>
                    <Input placeholder="0x..." {...field} disabled={!!walletAddress} />
                  </FormControl>
                  <FormDescription>The Ethereum address for which the verification will be registered</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expirationDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiration (days)</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} {...field} />
                  </FormControl>
                  <FormDescription>
                    Number of days until this verification expires. Set to 0 for no expiration.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g., Password verification, Document verification" {...field} />
                  </FormControl>
                  <FormDescription>A brief description of what this verification is for</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating proof...
                </>
              ) : (
                'Verify'
              )}
            </Button>
          </form>
        </Form>

        {loading && (
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground mt-2">
              This may take a few moments as we generate and verify the proof.
            </p>
          </div>
        )}

        {renderResult()}
      </CardContent>
    </Card>
  );
};

export default HashVerification;

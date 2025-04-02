import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Code, Hash, RefreshCw, KeyIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { CircuitType } from '../types';
import { useZoKratesVerification } from '../hooks/useZoKratesVerification';
import ZoKratesCard from './ZoKratesCard';

// Schema for form validation
const formSchema = z.object({
  input1: z.string().min(1, { message: 'Input data is required' }),
  input2: z.string().optional(),
  input3: z.string().optional(),
  input4: z.string().optional(),
  customHashInput: z.boolean().default(false),
  expectedHash: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const HashVerifier: React.FC = () => {
  const [calculatedHash, setCalculatedHash] = useState<string | null>(null);
  const [hashParts, setHashParts] = useState<[string, string] | null>(null);

  const {
    loading,
    error,
    result,
    resultCode,
    resultMessage,
    proof,
    publicSignals,
    generateAndVerifyProof,
    reset,
    circuitReady,
  } = useZoKratesVerification({
    circuitType: CircuitType.HASH_VERIFIER,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      input1: '',
      input2: '',
      input3: '',
      input4: '',
      customHashInput: false,
      expectedHash: '',
    },
  });

  const customHashInput = form.watch('customHashInput');

  // Function to compute hash using ZoKrates format
  const computeHash = async (data: string[]): Promise<{ hash: string; parts: [string, string] }> => {
    try {
      // This is a simplified example - in a real implementation you would use the actual hash function
      // For demonstration, we're using a placeholder
      const hash = `0x${Array.from(data.join('')).reduce((a, b) => a + b.charCodeAt(0).toString(16), '')}`.padEnd(
        66,
        '0'
      );

      // Split hash into two parts for ZoKrates format
      // In a real implementation, this would use the actual ZoKrates hash function
      const hashBigInt = BigInt(hash);
      const part1 = (hashBigInt & ((BigInt(1) << BigInt(128)) - BigInt(1))).toString();
      const part2 = (hashBigInt >> BigInt(128)).toString();

      return {
        hash,
        parts: [part1, part2],
      };
    } catch (error) {
      console.error('Error computing hash:', error);
      throw error;
    }
  };

  // Function to load sample test values
  const loadSampleValues = async () => {
    // Clear any existing hash values
    setCalculatedHash(null);
    setHashParts(null);

    if (customHashInput) {
      // For custom hash input mode
      form.setValue('input1', '123');
      form.setValue('input2', '456');
      form.setValue('input3', '789');
      form.setValue('input4', '101112');
      form.setValue('expectedHash', '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');
    } else {
      // For normal hash calculation mode
      form.setValue('input1', '123');
      form.setValue('input2', '456');
      form.setValue('input3', '789');
      form.setValue('input4', '101112');

      // Pre-calculate the hash so we can see it before submitting
      try {
        const inputs = ['123', '456', '789', '101112'];
        const { hash, parts } = await computeHash(inputs);
        setCalculatedHash(hash);
        setHashParts(parts);
      } catch (error) {
        console.error('Error pre-calculating hash:', error);
      }
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      // Collect non-empty inputs
      const inputs: string[] = [
        values.input1,
        ...(values.input2 ? [values.input2] : []),
        ...(values.input3 ? [values.input3] : []),
        ...(values.input4 ? [values.input4] : []),
      ];

      // Pad array to length 4 if needed
      while (inputs.length < 4) {
        inputs.push('0');
      }

      // Convert inputs to numbers if they're hex strings
      const processedInputs = inputs.map((input) => {
        if (input.startsWith('0x')) {
          return BigInt(input).toString();
        }
        return input;
      });

      // Calculate hash if not using custom expected hash
      let expectedHashParts: [string, string];

      if (customHashInput && values.expectedHash) {
        // Parse the expected hash
        const hashHex = values.expectedHash.startsWith('0x') ? values.expectedHash : `0x${values.expectedHash}`;

        const hashBigInt = BigInt(hashHex);

        // Split into two parts for ZoKrates format
        const part1 = (hashBigInt & ((BigInt(1) << BigInt(128)) - BigInt(1))).toString();
        const part2 = (hashBigInt >> BigInt(128)).toString();

        expectedHashParts = [part1, part2];
        setCalculatedHash(hashHex);
        setHashParts(expectedHashParts);
      } else {
        // Calculate hash from inputs
        const { hash, parts } = await computeHash(processedInputs);
        expectedHashParts = parts;
        setCalculatedHash(hash);
        setHashParts(parts);
      }

      // Prepare circuit input
      const circuitInput = {
        data: processedInputs,
        expectedHash: expectedHashParts,
      };

      // Generate and verify proof
      await generateAndVerifyProof(circuitInput);
    } catch (error) {
      console.error('Error preparing hash verification:', error);
      form.setError('expectedHash', {
        type: 'manual',
        message: `Error: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  };

  const resetForm = () => {
    form.reset();
    setCalculatedHash(null);
    setHashParts(null);
    reset();
  };

  return (
    <ZoKratesCard
      title="Hash Verifier"
      description="Verify data integrity with zero-knowledge proofs using SHA-256 hashing"
      circuitType={CircuitType.HASH_VERIFIER}
      loading={loading}
      result={result}
      resultCode={resultCode}
      resultMessage={resultMessage}
      error={error}
      onReset={resetForm}
      proof={proof}
      publicSignals={publicSignals}
      circuitReady={circuitReady}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <KeyIcon className="h-5 w-5 text-indigo-500 mr-2" />
              <h3 className="font-medium">Input Data</h3>
            </div>

            <FormField
              control={form.control}
              name="input1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Input 1</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter data value"
                      {...field}
                      className="border-indigo-200 dark:border-indigo-800 focus:border-indigo-500"
                    />
                  </FormControl>
                  <FormDescription>Enter a number, text, or hex value (0x...)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="input2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Input 2 (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter data value"
                      {...field}
                      className="border-indigo-200 dark:border-indigo-800 focus:border-indigo-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="input3"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Input 3 (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter data value"
                      {...field}
                      className="border-indigo-200 dark:border-indigo-800 focus:border-indigo-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="input4"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Input 4 (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter data value"
                      {...field}
                      className="border-indigo-200 dark:border-indigo-800 focus:border-indigo-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="customHashInput"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Use custom expected hash</FormLabel>
                  <FormDescription>
                    Instead of calculating the hash from inputs, use a custom expected hash value
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          {customHashInput && (
            <FormField
              control={form.control}
              name="expectedHash"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expected Hash</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter expected hash (hex)"
                      {...field}
                      className="font-mono border-blue-200 dark:border-blue-800"
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the expected hash value in hexadecimal format (with or without 0x prefix)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {calculatedHash && (
            <Card className="space-y-2 p-4 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
              <div className="flex items-center mb-2">
                <Hash className="h-5 w-5 text-slate-500 mr-2" />
                <p className="text-sm font-medium">Calculated Hash:</p>
              </div>
              <code className="block text-xs bg-slate-100 dark:bg-slate-800 p-3 rounded-md overflow-auto break-all font-mono">
                {calculatedHash}
              </code>

              {hashParts && (
                <div className="mt-2">
                  <div className="flex items-center mb-1">
                    <Code className="h-4 w-4 text-slate-500 mr-2" />
                    <p className="text-xs font-medium">Hash Parts (For Circuit):</p>
                  </div>
                  <ul className="text-xs bg-slate-100 dark:bg-slate-800 p-3 rounded-md overflow-auto font-mono">
                    <li>Low: {hashParts[0]}</li>
                    <li>High: {hashParts[1]}</li>
                  </ul>
                </div>
              )}
            </Card>
          )}

          <div className="flex space-x-4">
            <Button
              type="submit"
              disabled={loading || !circuitReady}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {loading ? 'Verifying...' : 'Verify Hash'}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={loadSampleValues}
              disabled={loading}
              className="flex items-center gap-2 border-gray-300 dark:border-gray-700"
            >
              <RefreshCw className="h-4 w-4" />
              Load Sample Values
            </Button>
          </div>
        </form>
      </Form>
    </ZoKratesCard>
  );
};

export default HashVerifier;

'use client';

import React, { useState, useEffect } from 'react';
import { isAddress } from 'viem';
import { format } from 'date-fns';
import { CalendarIcon, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useSonner } from '@/hooks/use-sonner';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

interface AgeVerificationProps {
  walletAddress?: string;
  onVerificationComplete?: (result: VerificationResult) => void;
  apiEndpoint?: string;
}

interface VerificationResult {
  success: boolean;
  verificationId?: string;
  transactionHash?: string;
  result?: number | boolean;
  error?: string;
}

// Define form schema with Zod
const formSchema = z.object({
  verificationType: z.enum(['1', '2', '3']),
  age: z
    .string()
    .optional()
    .refine((val) => !val || (Number(val) >= 0 && Number(val) <= 120), {
      message: 'Age must be between 0 and 120',
    }),
  birthDate: z.date().optional(),
  threshold: z
    .string()
    .optional()
    .refine((val) => !val || (Number(val) >= 0 && Number(val) <= 120), {
      message: 'Threshold must be between 0 and 120',
    }),
  subject: z.string().refine((val) => isAddress(val as `0x${string}`), {
    message: 'Invalid Ethereum address',
  }),
  expirationDays: z
    .string()
    .default('365')
    .refine((val) => Number(val) >= 0, {
      message: 'Expiration days must be a positive number or zero',
    }),
});

type FormValues = z.infer<typeof formSchema>;

/**
 * AgeVerification Component
 *
 * A React component that provides a user interface for ZKP-based age verification.
 * Supports three verification types: simple age verification, birth date verification,
 * and age bracket verification.
 */
const AgeVerification: React.FC<AgeVerificationProps> = ({
  walletAddress,
  onVerificationComplete,
  apiEndpoint = '/api/zkp/age-verification',
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const { toast } = useSonner();

  // Initialize form with react-hook-form and zod validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      verificationType: '1',
      subject: walletAddress || '',
      expirationDays: '365',
      threshold: '18',
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
  useEffect(() => {
    form.resetField('age');
    form.resetField('birthDate');
    form.resetField('threshold');

    // Set default threshold for age verification types
    if (verificationType === '1' || verificationType === '2') {
      form.setValue('threshold', '18');
    }
  }, [verificationType, form]);

  const handleSubmit = async (values: FormValues) => {
    setLoading(true);
    setResult(null);

    try {
      // Prepare request based on verification type
      const request: any = {
        verificationType: parseInt(values.verificationType),
        subject: values.subject,
        expirationDays: parseInt(values.expirationDays),
      };

      // Add type-specific parameters
      if (values.verificationType === '1') {
        // Simple age verification
        if (!values.age || !values.threshold) {
          throw new Error('Age and threshold are required for simple age verification');
        }
        request.age = parseInt(values.age);
        request.threshold = parseInt(values.threshold);
      } else if (values.verificationType === '2') {
        // Birth date verification
        if (!values.birthDate || !values.threshold) {
          throw new Error('Birth date and threshold are required for birth date verification');
        }
        const birthDate = format(values.birthDate, 'yyyyMMdd');
        const currentDate = format(new Date(), 'yyyyMMdd');
        request.birthDate = parseInt(birthDate);
        request.currentDate = parseInt(currentDate);
        request.threshold = parseInt(values.threshold);
      } else if (values.verificationType === '3') {
        // Age bracket verification
        if (!values.age) {
          throw new Error('Age is required for age bracket verification');
        }
        request.age = parseInt(values.age);
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
      };

      setResult(verificationResult);

      // Notify parent component
      if (onVerificationComplete) {
        onVerificationComplete(verificationResult);
      }

      toast.success('Verification Complete', {
        description: 'Your age verification has been successfully processed.',
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
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Age</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} max={120} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="threshold"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age Threshold</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} max={120} {...field} />
                  </FormControl>
                  <FormDescription>The minimum age required for verification</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
      case '2':
        return (
          <>
            <FormField
              control={form.control}
              name="birthDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Birth Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
                        >
                          {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="threshold"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age Threshold</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} max={120} {...field} />
                  </FormControl>
                  <FormDescription>The minimum age required for verification</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
      case '3':
        return (
          <FormField
            control={form.control}
            name="age"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Age</FormLabel>
                <FormControl>
                  <Input type="number" min={0} max={120} {...field} />
                </FormControl>
                <FormDescription>Your age will be used to determine your age bracket</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
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

    if (verificationType === '1' || verificationType === '2') {
      // Simple age or birth date verification
      if (result.result === true || result.result === 1) {
        resultMessage = 'Verification successful! You meet the age requirement.';
      } else {
        resultMessage = 'Verification failed. You do not meet the age requirement.';
        resultIcon = <AlertCircle className="h-5 w-5 text-red-500" />;
      }
    } else if (verificationType === '3') {
      // Age bracket verification
      let bracketName = '';
      const bracketResult = typeof result.result === 'number' ? result.result : 0;

      switch (bracketResult) {
        case 1:
          bracketName = 'Child (0-17)';
          break;
        case 2:
          bracketName = 'Adult (18-64)';
          break;
        case 3:
          bracketName = 'Senior (65+)';
          break;
        default:
          bracketName = 'Unknown';
      }
      resultMessage = `Your age bracket is: ${bracketName}`;
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
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Age Verification</CardTitle>
        <CardDescription>
          Verify your age using Zero-Knowledge Proofs without revealing your actual age or birth date.
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
                      <SelectItem value="1">Simple Age Verification</SelectItem>
                      <SelectItem value="2">Birth Date Verification</SelectItem>
                      <SelectItem value="3">Age Bracket Verification</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Choose the type of age verification you need</FormDescription>
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

export default AgeVerification;

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { SmartDatetimeInput as DatePicker } from '@/components/ui/custom/smart-date-input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Shield, CalendarIcon, ArrowRightIcon, Code, X, Copy, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import CircuitCard from './CircuitCard';
import { AgeVerificationType, CircuitType } from '../types';
import { useCircuitVerification } from '../hooks/useCircuitVerification';

// Schema for form validation
const formSchema = z
  .object({
    verificationType: z.enum(['1', '2', '3']),
    age: z.coerce.number().min(0).max(120).optional(),
    birthDate: z
      .date()
      .refine((date) => date <= new Date(), {
        message: 'Birth date must be in the past',
      })
      .refine(
        (date) => {
          const year = date.getFullYear();
          return year >= 1900 && year <= 2199;
        },
        {
          message: 'Birth year must be between 1900 and 2199',
        }
      )
      .optional(),
    threshold: z.coerce.number().min(0).max(120),
  })
  .superRefine((data, ctx) => {
    // Simple validation logic based on verification type
    if (data.verificationType === '1' && data.birthDate === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Birth date is required for simple age verification',
        path: ['birthDate'],
      });
    }

    if (data.verificationType === '2' && data.birthDate === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Birth date is required for birth date verification',
        path: ['birthDate'],
      });
    }

    if (data.verificationType === '3' && data.birthDate === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Birth date is required for age bracket verification',
        path: ['birthDate'],
      });
    }
  });

type FormValues = z.infer<typeof formSchema>;

// Convert a JavaScript date to Unix timestamp (seconds since epoch)
function dateToTimestamp(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}

// Convert years to seconds
function yearsToSeconds(years: number): number {
  return years * 31536000; // 365 days in seconds
}

// Calculate age in years from birthdate and current date timestamps
function calculateAgeInYears(birthDateTimestamp: number, currentDateTimestamp: number): number {
  return Math.floor((currentDateTimestamp - birthDateTimestamp) / 31536000);
}

/**
 * AgeVerifier component for verifying age-related claims using ZKP
 */
const AgeVerifier = React.memo(() => {
  // State to control the proof details modal
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);

  // Using the circuit verification hook
  const {
    loading,
    error,
    result,
    resultMessage,
    resultCode,
    generateAndVerifyProof,
    reset,
    circuitReady,
    publicSignals,
    proof,
  } = useCircuitVerification({
    circuitType: CircuitType.AGE_VERIFIER,
  });

  // Form setup with react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      verificationType: '1',
      threshold: 18,
    },
  });

  // Watch the verification type to update the UI accordingly
  const verificationType = form.watch('verificationType');

  // Use a ref to track if we should reset values
  const initialRender = React.useRef(true);

  // Handle form field updates when verification type changes - without causing infinite loops
  useEffect(() => {
    // Skip the effect on first render
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }

    // Only continue if verificationType has a value
    if (!verificationType) return;

    // Reset any validation errors first
    form.clearErrors();

    // Create a timeout to break the render cycle
    const timer = setTimeout(() => {
      // Reset birthDate for any verification type change
      // Since we're now using birth date for all verification types
      if (verificationType !== form.getValues().verificationType) {
        form.setValue('birthDate', undefined);
      }

      // Always reset threshold to default when changing types
      form.setValue('threshold', 18);
    }, 0);

    // Clean up the timeout if the component unmounts or the effect runs again
    return () => clearTimeout(timer);
  }, [verificationType]); // Only depend on verificationType

  // Generate a human-readable result message
  const getResultDisplay = (resultCode: number | null) => {
    if (resultCode === null) return null;

    // Determine message and style based on result code
    let message;
    let variant: 'success' | 'destructive' = 'destructive';

    // Simple Age Verification
    if (resultCode === 14) {
      message = 'Verification successful - you are above the age threshold';
      variant = 'success';
    } else if (resultCode === 21) {
      message = 'Verification failed - you are below the age threshold';
      variant = 'destructive';
    }
    // Birth Date Verification
    else if (resultCode === 19) {
      message = 'Birth date verification successful - above threshold';
      variant = 'success';
    } else if (resultCode === 22) {
      message = 'Birth date verification failed - below threshold';
      variant = 'destructive';
    } else if (resultCode === 23) {
      message = 'Invalid birth date - date must be in the past';
      variant = 'destructive';
    }
    // Age Bracket Verification results
    else if (resultCode === 11) {
      message = 'Verification Passed: Child (0-17)';
      variant = 'success';
    } else if (resultCode === 12) {
      message = 'Verification Passed: Adult (18-64)';
      variant = 'success';
    } else if (resultCode === 13) {
      message = 'Verification Passed: Senior (65+)';
      variant = 'success';
    } else if (resultCode === 10) {
      message = 'Verification Failed: Age bracket verification failed';
      variant = 'destructive';
    }

    return (
      <div
        className={`p-3 ${
          variant === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        } rounded-md text-${variant === 'success' ? 'green-800' : 'red-800'}`}
      >
        <p className="font-medium">{message}</p>
        {proof && publicSignals && (
          <div className="mt-3">
            <Button
              size="sm"
              variant="outline"
              className="flex items-center gap-1 text-xs"
              onClick={() => setIsProofModalOpen(true)}
            >
              <Code className="h-3 w-3" />
              Show Proof Details
            </Button>
          </div>
        )}
      </div>
    );
  };

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    try {
      // Check if values.birthDate exists
      if (!values.birthDate) {
        console.error('Birth date is required for all verification types');
        return;
      }

      // Get current date as a Date object
      const now = new Date();

      // Convert dates to Unix timestamps (seconds since epoch)
      const birthDateTimestamp = dateToTimestamp(values.birthDate);
      const currentDateTimestamp = dateToTimestamp(now);

      // Convert threshold from years to seconds
      const thresholdInSeconds = yearsToSeconds(values.threshold);

      // Calculate age in years (for informational purposes)
      const ageInYears = calculateAgeInYears(birthDateTimestamp, currentDateTimestamp);

      // Parse verification type
      const verificationType = parseInt(values.verificationType);

      console.log(
        `Submitting with: verificationType=${verificationType}, birthDate=${
          new Date(birthDateTimestamp * 1000).toISOString().split('T')[0]
        }, currentDate=${
          new Date(currentDateTimestamp * 1000).toISOString().split('T')[0]
        }, threshold=${thresholdInSeconds} seconds (${values.threshold} years), calculated age: ${ageInYears} years`
      );

      // Object input format for the circuit
      const input = {
        birthDate: birthDateTimestamp.toString(),
        currentDate: currentDateTimestamp.toString(),
        threshold: thresholdInSeconds.toString(),
        verificationType: verificationType.toString(),
      };

      // Use the hook's generateAndVerifyProof function
      await generateAndVerifyProof(input);
    } catch (error) {
      console.error('Error processing verification:', error);
    }
  };

  // Format proof and public signals for display
  const getFormattedProofData = () => {
    if (!proof || !publicSignals) return '';

    // Extract the result code for clearer display
    const resultCode = publicSignals[0];
    const otherSignals = publicSignals.slice(1);

    // Format the proof data for better readability
    const formattedProof = {
      // Show result code prominently
      result: {
        code: `${resultCode}`,
        verification: processResultMessage(parseInt(resultCode)),
      },
      // Group the cryptographic proof components
      zkProof: {
        pi_a: proof.pi_a,
        pi_b: proof.pi_b,
        pi_c: proof.pi_c,
        protocol: proof.protocol,
        curve: proof.curve,
      },
      // Show other public signals if any
      publicSignals: otherSignals.length > 0 ? otherSignals : undefined,
    };

    return JSON.stringify(formattedProof, null, 2);
  };

  // Helper function to process result code into a readable message
  const processResultMessage = (code: number): string => {
    // Simple Age Verification
    if (code === 14) return 'Success: Above Age Threshold';
    if (code === 21) return 'Failed: Below Age Threshold';

    // Birth Date Verification
    if (code === 19) return 'Success: Valid Birth Date Above Threshold';
    if (code === 22) return 'Failed: Valid Birth Date Below Threshold';
    if (code === 23) return 'Failed: Invalid Birth Date';

    // Age Bracket Verification
    if (code === 11) return 'Age Category: Child (0-17)';
    if (code === 12) return 'Age Category: Adult (18-64)';
    if (code === 13) return 'Age Category: Senior (65+)';

    return 'Unknown Result';
  };

  // Inside the AgeVerifier component, add a new state for copy status
  const [hasCopied, setHasCopied] = useState(false);

  // Add a function to copy proof data to clipboard
  const copyToClipboard = () => {
    const proofData = getFormattedProofData();
    if (proofData) {
      navigator.clipboard
        .writeText(proofData)
        .then(() => {
          setHasCopied(true);
          setTimeout(() => setHasCopied(false), 2000);
        })
        .catch((err) => {
          console.error('Failed to copy: ', err);
        });
    }
  };

  // Display error if circuit files are not available
  if (!circuitReady) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Circuit Files Not Available</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <CircuitCard
        title="Age Verification"
        description="Verify age-related claims without revealing the actual age"
        circuitType={CircuitType.AGE_VERIFIER}
        loading={loading}
        result={
          result
            ? {
                ...result,
                // Custom success flag based on the specific circuit's result codes
                success:
                  resultCode === 14 || resultCode === 19 || resultCode === 11 || resultCode === 12 || resultCode === 13,
              }
            : null
        }
        resultMessage={resultMessage}
        resultCode={resultCode}
        error={error}
        publicSignals={publicSignals || undefined}
        customResultDisplay={getResultDisplay(resultCode)}
        onReset={() => {
          // Use setTimeout to break the event loop and prevent re-render issues
          setTimeout(() => {
            // First reset the form with default values
            form.reset({
              verificationType: '1',
              birthDate: undefined,
              threshold: 18,
            });

            // Then clear any validation errors
            form.clearErrors();

            // Finally reset the circuit verification state
            reset();
          }, 0);
        }}
        data-testid="age-verifier"
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="verificationType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Verification Type</FormLabel>
                  <FormControl>
                    <div className="flex flex-col space-y-2">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          className="h-4 w-4 text-primary border-muted rounded-full focus:ring-primary"
                          checked={field.value === '1'}
                          onChange={() => field.onChange('1')}
                          data-testid="verification-type-simple"
                        />
                        <span className="text-sm font-normal">Simple Age Verification</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          className="h-4 w-4 text-primary border-muted rounded-full focus:ring-primary"
                          checked={field.value === '2'}
                          onChange={() => field.onChange('2')}
                          data-testid="verification-type-birthdate"
                        />
                        <span className="text-sm font-normal">Birth Date Verification</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          className="h-4 w-4 text-primary border-muted rounded-full focus:ring-primary"
                          checked={field.value === '3'}
                          onChange={() => field.onChange('3')}
                          data-testid="verification-type-bracket"
                        />
                        <span className="text-sm font-normal">Age Bracket Verification</span>
                      </label>
                    </div>
                  </FormControl>
                  <FormDescription>Select the type of age verification you want to perform</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Birth date field - now shown for all verification types */}
            <FormField
              control={form.control}
              name="birthDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Birth Date</FormLabel>
                  <FormControl>
                    <DatePicker
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select birth date"
                      disabled={false}
                      data-testid="birth-date-input"
                    />
                  </FormControl>
                  <FormDescription>
                    Enter your date of birth. The circuit will perform verification based on this date.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Threshold field - not shown for age bracket verification */}
            {verificationType !== '3' && (
              <FormField
                control={form.control}
                name="threshold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age Threshold</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={120}
                        placeholder="Minimum age required"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                        value={field.value || ''}
                        data-testid="threshold-input"
                      />
                    </FormControl>
                    <FormDescription>The minimum age required (e.g., 18 for adult verification)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {verificationType === '3' && (
              <div className="bg-muted/50 p-4 rounded-md">
                <h4 className="text-sm font-medium mb-2">Age Brackets</h4>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="p-2 bg-background rounded border">
                    <div className="font-medium">Child</div>
                    <div className="text-muted-foreground">0-17 years</div>
                  </div>
                  <div className="p-2 bg-background rounded border">
                    <div className="font-medium">Adult</div>
                    <div className="text-muted-foreground">18-64 years</div>
                  </div>
                  <div className="p-2 bg-background rounded border">
                    <div className="font-medium">Senior</div>
                    <div className="text-muted-foreground">65+ years</div>
                  </div>
                </div>
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full" data-testid="verify-button">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">◌</span> Verifying...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Shield className="h-4 w-4" /> Verify
                </span>
              )}
            </Button>
          </form>
        </Form>
      </CircuitCard>

      {/* Proof Details Modal */}
      <Dialog open={isProofModalOpen} onOpenChange={setIsProofModalOpen}>
        <DialogContent className="md:max-w-3xl lg:max-w-4xl xl:max-w-5xl w-[90vw] max-h-[90vh] p-0 overflow-hidden">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">Zero-Knowledge Proof Details</h2>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                The proof and public signals generated for this verification
              </p>
            </div>

            {/* Content area with fixed height */}
            <div className="flex-1 overflow-auto p-4">
              <div className="mb-4 flex justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-3 rounded-md flex items-center gap-1.5"
                  onClick={copyToClipboard}
                >
                  {hasCopied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-green-500" />
                      <span className="text-xs">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span className="text-xs">Copy to Clipboard</span>
                    </>
                  )}
                </Button>
              </div>

              <div className="rounded-md border overflow-hidden bg-slate-950">
                <pre className="p-4 text-xs text-slate-50 overflow-auto" style={{ maxHeight: '40vh' }}>
                  <code>{getFormattedProofData()}</code>
                </pre>
              </div>
            </div>

            {/* Footer explanation */}
            <div className="p-4 border-t bg-muted">
              <div className="grid gap-3 text-xs text-muted-foreground">
                <h3 className="font-medium text-foreground">What is this data?</h3>
                <div className="grid gap-2">
                  <div>
                    <span className="font-semibold text-foreground">Proof: </span>
                    The cryptographic proof that verifies your claim without revealing your actual birth date.
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">Public Signals: </span>
                    Public values that can be used with the proof to verify your claim. The first signal (
                    {publicSignals?.[0]}) is the result code.
                  </div>
                  <div>
                    The verification can be performed by anyone with access to the public signals and the verification
                    key, but they cannot extract your birth date from this information.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
});

export default AgeVerifier;

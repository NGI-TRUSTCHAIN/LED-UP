import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { SmartDatetimeInput as DatePicker } from '@/components/ui/custom/smart-date-input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon, AlertCircle, CalendarIcon, UserIcon, CalculatorIcon } from 'lucide-react';
import ZoKratesCard from './ZoKratesCard';
import { CircuitType } from '../types';
import { AgeVerificationType, AgeVerificationResultCode } from '../types/index';
import { useZoKratesVerification } from '../hooks/useZoKratesVerification';

// Schema for form validation
const formSchema = z.object({
  verificationType: z.enum(['1', '2', '3']),
  age: z.coerce.number().min(0).max(120).optional(),
  birthDate: z.date().optional(),
  threshold: z.coerce.number().min(0).max(120),
});

type FormValues = z.infer<typeof formSchema>;

// Convert a JavaScript date to a YYYYMMDD formatted number
function dateToYYYYMMDD(date: Date): number {
  return parseInt(
    date.getFullYear().toString() +
      (date.getMonth() + 1).toString().padStart(2, '0') +
      date.getDate().toString().padStart(2, '0'),
    10
  );
}

// Create a date from a year, month, and day
function createDate(year: number, month: number, day: number): Date {
  // Month is 0-indexed in JavaScript Date
  return new Date(year, month - 1, day);
}

// Safe helper function for verification type
function getVerificationType(type: string): number {
  const typeNumber = parseInt(type, 10);
  if (AgeVerificationType && typeof AgeVerificationType === 'object') {
    return typeNumber;
  }
  // Fallback values if enum is not properly defined
  return typeNumber;
}

const AgeVerifier: React.FC = () => {
  const [birthDateTimestamp, setBirthDateTimestamp] = useState<number | null>(null);
  const [currentDateTimestamp, setCurrentDateTimestamp] = useState<number>(dateToYYYYMMDD(new Date()));
  const [debugInfo, setDebugInfo] = useState<any | null>(null);

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
    circuitType: 'age_verifier' as CircuitType,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      verificationType: '1',
      age: 25,
      threshold: 18,
    },
  });

  const verificationType = form.watch('verificationType');

  // Function to load sample test values
  const loadSampleValues = () => {
    const verType = getVerificationType(form.getValues('verificationType'));

    switch (verType) {
      case 1: // SIMPLE
        // For simple age verification, set age to 25 and threshold to 18
        form.setValue('age', 25);
        form.setValue('threshold', 18);
        break;
      case 2: // BIRTH_DATE
        // For birth date verification, set birth date to 2000-01-01 and threshold to 18
        form.setValue('birthDate', createDate(2000, 1, 1));
        form.setValue('threshold', 18);
        break;
      case 3: // AGE_BRACKET
        // For age bracket verification, set age to 25 and threshold to 18
        form.setValue('age', 25);
        form.setValue('threshold', 18);
        break;
    }
  };

  const onSubmit = async (values: FormValues) => {
    // Always use today's date for current date
    const today = new Date();
    const currentDate = dateToYYYYMMDD(today);
    setCurrentDateTimestamp(currentDate);

    let birthDate = 0;
    if (values.birthDate) {
      // Ensure we're getting a proper date object from the form
      const birthDateObj = new Date(values.birthDate);
      birthDate = dateToYYYYMMDD(birthDateObj);
      setBirthDateTimestamp(birthDate);
    }

    // Make sure we have a valid verification type
    const verType = getVerificationType(values.verificationType);

    // For age bracket verification (type 3), make sure we have a birthdate
    if (verType === 3 && !birthDate) {
      form.setError('birthDate', {
        type: 'manual',
        message: 'Birth date is required for age bracket verification',
      });
      return;
    }

    // Prepare the input for the ZoKrates circuit
    const input = {
      age: values.age || 0,
      birthDate: birthDate,
      currentDate: currentDate,
      threshold: values.threshold,
      verificationType: verType,
    };

    // Save debug info
    setDebugInfo({
      input,
      dates: {
        birthDate: birthDate
          ? new Date(
              parseInt(birthDate.toString().substring(0, 4)),
              parseInt(birthDate.toString().substring(4, 6)) - 1,
              parseInt(birthDate.toString().substring(6, 8))
            ).toISOString()
          : null,
        currentDate: new Date(
          parseInt(currentDate.toString().substring(0, 4)),
          parseInt(currentDate.toString().substring(4, 6)) - 1,
          parseInt(currentDate.toString().substring(6, 8))
        ).toISOString(),
      },
    });

    console.log('Submitting age verification with input:', input);
    await generateAndVerifyProof(input);
  };

  // Reset the form and debug info
  const handleReset = () => {
    reset();
    setDebugInfo(null);
  };

  // Function to get the icon for the current verification type
  const getVerificationTypeIcon = () => {
    const verType = getVerificationType(verificationType);

    switch (verType) {
      case 1: // SIMPLE
        return <CalculatorIcon className="h-5 w-5 text-blue-500" />;
      case 2: // BIRTH_DATE
        return <CalendarIcon className="h-5 w-5 text-emerald-500" />;
      case 3: // AGE_BRACKET
        return <UserIcon className="h-5 w-5 text-purple-500" />;
      default:
        return <InfoIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  // Function to get the background color for the verification type section
  const getVerificationTypeBackground = () => {
    const verType = getVerificationType(verificationType);

    switch (verType) {
      case 1: // SIMPLE
        return 'bg-blue-50 dark:bg-blue-900/20';
      case 2: // BIRTH_DATE
        return 'bg-emerald-50 dark:bg-emerald-900/20';
      case 3: // AGE_BRACKET
        return 'bg-purple-50 dark:bg-purple-900/20';
      default:
        return 'bg-gray-50 dark:bg-gray-900/20';
    }
  };

  return (
    <ZoKratesCard
      title="Age Verifier"
      description="Verify age-related claims with zero-knowledge proofs using ZoKrates"
      circuitType={CircuitType.AGE_VERIFIER}
      loading={loading}
      result={result}
      resultCode={resultCode}
      resultMessage={resultMessage}
      error={error}
      onReset={handleReset}
      proof={proof}
      publicSignals={publicSignals}
      circuitReady={circuitReady}
    >
      <div className={`p-4 rounded-lg mb-6 ${getVerificationTypeBackground()}`}>
        <div className="flex items-center gap-2 mb-2">
          {getVerificationTypeIcon()}
          <h3 className="font-medium">
            {getVerificationType(verificationType) === 1
              ? 'Simple Age Verification'
              : getVerificationType(verificationType) === 2
              ? 'Birth Date Verification'
              : getVerificationType(verificationType) === 3
              ? 'Age Bracket Verification'
              : 'Age Verification'}
          </h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {getVerificationType(verificationType) === 1
            ? 'Directly verify if an age is above a threshold, without revealing the exact age.'
            : getVerificationType(verificationType) === 2
            ? "Calculate age from birth date and verify if it's above a threshold, without revealing the exact date."
            : 'Determine which age bracket a person falls into (child, adult, senior), without revealing the exact age.'}
        </p>
      </div>

      {verificationType === '2' && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Birth Date Format</AlertTitle>
          <AlertDescription>
            Birth date will be converted to YYYYMMDD format. Make sure it's a valid date.
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="verificationType"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Verification Type</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={(value) => {
                      field.onChange(value);
                      // When verification type changes, reset the relevant fields
                      if (value === '1') {
                        form.setValue('age', 25);
                      } else if (value === '2' || value === '3') {
                        // Clear birth date when switching to these modes
                        form.setValue('birthDate', undefined);
                        setBirthDateTimestamp(null);
                      }
                    }}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="1" />
                      </FormControl>
                      <FormLabel className="font-normal">Simple Age Check</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="2" />
                      </FormControl>
                      <FormLabel className="font-normal">Birth Date Check</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="3" />
                      </FormControl>
                      <FormLabel className="font-normal">Age Bracket Check</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormDescription>Select the type of age verification to perform.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {verificationType === '1' && (
            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} className="w-full" />
                  </FormControl>
                  <FormDescription>Enter the age to verify against the threshold.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {verificationType === '2' && (
            <FormField
              control={form.control}
              name="birthDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Birth Date</FormLabel>
                  <FormControl>
                    <DatePicker value={field.value} onValueChange={field.onChange} disabled={loading} />
                  </FormControl>
                  <FormDescription>Select the birth date to calculate the age.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {verificationType === '3' && (
            <FormField
              control={form.control}
              name="birthDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Birth Date</FormLabel>
                  <FormControl>
                    <DatePicker value={field.value} onValueChange={field.onChange} disabled={loading} />
                  </FormControl>
                  <FormDescription>Select the birth date to determine age bracket.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="threshold"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Threshold</FormLabel>
                <FormControl>
                  <Input type="number" {...field} className="w-full" />
                </FormControl>
                <FormDescription>
                  {verificationType === '3'
                    ? 'Age threshold to determine brackets (child: < threshold, adult: >= threshold)'
                    : 'Age threshold to verify against.'}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {birthDateTimestamp && (verificationType === '2' || verificationType === '3') && (
            <div className="text-sm bg-gray-50 dark:bg-gray-900 p-3 rounded-md border border-gray-200 dark:border-gray-800">
              <div className="font-medium mb-1">Date Information</div>
              <p className="text-gray-600 dark:text-gray-400">Birth Date (YYYYMMDD): {birthDateTimestamp}</p>
              <p className="text-gray-600 dark:text-gray-400">Current Date (YYYYMMDD): {currentDateTimestamp}</p>
            </div>
          )}

          {/* Show debug info if available */}
          {debugInfo && (
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md mb-4">
              <p className="text-sm font-semibold mb-2">Debug Information:</p>
              <div className="text-xs space-y-1 font-mono">
                <p>Verification Type: {debugInfo.input.verificationType}</p>
                <p>Age: {debugInfo.input.age}</p>
                <p>
                  Birth Date: {birthDateTimestamp} ({debugInfo.dates.birthDate})
                </p>
                <p>
                  Current Date: {currentDateTimestamp} ({debugInfo.dates.currentDate})
                </p>
                <p>Threshold: {debugInfo.input.threshold}</p>
              </div>
            </div>
          )}

          <div className="flex space-x-4">
            <Button
              type="submit"
              disabled={loading || !circuitReady}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {loading ? 'Verifying...' : 'Verify Age'}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={loadSampleValues}
              disabled={loading}
              className="border-gray-300 dark:border-gray-700"
            >
              Load Sample Values
            </Button>
          </div>
        </form>
      </Form>
    </ZoKratesCard>
  );
};

export default AgeVerifier;

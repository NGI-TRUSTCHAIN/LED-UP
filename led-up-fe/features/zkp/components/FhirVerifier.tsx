import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import CircuitCard from './CircuitCard';
import { CircuitType, FhirResourceType, FhirVerificationMode, FhirVerificationResult } from '../types';
import { useCircuitVerification } from '../hooks/useCircuitVerification';
import { calculatePoseidonHash, poseidonHashToHex, splitHashForCircuit } from '../utils/poseidon';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Shield, Code, Copy, Check } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

// Schema for form validation
const formSchema = z.object({
  verificationMode: z.enum(['1', '2', '3', '4']),
  resourceType: z.string().min(1, { message: 'Resource type is required' }),
  resourceData: z.string().optional(),
  resourceJson: z.string().optional(),
  expectedHash: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// Map of FHIR resource types
const resourceTypes = [
  { value: FhirResourceType.PATIENT.toString(), label: 'Patient' },
  { value: FhirResourceType.OBSERVATION.toString(), label: 'Observation' },
  { value: FhirResourceType.MEDICATION.toString(), label: 'Medication' },
  { value: FhirResourceType.CONDITION.toString(), label: 'Condition' },
  { value: FhirResourceType.ENCOUNTER.toString(), label: 'Encounter' },
  { value: FhirResourceType.PROCEDURE.toString(), label: 'Procedure' },
  { value: FhirResourceType.DIAGNOSTIC_REPORT.toString(), label: 'Diagnostic Report' },
  { value: FhirResourceType.IMMUNIZATION.toString(), label: 'Immunization' },
  { value: FhirResourceType.CLAIM.toString(), label: 'Claim' },
  { value: FhirResourceType.COVERAGE.toString(), label: 'Coverage' },
  { value: FhirResourceType.PRACTITIONER.toString(), label: 'Practitioner' },
  { value: FhirResourceType.ORGANIZATION.toString(), label: 'Organization' },
  { value: FhirResourceType.LOCATION.toString(), label: 'Location' },
  { value: FhirResourceType.CARE_PLAN.toString(), label: 'Care Plan' },
  { value: FhirResourceType.ALLERGY_INTOLERANCE.toString(), label: 'Allergy Intolerance' },
  { value: FhirResourceType.FAMILY_MEMBER_HISTORY.toString(), label: 'Family Member History' },
];

// Sample test vectors for easy verification based on the test file
const sampleTestVectors = {
  resourceType: {
    // Resource Type Verification - Valid (Mode 1)
    resourceData: [12345, 67890, 13579, 24680, 98765, 43210, 11223, 44556],
    resourceType: FhirResourceType.PATIENT,
    expectedHash: [0, 0],
    verificationMode: FhirVerificationMode.RESOURCE_TYPE_ONLY,
    expectedResult: FhirVerificationResult.SUCCESS,
  },
  resourceTypeFail: {
    // Resource Type Verification - Invalid (should fail)
    resourceData: [12345, 67890, 13579, 24680, 98765, 43210, 11223, 44556],
    resourceType: 99, // Invalid resource type
    expectedHash: [0, 0],
    verificationMode: FhirVerificationMode.RESOURCE_TYPE_ONLY,
    expectedResult: FhirVerificationResult.RESOURCE_TYPE_ERROR,
  },
  hash: {
    // Hash Verification - Valid (Mode 3)
    resourceData: [12345, 67890, 13579, 24680, 98765, 43210, 11223, 44556],
    resourceType: FhirResourceType.PATIENT,
    expectedHash: ['1796527974942811177779686228864301369667515173275935237830539062059572725738', '0'],
    verificationMode: FhirVerificationMode.HASH_VERIFICATION,
    expectedResult: FhirVerificationResult.SUCCESS,
  },
  hashFail: {
    // Hash Verification - Invalid (should fail with hash mismatch)
    resourceData: [12345, 67890, 13579, 24680, 98765, 43210, 11223, 44556],
    resourceType: FhirResourceType.PATIENT,
    expectedHash: ['987654321', '0'], // Deliberately wrong hash
    verificationMode: FhirVerificationMode.HASH_VERIFICATION,
    expectedResult: FhirVerificationResult.HASH_ERROR,
  },
  fields: {
    // Fields Verification (Mode 2) - Shows error code 4 as expected
    resourceData: [1, 12345, 67890, 0, 0, 0, 0, 0],
    resourceType: FhirResourceType.PATIENT,
    expectedHash: [0, 0],
    verificationMode: FhirVerificationMode.FIELD_VALIDATION,
    expectedResult: FhirVerificationResult.FIELD_ERROR,
  },
  complete: {
    // Complete Verification - Valid (Mode 4)
    // From Mocha test: Patient resource with complete data
    resourceData: [1, 123456, 654321, 111111, 222222, 333333, 444444, 555555],
    resourceType: FhirResourceType.PATIENT,
    expectedHash: ['21851047356946955483931778842960481887596557581966121956348027419892519346381', '0'],
    verificationMode: FhirVerificationMode.COMPLETE,
    expectedResult: FhirVerificationResult.SUCCESS,
  },
  completeFail: {
    // Complete Verification with missing fields (Mode 4)
    resourceData: [1, 0, 0, 111111, 222222, 333333, 444444, 555555],
    resourceType: FhirResourceType.PATIENT,
    expectedHash: ['19951358149749999460354640120581315777394458357505877505933828579145647062756', '0'],
    verificationMode: FhirVerificationMode.COMPLETE,
    expectedResult: FhirVerificationResult.FIELD_ERROR,
  },
  emptyResource: {
    // Empty resource - should fail with field error
    resourceData: [0, 0, 0, 0, 0, 0, 0, 0],
    resourceType: FhirResourceType.PATIENT,
    expectedHash: ['1524321216038799095937469147836866648978083754965002674906449126183454401066', '0'],
    verificationMode: FhirVerificationMode.COMPLETE,
    expectedResult: FhirVerificationResult.FIELD_ERROR,
  },
  observation: {
    // Observation resource (different resource type)
    resourceData: [2, 123456, 654321, 111111, 222222, 333333, 444444, 555555],
    resourceType: FhirResourceType.OBSERVATION,
    expectedHash: ['1616844955271914164475183024489519576828793045604803927919740524478147820590', '0'],
    verificationMode: FhirVerificationMode.COMPLETE,
    expectedResult: FhirVerificationResult.SUCCESS,
  },
};

const FhirVerifier = React.memo(() => {
  const [calculatedHash, setCalculatedHash] = useState<string | null>(null);
  const [hashParts, setHashParts] = useState<[bigint, bigint] | null>(null);
  const [processedResourceData, setProcessedResourceData] = useState<number[] | null>(null);
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

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
  } = useCircuitVerification({
    circuitType: CircuitType.FHIR_VERIFIER,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      verificationMode: '1',
      resourceType: FhirResourceType.PATIENT.toString(),
      resourceData: '',
      resourceJson: '',
      expectedHash: '',
    },
  });

  const verificationMode = form.watch('verificationMode');

  // Function to load sample test values
  const loadSampleValues = async (
    testType:
      | 'resourceType'
      | 'resourceTypeFail'
      | 'hash'
      | 'hashFail'
      | 'fields'
      | 'complete'
      | 'completeFail'
      | 'emptyResource'
      | 'observation' = 'resourceType'
  ) => {
    const testVector = sampleTestVectors[testType];

    // Clear previous values
    setCalculatedHash(null);
    setHashParts(null);
    setProcessedResourceData(null);

    // Set resource type
    form.setValue('resourceType', testVector.resourceType.toString(), { shouldDirty: false });
    form.setValue('verificationMode', testVector.verificationMode.toString() as '1' | '2' | '3' | '4', {
      shouldDirty: false,
    });

    // Format resource data as a comma-separated string
    const resourceDataStr = testVector.resourceData.join(',');
    form.setValue('resourceData', resourceDataStr, { shouldDirty: false });

    // Set expected hash for hash verification or complete verification mode
    if (
      testVector.verificationMode === FhirVerificationMode.HASH_VERIFICATION ||
      testVector.verificationMode === FhirVerificationMode.COMPLETE
    ) {
      // Calculate hash display
      try {
        const hashParts: [bigint, bigint] = [BigInt(testVector.expectedHash[0]), BigInt(testVector.expectedHash[1])];

        // For failing cases with very small numbers, just show the raw value
        let hashHex = '';
        if (testType === 'hashFail') {
          hashHex = '0x' + testVector.expectedHash[0].toString(16).padStart(64, '0');
        } else {
          hashHex = poseidonHashToHex(hashParts[0] + (hashParts[1] << BigInt(128)));
        }

        form.setValue('expectedHash', hashHex, { shouldDirty: false });
        setCalculatedHash(hashHex);
        setHashParts(hashParts);
      } catch (error) {
        console.error('Error setting hash values:', error);
      }
    }

    // Display processed resource data
    setProcessedResourceData(testVector.resourceData);
  };

  // Helper function to process FHIR resource data
  const processFhirResourceData = async (
    data: string,
    mode: string
  ): Promise<{ resourceData: number[]; hash?: [bigint, bigint] }> => {
    // For simplicity in this demo, we'll convert the data into 8 numeric values
    // In a real implementation, you would parse the FHIR JSON and extract specific fields

    let resourceData: number[] = [];

    if (mode === '3' || mode === '4') {
      // For hash verification mode, use the data to generate a hash
      try {
        // If data is JSON, try to process it
        if (data.trim().startsWith('{')) {
          const processedData = new TextEncoder().encode(data);

          // Take first 32 bytes or pad with zeros
          resourceData = Array.from({ length: 8 }, (_, i) => {
            if (i < processedData.length) return processedData[i];
            return 0;
          });
        } else {
          // Otherwise split by commas and convert to numbers
          resourceData = data
            .split(',')
            .map((item) => parseInt(item.trim(), 10))
            .filter((num) => !isNaN(num));

          // Ensure we have exactly 8 values
          if (resourceData.length > 8) {
            resourceData = resourceData.slice(0, 8);
          } else {
            resourceData = [...resourceData, ...Array(8 - resourceData.length).fill(0)];
          }
        }

        // Calculate hash
        const hashBigInt = await calculatePoseidonHash(resourceData);
        const hashParts = splitHashForCircuit(hashBigInt);
        setCalculatedHash(poseidonHashToHex(hashBigInt));
        setHashParts(hashParts);

        return { resourceData, hash: hashParts };
      } catch (error) {
        console.error('Error processing FHIR data for hash:', error);
        throw new Error('Failed to process FHIR data for hash calculation');
      }
    } else {
      // For resource type and field validation modes, just parse as numbers
      try {
        if (data.trim()) {
          // If JSON, try to parse it
          if (data.trim().startsWith('{')) {
            const jsonData = JSON.parse(data);
            // Extract some values from JSON to use as resource data
            // This is simplified - in a real app you'd extract specific FHIR fields
            const extractedValues = Object.values(jsonData).slice(0, 8);
            resourceData = extractedValues.map((val) => {
              if (typeof val === 'number') return val;
              if (typeof val === 'string') return val.charCodeAt(0);
              return 0;
            });
          } else {
            // Otherwise split by commas and convert to numbers
            resourceData = data
              .split(',')
              .map((item) => parseInt(item.trim(), 10))
              .filter((num) => !isNaN(num));
          }

          // Ensure we have exactly 8 values
          if (resourceData.length > 8) {
            resourceData = resourceData.slice(0, 8);
          } else {
            resourceData = [...resourceData, ...Array(8 - resourceData.length).fill(0)];
          }
        } else {
          // Empty data, use zeros
          resourceData = Array(8).fill(0);
        }

        setProcessedResourceData(resourceData);
        return { resourceData };
      } catch (error) {
        console.error('Error processing FHIR data:', error);
        throw new Error('Failed to process FHIR data');
      }
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      const mode = parseInt(values.verificationMode, 10);
      const resourceType = parseInt(values.resourceType, 10);

      // Get resource data based on mode
      let resourceDataStr = '';
      if (mode === FhirVerificationMode.HASH_VERIFICATION || mode === FhirVerificationMode.COMPLETE) {
        resourceDataStr = values.resourceJson || values.resourceData || '';
      } else {
        resourceDataStr = values.resourceData || '';
      }

      // Process the resource data
      const { resourceData, hash } = await processFhirResourceData(resourceDataStr, values.verificationMode);

      // Prepare expected hash if in hash verification mode
      let expectedHash: [bigint, bigint] | null = null;

      if (mode === FhirVerificationMode.HASH_VERIFICATION || mode === FhirVerificationMode.COMPLETE) {
        if (hash) {
          expectedHash = hash;
        } else if (values.expectedHash) {
          // Use provided hash if available
          const hashBigInt = BigInt(
            values.expectedHash.startsWith('0x') ? values.expectedHash : `0x${values.expectedHash}`
          );
          expectedHash = splitHashForCircuit(hashBigInt);
          setCalculatedHash(poseidonHashToHex(hashBigInt));
          setHashParts(expectedHash);
        } else {
          throw new Error('Expected hash is required for hash verification mode');
        }
      }

      // Prepare circuit input
      const circuitInput = {
        resourceData: resourceData.map((val) => val.toString()),
        resourceType,
        verificationMode: mode,
        expectedHash: expectedHash ? expectedHash.map((part) => part.toString()) : ['0', '0'],
      };

      console.log('Submitting circuit input:', circuitInput);

      // Generate and verify proof
      await generateAndVerifyProof(circuitInput);
    } catch (error) {
      console.error('Error preparing FHIR verification:', error);
      form.setError('resourceData', {
        type: 'manual',
        message: `Error: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  };

  const resetForm = () => {
    // Use setTimeout to break the event loop
    setTimeout(() => {
      form.reset();
      setCalculatedHash(null);
      setHashParts(null);
      setProcessedResourceData(null);
      reset();
    }, 0);
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
        verification: getResultMessage(parseInt(resultCode)),
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

  // Copy proof to clipboard
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

  // Get human-readable result message based on result code
  const getResultMessage = (code: number | null): string => {
    if (code === null) return 'Unknown result';

    switch (code) {
      case FhirVerificationResult.SUCCESS:
        return 'Success: Verification passed';
      case FhirVerificationResult.RESOURCE_TYPE_ERROR:
        return 'Failed: Invalid resource type';
      case FhirVerificationResult.HASH_ERROR:
        return 'Failed: Hash mismatch';
      case FhirVerificationResult.FIELD_ERROR:
        return 'Failed: Field validation error';
      default:
        return `Unknown result code: ${code}`;
    }
  };

  // Generate result display UI based on the verification result
  const getResultDisplay = (resultCode: number | null) => {
    if (resultCode === null) return null;

    // Determine style based on result code
    const isSuccess = resultCode === FhirVerificationResult.SUCCESS;
    const variant = isSuccess ? 'success' : 'destructive';
    const message = getResultMessage(resultCode);

    return (
      <div
        className={`p-3 ${
          isSuccess ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        } rounded-md text-${isSuccess ? 'green-800' : 'red-800'}`}
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
        title="FHIR Verifier"
        description="Verify FHIR resources with zero-knowledge proofs"
        circuitType={CircuitType.FHIR_VERIFIER}
        loading={loading}
        result={
          result
            ? {
                ...result,
                success: resultCode === FhirVerificationResult.SUCCESS,
              }
            : null
        }
        resultCode={resultCode}
        resultMessage={resultMessage}
        error={error}
        onReset={resetForm}
        proof={proof}
        publicSignals={publicSignals as string[]}
        customResultDisplay={getResultDisplay(resultCode)}
        data-testid="fhir-verifier"
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="verificationMode"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Verification Mode</FormLabel>
                  <FormControl>
                    <div className="flex flex-col space-y-2">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          className="h-4 w-4 text-primary border-muted rounded-full focus:ring-primary"
                          checked={field.value === '1'}
                          onChange={() => field.onChange('1')}
                          data-testid="verification-mode-resource-type"
                        />
                        <span className="text-sm font-normal">Resource Type Only</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          className="h-4 w-4 text-primary border-muted rounded-full focus:ring-primary"
                          checked={field.value === '2'}
                          onChange={() => field.onChange('2')}
                          data-testid="verification-mode-field"
                        />
                        <span className="text-sm font-normal">Field Validation</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          className="h-4 w-4 text-primary border-muted rounded-full focus:ring-primary"
                          checked={field.value === '3'}
                          onChange={() => field.onChange('3')}
                          data-testid="verification-mode-hash"
                        />
                        <span className="text-sm font-normal">Hash Verification</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          className="h-4 w-4 text-primary border-muted rounded-full focus:ring-primary"
                          checked={field.value === '4'}
                          onChange={() => field.onChange('4')}
                          data-testid="verification-mode-complete"
                        />
                        <span className="text-sm font-normal">Complete Verification</span>
                      </label>
                    </div>
                  </FormControl>
                  <FormDescription>Select the type of FHIR verification to perform.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="resourceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resource Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="resource-type-select">
                        <SelectValue placeholder="Select resource type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {resourceTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>Select the FHIR resource type to verify.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Resource data input for all modes */}
            <FormField
              control={form.control}
              name="resourceData"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resource Data</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter data values (comma-separated)"
                      {...field}
                      data-testid="resource-data-input"
                    />
                  </FormControl>
                  <FormDescription>
                    Enter up to 8 numeric values separated by commas (e.g., 123,456,789)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {(verificationMode === '3' || verificationMode === '4') && (
              <FormField
                control={form.control}
                name="expectedHash"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Hash</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter expected hash (hex)" {...field} data-testid="expected-hash-input" />
                    </FormControl>
                    <FormDescription>
                      For hash verification mode, enter the expected hash in hexadecimal format
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {processedResourceData && (
              <Card className="space-y-2 p-4 bg-background rounded-md">
                <p className="text-sm font-medium">Processed Resource Data:</p>
                <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                  {JSON.stringify(processedResourceData, null, 2)}
                </pre>
              </Card>
            )}

            {calculatedHash && (
              <Card className="space-y-2 p-4 bg-background rounded-md">
                <p className="text-sm font-medium">Calculated Hash:</p>
                <code className="block text-xs bg-muted p-2 rounded overflow-auto break-all">{calculatedHash}</code>
                {hashParts && (
                  <div className="mt-2">
                    <p className="text-xs font-medium">Hash Parts (For Circuit):</p>
                    <ul className="text-xs bg-muted p-2 rounded overflow-auto">
                      <li>Low: {hashParts[0].toString()}</li>
                      <li>High: {hashParts[1].toString()}</li>
                    </ul>
                  </div>
                )}
              </Card>
            )}

            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={loading} data-testid="verify-button">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">◌</span> Verifying...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Shield className="h-4 w-4" /> Verify FHIR Resource
                  </span>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => loadSampleValues('resourceType')}
                disabled={loading}
                data-testid="load-resourcetype-sample"
              >
                Load Type Verification
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => loadSampleValues('resourceTypeFail')}
                disabled={loading}
                data-testid="load-resourcetype-fail"
              >
                Load Type (Fail)
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => loadSampleValues('hash')}
                disabled={loading}
                data-testid="load-hash-sample"
              >
                Load Hash Verification
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => loadSampleValues('hashFail')}
                disabled={loading}
                data-testid="load-hash-fail"
              >
                Load Hash (Fail)
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => loadSampleValues('fields')}
                disabled={loading}
                data-testid="load-fields-sample"
              >
                Load Fields Verification
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => loadSampleValues('complete')}
                disabled={loading}
                data-testid="load-complete-sample"
              >
                Load Complete Verification
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => loadSampleValues('completeFail')}
                disabled={loading}
                data-testid="load-complete-fail"
              >
                Load Complete (Fail)
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => loadSampleValues('emptyResource')}
                disabled={loading}
                data-testid="load-empty-resource"
              >
                Load Empty Resource
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => loadSampleValues('observation')}
                disabled={loading}
                data-testid="load-observation"
              >
                Load Observation
              </Button>
            </div>
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
                    The cryptographic proof that verifies the FHIR resource without revealing sensitive information.
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">Public Signals: </span>
                    Public values that can be used with the proof to verify your claim. The first signal (
                    {publicSignals?.[0]}) is the result code.
                  </div>
                  <div>
                    The verification can be performed by anyone with access to the public signals and the verification
                    key, while keeping the actual FHIR data private.
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

export default FhirVerifier;

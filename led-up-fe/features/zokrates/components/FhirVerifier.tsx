import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HelpCircle, RefreshCw, FileCheck, Shield } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CircuitType } from '../types';
import { useZoKratesVerification } from '../hooks/useZoKratesVerification';
import ZoKratesCard from './ZoKratesCard';

// Schema for form validation
const formSchema = z.object({
  resourceType: z.string().min(1, { message: 'Resource type is required' }),
  patientId: z.string().min(1, { message: 'Patient ID is required' }),
  dataField: z.string().min(1, { message: 'Data field is required' }),
  dataValue: z.string().min(1, { message: 'Data value is required' }),
  recordHash: z.string().optional(),
  fhirJson: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// Available FHIR resource types for selection
const resourceTypes = [
  'Patient',
  'Observation',
  'Condition',
  'MedicationRequest',
  'Immunization',
  'AllergyIntolerance',
  'DiagnosticReport',
  'Procedure',
];

const FhirVerifier: React.FC = () => {
  const [dataFields, setDataFields] = useState<string[]>([]);
  const [calculatedHash, setCalculatedHash] = useState<string | null>(null);
  const [verificationInfo, setVerificationInfo] = useState<{
    resourceType: string;
    field: string;
    value: string;
    patientId: string;
  } | null>(null);

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
    circuitType: CircuitType.FHIR_VERIFIER,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      resourceType: '',
      patientId: '',
      dataField: '',
      dataValue: '',
      recordHash: '',
      fhirJson: '',
    },
  });

  const resourceType = form.watch('resourceType');

  // Update available data fields based on selected resource type
  React.useEffect(() => {
    if (resourceType) {
      // This would typically come from a schema or API
      // For now, we'll use placeholder fields based on the selected resource type
      let fields: string[] = [];

      switch (resourceType) {
        case 'Patient':
          fields = ['birthDate', 'gender', 'name.given', 'name.family', 'address.city', 'identifier.value'];
          break;
        case 'Observation':
          fields = ['code.coding.code', 'code.coding.display', 'valueQuantity.value', 'valueQuantity.unit', 'status'];
          break;
        case 'Condition':
          fields = ['code.coding.code', 'code.coding.display', 'clinicalStatus', 'verificationStatus', 'onsetDateTime'];
          break;
        case 'MedicationRequest':
          fields = ['medicationCodeableConcept.coding.code', 'dosageInstruction.text', 'status', 'authoredOn'];
          break;
        default:
          fields = ['id', 'status', 'code.coding.code', 'issued'];
      }

      setDataFields(fields);

      // Clear the data field if it doesn't exist in the new list
      const currentField = form.getValues('dataField');
      if (currentField && !fields.includes(currentField)) {
        form.setValue('dataField', '');
      }
    }
  }, [resourceType, form]);

  // Function to compute a placeholder hash of FHIR data
  const computeFhirHash = (resourceType: string, patientId: string, field: string, value: string): string => {
    // In a real implementation, this would use a proper hash function
    // For demonstration, we're using a simplified approach
    const dataString = `${resourceType}|${patientId}|${field}|${value}`;
    const hash = `0x${Array.from(dataString).reduce((a, b) => a + b.charCodeAt(0).toString(16), '')}`.padEnd(66, '0');
    return hash;
  };

  // Function to load sample test values
  const loadSampleValues = () => {
    const sampleResourceType = 'Patient';
    const samplePatientId = 'patient-12345';
    const sampleDataField = 'birthDate';
    const sampleDataValue = '1990-01-01';

    form.setValue('resourceType', sampleResourceType);
    form.setValue('patientId', samplePatientId);
    form.setValue('dataField', sampleDataField);
    form.setValue('dataValue', sampleDataValue);

    // Simulate calculating hash
    const hash = computeFhirHash(sampleResourceType, samplePatientId, sampleDataField, sampleDataValue);
    form.setValue('recordHash', hash);
    setCalculatedHash(hash);

    // Sample FHIR JSON
    const sampleFhirJson = JSON.stringify(
      {
        resourceType: 'Patient',
        id: 'patient-12345',
        meta: {
          versionId: '1',
          lastUpdated: '2023-01-15T12:00:00Z',
        },
        identifier: [
          {
            system: 'http://example.org/fhir/patient-identifier',
            value: 'patient-12345',
          },
        ],
        active: true,
        name: [
          {
            use: 'official',
            family: 'Smith',
            given: ['John', 'Evan'],
          },
        ],
        gender: 'male',
        birthDate: '1990-01-01',
        address: [
          {
            use: 'home',
            line: ['123 Main St'],
            city: 'Anytown',
            state: 'CA',
            postalCode: '12345',
            country: 'USA',
          },
        ],
      },
      null,
      2
    );

    form.setValue('fhirJson', sampleFhirJson);

    // Set verification info for display
    setVerificationInfo({
      resourceType: sampleResourceType,
      field: sampleDataField,
      value: sampleDataValue,
      patientId: samplePatientId,
    });
  };

  const onSubmit = async (values: FormValues) => {
    try {
      // Calculate hash from inputs if not already provided
      const hash =
        values.recordHash || computeFhirHash(values.resourceType, values.patientId, values.dataField, values.dataValue);

      setCalculatedHash(hash);

      // Store verification info for display
      setVerificationInfo({
        resourceType: values.resourceType,
        field: values.dataField,
        value: values.dataValue,
        patientId: values.patientId,
      });

      // In a real implementation, we would validate that the provided hash matches
      // a hash calculated from the actual FHIR record

      // Prepare circuit input - hash needs to be split into two parts for ZoKrates
      const hashBigInt = BigInt(hash);
      const hashPart1 = (hashBigInt & ((BigInt(1) << BigInt(128)) - BigInt(1))).toString();
      const hashPart2 = (hashBigInt >> BigInt(128)).toString();

      // Convert string values to numeric representation for the circuit
      // In a real implementation, this would be more sophisticated
      const fieldAsNumber = values.dataField.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const valueAsNumber = values.dataValue.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

      // Prepare circuit input
      const circuitInput = {
        patientId: values.patientId
          .split('')
          .reduce((acc, char) => acc + char.charCodeAt(0), 0)
          .toString(),
        resourceType: values.resourceType
          .split('')
          .reduce((acc, char) => acc + char.charCodeAt(0), 0)
          .toString(),
        dataField: fieldAsNumber.toString(),
        dataValue: valueAsNumber.toString(),
        recordHash: [hashPart1, hashPart2],
      };

      // Generate and verify proof
      await generateAndVerifyProof(circuitInput);
    } catch (error) {
      console.error('Error preparing FHIR verification:', error);
      form.setError('recordHash', {
        type: 'manual',
        message: `Error: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  };

  const resetForm = () => {
    form.reset();
    setCalculatedHash(null);
    setVerificationInfo(null);
    reset();
  };

  return (
    <ZoKratesCard
      title="FHIR Data Verifier"
      description="Verify healthcare data integrity with zero-knowledge proofs for FHIR resources"
      circuitType={CircuitType.FHIR_VERIFIER}
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
          <div className="space-y-4 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <FileCheck className="h-5 w-5 text-teal-500 mr-2" />
              <h3 className="font-medium">FHIR Resource Information</h3>
            </div>

            {/* Resource Type Selection */}
            <FormField
              control={form.control}
              name="resourceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>FHIR Resource Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="border-teal-200 dark:border-teal-800 focus:border-teal-500">
                        <SelectValue placeholder="Select resource type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {resourceTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>Select the FHIR resource type you want to verify</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Patient ID Field */}
            <FormField
              control={form.control}
              name="patientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Patient ID</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter patient ID"
                      {...field}
                      className="border-teal-200 dark:border-teal-800 focus:border-teal-500"
                    />
                  </FormControl>
                  <FormDescription>The unique identifier for the patient</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Data Field Selection */}
            <FormField
              control={form.control}
              name="dataField"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center space-x-2">
                    <FormLabel>FHIR Data Field</FormLabel>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-5 w-5 text-gray-500">
                            <HelpCircle className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-sm">
                          <p>Select the FHIR field path you want to verify (e.g., birthDate, gender, etc.)</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                    disabled={!resourceType}
                  >
                    <FormControl>
                      <SelectTrigger className="border-teal-200 dark:border-teal-800 focus:border-teal-500">
                        <SelectValue placeholder="Select data field" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {dataFields.map((fieldName) => (
                        <SelectItem key={fieldName} value={fieldName}>
                          {fieldName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>The specific data field from the FHIR resource to verify</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Data Value Field */}
            <FormField
              control={form.control}
              name="dataValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data Value</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter the expected value"
                      {...field}
                      className="border-teal-200 dark:border-teal-800 focus:border-teal-500"
                    />
                  </FormControl>
                  <FormDescription>The value that should be present in the specified field</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Record Hash Field */}
            <FormField
              control={form.control}
              name="recordHash"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Record Hash (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter record hash (hex)"
                      {...field}
                      className="font-mono border-cyan-200 dark:border-cyan-800"
                    />
                  </FormControl>
                  <FormDescription>
                    Optional: Provide the hash of the FHIR record, or leave empty to calculate it
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* FHIR JSON Textarea */}
          <FormField
            control={form.control}
            name="fhirJson"
            render={({ field }) => (
              <FormItem>
                <FormLabel>FHIR Resource JSON (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Paste the FHIR resource JSON here"
                    {...field}
                    className="font-mono text-xs h-32 border-gray-300 dark:border-gray-700"
                  />
                </FormControl>
                <FormDescription>Optional: You can paste the full FHIR resource JSON for reference</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Verification Information Display */}
          {calculatedHash && verificationInfo && (
            <Card className="p-4 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
              <div className="flex items-center mb-2">
                <Shield className="h-5 w-5 text-cyan-500 mr-2" />
                <p className="text-sm font-medium">Verification Information</p>
              </div>

              <div className="space-y-2 mt-3">
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant="outline"
                    className="bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800"
                  >
                    {verificationInfo.resourceType}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800"
                  >
                    Patient: {verificationInfo.patientId}
                  </Badge>
                </div>

                <div className="text-sm">
                  <span className="font-semibold">Verifying: </span>
                  <span className="font-mono text-cyan-700 dark:text-cyan-300">{verificationInfo.field}</span>
                  <span> = </span>
                  <span className="font-mono text-teal-700 dark:text-teal-300">{verificationInfo.value}</span>
                </div>

                <div className="mt-2">
                  <p className="text-xs font-medium mb-1">Record Hash:</p>
                  <code className="block text-xs bg-slate-100 dark:bg-slate-800 p-2 rounded-md overflow-auto break-all font-mono">
                    {calculatedHash}
                  </code>
                </div>
              </div>
            </Card>
          )}

          <div className="flex space-x-4">
            <Button
              type="submit"
              disabled={loading || !circuitReady}
              className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700"
            >
              {loading ? 'Verifying...' : 'Verify FHIR Data'}
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

export default FhirVerifier;

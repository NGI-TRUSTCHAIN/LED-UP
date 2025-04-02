'use client';

import { useState, useEffect } from 'react';
import { useFormState } from 'react-dom';
import { registerProducerRecord } from '../actions';
import { ConsentStatus } from '../types';
import { getConsentLabel } from '../helpers/status-labels';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/features/auth/contexts/auth-provider';

// Shadcn UI components
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Define the form schema with Zod - simplified to remove fields that will be auto-populated
const formSchema = z.object({
  consent: z.string(),
  resourceType: z.string().min(1, 'Resource type is required'),
  recordId: z.string().min(3, 'Record ID must be at least 3 characters long'),
  additionalData: z.string().optional(),
});

// Define the type for the form state
interface FormState {
  success: boolean;
  data: any;
  error: string | null;
  message: string | null;
}

// Define the type for optimistic records
interface OptimisticRecord {
  id: string;
  resourceType: string;
  status: string;
  timestamp: string;
}

// Initial state for the form
const initialState: FormState = {
  success: false,
  data: null,
  error: null,
  message: null,
};

export default function RegisterProducerForm() {
  const { isAuthenticated, did, address } = useAuth();
  // Optimistic state for showing pending records
  const [optimisticRecords, setOptimisticRecords] = useState<OptimisticRecord[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Setup React Hook Form with Zod validation
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      consent: ConsentStatus.Pending.toString(),
      resourceType: 'HealthRecord',
      recordId: '',
      additionalData: '',
    },
  });

  // Use form state for server action with proper typing
  const [state, formAction] = useFormState<FormState, FormData>(async (prevState, formData) => {
    // Create optimistic record before actual submission
    const recordId = formData.get('recordId') as string;
    const resourceType = formData.get('resourceType') as string;

    // Add optimistic record
    setOptimisticRecords((prev) => [
      ...prev,
      {
        id: recordId,
        resourceType,
        status: 'Pending',
        timestamp: new Date().toISOString(),
      },
    ]);

    // Call the actual server action
    return await registerProducerRecord(prevState, formData);
  }, initialState);

  // Show toast notifications for form submission results
  useEffect(() => {
    if (state.success) {
      toast.success('Producer record registered successfully!');
      form.reset(); // Reset the form on success
      setOptimisticRecords([]); // Clear optimistic records
      setIsSubmitting(false);
    } else if (state.error) {
      toast.error(state.message || 'Failed to register producer record');
      setIsSubmitting(false);
    }
  }, [state, form]);

  // Generate a unique record ID
  const generateRecordId = () => {
    const prefix = 'record';
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7);
    form.setValue('recordId', `${prefix}-${timestamp}-${random}`);
  };

  // Generate the data JSON for the form submission
  const getDataJson = () => {
    const values = form.getValues();
    return JSON.stringify({
      id: values.recordId,
      resourceType: values.resourceType,
      timestamp: new Date().toISOString(),
      additionalData: values.additionalData,
    });
  };

  // Handle form submission
  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (!isAuthenticated || !did || !address) {
      toast.error('You must be authenticated with a DID to register a producer');
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();

    // Add the authenticated user's DID and address
    formData.append('ownerDid', did);
    formData.append('producer', address);

    // Add form data
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });

    // Add the data JSON
    formData.append('dataJson', getDataJson());

    // Submit the form using the formAction
    formAction(formData);
  };

  // If not authenticated, show a message
  if (!isAuthenticated) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Authentication Required</AlertTitle>
        <AlertDescription>
          Please authenticate with your DID in Step 1 before registering as a producer.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Display authenticated user info */}
      <div className="bg-muted p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium">Your DID</p>
            <p className="text-xs font-mono break-all">{did}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Your Wallet Address</p>
            <p className="text-xs font-mono break-all">{address}</p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="consent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Consent Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select consent status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(ConsentStatus)
                        .filter(([key]) => isNaN(Number(key)))
                        .map(([_, value]) => (
                          <SelectItem key={value} value={value.toString()}>
                            {getConsentLabel(value as ConsentStatus)}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>The consent status for this record</FormDescription>
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select resource type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="HealthRecord">Health Record</SelectItem>
                      <SelectItem value="MedicalReport">Medical Report</SelectItem>
                      <SelectItem value="Prescription">Prescription</SelectItem>
                      <SelectItem value="LabResult">Lab Result</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>The type of resource being registered</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="recordId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Record ID</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <input
                        type="text"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="record-123"
                        {...field}
                      />
                    </FormControl>
                    <Button type="button" variant="outline" onClick={generateRecordId}>
                      Generate
                    </Button>
                  </div>
                  <FormDescription>A unique identifier for this record</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="additionalData"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Data (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter any additional data in JSON format"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Additional metadata for this record (JSON format)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registering...
              </>
            ) : (
              'Register Producer'
            )}
          </Button>
        </form>
      </Form>

      {/* Display optimistic records */}
      {optimisticRecords.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium mb-2">Pending Records</h3>
          <div className="space-y-2">
            {optimisticRecords.map((record) => (
              <div key={record.id} className="p-3 border rounded-md bg-muted/50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium">{record.resourceType}</p>
                    <p className="text-xs text-muted-foreground">{record.id}</p>
                  </div>
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                    {record.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Display success message */}
      {state.success && (
        <Alert className="mt-6 bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Registration Successful</AlertTitle>
          <AlertDescription className="text-green-700">
            Your producer record has been successfully registered on the blockchain.
          </AlertDescription>
        </Alert>
      )}

      {/* Display error message */}
      {state.error && (
        <Alert variant="destructive" className="mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Registration Failed</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

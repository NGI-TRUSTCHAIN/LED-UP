'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  MedicationRequestSchema,
  type MedicationRequest,
} from '@/features/data-registry/types/fhir/medication-request';
import { useState } from 'react';
import { MinusCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const MEDICATION_REQUEST_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'on-hold', label: 'On Hold' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'completed', label: 'Completed' },
  { value: 'entered-in-error', label: 'Entered in Error' },
  { value: 'stopped', label: 'Stopped' },
  { value: 'draft', label: 'Draft' },
  { value: 'unknown', label: 'Unknown' },
];

const MEDICATION_REQUEST_INTENTS = [
  { value: 'proposal', label: 'Proposal' },
  { value: 'plan', label: 'Plan' },
  { value: 'order', label: 'Order' },
  { value: 'original-order', label: 'Original Order' },
  { value: 'reflex-order', label: 'Reflex Order' },
  { value: 'filler-order', label: 'Filler Order' },
  { value: 'instance-order', label: 'Instance Order' },
  { value: 'option', label: 'Option' },
];

export function MedicationRequestForm({
  onSubmit,
  initialData,
  patientReference,
}: {
  onSubmit: (data: MedicationRequest) => void;
  initialData?: Partial<MedicationRequest>;
  patientReference: string;
}) {
  const [reasonCodes, setReasonCodes] = useState([{ id: 0 }]);
  const [dosageInstructions, setDosageInstructions] = useState([{ id: 0 }]);

  const form = useForm<MedicationRequest>({
    resolver: zodResolver(MedicationRequestSchema),
    defaultValues: {
      resourceType: 'MedicationRequest',
      status: 'active',
      intent: 'order',
      subject: { reference: patientReference },
      authoredOn: new Date().toISOString(),
      ...initialData,
    },
  });

  const addField = (
    fieldType: 'reasonCode' | 'dosageInstruction',
    setterFunction: React.Dispatch<React.SetStateAction<{ id: number }[]>>
  ) => {
    setterFunction((prev) => [...prev, { id: Math.max(...prev.map((f) => f.id)) + 1 }]);
  };

  const removeField = (
    fieldType: 'reasonCode' | 'dosageInstruction',
    id: number,
    setterFunction: React.Dispatch<React.SetStateAction<{ id: number }[]>>
  ) => {
    setterFunction((prev) => prev.filter((field) => field.id !== id));
  };

  return (
    <div className="w-full rounded-md mb-5">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-3xl mx-auto bg-background border p-3">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-6">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MEDICATION_REQUEST_STATUSES.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Current status of the medication request</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-6">
              <FormField
                control={form.control}
                name="intent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Intent</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select intent" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MEDICATION_REQUEST_INTENTS.map((intent) => (
                          <SelectItem key={intent.value} value={intent.value}>
                            {intent.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>The intent of the medication request</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-6">
              <FormField
                control={form.control}
                name="medicationCodeableConcept.coding.0.code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medication Code</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter medication code" />
                    </FormControl>
                    <FormDescription>Enter the standardized code (e.g., RxNorm, SNOMED CT)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-6">
              <FormField
                control={form.control}
                name="medicationCodeableConcept.coding.0.display"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medication Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter medication name" />
                    </FormControl>
                    <FormDescription>The name of the medication being requested</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-6">
              <FormField
                control={form.control}
                name="authoredOn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Authored Date</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormDescription>When the request was initially authored</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Reasons</h3>
              <Button type="button" variant="outline" size="sm" onClick={() => addField('reasonCode', setReasonCodes)}>
                Add Reason
              </Button>
            </div>

            {reasonCodes.map((reason, index) => (
              <div key={reason.id} className="grid grid-cols-12 gap-4 relative">
                {reasonCodes.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => removeField('reasonCode', reason.id, setReasonCodes)}
                  >
                    <MinusCircle className="h-4 w-4" />
                  </Button>
                )}
                <div className="col-span-6">
                  <FormField
                    control={form.control}
                    name={`reasonCode.${index}.coding.0.code`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reason Code</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter reason code" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="col-span-6">
                  <FormField
                    control={form.control}
                    name={`reasonCode.${index}.coding.0.display`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reason Description</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter reason description" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Dosage Instructions</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addField('dosageInstruction', setDosageInstructions)}
              >
                Add Dosage Instruction
              </Button>
            </div>

            {dosageInstructions.map((instruction, index) => (
              <div key={instruction.id} className="grid grid-cols-12 gap-4 relative">
                {dosageInstructions.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => removeField('dosageInstruction', instruction.id, setDosageInstructions)}
                  >
                    <MinusCircle className="h-4 w-4" />
                  </Button>
                )}
                <div className="col-span-12">
                  <FormField
                    control={form.control}
                    name={`dosageInstruction.${index}.text`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dosage Instructions</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Enter dosage instructions" />
                        </FormControl>
                        <FormDescription>Free text dosage instructions</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))}
          </div>

          <FormField
            control={form.control}
            name="note.0.text"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Enter additional notes"
                    value={field.value as string}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                    }}
                  />
                </FormControl>
                <FormDescription>Additional information about the medication request</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full">
            Save Medication Request
          </Button>
        </form>
      </Form>
    </div>
  );
}

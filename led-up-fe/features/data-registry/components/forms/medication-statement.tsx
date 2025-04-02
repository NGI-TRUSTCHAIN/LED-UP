'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  MedicationStatement,
  MedicationStatementSchema,
} from '@/features/data-registry/types/fhir/medication-statement';
import { useState } from 'react';
import { MinusCircle, PlusCircle } from 'lucide-react';
import { SmartDatetimeInput } from '@/components/ui/custom/smart-date-input';

const MEDICATION_STATEMENT_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'entered-in-error', label: 'Entered in Error' },
  { value: 'intended', label: 'Intended' },
  { value: 'stopped', label: 'Stopped' },
  { value: 'on-hold', label: 'On Hold' },
  { value: 'unknown', label: 'Unknown' },
  { value: 'not-taken', label: 'Not Taken' },
];

export function MedicationStatementForm({
  onSubmit,
  initialData,
  patientReference,
}: {
  onSubmit: (data: MedicationStatement) => void;
  initialData?: Partial<MedicationStatement>;
  patientReference: string;
}) {
  const form = useForm<z.infer<typeof MedicationStatementSchema>>({
    resolver: zodResolver(MedicationStatementSchema),
    defaultValues: {
      resourceType: 'MedicationStatement',
      subject: { reference: patientReference },
      status: 'active',
      medicationCodeableConcept: {
        coding: [{ system: 'http://www.nlm.nih.gov/research/umls/rxnorm', code: '', display: '' }],
      },
      note: [{ text: '' }],
      ...initialData,
    },
  });

  const [reasonCodes, setReasonCodes] = useState([{ id: 0 }]);
  const [dosages, setDosages] = useState([{ id: 0 }]);

  const addField = (
    fieldType: 'reasonCode' | 'dosage',
    setterFunction: React.Dispatch<React.SetStateAction<{ id: number }[]>>
  ) => {
    setterFunction((prev) => [...prev, { id: Math.max(...prev.map((f) => f.id)) + 1 }]);
  };

  const removeField = (
    fieldType: 'reasonCode' | 'dosage',
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
                        {MEDICATION_STATEMENT_STATUSES.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Select the status of the medication statement.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-6">
              <FormField
                control={form.control}
                name="category.coding.0.code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter category code" />
                    </FormControl>
                    <FormDescription>Enter the category of medication (e.g., inpatient, outpatient)</FormDescription>
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
                    <FormDescription>Enter the name of the medication</FormDescription>
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
                name="effectiveDateTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Effective Date</FormLabel>
                    <FormControl>
                      <SmartDatetimeInput
                        value={field.value ? new Date(field.value) : null}
                        onValueChange={(date) => {
                          field.onChange(date ? date.toISOString() : undefined);
                        }}
                        placeholder="e.g. Tomorrow morning 9am"
                      />
                    </FormControl>
                    <FormDescription>When the medication was/is being taken</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-6">
              <FormField
                control={form.control}
                name="dateAsserted"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date Asserted</FormLabel>
                    <FormControl>
                      <SmartDatetimeInput
                        value={field.value ? new Date(field.value) : null}
                        onValueChange={(date) => {
                          field.onChange(date ? date.toISOString() : undefined);
                        }}
                        placeholder="e.g. Today at 2pm"
                      />
                    </FormControl>
                    <FormDescription>When this statement was recorded</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12">
              <FormField
                control={form.control}
                name="informationSource.reference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Information Source</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter information source reference" />
                    </FormControl>
                    <FormDescription>Reference to the source of information about the medication</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Reason Codes */}
          <div className="space-y-4">
            <div className="flex flex-row items-center justify-between">
              <h3 className="text-lg font-medium">Reasons</h3>
              <Button type="button" variant="outline" size="sm" onClick={() => addField('reasonCode', setReasonCodes)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Reason
              </Button>
            </div>

            {reasonCodes.map((reason, index) => (
              <div key={reason.id} className="space-y-4 border p-4 rounded-lg relative">
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
                <div className="grid grid-cols-12 gap-4">
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
              </div>
            ))}
          </div>

          {/* Dosages */}
          <div className="space-y-4">
            <div className="flex flex-row items-center justify-between">
              <h3 className="text-lg font-medium">Dosages</h3>
              <Button type="button" variant="outline" size="sm" onClick={() => addField('dosage', setDosages)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Dosage
              </Button>
            </div>

            {dosages.map((dosage, index) => (
              <div key={dosage.id} className="space-y-4 border p-4 rounded-lg relative">
                {dosages.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => removeField('dosage', dosage.id, setDosages)}
                  >
                    <MinusCircle className="h-4 w-4" />
                  </Button>
                )}
                <FormField
                  control={form.control}
                  name={`dosage.${index}.text`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dosage Instructions</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter dosage instructions"
                          className="min-h-[100px]"
                          {...field}
                          value={field.value as string}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}
          </div>

          {/* Notes */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Additional Notes</h3>
            <FormField
              control={form.control}
              name="note.0.text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Clinical Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter any additional notes"
                      className="min-h-[100px]"
                      {...field}
                      value={field.value as string}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit">Save Medication Statement</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { SmartDatetimeInput } from '@/components/ui/custom/smart-date-input';
import { Textarea } from '@/components/ui/textarea';
import { Condition, ConditionSchema } from '@/features/data-registry/types/fhir/condition';
import { useState } from 'react';
import { MinusCircle } from 'lucide-react';

const CLINICAL_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'recurrence', label: 'Recurrence' },
  { value: 'relapse', label: 'Relapse' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'remission', label: 'Remission' },
  { value: 'resolved', label: 'Resolved' },
];

const VERIFICATION_STATUSES = [
  { value: 'unconfirmed', label: 'Unconfirmed' },
  { value: 'provisional', label: 'Provisional' },
  { value: 'differential', label: 'Differential' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'refuted', label: 'Refuted' },
  { value: 'entered-in-error', label: 'Entered in Error' },
];

export function Condition2Form({
  onSubmit,
  initialData,
  patientReference,
}: {
  onSubmit: (data: Condition) => void;
  initialData?: Partial<Condition>;
  patientReference: string;
}) {
  const form = useForm<z.infer<typeof ConditionSchema>>({
    resolver: zodResolver(ConditionSchema),
    defaultValues: {
      resourceType: 'Condition',
      subject: { reference: patientReference },
      clinicalStatus: {
        coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-clinical', code: 'active' }],
      },
      verificationStatus: {
        coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status', code: 'confirmed' }],
      },
      ...initialData,
    },
  });

  const [categoryFields, setCategoryFields] = useState([{ id: 0 }]);
  const [bodySiteFields, setBodySiteFields] = useState([{ id: 0 }]);
  // function onSubmit(values: z.infer<typeof ConditionSchema>) {
  //   try {
  //     console.log(values);
  //     toast(
  //       <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
  //         <code className="text-white">{JSON.stringify(values, null, 2)}</code>
  //       </pre>
  //     );
  //   } catch (error) {
  //     console.error('Form submission error', error);
  //     toast.error('Failed to submit the form. Please try again.');
  //   }
  // }

  const addField = (
    fieldType: 'category' | 'bodySite',
    setterFunction: React.Dispatch<React.SetStateAction<{ id: number }[]>>
  ) => {
    setterFunction((prev) => [...prev, { id: Math.max(...prev.map((f) => f.id)) + 1 }]);
  };

  const removeField = (
    fieldType: 'category' | 'bodySite',
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
                name="clinicalStatus.coding.0.code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Clinical Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select clinical status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CLINICAL_STATUSES.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Select the clinical status of the condition.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-6">
              <FormField
                control={form.control}
                name="verificationStatus.coding.0.code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verification Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select verification status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {VERIFICATION_STATUSES.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Select the verification status of the condition.</FormDescription>
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
                name="code.coding.0.code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Condition Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter condition code" type="" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter the standardized code for this condition (e.g., ICD-10 or SNOMED CT)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-6">
              <FormField
                control={form.control}
                name="code.coding.0.display"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Condition Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter condition name" type="" {...field} />
                    </FormControl>
                    <FormDescription>Enter the name of the condition.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <FormField
            control={form.control}
            name="severity.coding.0.code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Severity</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="mild">Mild</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="severe">Severe</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>Select the severity of the condition.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="relative">
            {bodySiteFields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-12 gap-4">
                {bodySiteFields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => removeField('bodySite', field.id, setBodySiteFields)}
                  >
                    <MinusCircle className="h-4 w-4" />
                  </Button>
                )}
                <div className="col-span-6">
                  <FormField
                    control={form.control}
                    name={`bodySite.${index}.coding.0.code`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Body Site Code</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter body site code" />
                        </FormControl>
                        <FormDescription>
                          Enter the standardized code for the body site (e.g., ICD-10 or SNOMED CT)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-6">
                  <FormField
                    control={form.control}
                    name={`bodySite.${index}.coding.0.display`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Body Site Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter body site name" type="" {...field} />
                        </FormControl>
                        <FormDescription>Enter the name of the body site.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-6">
              <FormField
                control={form.control}
                name={`onsetDateTime`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Onset Date</FormLabel>
                    <FormControl>
                      <SmartDatetimeInput
                        value={field.value ? new Date(field.value) : null}
                        onValueChange={(date) => {
                          field.onChange(date ? date.toISOString() : new Date().toISOString());
                        }}
                        placeholder="e.g. Tomorrow morning 9am"
                      />
                    </FormControl>
                    <FormDescription>Enter the date and time of the onset of the condition.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-6">
              <FormField
                control={form.control}
                name={`abatementDateTime`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Abatement Date</FormLabel>
                    <FormControl>
                      <SmartDatetimeInput
                        value={field.value ? new Date(field.value) : null}
                        onValueChange={(date) => {
                          field.onChange(date ? date.toISOString() : new Date().toISOString());
                        }}
                        placeholder="e.g. Tomorrow morning 9am"
                      />
                    </FormControl>
                    <FormDescription>Enter the date and time of the abatement of the condition.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <FormField
            control={form.control}
            name={`recordedDate`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Recorded Date</FormLabel>
                <FormControl>
                  <SmartDatetimeInput
                    value={field.value ? new Date(field.value) : null}
                    onValueChange={(date) => {
                      field.onChange(date ? date.toISOString() : new Date().toISOString());
                    }}
                    placeholder="e.g. Tomorrow morning 9am"
                  />
                </FormControl>
                <FormDescription>Enter the date and time of the recording of the condition.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`note.0.text`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Clinical Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter clinical notes"
                    className="resize-none"
                    {...field}
                    value={field.value as string}
                  />
                </FormControl>
                <FormDescription>Enter any additional notes about the condition.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </div>
  );
}

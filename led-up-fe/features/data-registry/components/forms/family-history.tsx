'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  FamilyMemberHistorySchema,
  type FamilyMemberHistory,
} from '@/features/data-registry/types/fhir/family-history';
import { useState } from 'react';
import { MinusCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { SmartDatetimeInput } from '@/components/ui/custom/smart-date-input';

const FAMILY_HISTORY_STATUSES = [
  { value: 'partial', label: 'Partial' },
  { value: 'completed', label: 'Completed' },
  { value: 'entered-in-error', label: 'Entered in Error' },
  { value: 'health-unknown', label: 'Health Unknown' },
];

const RELATIONSHIP_TYPES = [
  { value: 'FTH', label: 'Father' },
  { value: 'MTH', label: 'Mother' },
  { value: 'GRMTH', label: 'Grandmother' },
  { value: 'GRFTH', label: 'Grandfather' },
  { value: 'SIB', label: 'Sibling' },
  { value: 'CHILD', label: 'Child' },
  { value: 'AUNT', label: 'Aunt' },
  { value: 'UNCLE', label: 'Uncle' },
  { value: 'COUSN', label: 'Cousin' },
];

const SEX_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'unknown', label: 'Unknown' },
];

export function FamilyHistoryForm({
  onSubmit,
  initialData,
  patientReference,
}: {
  onSubmit: (data: FamilyMemberHistory) => void;
  initialData?: Partial<FamilyMemberHistory>;
  patientReference: string;
}) {
  const [conditions, setConditions] = useState([{ id: 0 }]);

  const form = useForm<FamilyMemberHistory>({
    resolver: zodResolver(FamilyMemberHistorySchema),
    defaultValues: {
      resourceType: 'FamilyMemberHistory',
      status: 'completed',
      subject: { reference: patientReference },
      date: new Date().toISOString(),
      relationship: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/v3-RoleCode',
            code: 'FTH',
          },
        ],
      },
      sex: {
        coding: [
          {
            system: 'http://hl7.org/fhir/administrative-gender',
            code: 'male',
          },
        ],
      },
      condition: [
        {
          code: {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '',
              },
            ],
          },
        },
      ],
      ...initialData,
    },
  });

  const addCondition = () => {
    setConditions((prev) => [...prev, { id: Math.max(...prev.map((f) => f.id)) + 1 }]);
  };

  const removeCondition = (id: number) => {
    setConditions((prev) => prev.filter((condition) => condition.id !== id));
  };

  return (
    <div className="w-full rounded-md mb-5">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-3xl mx-auto bg-background border p-3">
          <h3 className="text-lg font-medium">Basic Information</h3>
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
                        {FAMILY_HISTORY_STATUSES.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Current status of the family history record</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-6">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Record Date</FormLabel>
                    <FormControl>
                      <SmartDatetimeInput
                        value={field.value ? new Date(field.value) : null}
                        onValueChange={(date) => {
                          field.onChange(date ? date.toISOString() : new Date().toISOString());
                        }}
                        placeholder="e.g. Today"
                      />
                    </FormControl>
                    <FormDescription>When this family history was recorded</FormDescription>
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
                name="relationship.coding.0.code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relationship</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select relationship" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {RELATIONSHIP_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Relationship to the patient</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-6">
              <FormField
                control={form.control}
                name="sex.coding.0.code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sex</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select sex" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SEX_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Sex of the family member</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Conditions</h3>
              <Button type="button" variant="outline" size="sm" onClick={addCondition}>
                Add Condition
              </Button>
            </div>

            {conditions.map((condition, index) => (
              <div key={condition.id} className="space-y-4 border p-4 rounded-lg">
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-6">
                    <FormField
                      control={form.control}
                      name={`condition.${index}.code.coding.0.code`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Condition Code</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter condition code" />
                          </FormControl>
                          <FormDescription>Enter the standardized code (e.g., SNOMED CT, ICD-10)</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-6">
                    <FormField
                      control={form.control}
                      name={`condition.${index}.code.coding.0.display`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Condition Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter condition name" />
                          </FormControl>
                          <FormDescription>Name or description of the condition</FormDescription>
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
                      name={`condition.${index}.outcome.coding.0.code`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Outcome Code</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter outcome code" />
                          </FormControl>
                          <FormDescription>Code representing the outcome of the condition</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-6">
                    <FormField
                      control={form.control}
                      name={`condition.${index}.outcome.coding.0.display`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Outcome Description</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter outcome description" />
                          </FormControl>
                          <FormDescription>Description of the condition outcome</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name={`condition.${index}.onsetString`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Onset</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter onset information" />
                      </FormControl>
                      <FormDescription>
                        Describe when the condition started (e.g., "In early 40s", "During childhood")
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`condition.${index}.note`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter condition details"
                          className="min-h-[100px]"
                          {...field}
                          value={(field.value?.[0]?.text || '') as string}
                        />
                      </FormControl>
                      <FormDescription>Additional information about this condition</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {conditions.length > 1 && (
                  <div className="flex justify-end">
                    <Button type="button" variant="outline" size="sm" onClick={() => removeCondition(condition.id)}>
                      <MinusCircle className="h-4 w-4 mr-2" />
                      Remove Condition
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

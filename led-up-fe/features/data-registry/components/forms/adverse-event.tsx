'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdverseEventSchema, type AdverseEvent } from '@/features/data-registry/types/fhir/adverse-event';
import { useState } from 'react';
import { MinusCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SmartDatetimeInput } from '@/components/ui/custom/smart-date-input';

const EVENT_STATUSES = [
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'entered-in-error', label: 'Entered in Error' },
  { value: 'unknown', label: 'Unknown' },
];

const EVENT_ACTUALITIES = [
  { value: 'actual', label: 'Actual' },
  { value: 'potential', label: 'Potential' },
];

const SEVERITY_OPTIONS = [
  {
    value: 'mild',
    label: 'Mild',
    code: 'mild',
    system: 'http://terminology.hl7.org/CodeSystem/adverse-event-severity',
  },
  {
    value: 'moderate',
    label: 'Moderate',
    code: 'moderate',
    system: 'http://terminology.hl7.org/CodeSystem/adverse-event-severity',
  },
  {
    value: 'severe',
    label: 'Severe',
    code: 'severe',
    system: 'http://terminology.hl7.org/CodeSystem/adverse-event-severity',
  },
];

export function AdverseEventForm({
  onSubmit,
  initialData,
  patientReference,
}: {
  onSubmit: (data: AdverseEvent) => void;
  initialData?: Partial<AdverseEvent>;
  patientReference: string;
}) {
  const [suspectEntities, setSuspectEntities] = useState([{ id: 0 }]);
  const [categories, setCategories] = useState([{ id: 0 }]);

  const form = useForm<AdverseEvent>({
    resolver: zodResolver(AdverseEventSchema),
    defaultValues: {
      resourceType: 'AdverseEvent',
      id: crypto.randomUUID(),
      status: 'in-progress',
      actuality: 'actual',
      subject: { reference: patientReference },
      event: { coding: [{ code: '', system: 'http://snomed.info/sct' }] },
      severity: {
        coding: [{ code: 'moderate', system: 'http://terminology.hl7.org/CodeSystem/adverse-event-severity' }],
      },
      category: [{ coding: [{ code: '', system: 'http://terminology.hl7.org/CodeSystem/adverse-event-category' }] }],
      suspectEntity: [{ instance: { reference: '', display: '' } }],
      ...initialData,
    },
  });

  const addField = (
    fieldType: 'suspectEntity' | 'category',
    setterFunction: React.Dispatch<React.SetStateAction<{ id: number }[]>>
  ) => {
    setterFunction((prev) => [...prev, { id: Math.max(...prev.map((f) => f.id)) + 1 }]);
  };

  const removeField = (
    fieldType: 'suspectEntity' | 'category',
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
                        {EVENT_STATUSES.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Select the status of the adverse event</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-6">
              <FormField
                control={form.control}
                name="actuality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Actuality</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select actuality" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {EVENT_ACTUALITIES.map((actuality) => (
                          <SelectItem key={actuality.value} value={actuality.value}>
                            {actuality.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Indicate whether the event actually happened or was a potential issue
                    </FormDescription>
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
                name="event.coding.0.code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter event code" {...field} />
                    </FormControl>
                    <FormDescription>Enter the standardized code for this adverse event</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-6">
              <FormField
                control={form.control}
                name="event.coding.0.display"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter event name" {...field} />
                    </FormControl>
                    <FormDescription>Enter the name of the adverse event</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Date</FormLabel>
                <FormControl>
                  <SmartDatetimeInput
                    value={field.value ? new Date(field.value) : null}
                    onValueChange={(date) => {
                      field.onChange(date ? date.toISOString() : new Date().toISOString());
                    }}
                    placeholder="e.g. Yesterday at 2pm"
                  />
                </FormControl>
                <FormDescription>Enter the date and time when the adverse event occurred</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="severity.coding.0.code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Severity</FormLabel>
                <Select
                  onValueChange={(value) => {
                    const selectedOption = SEVERITY_OPTIONS.find((option) => option.value === value);
                    if (selectedOption) {
                      form.setValue('severity.coding.0', {
                        code: selectedOption.code,
                        system: selectedOption.system,
                        display: selectedOption.label,
                      });
                    }
                    field.onChange(value);
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {SEVERITY_OPTIONS.map((severity) => (
                      <SelectItem key={severity.value} value={severity.value}>
                        {severity.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>Select the severity of the adverse event</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Categories</h3>
              <Button type="button" variant="outline" size="sm" onClick={() => addField('category', setCategories)}>
                Add Category
              </Button>
            </div>

            {categories.map((field, index) => (
              <div key={field.id} className="flex items-end gap-4">
                <div className="flex-1">
                  <FormField
                    control={form.control}
                    name={`category.${index}.coding.0.code`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category Code</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter category code" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex-1">
                  <FormField
                    control={form.control}
                    name={`category.${index}.coding.0.display`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter category name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {categories.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeField('category', field.id, setCategories)}
                  >
                    <MinusCircle className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Suspect Entities</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addField('suspectEntity', setSuspectEntities)}
              >
                Add Suspect Entity
              </Button>
            </div>

            {suspectEntities.map((field, index) => (
              <div key={field.id} className="flex items-end gap-4">
                <div className="flex-1">
                  <FormField
                    control={form.control}
                    name={`suspectEntity.${index}.instance.reference`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Entity Reference</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter entity reference" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex-1">
                  <FormField
                    control={form.control}
                    name={`suspectEntity.${index}.instance.display`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Entity Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter entity name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {suspectEntities.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeField('suspectEntity', field.id, setSuspectEntities)}
                  >
                    <MinusCircle className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* <FormField
            control={form.control}
            name="note"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter additional notes about the adverse event"
                    className="resize-none"
                    value={field.value?.[0]?.text || ''}
                    onChange={(e) => {
                      const updatedNote = [{ text: e.target.value }];
                      field.onChange(updatedNote);
                    }}
                  />
                </FormControl>
                <FormDescription>Enter any additional notes about this adverse event</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          /> */}
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </div>
  );
}

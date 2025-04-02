'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ObservationSchema, type Observation } from '@/features/data-registry/types/fhir/observation';
import { useState } from 'react';
import {
  MinusCircle,
  PlusCircle,
  AlertCircle,
  Stethoscope,
  Calendar,
  User,
  FileText,
  Activity,
  Tag,
  HelpCircle,
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { SmartDatetimeInput } from '@/components/ui/custom/smart-date-input';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const OBSERVATION_STATUSES = [
  { value: 'registered', label: 'Registered' },
  { value: 'preliminary', label: 'Preliminary' },
  { value: 'final', label: 'Final' },
  { value: 'amended', label: 'Amended' },
  { value: 'corrected', label: 'Corrected' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'entered-in-error', label: 'Entered in Error' },
  { value: 'unknown', label: 'Unknown' },
];

const CODING_SYSTEMS = [
  { value: 'http://loinc.org', label: 'LOINC' },
  { value: 'http://snomed.info/sct', label: 'SNOMED CT' },
  { value: 'http://hl7.org/fhir/observation-category', label: 'Observation Category' },
  { value: 'http://terminology.hl7.org/CodeSystem/observation-category', label: 'HL7 Observation Category' },
];

export function ObservationForm({
  onSubmit,
  initialData,
  patientReference,
  encounterReference,
}: {
  onSubmit: (data: Observation) => void;
  initialData?: Partial<Observation>;
  patientReference: string;
  encounterReference?: string;
}) {
  const [categories, setCategories] = useState([{ id: 0 }]);
  const [performers, setPerformers] = useState([{ id: 0 }]);
  const [formError, setFormError] = useState<string | null>(null);

  // Set up default values for the form
  const defaultValues: Partial<Observation> = {
    resourceType: 'Observation',
    status: 'registered',
    subject: { reference: patientReference },
    encounter: encounterReference ? { reference: encounterReference } : undefined,
    effectiveDateTime: new Date().toISOString(),
    issued: new Date().toISOString(),
    code: {
      coding: [{ system: 'http://loinc.org', code: 'CODE-12', display: 'Observation Code' }],
    },
    category: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
            code: 'vital-signs',
            display: 'Vital Signs',
          },
        ],
      },
    ],
    bodySite: {
      coding: [
        {
          system: 'http://snomed.info/sct',
          code: 'BODY-1',
          display: 'Body Site',
        },
      ],
    },
    performer: [{ reference: 'Practitioner/123' }],
    note: [{ text: 'Additional Notes about the observation. This is a test note.' }],
    ...initialData,
  };

  const form = useForm<Observation>({
    resolver: zodResolver(ObservationSchema),
    defaultValues,
  });

  // Monitor form validation errors
  const errors = form.formState.errors;

  console.log(errors);

  const addField = (
    fieldType: 'category' | 'performer',
    setterFunction: React.Dispatch<React.SetStateAction<{ id: number }[]>>
  ) => {
    setterFunction((prev) => [...prev, { id: Math.max(...prev.map((f) => f.id)) + 1 }]);
  };

  const removeField = (
    fieldType: 'category' | 'performer',
    id: number,
    setterFunction: React.Dispatch<React.SetStateAction<{ id: number }[]>>
  ) => {
    setterFunction((prev) => prev.filter((field) => field.id !== id));
  };

  const handleSubmit = form.handleSubmit((data) => {
    try {
      setFormError(null);
      onSubmit(data);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'An error occurred while submitting the form');
      console.error('Form submission error:', error);
    }
  });

  const InfoTooltip = ({ content }: { content: string }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className="h-4 w-4 text-muted-foreground ml-2 inline cursor-help" />
        </TooltipTrigger>
        <TooltipContent side="right">
          <p className="max-w-xs">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  const SectionHeader = ({
    icon,
    title,
    description,
  }: {
    icon: React.ReactNode;
    title: string;
    description: string;
  }) => (
    <div className="flex items-start gap-3 mb-4">
      <div className="bg-primary/10 p-2 rounded-full text-primary">{icon}</div>
      <div>
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {formError && (
        <div className="bg-red-50 p-4 rounded-md flex items-start gap-3 text-red-700 mb-4">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium">Error submitting form</h3>
            <p className="text-sm">{formError}</p>
          </div>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Observation Information */}
          <div className="space-y-4">
            <SectionHeader
              icon={<Activity className="h-5 w-5" />}
              title="Basic Observation Information"
              description="Essential details about the observation"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Status
                      <InfoTooltip content="The status of the observation result value" />
                    </FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {OBSERVATION_STATUSES.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="code.coding.0.system"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Coding System
                      <InfoTooltip content="The coding system used for this observation" />
                    </FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select coding system" />
                        </SelectTrigger>
                        <SelectContent>
                          {CODING_SYSTEMS.map((system) => (
                            <SelectItem key={system.value} value={system.value}>
                              {system.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="code.coding.0.code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Observation Code
                      <InfoTooltip content="The standardized code for this observation (e.g., LOINC code)" />
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter observation code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="code.coding.0.display"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Observation Name
                      <InfoTooltip content="The human-readable name of the observation" />
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter observation name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="bodySite.coding.0.system"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Body Site System
                      <InfoTooltip content="The coding system for the body site" />
                    </FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select coding system" />
                        </SelectTrigger>
                        <SelectContent>
                          {CODING_SYSTEMS.map((system) => (
                            <SelectItem key={system.value} value={system.value}>
                              {system.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bodySite.coding.0.code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Body Site Code
                      <InfoTooltip content="The standardized code for the body site" />
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter body site code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="bodySite.coding.0.display"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Body Site
                      <InfoTooltip content="The body site where the observation was made" />
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter body site" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="valueQuantity.value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Value
                      <InfoTooltip content="The numeric value of the observation" />
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter value"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="valueQuantity.unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Unit
                      <InfoTooltip content="The unit of measure for the observation value" />
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter unit (e.g., mg/dL)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <SectionHeader
              icon={<Tag className="h-5 w-5" />}
              title="Categories"
              description="Classification of the observation (vital signs, lab, etc.)"
            />

            <div className="flex items-center justify-between mb-1">
              <h3 className="text-md font-medium flex items-center">
                Observation Categories
                <InfoTooltip content="Add all relevant categories for this observation" />
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addField('category', setCategories)}
                className="flex items-center gap-1"
              >
                <PlusCircle className="h-4 w-4" /> Add Category
              </Button>
            </div>

            {categories.map((field, index) => (
              <Card key={field.id} className="relative border-muted">
                <CardContent className="pt-6">
                  {categories.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                      onClick={() => removeField('category', field.id, setCategories)}
                    >
                      <MinusCircle className="h-4 w-4" />
                    </Button>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`category.${index}.coding.0.system`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Category System
                            <InfoTooltip content="The coding system for this category" />
                          </FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category system" />
                              </SelectTrigger>
                              <SelectContent>
                                {CODING_SYSTEMS.map((system) => (
                                  <SelectItem key={system.value} value={system.value}>
                                    {system.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`category.${index}.coding.0.code`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Category Code
                            <InfoTooltip content="The standardized code for this category" />
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Enter category code" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`category.${index}.coding.0.display`}
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>
                            Category Name
                            <InfoTooltip content="The human-readable name of the category" />
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Enter category name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Dates */}
          <div className="space-y-4">
            <SectionHeader
              icon={<Calendar className="h-5 w-5" />}
              title="Dates"
              description="When the observation was made and issued"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="effectiveDateTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Effective Date
                      <InfoTooltip content="When the observation was made" />
                    </FormLabel>
                    <FormControl>
                      <SmartDatetimeInput
                        value={field.value ? new Date(field.value) : null}
                        onValueChange={(date) => {
                          field.onChange(date ? date.toISOString() : new Date().toISOString());
                        }}
                        placeholder="e.g. Yesterday at 2pm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="issued"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Issued Date
                      <InfoTooltip content="When the result was issued" />
                    </FormLabel>
                    <FormControl>
                      <SmartDatetimeInput
                        value={field.value ? new Date(field.value) : null}
                        onValueChange={(date) => {
                          field.onChange(date ? date.toISOString() : new Date().toISOString());
                        }}
                        placeholder="e.g. Today at 9am"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Performers */}
          <div className="space-y-4">
            <SectionHeader
              icon={<User className="h-5 w-5" />}
              title="Performers"
              description="Healthcare providers who performed the observation"
            />

            <div className="flex items-center justify-between mb-1">
              <h3 className="text-md font-medium flex items-center">
                Observation Performers
                <InfoTooltip content="Add all healthcare providers who performed this observation" />
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addField('performer', setPerformers)}
                className="flex items-center gap-1"
              >
                <PlusCircle className="h-4 w-4" /> Add Performer
              </Button>
            </div>

            {performers.map((field, index) => (
              <Card key={field.id} className="relative border-muted">
                <CardContent className="pt-6">
                  {performers.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                      onClick={() => removeField('performer', field.id, setPerformers)}
                    >
                      <MinusCircle className="h-4 w-4" />
                    </Button>
                  )}
                  <div className="col-span-12">
                    <FormField
                      control={form.control}
                      name={`performer.${index}.reference`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Performer Reference
                            <InfoTooltip content="Reference to the person who performed the observation (e.g., Practitioner/123)" />
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Enter performer reference" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Notes */}
          <div className="space-y-4">
            <SectionHeader
              icon={<FileText className="h-5 w-5" />}
              title="Additional Notes"
              description="Any additional information about this observation"
            />

            <FormField
              control={form.control}
              name="note.0.text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Notes
                    <InfoTooltip content="Additional notes about the observation, including context, methodology, or other relevant information" />
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter additional notes"
                      {...field}
                      value={field.value as string}
                      onChange={(e) => {
                        field.onChange(e.target.value);
                      }}
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button
            type="submit"
            className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white font-medium py-5 px-8"
          >
            Save Observation
          </Button>
        </form>
      </Form>
    </div>
  );
}

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConditionSchema, type Condition } from '@/features/data-registry/types/fhir/condition';
import { useState } from 'react';
import {
  MinusCircle,
  PlusCircle,
  AlertCircle,
  Activity,
  FileText,
  Tag,
  Stethoscope,
  MapPin,
  HelpCircle,
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { SmartDatetimeInput } from '@/components/ui/custom/smart-date-input';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { v4 as uuidv4 } from 'uuid';

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

const CODING_SYSTEMS = [
  { value: 'http://snomed.info/sct', label: 'SNOMED CT' },
  { value: 'http://hl7.org/fhir/sid/icd-10', label: 'ICD-10' },
  { value: 'http://hl7.org/fhir/sid/icd-9-cm', label: 'ICD-9-CM' },
  { value: 'http://loinc.org', label: 'LOINC' },
];

const CATEGORY_SYSTEMS = [
  { value: 'http://terminology.hl7.org/CodeSystem/condition-category', label: 'Condition Category' },
  { value: 'http://snomed.info/sct', label: 'SNOMED CT' },
];

const SEVERITY_CODES = [
  { value: 'mild', label: 'Mild', system: 'http://snomed.info/sct' },
  { value: 'moderate', label: 'Moderate', system: 'http://snomed.info/sct' },
  { value: 'severe', label: 'Severe', system: 'http://snomed.info/sct' },
];

export function ConditionForm({
  onSubmit,
  initialData,
  patientReference,
  encounterReference,
}: {
  onSubmit: (data: Condition) => void;
  initialData?: Partial<Condition>;
  patientReference: string;
  encounterReference?: string;
}) {
  const [categoryFields, setCategoryFields] = useState([{ id: 0 }]);
  const [bodySiteFields, setBodySiteFields] = useState([{ id: 0 }]);
  const [formError, setFormError] = useState<string | null>(null);

  // Set up default values for the form
  const defaultValues: Partial<Condition> = {
    resourceType: 'Condition',
    id: uuidv4(),
    subject: { reference: patientReference },
    encounter: encounterReference ? { reference: encounterReference } : undefined,
    clinicalStatus: {
      coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-clinical', code: 'active' }],
    },
    verificationStatus: {
      coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status', code: 'confirmed' }],
    },
    code: {
      coding: [{ system: 'http://snomed.info/sct', code: 'CODE-12', display: 'Condition Code' }],
    },
    category: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/condition-category',
            code: 'problem-list-item',
            display: 'Problem List Item',
          },
        ],
      },
    ],
    severity: {
      coding: [
        {
          system: 'http://snomed.info/sct',
          code: 'moderate',
          display: 'Moderate',
        },
      ],
    },
    bodySite: [
      {
        coding: [{ system: 'http://snomed.info/sct', code: 'BODY-1', display: 'Body Site' }],
      },
    ],
    recordedDate: new Date().toISOString(),
    ...initialData,
  };

  const form = useForm<Condition>({
    resolver: zodResolver(ConditionSchema),
    defaultValues,
  });

  // Monitor form validation errors
  const errors = form.formState.errors;

  const addField = (
    fieldType: 'category' | 'bodySite',
    setterFunction: React.Dispatch<React.SetStateAction<{ id: number }[]>>
  ) => {
    setterFunction((prev) => [...prev, { id: Math.max(...prev.map((f) => f.id)) + 1 }]);

    // Get the current array
    const currentArray = form.getValues(fieldType) || [];

    // Add a new item with the required system field
    if (fieldType === 'category') {
      form.setValue('category', [
        ...currentArray,
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/condition-category',
              code: 'problem-list-item',
              display: 'Problem List Item',
            },
          ],
        },
      ]);
    } else if (fieldType === 'bodySite') {
      form.setValue('bodySite', [
        ...currentArray,
        {
          coding: [{ system: 'http://snomed.info/sct', code: 'BODY-1', display: 'Body Site' }],
        },
      ]);
    }
  };

  const removeField = (
    fieldType: 'category' | 'bodySite',
    id: number,
    setterFunction: React.Dispatch<React.SetStateAction<{ id: number }[]>>
  ) => {
    const index =
      fieldType === 'category'
        ? categoryFields.findIndex((item) => item.id === id)
        : bodySiteFields.findIndex((item) => item.id === id);

    setterFunction((prev) => prev.filter((field) => field.id !== id));

    // Get the current array
    const currentArray = form.getValues(fieldType) || [];

    // Remove the item at the specified index
    if (index !== -1 && currentArray.length > index) {
      const newArray = [...currentArray];
      newArray.splice(index, 1);
      form.setValue(fieldType, newArray);
    }
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
    <div className="space-y-4">
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
          {/* Status Information */}
          <div className="space-y-4">
            <SectionHeader
              icon={<Activity className="h-5 w-5" />}
              title="Status Information"
              description="Current clinical and verification status of the condition"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="clinicalStatus.coding.0.code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Clinical Status
                      <InfoTooltip content="The clinical status of the condition (e.g., active, resolved)" />
                    </FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select clinical status" />
                        </SelectTrigger>
                        <SelectContent>
                          {CLINICAL_STATUSES.map((status) => (
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
                name="verificationStatus.coding.0.code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Verification Status
                      <InfoTooltip content="The verification status of the condition (e.g., confirmed, provisional)" />
                    </FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select verification status" />
                        </SelectTrigger>
                        <SelectContent>
                          {VERIFICATION_STATUSES.map((status) => (
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
            </div>
          </div>

          {/* Condition Information */}
          <div className="space-y-4">
            <SectionHeader
              icon={<Stethoscope className="h-5 w-5" />}
              title="Condition Information"
              description="Details about the medical condition"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="code.coding.0.code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Condition Code
                      <InfoTooltip content="The standardized code for this condition (e.g., ICD-10 or SNOMED CT)" />
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter condition code" {...field} />
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
                      Condition Name
                      <InfoTooltip content="The human-readable name of the condition" />
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter condition name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="severity.coding.0.code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Severity
                      <InfoTooltip content="The severity of the condition" />
                    </FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select severity" />
                        </SelectTrigger>
                        <SelectContent>
                          {SEVERITY_CODES.map((severity) => (
                            <SelectItem key={severity.value} value={severity.value}>
                              {severity.label}
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
                name="onsetDateTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Onset Date
                      <InfoTooltip content="When the condition began" />
                    </FormLabel>
                    <FormControl>
                      <SmartDatetimeInput
                        value={field.value ? new Date(field.value) : null}
                        onValueChange={(date) => {
                          field.onChange(date ? date.toISOString() : undefined);
                        }}
                        placeholder="e.g. Last week"
                      />
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
              description="Classification of the condition (problem list item, encounter diagnosis, etc.)"
            />

            <div className="flex items-center justify-between mb-1">
              <h3 className="text-md font-medium flex items-center">
                Condition Categories
                <InfoTooltip content="Add all relevant categories for this condition" />
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addField('category', setCategoryFields)}
                className="flex items-center gap-1"
              >
                <PlusCircle className="h-4 w-4" /> Add Category
              </Button>
            </div>

            {categoryFields.map((field, index) => (
              <Card key={field.id} className="relative border-muted">
                {categoryFields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                    onClick={() => removeField('category', field.id, setCategoryFields)}
                  >
                    <MinusCircle className="h-4 w-4" />
                  </Button>
                )}
                <CardContent className="pt-6 pb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <FormItem>
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

          {/* Body Sites */}
          <div className="space-y-4">
            <SectionHeader
              icon={<MapPin className="h-5 w-5" />}
              title="Body Sites"
              description="Anatomical locations affected by this condition"
            />

            <div className="flex items-center justify-between mb-1">
              <h3 className="text-md font-medium flex items-center">
                Affected Body Sites
                <InfoTooltip content="Add all relevant body sites affected by this condition" />
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addField('bodySite', setBodySiteFields)}
                className="flex items-center gap-1"
              >
                <PlusCircle className="h-4 w-4" /> Add Body Site
              </Button>
            </div>

            {bodySiteFields.map((field, index) => (
              <Card key={field.id} className="relative border-muted">
                {bodySiteFields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                    onClick={() => removeField('bodySite', field.id, setBodySiteFields)}
                  >
                    <MinusCircle className="h-4 w-4" />
                  </Button>
                )}
                <CardContent className="pt-6 pb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`bodySite.${index}.coding.0.code`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Body Site Code
                            <InfoTooltip content="The standardized code for this body site" />
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Enter body site code" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`bodySite.${index}.coding.0.display`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Body Site Name
                            <InfoTooltip content="The human-readable name of the body site" />
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Enter body site name" {...field} />
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
              title="Notes"
              description="Additional clinical notes about this condition"
            />

            <FormField
              control={form.control}
              name="note.0.text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Clinical Notes
                    <InfoTooltip content="Additional notes about the condition, including symptoms, treatment plans, or other relevant information" />
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter additional notes about the condition"
                      className="min-h-[100px]"
                      {...field}
                      value={(field.value as string) || ''}
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
            Save Condition
          </Button>
        </form>
      </Form>
    </div>
  );
}

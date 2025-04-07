'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BasicSchema, type Basic, type FHIRExtension } from '@/features/data-registry/types/fhir/basic';
import { useState } from 'react';
import { MinusCircle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

// Predefined social history extension URLs
const SOCIAL_HISTORY_EXTENSIONS = {
  ECONOMIC_STATUS: 'http://hl7.org/fhir/StructureDefinition/economic-status',
  EDUCATION_LEVEL: 'http://hl7.org/fhir/StructureDefinition/education-level',
  PHYSICAL_ACTIVITY: 'http://hl7.org/fhir/StructureDefinition/physical-activity',
  DIET_NUTRITION: 'http://hl7.org/fhir/StructureDefinition/diet-nutrition',
  SUBSTANCE_USE: 'http://hl7.org/fhir/StructureDefinition/substance-use',
  STRESS_COPING: 'http://hl7.org/fhir/StructureDefinition/stress-coping',
};

const EXTENSION_TYPES = [
  { value: 'string', label: 'Text' },
  { value: 'integer', label: 'Number' },
  { value: 'boolean', label: 'Yes/No' },
  { value: 'dateTime', label: 'Date & Time' },
];

const ECONOMIC_STATUS_OPTIONS = [
  { value: 'Low', display: 'Low' },
  { value: 'LowerMiddle', display: 'Lower Middle' },
  { value: 'Middle', display: 'Middle' },
  { value: 'UpperMiddle', display: 'Upper Middle' },
  { value: 'High', display: 'High' },
];

const EDUCATION_LEVEL_OPTIONS = [
  { value: 'NoFormalEducation', display: 'No Formal Education' },
  { value: 'PrimaryEducation', display: 'Primary Education' },
  { value: 'SecondaryEducation', display: 'Secondary Education' },
  { value: 'VocationalTraining', display: 'Vocational Training' },
  { value: 'AssociateDegree', display: 'Associate Degree' },
  { value: 'BachelorDegree', display: "Bachelor's Degree" },
  { value: 'GraduateDegree', display: 'Graduate Degree' },
];

const PHYSICAL_ACTIVITY_OPTIONS = [
  { value: 'Sedentary', display: 'Sedentary' },
  { value: 'Light', display: 'Light' },
  { value: 'Moderate', display: 'Moderate' },
  { value: 'Active', display: 'Active' },
  { value: 'VigorouslyActive', display: 'Vigorously Active' },
];

const DIET_NUTRITION_OPTIONS = [
  { value: 'Poor', display: 'Poor' },
  { value: 'Average', display: 'Average' },
  { value: 'Good', display: 'Good' },
  { value: 'Excellent', display: 'Excellent' },
];

const SUBSTANCE_USE_OPTIONS = [
  { value: 'None', display: 'None' },
  { value: 'Alcohol', display: 'Alcohol' },
  { value: 'Tobacco', display: 'Tobacco' },
  { value: 'RecreationalDrugs', display: 'Recreational Drugs' },
];

const STRESS_COPING_OPTIONS = [
  { value: 'Low', display: 'Low' },
  { value: 'Moderate', display: 'Moderate' },
  { value: 'High', display: 'High' },
];

export function SocialHistoryForm({
  onSubmit,
  initialData,
  patientReference,
}: {
  onSubmit: (data: Basic) => void;
  initialData?: Partial<Basic>;
  patientReference: string;
}) {
  const [extensions, setExtensions] = useState([{ id: 0 }]);

  const form = useForm<Basic>({
    resolver: zodResolver(BasicSchema),
    defaultValues: {
      resourceType: 'Basic',
      code: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/basic-resource-type',
            code: 'SOCHISTORY',
            display: 'Social History',
          },
        ],
      },
      subject: { reference: patientReference },
      created: new Date().toISOString(),
      extension: [],
      ...initialData,
    },
  });

  const addExtension = () => {
    setExtensions((prev) => [...prev, { id: Math.max(...prev.map((f) => f.id)) + 1 }]);
  };

  const removeExtension = (id: number) => {
    setExtensions((prev) => prev.filter((ext) => ext.id !== id));
  };

  return (
    <div className="w-full rounded-md mb-5">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-3xl mx-auto bg-background border p-3">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-6">
              <FormField
                control={form.control}
                name="created"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Documentation Date</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormDescription>Date when this social history was documented</FormDescription>
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
                name="extension.0"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Economic Status</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange({
                          url: SOCIAL_HISTORY_EXTENSIONS.ECONOMIC_STATUS,
                          valueString: value,
                        })
                      }
                      defaultValue={field.value?.valueString}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select economic status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ECONOMIC_STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.display}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Patient's economic status</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-6">
              <FormField
                control={form.control}
                name="extension.1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Highest Level of Education</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange({
                          url: SOCIAL_HISTORY_EXTENSIONS.EDUCATION_LEVEL,
                          valueString: value,
                        })
                      }
                      defaultValue={field.value?.valueString}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select education level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {EDUCATION_LEVEL_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.display}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Patient's highest level of education</FormDescription>
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
                name="extension.2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Physical Activity</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange({
                          url: SOCIAL_HISTORY_EXTENSIONS.PHYSICAL_ACTIVITY,
                          valueString: value,
                        })
                      }
                      defaultValue={field.value?.valueString}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select physical activity level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PHYSICAL_ACTIVITY_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.display}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Patient's physical activity level</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-6">
              <FormField
                control={form.control}
                name="extension.3"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Diet & Nutrition</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange({
                          url: SOCIAL_HISTORY_EXTENSIONS.DIET_NUTRITION,
                          valueString: value,
                        })
                      }
                      defaultValue={field.value?.valueString}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select diet quality" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DIET_NUTRITION_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.display}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Patient's diet and nutrition quality</FormDescription>
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
                name="extension.4"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Substance Use</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange({
                          url: SOCIAL_HISTORY_EXTENSIONS.SUBSTANCE_USE,
                          valueString: value,
                        })
                      }
                      defaultValue={field.value?.valueString}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select substance use" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SUBSTANCE_USE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.display}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Patient's substance use</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-6">
              <FormField
                control={form.control}
                name="extension.5"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stress & Coping</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange({
                          url: SOCIAL_HISTORY_EXTENSIONS.STRESS_COPING,
                          valueString: value,
                        })
                      }
                      defaultValue={field.value?.valueString}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select stress level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {STRESS_COPING_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.display}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Patient's stress level and coping mechanisms</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Additional Extensions</h3>
              <Button type="button" variant="outline" size="sm" onClick={addExtension}>
                Add Extension
              </Button>
            </div>

            {extensions.map((extension, index) => (
              <div key={extension.id} className="grid grid-cols-12 gap-4 relative">
                {extensions.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => removeExtension(extension.id)}
                  >
                    <MinusCircle className="h-4 w-4" />
                  </Button>
                )}
                <div className="col-span-6">
                  <FormField
                    control={form.control}
                    name={`extension.${index + 6}.url`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Extension URL</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter extension URL" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="col-span-6">
                  <FormField
                    control={form.control}
                    name={`extension.${index + 6}.valueString`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Extension Value</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter extension value" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))}
          </div>

          <Button type="submit" className="w-full">
            Save Social History
          </Button>
        </form>
      </Form>
    </div>
  );
}

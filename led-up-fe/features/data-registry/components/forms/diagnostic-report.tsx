'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DiagnosticReportSchema, type DiagnosticReport } from '@/features/data-registry/types/fhir/diagnostic-report';
import { useState } from 'react';
import {
  PlusCircle,
  MinusCircle,
  AlertCircle,
  FileText,
  Calendar,
  Users,
  Microscope,
  Image,
  ClipboardList,
  HelpCircle,
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { SmartDatetimeInput } from '@/components/ui/custom/smart-date-input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const DIAGNOSTIC_REPORT_STATUSES = [
  { value: 'registered', label: 'Registered' },
  { value: 'partial', label: 'Partial' },
  { value: 'preliminary', label: 'Preliminary' },
  { value: 'final', label: 'Final' },
];

export function DiagnosticReportForm({
  onSubmit,
  initialData,
  patientReference,
  encounterReference,
}: {
  onSubmit: (data: DiagnosticReport) => void;
  initialData?: Partial<DiagnosticReport>;
  patientReference: string;
  encounterReference?: string;
}) {
  const [categories, setCategories] = useState([{ id: 0 }]);
  const [performers, setPerformers] = useState([{ id: 0 }]);
  const [resultsInterpreters, setResultsInterpreters] = useState([{ id: 0 }]);
  const [specimens, setSpecimens] = useState([{ id: 0 }]);
  const [results, setResults] = useState([{ id: 0 }]);
  const [media, setMedia] = useState([{ id: 0 }]);
  const [formError, setFormError] = useState<string | null>(null);

  const defaultValues: Partial<DiagnosticReport> = {
    resourceType: 'DiagnosticReport',
    status: 'registered',
    subject: { reference: patientReference, type: 'Patient' },
    encounter: encounterReference ? { reference: encounterReference, type: 'Encounter' } : undefined,
    issued: new Date().toISOString(),
    code: {
      coding: [{ system: 'http://loinc.org', code: '', display: '' }],
    },
    category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v2-0074', code: '', display: '' }] }],
    ...initialData,
  };

  const form = useForm<DiagnosticReport>({
    resolver: zodResolver(DiagnosticReportSchema),
    defaultValues,
  });

  const addField = (
    fieldType: 'category' | 'performer' | 'resultsInterpreter' | 'specimen' | 'result' | 'media',
    setterFunction: React.Dispatch<React.SetStateAction<{ id: number }[]>>
  ) => {
    setterFunction((prev) => [...prev, { id: Math.max(...prev.map((f) => f.id)) + 1 }]);
  };

  const removeField = (
    fieldType: 'category' | 'performer' | 'resultsInterpreter' | 'specimen' | 'result' | 'media',
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

  // Monitor form validation errors
  console.log(form.formState.errors);

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
          {/* Basic Information */}
          <div className="space-y-4">
            <SectionHeader
              icon={<FileText className="h-5 w-5" />}
              title="Basic Information"
              description="Essential details about the diagnostic report"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Status
                      <InfoTooltip content="Current status of the diagnostic report" />
                    </FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {DIAGNOSTIC_REPORT_STATUSES.map((status) => (
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
                      <InfoTooltip content="The coding system used for this report (e.g., LOINC, SNOMED CT)" />
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter coding system" defaultValue="http://loinc.org" {...field} />
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
                      Report Code
                      <InfoTooltip content="The standardized code for this diagnostic report" />
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter report code" {...field} />
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
                      Report Name
                      <InfoTooltip content="The human-readable name of the diagnostic report" />
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter report name" {...field} />
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
              icon={<ClipboardList className="h-5 w-5" />}
              title="Categories"
              description="Classification of the diagnostic report"
            />

            <div className="flex items-center justify-between mb-1">
              <h3 className="text-md font-medium flex items-center">
                Report Categories
                <InfoTooltip content="Add all relevant categories for this diagnostic report" />
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

            {categories.map((category, index) => (
              <Card key={category.id} className="relative border-muted">
                <CardContent className="pt-6">
                  {categories.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                      onClick={() => removeField('category', category.id, setCategories)}
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
                            <Input
                              placeholder="Enter category system"
                              defaultValue="http://terminology.hl7.org/CodeSystem/v2-0074"
                              {...field}
                            />
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
                  </div>

                  <div className="mt-4">
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

          {/* Timing Information */}
          <div className="space-y-4">
            <SectionHeader
              icon={<Calendar className="h-5 w-5" />}
              title="Timing Information"
              description="When the diagnostic report was created and issued"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="effectiveDateTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Effective Date
                      <InfoTooltip content="When the diagnostic report was created" />
                    </FormLabel>
                    <FormControl>
                      <SmartDatetimeInput
                        value={field.value ? new Date(field.value) : null}
                        onValueChange={(date) => {
                          field.onChange(date ? date.toISOString() : undefined);
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
                      <InfoTooltip content="When the diagnostic report was issued" />
                    </FormLabel>
                    <FormControl>
                      <SmartDatetimeInput
                        value={field.value ? new Date(field.value) : null}
                        onValueChange={(date) => {
                          field.onChange(date ? date.toISOString() : new Date().toISOString());
                        }}
                        placeholder="e.g. Today at 10am"
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
              icon={<Users className="h-5 w-5" />}
              title="Performers"
              description="Healthcare providers who performed the diagnostic procedure"
            />

            <div className="flex items-center justify-between mb-1">
              <h3 className="text-md font-medium flex items-center">
                Report Performers
                <InfoTooltip content="Add all healthcare providers who performed this diagnostic procedure" />
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

            {performers.map((performer, index) => (
              <Card key={performer.id} className="relative border-muted">
                <CardContent className="pt-6">
                  {performers.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                      onClick={() => removeField('performer', performer.id, setPerformers)}
                    >
                      <MinusCircle className="h-4 w-4" />
                    </Button>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`performer.${index}.reference`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Performer Reference
                            <InfoTooltip content="Reference to the healthcare provider (e.g., Practitioner/123)" />
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Enter performer reference" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`performer.${index}.display`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Performer Name
                            <InfoTooltip content="Name of the healthcare provider who performed the diagnostic procedure" />
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Enter performer name" {...field} />
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

          {/* Specimens */}
          <div className="space-y-4">
            <SectionHeader
              icon={<Microscope className="h-5 w-5" />}
              title="Specimens"
              description="Specimens used for this diagnostic report"
            />

            <div className="flex items-center justify-between mb-1">
              <h3 className="text-md font-medium flex items-center">
                Report Specimens
                <InfoTooltip content="Add all specimens used for this diagnostic report" />
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addField('specimen', setSpecimens)}
                className="flex items-center gap-1"
              >
                <PlusCircle className="h-4 w-4" /> Add Specimen
              </Button>
            </div>

            {specimens.map((specimen, index) => (
              <Card key={specimen.id} className="relative border-muted">
                <CardContent className="pt-6">
                  {specimens.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                      onClick={() => removeField('specimen', specimen.id, setSpecimens)}
                    >
                      <MinusCircle className="h-4 w-4" />
                    </Button>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`specimen.${index}.reference`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Specimen Reference
                            <InfoTooltip content="Reference to the specimen (e.g., Specimen/123)" />
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Enter specimen reference" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`specimen.${index}.display`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Specimen Description
                            <InfoTooltip content="Description of the specimen used" />
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Enter specimen description" {...field} />
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

          {/* Results */}
          <div className="space-y-4">
            <SectionHeader
              icon={<ClipboardList className="h-5 w-5" />}
              title="Results"
              description="Observations that are part of this diagnostic report"
            />

            <div className="flex items-center justify-between mb-1">
              <h3 className="text-md font-medium flex items-center">
                Report Results
                <InfoTooltip content="Add all observations that are part of this diagnostic report" />
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addField('result', setResults)}
                className="flex items-center gap-1"
              >
                <PlusCircle className="h-4 w-4" /> Add Result
              </Button>
            </div>

            {results.map((result, index) => (
              <Card key={result.id} className="relative border-muted">
                <CardContent className="pt-6">
                  {results.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                      onClick={() => removeField('result', result.id, setResults)}
                    >
                      <MinusCircle className="h-4 w-4" />
                    </Button>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`result.${index}.reference`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Result Reference
                            <InfoTooltip content="Reference to the observation result (e.g., Observation/123)" />
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Enter observation reference" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`result.${index}.display`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Result Description
                            <InfoTooltip content="Description of the observation result" />
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Enter result description" {...field} />
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

          {/* Media */}
          <div className="space-y-4">
            <SectionHeader
              icon={<Image className="h-5 w-5" />}
              title="Media"
              description="Images, videos, or other media associated with this report"
            />

            <div className="flex items-center justify-between mb-1">
              <h3 className="text-md font-medium flex items-center">
                Report Media
                <InfoTooltip content="Add all media associated with this diagnostic report" />
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addField('media', setMedia)}
                className="flex items-center gap-1"
              >
                <PlusCircle className="h-4 w-4" /> Add Media
              </Button>
            </div>

            {media.map((item, index) => (
              <Card key={item.id} className="relative border-muted">
                <CardContent className="pt-6">
                  {media.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                      onClick={() => removeField('media', item.id, setMedia)}
                    >
                      <MinusCircle className="h-4 w-4" />
                    </Button>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`media.${index}.comment`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Comment
                            <InfoTooltip content="Comment about the media" />
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Enter media comment" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`media.${index}.link.reference`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Media Reference
                            <InfoTooltip content="Reference to the media (e.g., Media/123)" />
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Enter media reference" {...field} />
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

          {/* Conclusion */}
          <div className="space-y-4">
            <SectionHeader
              icon={<FileText className="h-5 w-5" />}
              title="Conclusion"
              description="Clinical conclusion and codes for this diagnostic report"
            />

            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="conclusion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Clinical Conclusion
                      <InfoTooltip content="Clinical interpretation of the diagnostic report" />
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter clinical conclusion"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="conclusionCode.0.coding.0.system"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Conclusion Code System
                      <InfoTooltip content="The coding system for the conclusion code" />
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter code system" defaultValue="http://snomed.info/sct" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="conclusionCode.0.coding.0.code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Conclusion Code
                      <InfoTooltip content="The standardized code for the conclusion" />
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter conclusion code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="conclusionCode.0.coding.0.display"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Conclusion Code Display
                      <InfoTooltip content="The human-readable description of the conclusion code" />
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter conclusion code display" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white font-medium py-5 px-8"
          >
            Save Diagnostic Report
          </Button>
        </form>
      </Form>
    </div>
  );
}

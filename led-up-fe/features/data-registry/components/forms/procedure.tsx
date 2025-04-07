'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProcedureSchema, type Procedure } from '@/features/data-registry/types/fhir/procedure';
import { useState, useEffect } from 'react';
import {
  MinusCircle,
  PlusCircle,
  AlertCircle,
  Stethoscope,
  Calendar,
  User,
  MapPin,
  ClipboardList,
  FileText,
  HelpCircle,
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { SmartDatetimeInput } from '@/components/ui/custom/smart-date-input';
import { Alert } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const PROCEDURE_STATUSES = [
  { value: 'preparation', label: 'Preparation' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'not-done', label: 'Not Done' },
  { value: 'on-hold', label: 'On Hold' },
  { value: 'stopped', label: 'Stopped' },
  { value: 'completed', label: 'Completed' },
  { value: 'entered-in-error', label: 'Entered in Error' },
  { value: 'unknown', label: 'Unknown' },
];

const CODING_SYSTEMS = [
  { value: 'http://snomed.info/sct', label: 'SNOMED CT' },
  { value: 'http://loinc.org', label: 'LOINC' },
  { value: 'http://www.nlm.nih.gov/research/umls/rxnorm', label: 'RxNorm' },
  { value: 'http://hl7.org/fhir/sid/icd-10', label: 'ICD-10' },
  { value: 'http://hl7.org/fhir/sid/icd-9-cm', label: 'ICD-9-CM' },
  { value: 'http://hl7.org/fhir/sid/cvx', label: 'CVX (Vaccine)' },
  { value: 'http://terminology.hl7.org/CodeSystem/v3-ActCode', label: 'HL7 ActCode' },
  { value: 'http://terminology.hl7.org/CodeSystem/procedure-category', label: 'Procedure Category' },
];

export function ProcedureForm({
  onSubmit,
  initialData,
  patientReference,
}: {
  onSubmit: (data: Procedure) => void;
  initialData?: Partial<Procedure>;
  patientReference: string;
}) {
  const [performers, setPerformers] = useState([{ id: 0 }]);
  const [complications, setComplications] = useState([{ id: 0 }]);
  const [followUps, setFollowUps] = useState([{ id: 0 }]);
  const [formError, setFormError] = useState<string | null>(null);

  // Create default values with sensible defaults
  const defaultValues: Partial<Procedure> = {
    resourceType: 'Procedure',
    status: 'completed',
    subject: { reference: patientReference },
    performedDateTime: new Date().toISOString(),
    code: {
      coding: [
        {
          system: 'http://snomed.info/sct',
          code: 'CODE-12',
          display: 'Procedure Code',
        },
      ],
    },
    category: {
      coding: [
        {
          system: 'http://snomed.info/sct',
          code: 'CODE-12',
          display: 'Procedure Category',
        },
      ],
    },
    outcome: {
      coding: [
        {
          system: 'http://snomed.info/sct',
          code: 'CODE-12',
          display: 'Procedure Outcome',
        },
      ],
    },
    location: {
      reference: 'LOCATION-12',
      display: 'Procedure Location',
    },
    performer: [
      {
        actor: {
          reference: 'PERFORMER-12',
          display: 'Performer',
        },
      },
    ],
    complication: [
      {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: 'CODE-12',
            display: 'Complication',
          },
        ],
      },
    ],
    followUp: [
      {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: 'CODE-12',
            display: 'Follow-up',
          },
        ],
      },
    ],
    note: [
      {
        text: 'Additional Notes about the procedure. This is a test note.',
      },
    ],
    ...initialData,
  };

  const form = useForm<Procedure>({
    resolver: zodResolver(ProcedureSchema),
    defaultValues,
  });

  // Monitor form errors and set a general error message if needed
  useEffect(() => {
    const errors = form.formState.errors;
    if (Object.keys(errors).length > 0) {
      setFormError('There are validation errors in the form. Please check the highlighted fields.');
    } else {
      setFormError(null);
    }
  }, [form.formState.errors]);

  const addField = (
    fieldType: 'performer' | 'complication' | 'followUp',
    setterFunction: React.Dispatch<React.SetStateAction<{ id: number }[]>>
  ) => {
    setterFunction((prev) => [...prev, { id: Math.max(...prev.map((f) => f.id), 0) + 1 }]);
  };

  const removeField = (
    fieldType: 'performer' | 'complication' | 'followUp',
    id: number,
    setterFunction: React.Dispatch<React.SetStateAction<{ id: number }[]>>
  ) => {
    setterFunction((prev) => prev.filter((field) => field.id !== id));
  };

  const handleSubmit = (data: Procedure) => {
    try {
      onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
      setFormError(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  };

  const InfoTooltip = ({ content }: { content: string }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className="h-5 w-5 text-muted-foreground ml-2 inline cursor-help " />
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
    <div className="rounded-md mb-5">
      {formError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <p>{formError}</p>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8 max-w-3xl mx-auto bg-background">
          {/* Basic Procedure Information Section */}
          <div className="space-y-6">
            <SectionHeader
              icon={<Stethoscope className="h-5 w-5" />}
              title="Basic Procedure Information"
              description="Enter the basic details about the medical procedure"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Status
                      <InfoTooltip content="Current status of the procedure" />
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PROCEDURE_STATUSES.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="performedDateTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Performed Date
                      <InfoTooltip content="When the procedure was performed" />
                    </FormLabel>
                    <FormControl>
                      <SmartDatetimeInput
                        value={field.value ? new Date(field.value) : null}
                        onValueChange={(date: Date | null) => {
                          field.onChange(date ? date.toISOString() : new Date().toISOString());
                        }}
                        placeholder="e.g. Yesterday at 2pm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h4 className="text-md font-medium">Procedure Category</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="category.coding.0.system"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category System</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select coding system" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CODING_SYSTEMS.map((system) => (
                            <SelectItem key={system.value} value={system.value}>
                              {system.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category.coding.0.code"
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

                <FormField
                  control={form.control}
                  name="category.coding.0.display"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter procedure category" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-md font-medium">Procedure Code</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="code.coding.0.system"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Coding System</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select coding system" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CODING_SYSTEMS.map((system) => (
                            <SelectItem key={system.value} value={system.value}>
                              {system.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="code.coding.0.code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Procedure Code</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter procedure code" {...field} />
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
                      <FormLabel>Procedure Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter procedure name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Location and Performers Section */}
          <div className="space-y-6">
            <SectionHeader
              icon={<MapPin className="h-5 w-5" />}
              title="Location and Performers"
              description="Where the procedure was performed and who performed it"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="location.reference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location Reference</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter location reference" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location.display"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter location name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-md font-medium flex items-center">
                  Performers
                  <InfoTooltip content="People who performed the procedure" />
                </h4>
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
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`performer.${index}.actor.reference`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Performer Reference</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter performer reference" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`performer.${index}.actor.display`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Performer Name</FormLabel>
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
          </div>

          <Separator className="my-6" />

          {/* Outcomes and Follow-ups Section */}
          <div className="space-y-6">
            <SectionHeader
              icon={<ClipboardList className="h-5 w-5" />}
              title="Outcomes and Follow-ups"
              description="Results of the procedure and recommended follow-up actions"
            />

            <div className="space-y-4">
              <h4 className="text-md font-medium">Procedure Outcome</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="outcome.coding.0.system"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Outcome System</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select coding system" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CODING_SYSTEMS.map((system) => (
                            <SelectItem key={system.value} value={system.value}>
                              {system.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="outcome.coding.0.code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Outcome Code</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter outcome code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="outcome.coding.0.display"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Outcome Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter procedure outcome" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-md font-medium flex items-center">
                  Complications
                  <InfoTooltip content="Any complications that occurred during or after the procedure" />
                </h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addField('complication', setComplications)}
                  className="flex items-center gap-1"
                >
                  <PlusCircle className="h-4 w-4" /> Add Complication
                </Button>
              </div>

              {complications.map((field, index) => (
                <Card key={field.id} className="relative border-muted">
                  {complications.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                      onClick={() => removeField('complication', field.id, setComplications)}
                    >
                      <MinusCircle className="h-4 w-4" />
                    </Button>
                  )}
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name={`complication.${index}.coding.0.system`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Coding System</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select coding system" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {CODING_SYSTEMS.map((system) => (
                                  <SelectItem key={system.value} value={system.value}>
                                    {system.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`complication.${index}.coding.0.code`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Complication Code</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter complication code" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`complication.${index}.coding.0.display`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Complication Description</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter complication description" {...field} />
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

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-md font-medium flex items-center">
                  Follow-ups
                  <InfoTooltip content="Recommended follow-up actions after the procedure" />
                </h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addField('followUp', setFollowUps)}
                  className="flex items-center gap-1"
                >
                  <PlusCircle className="h-4 w-4" /> Add Follow-up
                </Button>
              </div>

              {followUps.map((field, index) => (
                <Card key={field.id} className="relative border-muted">
                  {followUps.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                      onClick={() => removeField('followUp', field.id, setFollowUps)}
                    >
                      <MinusCircle className="h-4 w-4" />
                    </Button>
                  )}
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name={`followUp.${index}.coding.0.system`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Coding System</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select coding system" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {CODING_SYSTEMS.map((system) => (
                                  <SelectItem key={system.value} value={system.value}>
                                    {system.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`followUp.${index}.coding.0.code`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Follow-up Code</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter follow-up code" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`followUp.${index}.coding.0.display`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Follow-up Description</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter follow-up description" {...field} />
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
          </div>

          <Separator className="my-6" />

          {/* Notes Section */}
          <div className="space-y-6">
            <SectionHeader
              icon={<FileText className="h-5 w-5" />}
              title="Additional Notes"
              description="Any other relevant information about the procedure"
            />

            <FormField
              control={form.control}
              name="note.0.text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter additional notes about the procedure"
                      className="resize-none min-h-[120px]"
                      {...field}
                      value={field.value as string}
                    />
                  </FormControl>
                  <FormDescription>
                    Include any additional details, observations, or comments about this procedure
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white font-medium py-5 px-8"
            >
              Register Procedure Record
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

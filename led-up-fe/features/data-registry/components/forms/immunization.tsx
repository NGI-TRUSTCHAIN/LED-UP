'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImmunizationSchema, type Immunization } from '@/features/data-registry/types/fhir/immunization';
import { useState } from 'react';
import {
  MinusCircle,
  PlusCircle,
  AlertCircle,
  Syringe,
  Calendar,
  FileText,
  Users,
  ClipboardList,
  HelpCircle,
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { SmartDatetimeInput } from '@/components/ui/custom/smart-date-input';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const IMMUNIZATION_STATUSES = [
  { value: 'completed', label: 'Completed' },
  { value: 'entered-in-error', label: 'Entered in Error' },
  { value: 'not-done', label: 'Not Done' },
];

export function ImmunizationForm({
  onSubmit,
  initialData,
  patientReference,
}: {
  onSubmit: (data: Immunization) => void;
  initialData?: Partial<Immunization>;
  patientReference: string;
}) {
  const [performers, setPerformers] = useState([{ id: 0 }]);
  const [protocols, setProtocols] = useState([{ id: 0 }]);
  const [formError, setFormError] = useState<string | null>(null);

  const defaultValues: Partial<Immunization> = {
    resourceType: 'Immunization',
    status: 'completed',
    patient: { reference: patientReference },
    primarySource: true,
    vaccineCode: {
      coding: [{ system: 'http://snomed.info/sct', code: '', display: '' }],
    },
    occurrence: new Date().toISOString(),
    recorded: new Date().toISOString(),
    manufacturer: { reference: '', display: '' },
    ...initialData,
  };

  const form = useForm<Immunization>({
    resolver: zodResolver(ImmunizationSchema),
    defaultValues,
  });

  const addField = (
    fieldType: 'performer' | 'protocol',
    setterFunction: React.Dispatch<React.SetStateAction<{ id: number }[]>>
  ) => {
    setterFunction((prev) => [...prev, { id: Math.max(...prev.map((f) => f.id)) + 1 }]);
  };

  const removeField = (
    fieldType: 'performer' | 'protocol',
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
              icon={<Syringe className="h-5 w-5" />}
              title="Basic Information"
              description="Essential details about the immunization"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Status
                      <InfoTooltip content="Current status of the immunization" />
                    </FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {IMMUNIZATION_STATUSES.map((status) => (
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

            <div className="mb-4">
              <FormField
                control={form.control}
                name="primarySource"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Primary Source
                        <InfoTooltip content="Indicates whether the data was reported by primary source (e.g., patient)" />
                      </FormLabel>
                      <p className="text-sm text-muted-foreground">Data reported by primary source</p>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="vaccineCode.coding.0.system"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Coding System
                      <InfoTooltip content="The coding system used for this vaccine" />
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter coding system" defaultValue="http://snomed.info/sct" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vaccineCode.coding.0.code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Vaccine Code
                      <InfoTooltip content="The standardized code for this vaccine" />
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter vaccine code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="vaccineCode.coding.0.display"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Vaccine Name
                      <InfoTooltip content="The human-readable name of the vaccine" />
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter vaccine name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="manufacturer.display"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Manufacturer Name
                      <InfoTooltip content="The manufacturer of the vaccine" />
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter manufacturer name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="manufacturer.reference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Manufacturer Reference
                      <InfoTooltip content="Reference to the manufacturer (e.g., Organization/123)" />
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter manufacturer reference" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Dates and Lot Information */}
          <div className="space-y-4">
            <SectionHeader
              icon={<Calendar className="h-5 w-5" />}
              title="Dates and Lot Information"
              description="When the immunization was administered and recorded"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="occurrence"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Occurrence Date
                      <InfoTooltip content="When the immunization was administered" />
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
                name="recorded"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Recorded Date
                      <InfoTooltip content="When the immunization was recorded" />
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="lotNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Lot Number
                      <InfoTooltip content="The lot number of the vaccine" />
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter lot number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expirationDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Expiration Date
                      <InfoTooltip content="The expiration date of the vaccine" />
                    </FormLabel>
                    <FormControl>
                      <SmartDatetimeInput
                        value={field.value ? new Date(field.value) : null}
                        onValueChange={(date) => {
                          field.onChange(date ? date.toISOString() : null);
                        }}
                        placeholder="e.g. Next year June 30"
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
              description="Healthcare providers who administered the immunization"
            />

            <div className="flex items-center justify-between mb-1">
              <h3 className="text-md font-medium flex items-center">
                Immunization Performers
                <InfoTooltip content="Add all healthcare providers who administered this immunization" />
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`performer.${index}.actor.reference`}
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
                      name={`performer.${index}.actor.display`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Performer Name
                            <InfoTooltip content="Name of the healthcare provider who administered the immunization" />
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

          {/* Protocol */}
          <div className="space-y-4">
            <SectionHeader
              icon={<ClipboardList className="h-5 w-5" />}
              title="Protocol"
              description="Details about the immunization protocol followed"
            />

            <div className="flex items-center justify-between mb-1">
              <h3 className="text-md font-medium flex items-center">
                Protocol Details
                <InfoTooltip content="Add details about the immunization protocol followed" />
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addField('protocol', setProtocols)}
                className="flex items-center gap-1"
              >
                <PlusCircle className="h-4 w-4" /> Add Protocol
              </Button>
            </div>

            {protocols.map((field, index) => (
              <Card key={field.id} className="relative border-muted">
                <CardContent className="pt-6">
                  {protocols.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                      onClick={() => removeField('protocol', field.id, setProtocols)}
                    >
                      <MinusCircle className="h-4 w-4" />
                    </Button>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`protocolApplied.${index}.series`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Series
                            <InfoTooltip content="The vaccination series (e.g., 'Childhood Series')" />
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Enter protocol series" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`protocolApplied.${index}.doseNumber`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Dose Number
                            <InfoTooltip content="The dose number within the series (e.g., '1', '2', 'Booster')" />
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Enter dose number" {...field} />
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
              description="Any additional information about this immunization"
            />

            <FormField
              control={form.control}
              name="note.0.text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Notes
                    <InfoTooltip content="Additional notes about the immunization, including reactions, observations, or other relevant information" />
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter additional notes about the immunization"
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

          <Button
            type="submit"
            className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white font-medium py-5 px-8"
          >
            Save Immunization
          </Button>
        </form>
      </Form>
    </div>
  );
}

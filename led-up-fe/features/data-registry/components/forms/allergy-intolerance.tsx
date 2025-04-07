'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AllergyIntoleranceSchema,
  type AllergyIntolerance,
} from '@/features/data-registry/types/fhir/allergy-intolerance';
import { useState } from 'react';
import {
  MinusCircle,
  PlusCircle,
  AlertCircle,
  AlertTriangle,
  Calendar,
  FileText,
  Thermometer,
  HelpCircle,
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { SmartDatetimeInput } from '@/components/ui/custom/smart-date-input';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const CLINICAL_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'resolved', label: 'Resolved' },
];

const VERIFICATION_STATUSES = [
  { value: 'unconfirmed', label: 'Unconfirmed' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'refuted', label: 'Refuted' },
  { value: 'entered-in-error', label: 'Entered in Error' },
];

const CATEGORIES = [
  { value: 'food', label: 'Food' },
  { value: 'medication', label: 'Medication' },
  { value: 'environment', label: 'Environment' },
  { value: 'biologic', label: 'Biologic' },
];

const CRITICALITY = [
  { value: 'low', label: 'Low' },
  { value: 'high', label: 'High' },
  { value: 'unable-to-assess', label: 'Unable to Assess' },
];

const SEVERITY = [
  { value: 'mild', label: 'Mild' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'severe', label: 'Severe' },
];

export function AllergyIntoleranceForm({
  onSubmit,
  initialData,
  patientReference,
}: {
  onSubmit: (data: AllergyIntolerance) => void;
  initialData?: Partial<AllergyIntolerance>;
  patientReference: string;
}) {
  const [reactions, setReactions] = useState([{ id: 0 }]);
  const [formError, setFormError] = useState<string | null>(null);

  const defaultValues: Partial<AllergyIntolerance> = {
    resourceType: 'AllergyIntolerance',
    id: crypto.randomUUID(),
    patient: { reference: patientReference },
    clinicalStatus: {
      coding: [{ system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical', code: 'active' }],
    },
    verificationStatus: {
      coding: [{ system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-verification', code: 'confirmed' }],
    },
    category: ['medication'],
    code: { coding: [{ code: '', system: 'http://snomed.info/sct', display: '' }] },
    reaction: [
      {
        manifestation: [{ coding: [{ code: '', system: 'http://snomed.info/sct', display: '' }] }],
        substance: { coding: [{ code: '', system: 'http://snomed.info/sct', display: '' }] },
      },
    ],
    ...initialData,
  };

  const form = useForm<AllergyIntolerance>({
    resolver: zodResolver(AllergyIntoleranceSchema),
    defaultValues,
  });

  const addReaction = () => {
    setReactions((prev) => [...prev, { id: Math.max(...prev.map((f) => f.id)) + 1 }]);

    // Get the current reactions array
    const currentReactions = form.getValues('reaction') || [];

    // Add a new reaction with the required fields
    form.setValue('reaction', [
      ...currentReactions,
      {
        manifestation: [{ coding: [{ code: '', system: 'http://snomed.info/sct', display: '' }] }],
        substance: { coding: [{ code: '', system: 'http://snomed.info/sct', display: '' }] },
      },
    ]);
  };

  const removeReaction = (id: number) => {
    const index = reactions.findIndex((item) => item.id === id);
    setReactions((prev) => prev.filter((reaction) => reaction.id !== id));

    // Get the current reactions array
    const currentReactions = form.getValues('reaction') || [];

    // Remove the reaction at the specified index
    if (index !== -1 && currentReactions.length > index) {
      const newReactions = [...currentReactions];
      newReactions.splice(index, 1);
      form.setValue('reaction', newReactions);
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
              icon={<AlertTriangle className="h-5 w-5" />}
              title="Basic Information"
              description="Essential details about the allergy or intolerance"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="clinicalStatus.coding.0.code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Clinical Status
                      <InfoTooltip content="Current status of the allergy (active, inactive, resolved)" />
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
                      <InfoTooltip content="Verification status of the allergy (confirmed, unconfirmed, refuted)" />
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Type
                      <InfoTooltip content="Whether this is an allergy or an intolerance" />
                    </FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="allergy">Allergy</SelectItem>
                          <SelectItem value="intolerance">Intolerance</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Category
                      <InfoTooltip content="Category of the adverse reaction (food, medication, environment, biologic)" />
                    </FormLabel>
                    <FormControl>
                      <Select onValueChange={(value) => field.onChange([value])} defaultValue={field.value?.[0]}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
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
                name="criticality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Criticality
                      <InfoTooltip content="Estimated potential clinical harm (low, high, unable to assess)" />
                    </FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select criticality" />
                        </SelectTrigger>
                        <SelectContent>
                          {CRITICALITY.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                              {level.label}
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

          {/* Allergy Details */}
          <div className="space-y-4">
            <SectionHeader
              icon={<Thermometer className="h-5 w-5" />}
              title="Allergy Details"
              description="Specific information about the allergy or intolerance"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="code.coding.0.code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Allergy Code
                      <InfoTooltip content="Code that identifies the allergy or intolerance" />
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter allergy code" {...field} />
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
                      Allergy Description
                      <InfoTooltip content="Description of the allergy or intolerance" />
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter allergy description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="onsetDateTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Onset Date
                      <InfoTooltip content="When the allergy or intolerance was identified" />
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

              <FormField
                control={form.control}
                name="recordedDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Recorded Date
                      <InfoTooltip content="When the allergy was recorded" />
                    </FormLabel>
                    <FormControl>
                      <SmartDatetimeInput
                        value={field.value ? new Date(field.value) : null}
                        onValueChange={(date) => {
                          field.onChange(date ? date.toISOString() : undefined);
                        }}
                        placeholder="e.g. Today"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastOccurrence"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Last Occurrence
                      <InfoTooltip content="When the allergy last manifested" />
                    </FormLabel>
                    <FormControl>
                      <SmartDatetimeInput
                        value={field.value ? new Date(field.value) : null}
                        onValueChange={(date) => {
                          field.onChange(date ? date.toISOString() : undefined);
                        }}
                        placeholder="e.g. Yesterday"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Reactions */}
          <div className="space-y-4">
            <SectionHeader
              icon={<AlertCircle className="h-5 w-5" />}
              title="Reactions"
              description="Details about reactions to this allergy or intolerance"
            />

            <div className="flex items-center justify-between mb-1">
              <h3 className="text-md font-medium flex items-center">
                Reaction Details
                <InfoTooltip content="Add all reactions associated with this allergy or intolerance" />
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addReaction}
                className="flex items-center gap-1"
              >
                <PlusCircle className="h-4 w-4" /> Add Reaction
              </Button>
            </div>

            {reactions.map((reaction, index) => (
              <Card key={reaction.id} className="relative border-muted">
                <CardContent className="pt-6">
                  {reactions.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                      onClick={() => removeReaction(reaction.id)}
                    >
                      <MinusCircle className="h-4 w-4" />
                    </Button>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`reaction.${index}.substance.coding.0.code`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Substance Code
                            <InfoTooltip content="Code for the specific substance that caused the reaction" />
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Enter substance code" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`reaction.${index}.substance.coding.0.display`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Substance Name
                            <InfoTooltip content="Name of the specific substance that caused the reaction" />
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Enter substance name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <FormField
                      control={form.control}
                      name={`reaction.${index}.manifestation.0.coding.0.code`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Manifestation Code
                            <InfoTooltip content="Code for the clinical manifestation of the reaction" />
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Enter manifestation code" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`reaction.${index}.manifestation.0.coding.0.display`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Manifestation Description
                            <InfoTooltip content="Description of the clinical manifestation of the reaction" />
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Enter manifestation description" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <FormField
                      control={form.control}
                      name={`reaction.${index}.severity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Severity
                            <InfoTooltip content="Severity of the reaction (mild, moderate, severe)" />
                          </FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select severity" />
                              </SelectTrigger>
                              <SelectContent>
                                {SEVERITY.map((level) => (
                                  <SelectItem key={level.value} value={level.value}>
                                    {level.label}
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
                      name={`reaction.${index}.onset`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Reaction Onset
                            <InfoTooltip content="When the reaction occurred" />
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
                  </div>

                  <div className="mt-4">
                    <FormField
                      control={form.control}
                      name={`reaction.${index}.note`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Notes
                            <InfoTooltip content="Additional notes about this specific reaction" />
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter notes about the reaction"
                              className="min-h-[100px]"
                              value={field.value?.[0]?.text || ''}
                              onChange={(e) => {
                                const updatedNote = [{ text: e.target.value }];
                                field.onChange(updatedNote);
                              }}
                            />
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

          {/* Clinical Notes */}
          <div className="space-y-4">
            <SectionHeader
              icon={<FileText className="h-5 w-5" />}
              title="Clinical Notes"
              description="Additional information about this allergy or intolerance"
            />

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Clinical Notes
                    <InfoTooltip content="Additional clinical notes about this allergy or intolerance" />
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter any additional notes"
                      className="min-h-[100px]"
                      value={field.value?.[0]?.text || ''}
                      onChange={(e) => {
                        const updatedNote = [{ text: e.target.value }];
                        field.onChange(updatedNote);
                      }}
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
            Save Allergy/Intolerance
          </Button>
        </form>
      </Form>
    </div>
  );
}

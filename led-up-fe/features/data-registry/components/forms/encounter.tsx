'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EncounterSchema, type Encounter } from '@/features/data-registry/types/fhir/encounter';
import { useState } from 'react';
import { MinusCircle, PlusCircle, AlertCircle, Calendar, Users, FileText, Activity, HelpCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { SmartDatetimeInput } from '@/components/ui/custom/smart-date-input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const ENCOUNTER_STATUSES = [
  { value: 'planned', label: 'Planned' },
  { value: 'arrived', label: 'Arrived' },
  { value: 'triaged', label: 'Triaged' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'onleave', label: 'On Leave' },
  { value: 'finished', label: 'Finished' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'entered-in-error', label: 'Entered in Error' },
  { value: 'unknown', label: 'Unknown' },
];

const ENCOUNTER_TYPES = [
  { value: 'ACUTE', label: 'Acute Care' },
  { value: 'NONAC', label: 'Non-Acute Care' },
  { value: 'PRENC', label: 'Prenatal Care' },
  { value: 'EMER', label: 'Emergency Care' },
  { value: 'FUP', label: 'Follow-up Visit' },
  { value: 'ROUTN', label: 'Routine Visit' },
];

const ENCOUNTER_CLASSES = [
  { value: 'AMB', label: 'Ambulatory', system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode' },
  { value: 'EMER', label: 'Emergency', system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode' },
  { value: 'IMP', label: 'Inpatient', system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode' },
  { value: 'ACUTE', label: 'Acute', system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode' },
  { value: 'OBSENC', label: 'Observation', system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode' },
  { value: 'VR', label: 'Virtual', system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode' },
];

const PARTICIPANT_TYPES = [
  { value: 'PPRF', label: 'Primary Performer', system: 'http://terminology.hl7.org/CodeSystem/v3-ParticipationType' },
  { value: 'SPRF', label: 'Secondary Performer', system: 'http://terminology.hl7.org/CodeSystem/v3-ParticipationType' },
  { value: 'CON', label: 'Consultant', system: 'http://terminology.hl7.org/CodeSystem/v3-ParticipationType' },
  { value: 'REF', label: 'Referrer', system: 'http://terminology.hl7.org/CodeSystem/v3-ParticipationType' },
  { value: 'ADM', label: 'Admitter', system: 'http://terminology.hl7.org/CodeSystem/v3-ParticipationType' },
  { value: 'ATND', label: 'Attender', system: 'http://terminology.hl7.org/CodeSystem/v3-ParticipationType' },
  { value: 'CALLBCK', label: 'Callback Contact', system: 'http://terminology.hl7.org/CodeSystem/v3-ParticipationType' },
  { value: 'DIS', label: 'Discharger', system: 'http://terminology.hl7.org/CodeSystem/v3-ParticipationType' },
];

export function EncounterForm({
  onSubmit,
  initialData,
  patientReference,
}: {
  onSubmit: (data: Encounter) => void;
  initialData?: Partial<Encounter>;
  patientReference: string;
}) {
  const [participants, setParticipants] = useState([{ id: 0 }]);
  const [reasonCodes, setReasonCodes] = useState([{ id: 0 }]);
  const [formError, setFormError] = useState<string | null>(null);

  // Set up default values for the form
  const defaultValues: Partial<Encounter> = {
    resourceType: 'Encounter',
    status: 'planned',
    class_: { code: 'AMB', system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode' },
    subject: { reference: patientReference },
    type: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/encounter-type',
            code: 'ROUTN',
            display: 'Routine Visit',
          },
        ],
      },
    ],
    participant: [
      {
        type: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/v3-ParticipationType',
                code: 'PPRF',
                display: 'Primary Performer',
              },
            ],
          },
        ],
        individual: {
          reference: '',
          display: '',
        },
      },
    ],
    reasonCode: [
      {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: '',
            display: '',
          },
        ],
      },
    ],
    ...initialData,
  };

  const form = useForm<Encounter>({
    resolver: zodResolver(EncounterSchema),
    defaultValues,
  });

  const addField = (
    fieldType: 'participant' | 'reasonCode',
    setterFunction: React.Dispatch<React.SetStateAction<{ id: number }[]>>
  ) => {
    setterFunction((prev) => [...prev, { id: Math.max(...prev.map((f) => f.id)) + 1 }]);
  };

  const removeField = (
    fieldType: 'participant' | 'reasonCode',
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
          {/* Basic Information */}
          <div className="space-y-4">
            <SectionHeader
              icon={<Activity className="h-5 w-5" />}
              title="Basic Information"
              description="Essential details about the encounter"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Status
                      <InfoTooltip content="Current status of the encounter" />
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ENCOUNTER_STATUSES.map((status) => (
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
                name="class_.code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Class
                      <InfoTooltip content="Classification of the encounter (e.g., ambulatory, inpatient)" />
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select encounter class" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ENCOUNTER_CLASSES.map((cls) => (
                          <SelectItem key={cls.value} value={cls.value}>
                            {cls.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type.0.coding.0.code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Type
                      <InfoTooltip content="The type of encounter (e.g., routine visit, emergency)" />
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select encounter type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ENCOUNTER_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
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
                name="type.0.coding.0.system"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Type System
                      <InfoTooltip content="The coding system for the encounter type" />
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter type system"
                        defaultValue="http://terminology.hl7.org/CodeSystem/encounter-type"
                        {...field}
                        value={field.value || 'http://terminology.hl7.org/CodeSystem/encounter-type'}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Timing Information */}
          <div className="space-y-4">
            <SectionHeader
              icon={<Calendar className="h-5 w-5" />}
              title="Timing Information"
              description="When the encounter started and ended"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="period.start"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Start Date
                      <InfoTooltip content="When the encounter started" />
                    </FormLabel>
                    <FormControl>
                      <SmartDatetimeInput
                        value={field.value ? new Date(field.value) : null}
                        onValueChange={(date) => {
                          field.onChange(date ? date.toISOString() : undefined);
                        }}
                        placeholder="e.g. Today at 9am"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="period.end"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      End Date
                      <InfoTooltip content="When the encounter ended" />
                    </FormLabel>
                    <FormControl>
                      <SmartDatetimeInput
                        value={field.value ? new Date(field.value) : null}
                        onValueChange={(date) => {
                          field.onChange(date ? date.toISOString() : undefined);
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

          {/* Participants */}
          <div className="space-y-4">
            <SectionHeader
              icon={<Users className="h-5 w-5" />}
              title="Participants"
              description="Healthcare providers involved in this encounter"
            />

            <div className="flex items-center justify-between mb-1">
              <h3 className="text-md font-medium flex items-center">
                Encounter Participants
                <InfoTooltip content="Add all healthcare providers involved in this encounter" />
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addField('participant', setParticipants)}
                className="flex items-center gap-1"
              >
                <PlusCircle className="h-4 w-4" /> Add Participant
              </Button>
            </div>

            {participants.map((participant, index) => (
              <Card key={participant.id} className="relative border-muted">
                <CardContent className="pt-6">
                  {participants.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                      onClick={() => removeField('participant', participant.id, setParticipants)}
                    >
                      <MinusCircle className="h-4 w-4" />
                    </Button>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`participant.${index}.type.0.coding.0.code`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Participant Type
                            <InfoTooltip content="The role of the participant in this encounter" />
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select participant type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {PARTICIPANT_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
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
                      name={`participant.${index}.type.0.coding.0.system`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Participant Type System
                            <InfoTooltip content="The coding system for the participant type" />
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter system"
                              defaultValue="http://terminology.hl7.org/CodeSystem/v3-ParticipationType"
                              {...field}
                              value={field.value || 'http://terminology.hl7.org/CodeSystem/v3-ParticipationType'}
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
                      name={`participant.${index}.individual.reference`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Individual Reference
                            <InfoTooltip content="Reference to the healthcare provider (e.g., Practitioner/123)" />
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Enter individual reference" {...field} value={field.value || ''} />
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

          {/* Reason Codes */}
          <div className="space-y-4">
            <SectionHeader
              icon={<FileText className="h-5 w-5" />}
              title="Reason Codes"
              description="Reasons for this encounter"
            />

            <div className="flex items-center justify-between mb-1">
              <h3 className="text-md font-medium flex items-center">
                Encounter Reasons
                <InfoTooltip content="Add all reasons for this encounter" />
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addField('reasonCode', setReasonCodes)}
                className="flex items-center gap-1"
              >
                <PlusCircle className="h-4 w-4" /> Add Reason
              </Button>
            </div>

            {reasonCodes.map((reason, index) => (
              <Card key={reason.id} className="relative border-muted">
                <CardContent className="pt-6">
                  {reasonCodes.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                      onClick={() => removeField('reasonCode', reason.id, setReasonCodes)}
                    >
                      <MinusCircle className="h-4 w-4" />
                    </Button>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`reasonCode.${index}.coding.0.system`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Coding System
                            <InfoTooltip content="The coding system for this reason (e.g., SNOMED CT)" />
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter coding system"
                              defaultValue="http://snomed.info/sct"
                              {...field}
                              value={field.value || 'http://snomed.info/sct'}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`reasonCode.${index}.coding.0.code`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Reason Code
                            <InfoTooltip content="The standardized code for this reason" />
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Enter reason code" {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="mt-4">
                    <FormField
                      control={form.control}
                      name={`reasonCode.${index}.coding.0.display`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Reason Description
                            <InfoTooltip content="The human-readable description of the reason" />
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Enter reason description" {...field} value={field.value || ''} />
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

          <Button
            type="submit"
            className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white font-medium py-5 px-8"
          >
            Save Encounter
          </Button>
        </form>
      </Form>
    </div>
  );
}

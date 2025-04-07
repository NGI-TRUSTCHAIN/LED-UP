'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppointmentSchema, type Appointment } from '@/features/data-registry/types/fhir/appointment';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, MinusCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';

const APPOINTMENT_STATUSES = [
  { value: 'proposed', label: 'Proposed' },
  { value: 'pending', label: 'Pending' },
  { value: 'booked', label: 'Booked' },
  { value: 'arrived', label: 'Arrived' },
  { value: 'fulfilled', label: 'Fulfilled' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'noshow', label: 'No Show' },
  { value: 'entered-in-error', label: 'Entered in Error' },
  { value: 'checked-in', label: 'Checked In' },
  { value: 'waitlist', label: 'Waitlist' },
];

const PARTICIPANT_REQUIRED = [
  { value: 'required', label: 'Required' },
  { value: 'optional', label: 'Optional' },
  { value: 'information-only', label: 'Information Only' },
];

const PARTICIPANT_STATUS = [
  { value: 'accepted', label: 'Accepted' },
  { value: 'declined', label: 'Declined' },
  { value: 'tentative', label: 'Tentative' },
  { value: 'needs-action', label: 'Needs Action' },
];

export function AppointmentForm({
  onSubmit,
  initialData,
  patientReference,
}: {
  onSubmit: (data: Appointment) => void;
  initialData?: Partial<Appointment>;
  patientReference: string;
}) {
  const [participants, setParticipants] = useState([{ id: 0 }]);
  const [serviceCategories, setServiceCategories] = useState([{ id: 0 }]);

  const form = useForm<Appointment>({
    resolver: zodResolver(AppointmentSchema),
    defaultValues: {
      resourceType: 'Appointment',
      status: 'proposed',
      start: new Date().toISOString(),
      end: new Date(Date.now() + 30 * 60000).toISOString(), // 30 minutes from now
      participant: [
        {
          type: [{ coding: [{ code: 'ATND', system: 'http://terminology.hl7.org/CodeSystem/v3-ParticipationType' }] }],
          actor: { reference: patientReference },
          required: 'required',
          status: 'needs-action',
        },
      ],
      ...initialData,
    },
  });

  const addParticipant = () => {
    setParticipants((prev) => [...prev, { id: Math.max(...prev.map((f) => f.id)) + 1 }]);
  };

  const removeParticipant = (id: number) => {
    setParticipants((prev) => prev.filter((participant) => participant.id !== id));
  };

  const addServiceCategory = () => {
    setServiceCategories((prev) => [...prev, { id: Math.max(...prev.map((f) => f.id)) + 1 }]);
  };

  const removeServiceCategory = (id: number) => {
    setServiceCategories((prev) => prev.filter((category) => category.id !== id));
  };

  return (
    <div className="w-full rounded-md mb-5">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-3xl mx-auto bg-background border p-3">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                        {APPOINTMENT_STATUSES.map((status) => (
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
                name="appointmentType.coding.0.code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Appointment Type</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter appointment type code" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormDescription>Lower numbers = higher priority</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter appointment description" className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Timing Information */}
          <Card>
            <CardHeader>
              <CardTitle>Timing Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="start"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="minutesDuration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Service Categories */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Service Categories</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addServiceCategory}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {serviceCategories.map((category, index) => (
                <div key={category.id} className="space-y-4 border p-4 rounded-lg relative">
                  {serviceCategories.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => removeServiceCategory(category.id)}
                    >
                      <MinusCircle className="h-4 w-4" />
                    </Button>
                  )}
                  <FormField
                    control={form.control}
                    name={`serviceCategory.${index}.coding.0.code`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category Code</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter category code" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`serviceCategory.${index}.coding.0.display`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter category name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Participants */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Participants</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addParticipant}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Participant
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {participants.map((participant, index) => (
                <div key={participant.id} className="space-y-4 border p-4 rounded-lg relative">
                  {participants.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => removeParticipant(participant.id)}
                    >
                      <MinusCircle className="h-4 w-4" />
                    </Button>
                  )}
                  <FormField
                    control={form.control}
                    name={`participant.${index}.actor.reference`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Participant Reference</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter participant reference" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`participant.${index}.required`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Required Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select required status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PARTICIPANT_REQUIRED.map((status) => (
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
                    name={`participant.${index}.status`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Participation Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select participation status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PARTICIPANT_STATUS.map((status) => (
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
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comments</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter any additional comments" className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="patientInstruction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient Instructions</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter instructions for the patient" className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit">Save Appointment</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

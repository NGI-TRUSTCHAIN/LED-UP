'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CarePlanSchema, type CarePlan } from '@/features/data-registry/types/fhir/care-plan';
import { useState } from 'react';
import { MinusCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';

const CARE_PLAN_STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'on-hold', label: 'On Hold' },
  { value: 'revoked', label: 'Revoked' },
  { value: 'completed', label: 'Completed' },
  { value: 'entered-in-error', label: 'Entered in Error' },
  { value: 'unknown', label: 'Unknown' },
];

const CARE_PLAN_INTENTS = [
  { value: 'proposal', label: 'Proposal' },
  { value: 'plan', label: 'Plan' },
  { value: 'order', label: 'Order' },
  { value: 'option', label: 'Option' },
];

export function CarePlanForm({
  onSubmit,
  initialData,
  patientReference,
}: {
  onSubmit: (data: CarePlan) => void;
  initialData?: Partial<CarePlan>;
  patientReference: string;
}) {
  const [categories, setCategories] = useState([{ id: 0 }]);
  const [activities, setActivities] = useState([{ id: 0 }]);
  const [goals, setGoals] = useState([{ id: 0 }]);

  const form = useForm<CarePlan>({
    resolver: zodResolver(CarePlanSchema),
    defaultValues: {
      resourceType: 'CarePlan',
      subject: { reference: patientReference },
      status: 'draft',
      intent: 'plan',
      created: new Date().toISOString(),
      ...initialData,
    },
  });

  const addField = (
    fieldType: 'category' | 'activity' | 'goal',
    setterFunction: React.Dispatch<React.SetStateAction<{ id: number }[]>>
  ) => {
    setterFunction((prev) => [...prev, { id: Math.max(...prev.map((f) => f.id)) + 1 }]);
  };

  const removeField = (
    fieldType: 'category' | 'activity' | 'goal',
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
                        {CARE_PLAN_STATUSES.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Current status of the care plan</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-6">
              <FormField
                control={form.control}
                name="intent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Intent</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select intent" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CARE_PLAN_INTENTS.map((intent) => (
                          <SelectItem key={intent.value} value={intent.value}>
                            {intent.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>The intent of the care plan</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter care plan title" />
                    </FormControl>
                    <FormDescription>Human-friendly name for the care plan</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter care plan description" {...field} />
                    </FormControl>
                    <FormDescription>Summary of nature and aim of the care plan</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Categories</h3>
              <Button type="button" variant="outline" size="sm" onClick={() => addField('category', setCategories)}>
                Add Category
              </Button>
            </div>

            {categories.map((category, index) => (
              <div key={category.id} className="grid grid-cols-12 gap-4 relative">
                {categories.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => removeField('category', category.id, setCategories)}
                  >
                    <MinusCircle className="h-4 w-4" />
                  </Button>
                )}
                <div className="col-span-6">
                  <FormField
                    control={form.control}
                    name={`category.${index}.coding.0.code`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category Code</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter category code" />
                        </FormControl>
                        <FormDescription>Code for the care plan category</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="col-span-6">
                  <FormField
                    control={form.control}
                    name={`category.${index}.coding.0.display`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter category name" />
                        </FormControl>
                        <FormDescription>Display name for the category</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Goals</h3>
              <Button type="button" variant="outline" size="sm" onClick={() => addField('goal', setGoals)}>
                Add Goal
              </Button>
            </div>

            {goals.map((goal, index) => (
              <div key={goal.id} className="grid grid-cols-12 gap-4 relative">
                {goals.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => removeField('goal', goal.id, setGoals)}
                  >
                    <MinusCircle className="h-4 w-4" />
                  </Button>
                )}
                <div className="col-span-12">
                  <FormField
                    control={form.control}
                    name={`goal.${index}.reference`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Goal Reference</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter goal reference" />
                        </FormControl>
                        <FormDescription>Reference to a goal this plan addresses</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Activities</h3>
              <Button type="button" variant="outline" size="sm" onClick={() => addField('activity', setActivities)}>
                Add Activity
              </Button>
            </div>

            {activities.map((activity, index) => (
              <div key={activity.id} className="grid grid-cols-12 gap-4 relative">
                {activities.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => removeField('activity', activity.id, setActivities)}
                  >
                    <MinusCircle className="h-4 w-4" />
                  </Button>
                )}
                <div className="col-span-12">
                  <FormField
                    control={form.control}
                    name={`activity.${index}.detail.status`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Activity Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value as string}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select activity status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="not-started">Not Started</SelectItem>
                            <SelectItem value="scheduled">Scheduled</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="on-hold">On Hold</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>Current state of the activity</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="col-span-12">
                  <FormField
                    control={form.control}
                    name={`activity.${index}.detail.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Activity Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Enter activity description" value={field.value as string} />
                        </FormControl>
                        <FormDescription>Description of the activity to be performed</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))}
          </div>

          <Button type="submit" className="w-full">
            Save Care Plan
          </Button>
        </form>
      </Form>
    </div>
  );
}

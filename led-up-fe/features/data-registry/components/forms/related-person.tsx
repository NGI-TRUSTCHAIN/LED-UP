'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RelatedPersonSchema, type RelatedPerson } from '@/features/data-registry/types/fhir/related-person';
import { useState } from 'react';
import { MinusCircle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'unknown', label: 'Unknown' },
];

const RELATIONSHIP_TYPES = [
  { value: 'FAMMEMB', label: 'Family Member' },
  { value: 'GUARD', label: 'Guardian' },
  { value: 'POWATY', label: 'Power of Attorney' },
  { value: 'CAREGIVER', label: 'Caregiver' },
  { value: 'ECON', label: 'Emergency Contact' },
  { value: 'AGNT', label: 'Agent' },
];

const CONTACT_TYPES = [
  { value: 'phone', label: 'Phone' },
  { value: 'email', label: 'Email' },
  { value: 'fax', label: 'Fax' },
  { value: 'url', label: 'URL' },
];

const CONTACT_USES = [
  { value: 'home', label: 'Home' },
  { value: 'work', label: 'Work' },
  { value: 'temp', label: 'Temporary' },
  { value: 'old', label: 'Old' },
  { value: 'mobile', label: 'Mobile' },
];

export function RelatedPersonForm({
  onSubmit,
  initialData,
  patientReference,
}: {
  onSubmit: (data: RelatedPerson) => void;
  initialData?: Partial<RelatedPerson>;
  patientReference: string;
}) {
  const [names, setNames] = useState([{ id: 0 }]);
  const [telecom, setTelecom] = useState([{ id: 0 }]);
  const [addresses, setAddresses] = useState([{ id: 0 }]);
  const [relationships, setRelationships] = useState([{ id: 0 }]);
  const [communications, setCommunications] = useState([{ id: 0 }]);

  const form = useForm<RelatedPerson>({
    resolver: zodResolver(RelatedPersonSchema),
    defaultValues: {
      resourceType: 'RelatedPerson',
      active: true,
      patient: { reference: patientReference },
      ...initialData,
    },
  });

  const addField = (
    fieldType: 'name' | 'telecom' | 'address' | 'relationship' | 'communication',
    setterFunction: React.Dispatch<React.SetStateAction<{ id: number }[]>>
  ) => {
    setterFunction((prev) => [...prev, { id: Math.max(...prev.map((f) => f.id)) + 1 }]);
  };

  const removeField = (
    fieldType: 'name' | 'telecom' | 'address' | 'relationship' | 'communication',
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
            <div className="col-span-12">
              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel>Active</FormLabel>
                    <FormDescription>Whether this related person's record is in active use</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-6">
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {GENDER_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Administrative gender - not clinical gender</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-6">
              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Birth Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormDescription>The date of birth for the related person</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Relationships</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addField('relationship', setRelationships)}
              >
                Add Relationship
              </Button>
            </div>

            {relationships.map((relationship, index) => (
              <div key={relationship.id} className="grid grid-cols-12 gap-4 relative">
                {relationships.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => removeField('relationship', relationship.id, setRelationships)}
                  >
                    <MinusCircle className="h-4 w-4" />
                  </Button>
                )}
                <div className="col-span-6">
                  <FormField
                    control={form.control}
                    name={`relationship.${index}.coding.0.code`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Relationship Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select relationship type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {RELATIONSHIP_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>The nature of the relationship</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-6">
                  <FormField
                    control={form.control}
                    name={`relationship.${index}.text`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Relationship Description</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter relationship description" />
                        </FormControl>
                        <FormDescription>Plain text representation of the relationship</FormDescription>
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
              <h3 className="text-lg font-medium">Names</h3>
              <Button type="button" variant="outline" size="sm" onClick={() => addField('name', setNames)}>
                Add Name
              </Button>
            </div>

            {names.map((name, index) => (
              <div key={name.id} className="grid grid-cols-12 gap-4 relative">
                {names.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => removeField('name', name.id, setNames)}
                  >
                    <MinusCircle className="h-4 w-4" />
                  </Button>
                )}
                <div className="col-span-6">
                  <FormField
                    control={form.control}
                    name={`name.${index}.use`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name Use</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select name use" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="official">Official</SelectItem>
                            <SelectItem value="usual">Usual</SelectItem>
                            <SelectItem value="nickname">Nickname</SelectItem>
                            <SelectItem value="anonymous">Anonymous</SelectItem>
                            <SelectItem value="old">Old</SelectItem>
                            <SelectItem value="maiden">Maiden</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>The use of this name</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-12">
                  <FormField
                    control={form.control}
                    name={`name.${index}.family`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Family Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter family name" />
                        </FormControl>
                        <FormDescription>Family name (often called 'Surname')</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-12">
                  <FormField
                    control={form.control}
                    name={`name.${index}.given.0`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Given Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter given name" />
                        </FormControl>
                        <FormDescription>Given names (including middle names)</FormDescription>
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
              <h3 className="text-lg font-medium">Contact Information</h3>
              <Button type="button" variant="outline" size="sm" onClick={() => addField('telecom', setTelecom)}>
                Add Contact
              </Button>
            </div>

            {telecom.map((contact, index) => (
              <div key={contact.id} className="grid grid-cols-12 gap-4 relative">
                {telecom.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => removeField('telecom', contact.id, setTelecom)}
                  >
                    <MinusCircle className="h-4 w-4" />
                  </Button>
                )}
                <div className="col-span-4">
                  <FormField
                    control={form.control}
                    name={`telecom.${index}.system`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select contact type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CONTACT_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>Type of contact point</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-4">
                  <FormField
                    control={form.control}
                    name={`telecom.${index}.value`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Value</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter contact details" />
                        </FormControl>
                        <FormDescription>The actual contact point details</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-4">
                  <FormField
                    control={form.control}
                    name={`telecom.${index}.use`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Use</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select use" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CONTACT_USES.map((use) => (
                              <SelectItem key={use.value} value={use.value}>
                                {use.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>Purpose of this contact point</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))}
          </div>

          <Button type="submit" className="w-full">
            Save Related Person
          </Button>
        </form>
      </Form>
    </div>
  );
}

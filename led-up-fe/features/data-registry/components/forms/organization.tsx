'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OrganizationSchema, type Organization } from '@/features/data-registry/types/fhir/organization';
import { useState } from 'react';
import { MinusCircle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

const ORGANIZATION_TYPES = [
  { value: 'prov', label: 'Healthcare Provider' },
  { value: 'dept', label: 'Hospital Department' },
  { value: 'team', label: 'Organizational Team' },
  { value: 'govt', label: 'Government' },
  { value: 'ins', label: 'Insurance Company' },
  { value: 'edu', label: 'Educational Institution' },
  { value: 'reli', label: 'Religious Institution' },
  { value: 'crs', label: 'Clinical Research Sponsor' },
];

const CONTACT_TYPES = [
  { value: 'phone', label: 'Phone' },
  { value: 'email', label: 'Email' },
  { value: 'fax', label: 'Fax' },
  { value: 'url', label: 'URL' },
];

const CONTACT_PURPOSES = [
  { value: 'ADMIN', label: 'Administrative' },
  { value: 'BILL', label: 'Billing' },
  { value: 'HR', label: 'Human Resources' },
  { value: 'PRESS', label: 'Press/Media' },
  { value: 'PATINF', label: 'Patient Information' },
];

export function OrganizationForm({
  onSubmit,
  initialData,
}: {
  onSubmit: (data: Organization) => void;
  initialData?: Partial<Organization>;
}) {
  const [identifiers, setIdentifiers] = useState([{ id: 0 }]);
  const [types, setTypes] = useState([{ id: 0 }]);
  const [aliases, setAliases] = useState([{ id: 0 }]);
  const [telecom, setTelecom] = useState([{ id: 0 }]);
  const [addresses, setAddresses] = useState([{ id: 0 }]);
  const [contacts, setContacts] = useState([{ id: 0 }]);
  const [endpoints, setEndpoints] = useState([{ id: 0 }]);

  const form = useForm<Organization>({
    resolver: zodResolver(OrganizationSchema),
    defaultValues: {
      resourceType: 'Organization',
      active: true,
      ...initialData,
    },
  });

  const addField = (
    fieldType: 'identifier' | 'type' | 'alias' | 'telecom' | 'address' | 'contact' | 'endpoint',
    setterFunction: React.Dispatch<React.SetStateAction<{ id: number }[]>>
  ) => {
    setterFunction((prev) => [...prev, { id: Math.max(...prev.map((f) => f.id)) + 1 }]);
  };

  const removeField = (
    fieldType: 'identifier' | 'type' | 'alias' | 'telecom' | 'address' | 'contact' | 'endpoint',
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
                    <FormDescription>Whether this organization's record is in active use</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-12">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter organization name" />
                    </FormControl>
                    <FormDescription>The name by which this organization is known</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-12">
              <FormField
                control={form.control}
                name="partOf.reference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent Organization</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter parent organization reference" />
                    </FormControl>
                    <FormDescription>Reference to the parent organization (if any)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Identifiers</h3>
              <Button type="button" variant="outline" size="sm" onClick={() => addField('identifier', setIdentifiers)}>
                Add Identifier
              </Button>
            </div>

            {identifiers.map((identifier, index) => (
              <div key={identifier.id} className="grid grid-cols-12 gap-4 relative">
                {identifiers.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => removeField('identifier', identifier.id, setIdentifiers)}
                  >
                    <MinusCircle className="h-4 w-4" />
                  </Button>
                )}
                <div className="col-span-6">
                  <FormField
                    control={form.control}
                    name={`identifier.${index}.system`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>System</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter identifier system" />
                        </FormControl>
                        <FormDescription>The namespace for the identifier value</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-6">
                  <FormField
                    control={form.control}
                    name={`identifier.${index}.value`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Value</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter identifier value" />
                        </FormControl>
                        <FormDescription>The value that is unique within the system</FormDescription>
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
              <h3 className="text-lg font-medium">Organization Types</h3>
              <Button type="button" variant="outline" size="sm" onClick={() => addField('type', setTypes)}>
                Add Type
              </Button>
            </div>

            {types.map((type, index) => (
              <div key={type.id} className="grid grid-cols-12 gap-4 relative">
                {types.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => removeField('type', type.id, setTypes)}
                  >
                    <MinusCircle className="h-4 w-4" />
                  </Button>
                )}
                <div className="col-span-12">
                  <FormField
                    control={form.control}
                    name={`type.${index}.coding.0.code`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organization Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select organization type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {ORGANIZATION_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>The kind of organization</FormDescription>
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
              <h3 className="text-lg font-medium">Aliases</h3>
              <Button type="button" variant="outline" size="sm" onClick={() => addField('alias', setAliases)}>
                Add Alias
              </Button>
            </div>

            {aliases.map((alias, index) => (
              <div key={alias.id} className="grid grid-cols-12 gap-4 relative">
                {aliases.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => removeField('alias', alias.id, setAliases)}
                  >
                    <MinusCircle className="h-4 w-4" />
                  </Button>
                )}
                <div className="col-span-12">
                  <FormField
                    control={form.control}
                    name={`alias.${index}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alias</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter organization alias" />
                        </FormControl>
                        <FormDescription>Alternative name by which the organization is known</FormDescription>
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
                <div className="col-span-6">
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

                <div className="col-span-6">
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
              </div>
            ))}
          </div>

          <Button type="submit" className="w-full">
            Save Organization
          </Button>
        </form>
      </Form>
    </div>
  );
}

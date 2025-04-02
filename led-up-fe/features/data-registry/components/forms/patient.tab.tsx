'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { PatientSchema, type Patient } from '@/features/data-registry/types/fhir/patient';
import { useState } from 'react';
import { MinusCircle, PlusCircle, Info, User, Phone, MapPin } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export function PatientForm({
  onSubmit,
  initialData,
}: {
  onSubmit: (data: Patient) => void;
  initialData?: Partial<Patient>;
}) {
  const [activeTab, setActiveTab] = useState('basic');
  const [nameFields, setNameFields] = useState([{ id: 0 }]);
  const [telecomFields, setTelecomFields] = useState([{ id: 0 }]);
  const [addressFields, setAddressFields] = useState([{ id: 0 }]);

  // Create default values with sensible defaults
  const defaultValues: Partial<Patient> = {
    resourceType: 'Patient',
    active: true,
    identifier: [],
    name: [{ use: 'official', family: '', given: [] }],
    telecom: [{ system: 'phone', value: '', use: 'home' }],
    address: [{ use: 'home', type: 'physical', line: [], city: '', state: '', postalCode: '', country: 'US' }],
    gender: 'unknown',
    ...initialData,
  };

  const form = useForm<Patient>({
    resolver: zodResolver(PatientSchema),
    defaultValues,
  });

  const addField = (
    fieldType: 'name' | 'telecom' | 'address',
    setterFunction: React.Dispatch<React.SetStateAction<{ id: number }[]>>
  ) => {
    setterFunction((prev) => [...prev, { id: Math.max(...prev.map((f) => f.id), 0) + 1 }]);
  };

  const removeField = (
    fieldType: 'name' | 'telecom' | 'address',
    id: number,
    setterFunction: React.Dispatch<React.SetStateAction<{ id: number }[]>>
  ) => {
    setterFunction((prev) => prev.filter((field) => field.id !== id));
  };

  const InfoTooltip = ({ content }: { content: string }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="h-4 w-4 text-muted-foreground ml-1 inline cursor-help" />
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className="rounded-md mb-5">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-3xl mx-auto bg-background">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1">
            <TabsList className="mb-6 bg-muted/50 p-1 rounded-lg">
              <TabsTrigger
                value="basic"
                className={cn(
                  'rounded-full border-2 border-transparent flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all hover:bg-primary/10',
                  activeTab === 'basic' ? 'text-primary font-medium border-primary' : 'text-muted-foreground'
                )}
              >
                <User className="h-4 w-4" />
                Basic Information
              </TabsTrigger>
              <TabsTrigger
                value="contact"
                className={cn(
                  'rounded-full border-2 border-transparent flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all hover:bg-primary/10',
                  activeTab === 'contact' ? 'text-primary font-medium border-primary' : 'text-muted-foreground'
                )}
              >
                <Phone className="h-4 w-4" />
                Contact Details
              </TabsTrigger>
              <TabsTrigger
                value="address"
                className={cn(
                  'rounded-full border-2 border-transparent flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all hover:bg-primary/10',
                  activeTab === 'address'
                    ? 'text-primary font-medium border-primary hover:bg-primary/10'
                    : 'text-muted-foreground'
                )}
              >
                <MapPin className="h-4 w-4" />
                Addresses
              </TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic" className="flex-1">
              <Card>
                <CardHeader className="bg-muted/20 border-b">
                  <CardTitle>Patient Demographics</CardTitle>
                  <CardDescription>Enter the basic demographic information for this patient.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="flex items-center space-x-2">
                    <FormField
                      control={form.control}
                      name="active"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Active Patient Record</FormLabel>
                            <FormDescription>
                              Indicates if this patient record is currently in active use.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Gender
                            <InfoTooltip content="Administrative gender - not clinical gender" />
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                              <SelectItem value="unknown">Unknown</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="birthDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Date of Birth
                            <InfoTooltip content="The date of birth for the patient (YYYY-MM-DD)" />
                          </FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4 mt-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium flex items-center">
                        Patient Names
                        <InfoTooltip content="Add all relevant names for the patient (legal name, maiden name, etc.)" />
                      </h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addField('name', setNameFields)}
                        className="flex items-center gap-1"
                      >
                        <PlusCircle className="h-4 w-4" /> Add Name
                      </Button>
                    </div>

                    {nameFields.map((field, index) => (
                      <Card key={field.id} className="relative border-muted">
                        {nameFields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                            onClick={() => removeField('name', field.id, setNameFields)}
                          >
                            <MinusCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <CardContent className="pt-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`name.${index}.use`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Name Type</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select name type" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="official">Official/Legal</SelectItem>
                                      <SelectItem value="usual">Usual</SelectItem>
                                      <SelectItem value="temp">Temporary</SelectItem>
                                      <SelectItem value="nickname">Nickname</SelectItem>
                                      <SelectItem value="maiden">Maiden</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`name.${index}.family`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Family Name (Last Name)</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="Enter family name" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="mt-4">
                            <FormField
                              control={form.control}
                              name={`name.${index}.given`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Given Names (First & Middle)</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      onChange={(e) => field.onChange(e.target.value.split(' '))}
                                      value={(field.value || []).join(' ')}
                                      placeholder="Enter first and middle names separated by spaces"
                                    />
                                  </FormControl>
                                  <FormDescription>Enter all given names separated by spaces</FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Contact Information Tab */}
            <TabsContent value="contact" className="flex-1">
              <Card>
                <CardHeader className="bg-muted/20 border-b">
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>Add phone numbers, email addresses, and other contact methods.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium flex items-center">
                      Contact Methods
                      <InfoTooltip content="Add all relevant contact methods for the patient" />
                    </h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addField('telecom', setTelecomFields)}
                      className="flex items-center gap-1"
                    >
                      <PlusCircle className="h-4 w-4" /> Add Contact
                    </Button>
                  </div>

                  {telecomFields.map((field, index) => (
                    <Card key={field.id} className="relative border-muted">
                      {telecomFields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                          onClick={() => removeField('telecom', field.id, setTelecomFields)}
                        >
                          <MinusCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name={`telecom.${index}.system`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Contact Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="phone">Phone</SelectItem>
                                    <SelectItem value="email">Email</SelectItem>
                                    <SelectItem value="sms">SMS</SelectItem>
                                    <SelectItem value="fax">Fax</SelectItem>
                                    <SelectItem value="url">Website</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`telecom.${index}.value`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Contact Details</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Enter contact information" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`telecom.${index}.use`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Purpose</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select purpose" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="home">Home</SelectItem>
                                    <SelectItem value="work">Work</SelectItem>
                                    <SelectItem value="mobile">Mobile</SelectItem>
                                    <SelectItem value="temp">Temporary</SelectItem>
                                    <SelectItem value="old">Old</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Address Tab */}
            <TabsContent value="address" className="flex-1">
              <Card>
                <CardHeader className="bg-muted/20 border-b">
                  <CardTitle>Patient Addresses</CardTitle>
                  <CardDescription>Add home, work, or other addresses for this patient.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium flex items-center">
                      Addresses
                      <InfoTooltip content="Add all relevant addresses for the patient" />
                    </h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addField('address', setAddressFields)}
                      className="flex items-center gap-1"
                    >
                      <PlusCircle className="h-4 w-4" /> Add Address
                    </Button>
                  </div>

                  {addressFields.map((field, index) => (
                    <Card key={field.id} className="relative border-muted">
                      {addressFields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                          onClick={() => removeField('address', field.id, setAddressFields)}
                        >
                          <MinusCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`address.${index}.use`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Address Purpose</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select purpose" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="home">Home</SelectItem>
                                    <SelectItem value="work">Work</SelectItem>
                                    <SelectItem value="temp">Temporary</SelectItem>
                                    <SelectItem value="old">Old</SelectItem>
                                    <SelectItem value="billing">Billing</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`address.${index}.type`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Address Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="postal">Postal</SelectItem>
                                    <SelectItem value="physical">Physical</SelectItem>
                                    <SelectItem value="both">Both</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="mt-4">
                          <FormField
                            control={form.control}
                            name={`address.${index}.line`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Street Address</FormLabel>
                                <FormControl>
                                  <Textarea
                                    {...field}
                                    onChange={(e) => field.onChange(e.target.value.split('\n'))}
                                    value={(field.value || []).join('\n')}
                                    placeholder="Enter street address"
                                    rows={2}
                                  />
                                </FormControl>
                                <FormDescription>Enter each line of the address on a new line</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <FormField
                            control={form.control}
                            name={`address.${index}.city`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>City</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Enter city" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`address.${index}.state`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>State / Province</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Enter state or province" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <FormField
                            control={form.control}
                            name={`address.${index}.postalCode`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Postal / ZIP Code</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Enter postal code" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`address.${index}.country`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Country</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Enter country" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Button type="submit" className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white font-medium py-6">
            Save Patient Record
          </Button>
        </form>
      </Form>
    </div>
  );
}

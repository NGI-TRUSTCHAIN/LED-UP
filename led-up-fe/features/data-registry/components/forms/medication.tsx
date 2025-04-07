'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MedicationSchema, type Medication } from '@/features/data-registry/types/fhir/medication';
import { useState } from 'react';
import { MinusCircle, PlusCircle, AlertCircle, Pill, Beaker, Package, Calendar, Tag, HelpCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const MEDICATION_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'entered-in-error', label: 'Entered in Error' },
];

const CODING_SYSTEMS = [
  { value: 'http://www.nlm.nih.gov/research/umls/rxnorm', label: 'RxNorm' },
  { value: 'http://snomed.info/sct', label: 'SNOMED CT' },
  { value: 'http://hl7.org/fhir/sid/ndc', label: 'NDC' },
  { value: 'http://fdasis.nlm.nih.gov', label: 'UNII' },
];

export function MedicationForm({
  onSubmit,
  initialData,
}: {
  onSubmit: (data: Medication) => void;
  initialData?: Partial<Medication>;
}) {
  const [ingredients, setIngredients] = useState([{ id: 0 }]);
  const [formError, setFormError] = useState<string | null>(null);

  // Set up default values for the form
  const defaultValues: Partial<Medication> = {
    resourceType: 'Medication',
    status: 'active',
    code: {
      coding: [{ system: 'http://www.nlm.nih.gov/research/umls/rxnorm', code: 'CODE-12', display: 'Medication Code' }],
    },
    form: {
      coding: [{ system: 'http://snomed.info/sct', code: 'CODE-12', display: 'Form' }],
    },
    ingredient: [
      {
        itemCodeableConcept: {
          coding: [{ system: 'http://snomed.info/sct', code: '', display: '' }],
        },
        isActive: true,
      },
    ],
    ...initialData,
  };

  const form = useForm<Medication>({
    resolver: zodResolver(MedicationSchema),
    defaultValues,
  });

  // Monitor form validation errors
  const errors = form.formState.errors;

  const addIngredient = () => {
    setIngredients((prev) => [...prev, { id: Math.max(...prev.map((f) => f.id)) + 1 }]);

    // Get the current ingredients array
    const currentIngredients = form.getValues('ingredient') || [];

    // Add a new ingredient with the required system field
    form.setValue('ingredient', [
      ...currentIngredients,
      {
        itemCodeableConcept: {
          coding: [{ system: 'http://snomed.info/sct', code: '', display: '' }],
        },
        isActive: true,
      },
    ]);
  };

  const removeIngredient = (id: number) => {
    const index = ingredients.findIndex((item) => item.id === id);
    setIngredients((prev) => prev.filter((field) => field.id !== id));

    // Get the current ingredients array
    const currentIngredients = form.getValues('ingredient') || [];

    // Remove the ingredient at the specified index
    if (index !== -1 && currentIngredients.length > index) {
      const newIngredients = [...currentIngredients];
      newIngredients.splice(index, 1);
      form.setValue('ingredient', newIngredients);
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
          {/* Basic Medication Information */}
          <div className="space-y-4">
            <SectionHeader
              icon={<Pill className="h-5 w-5" />}
              title="Basic Medication Information"
              description="Essential details about the medication"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="code.coding.0.system"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Coding System
                      <InfoTooltip content="The coding system used for this medication" />
                    </FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select coding system" />
                        </SelectTrigger>
                        <SelectContent>
                          {CODING_SYSTEMS.map((system) => (
                            <SelectItem key={system.value} value={system.value}>
                              {system.label}
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
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Status
                      <InfoTooltip content="The status of the medication" />
                    </FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {MEDICATION_STATUSES.map((status) => (
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
                name="code.coding.0.code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Medication Code
                      <InfoTooltip content="The standardized code for this medication (e.g., RxNorm code)" />
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter medication code" {...field} />
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
                      Medication Name
                      <InfoTooltip content="The human-readable name of the medication" />
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter medication name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="form.coding.0.code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Form Code
                      <InfoTooltip content="The standardized code for the medication form" />
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter form code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="form.coding.0.display"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Form
                      <InfoTooltip content="The form of the medication (e.g., tablet, capsule, solution)" />
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter medication form (e.g., tablet, capsule)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Packaging Information */}
          <div className="space-y-4">
            <SectionHeader
              icon={<Package className="h-5 w-5" />}
              title="Packaging Information"
              description="Details about medication packaging and expiration"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount.numerator.value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Amount Value
                      <InfoTooltip content="The numeric amount of medication in the package" />
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter amount value"
                        {...field}
                        value={field.value as string}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount.numerator.unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Amount Unit
                      <InfoTooltip content="The unit for the amount (e.g., tablets, ml)" />
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., tablets, ml" {...field} value={field.value as string} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="batch.lotNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Lot Number
                      <InfoTooltip content="The lot number of the medication" />
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
                name="batch.expirationDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Expiration Date
                      <InfoTooltip content="The expiration date of the medication" />
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        value={field.value ? field.value.substring(0, 10) : ''}
                        onChange={(e) => {
                          const date = e.target.value ? new Date(e.target.value) : null;
                          field.onChange(date ? date.toISOString() : undefined);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Ingredients */}
          <div className="space-y-4">
            <SectionHeader
              icon={<Beaker className="h-5 w-5" />}
              title="Ingredients"
              description="Active and inactive ingredients in the medication"
            />

            <div className="flex items-center justify-between mb-1">
              <h3 className="text-md font-medium flex items-center">
                Medication Ingredients
                <InfoTooltip content="Add all ingredients contained in this medication" />
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addIngredient}
                className="flex items-center gap-1"
              >
                <PlusCircle className="h-4 w-4" /> Add Ingredient
              </Button>
            </div>

            {ingredients.map((field, index) => (
              <Card key={field.id} className="relative border-muted">
                <CardContent className="pt-6">
                  {ingredients.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                      onClick={() => removeIngredient(field.id)}
                    >
                      <MinusCircle className="h-4 w-4" />
                    </Button>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`ingredient.${index}.itemCodeableConcept.coding.0.system`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Ingredient System
                            <InfoTooltip content="The coding system used for this ingredient" />
                          </FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select coding system" />
                              </SelectTrigger>
                              <SelectContent>
                                {CODING_SYSTEMS.map((system) => (
                                  <SelectItem key={system.value} value={system.value}>
                                    {system.label}
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
                      name={`ingredient.${index}.itemCodeableConcept.coding.0.code`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Ingredient Code
                            <InfoTooltip content="The standardized code for this ingredient" />
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Enter ingredient code" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <FormField
                      control={form.control}
                      name={`ingredient.${index}.itemCodeableConcept.coding.0.display`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Ingredient Name
                            <InfoTooltip content="The human-readable name of the ingredient" />
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Enter ingredient name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`ingredient.${index}.strength.numerator.value`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Strength Value
                            <InfoTooltip content="The numeric strength of this ingredient" />
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Enter strength value"
                              {...field}
                              value={field.value as string}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <FormField
                      control={form.control}
                      name={`ingredient.${index}.strength.numerator.unit`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Strength Unit
                            <InfoTooltip content="The unit of measure for the ingredient strength (e.g., mg, ml)" />
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., mg, ml" {...field} value={field.value as string} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`ingredient.${index}.isActive`}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={(e) => field.onChange(e.target.checked)}
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                              aria-label="Active Ingredient"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Active Ingredient
                              <InfoTooltip content="Indicates if this is an active ingredient in the medication" />
                            </FormLabel>
                            <FormDescription>
                              Indicates if this is an active ingredient in the medication
                            </FormDescription>
                          </div>
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
            Save Medication
          </Button>
        </form>
      </Form>
    </div>
  );
}

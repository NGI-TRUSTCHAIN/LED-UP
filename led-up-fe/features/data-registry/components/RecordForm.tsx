'use client';

import * as React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ResourceType } from '../types';
import { getResourceTypeName } from '../utils/index';
import { useAccount } from 'wagmi';
import { isAddress } from 'viem';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Loader2, Upload, X, Plus, Trash } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Define the schema for the form
const formSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  description: z.string().min(5, 'Description must be at least 5 characters').max(1000),
  resourceType: z.number().int().min(0),
  producer: z.string().refine((val) => isAddress(val as `0x${string}`), {
    message: 'Invalid Ethereum address',
  }),
  keywords: z.array(z.string()).optional(),
  schema: z
    .object({
      url: z.string().url('Must be a valid URL').optional(),
      version: z.string().optional(),
    })
    .optional(),
  file: z.any().optional(),
  encryptMetadata: z.boolean().default(true),
  additionalData: z.string().optional(),
});

// Define the type based on the schema
type RecordFormValues = z.infer<typeof formSchema>;

// Type for the component props
interface RecordFormProps {
  initialData?: Partial<RecordFormValues>;
  onSubmit: (data: RecordFormValues) => void;
  isSubmitting: boolean;
  error?: string | null;
  mode?: 'create' | 'edit';
}

export function RecordForm({ initialData, onSubmit, isSubmitting, error, mode = 'create' }: RecordFormProps) {
  const { address } = useAccount();
  const [keywords, setKeywords] = useState<string[]>(initialData?.keywords || []);
  const [currentKeyword, setCurrentKeyword] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [additionalDataTab, setAdditionalDataTab] = useState<'input' | 'preview'>('input');
  const [additionalDataJson, setAdditionalDataJson] = useState<string>(initialData?.additionalData || '{}');
  const [additionalDataError, setAdditionalDataError] = useState<string | null>(null);

  // Initialize the form
  const form = useForm<RecordFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      resourceType: initialData?.resourceType || ResourceType.Basic,
      producer: initialData?.producer || address || '',
      encryptMetadata: initialData?.encryptMetadata ?? true,
      schema: initialData?.schema || { url: '', version: '' },
      additionalData: initialData?.additionalData || '{}',
    },
  });

  // Form submission handler
  const handleSubmit = (values: RecordFormValues) => {
    // Add keywords to the values
    values.keywords = keywords;

    // Handle file
    if (selectedFile) {
      values.file = selectedFile;
    }

    // Handle additional data
    try {
      const parsed = JSON.parse(additionalDataJson);
      values.additionalData = additionalDataJson;
    } catch (error) {
      setAdditionalDataError('Invalid JSON format');
      return;
    }

    // Send data to parent component
    onSubmit(values);
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Handle additional data input change
  const handleAdditionalDataChange = (value: string) => {
    setAdditionalDataJson(value);
    setAdditionalDataError(null);

    try {
      JSON.parse(value);
    } catch (error) {
      setAdditionalDataError('Invalid JSON format');
    }
  };

  // Handle adding a keyword
  const addKeyword = () => {
    if (currentKeyword.trim() && !keywords.includes(currentKeyword.trim())) {
      setKeywords([...keywords, currentKeyword.trim()]);
      setCurrentKeyword('');
    }
  };

  // Handle removing a keyword
  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter((k) => k !== keyword));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Record Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter a title for this record" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="producer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Producer Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter the producer's Ethereum address" {...field} disabled={mode === 'edit'} />
                  </FormControl>
                  <FormDescription>
                    {mode === 'create' ? 'The address that will own this record' : 'Producer address cannot be changed'}
                  </FormDescription>
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
                    <Textarea placeholder="Describe the record's content and purpose" className="min-h-32" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="resourceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resource Type</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value, 10))}
                    defaultValue={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a resource type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.keys(ResourceType)
                        .filter((key) => isNaN(Number(key)))
                        .map((type, index) => (
                          <SelectItem key={index} value={index.toString()}>
                            {getResourceTypeName(index)}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Keywords</FormLabel>
              <div className="flex items-center mt-2">
                <Input
                  placeholder="Add keywords"
                  value={currentKeyword}
                  onChange={(e) => setCurrentKeyword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addKeyword();
                    }
                  }}
                  className="flex-1"
                />
                <Button type="button" variant="secondary" size="sm" className="ml-2" onClick={addKeyword}>
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>
              {keywords.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {keywords.map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="px-2 py-1">
                      {keyword}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 ml-1"
                        onClick={() => removeKeyword(keyword)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <FormField
              control={form.control}
              name="encryptMetadata"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Encrypt Metadata</FormLabel>
                    <FormDescription>Enable to encrypt the metadata stored with this record</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Record Data</FormLabel>
              <Card className="mt-2 p-4 border-dashed">
                <CardContent className="p-0">
                  <div className="flex flex-col items-center justify-center p-4">
                    {selectedFile ? (
                      <div className="w-full">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{selectedFile.name}</span>
                          <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedFile(null)}>
                            <Trash className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground mb-2">Drag and drop a file or click to browse</p>
                        <Input type="file" className="hidden" id="file-upload" onChange={handleFileSelect} />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('file-upload')?.click()}
                        >
                          Select File
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <FormLabel>Schema Information</FormLabel>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <FormField
                  control={form.control}
                  name="schema.url"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Schema URL" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="schema.version"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Schema Version" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <FormLabel>Additional Data (JSON)</FormLabel>
          <Tabs
            value={additionalDataTab}
            onValueChange={(v: string) => setAdditionalDataTab(v as 'input' | 'preview')}
            className="mt-2"
          >
            <TabsList>
              <TabsTrigger value="input">JSON Input</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            <TabsContent value="input">
              <Textarea
                placeholder='{"key": "value"}'
                className="min-h-32 font-mono"
                value={additionalDataJson}
                onChange={(e) => handleAdditionalDataChange(e.target.value)}
              />
              {additionalDataError && <p className="text-sm text-red-500 mt-1">{additionalDataError}</p>}
            </TabsContent>
            <TabsContent value="preview">
              <div className="border rounded-md p-4 min-h-32 bg-muted/50">
                <pre className="text-sm overflow-auto whitespace-pre-wrap">
                  {additionalDataError ? (
                    <span className="text-red-500">Invalid JSON</span>
                  ) : (
                    JSON.stringify(JSON.parse(additionalDataJson || '{}'), null, 2)
                  )}
                </pre>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <Separator />

        <div className="flex justify-end space-x-4">
          <Button variant="outline" type="button" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === 'create' ? 'Create Record' : 'Update Record'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

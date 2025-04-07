'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

enum ConsentStatus {
  Allowed = 0,
  Denied = 1,
  Pending = 2,
}

const formSchema = z.object({
  file: z.instanceof(File).optional(),
  consent: z.nativeEnum(ConsentStatus),
});

type FormValues = z.infer<typeof formSchema>;

export function FileUploadWithConsent() {
  const [fileName, setFileName] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      consent: ConsentStatus.Pending,
    },
  });

  const onSubmit = async (data: FormValues) => {
    // Handle file upload and consent
    if (data.file) {
      try {
        // Create form data for file upload
        const formData = new FormData();
        formData.append('file', data.file);
        formData.append('consent', data.consent.toString());
        formData.append(
          'metadata',
          JSON.stringify({
            fileName: data.file.name,
            fileType: data.file.type,
            fileSize: data.file.size,
            uploadDate: new Date().toISOString(),
          })
        );

        // Get file type
        const fileType = data.file.type;

        // Send directly to the upload endpoint using fetch
        const response = await fetch('/api/files/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }

        // Handle successful upload
        const result = await response.json();
        alert('File uploaded successfully!');
      } catch (error) {
        console.error('Upload failed:', error);
        alert('Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
    }

    // const response = await upload({
    //   consent: data.consent,
    //   data: data.file,
    //   producer: '0x1234567890123456789012345678901234567890',
    // });

    // Reset the form after submission
    form.reset();
    setFileName(null);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="file"
          render={({ field: { onChange, value, ...rest } }) => (
            <FormItem>
              <FormLabel>File Upload</FormLabel>
              <FormControl>
                <div className="flex flex-col items-center justify-center w-full">
                  <label
                    htmlFor="dropzone-file"
                    className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{fileName || 'Max file size: 5MB'}</p>
                    </div>
                    <input
                      id="dropzone-file"
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          onChange(file);
                          setFileName(file.name);
                        }
                      }}
                      {...rest}
                    />
                  </label>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="consent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Would you like to share your data?</FormLabel>
              <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value.toString()}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select consent status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={ConsentStatus.Allowed.toString()}>Allowed</SelectItem>
                  <SelectItem value={ConsentStatus.Denied.toString()}>Denied</SelectItem>
                  <SelectItem value={ConsentStatus.Pending.toString()}>Pending</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}

'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Form validation schema
const columnFormSchema = z.object({
  title: z.string().min(1, 'Column title is required'),
  color: z.string().min(1, 'Column color is required'),
});

type ColumnFormValues = z.infer<typeof columnFormSchema>;

interface CreateColumnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddColumn: (title: string, color: string) => void;
}

/**
 * CreateColumnDialog component - Dialog for creating new columns
 */
export function CreateColumnDialog({ open, onOpenChange, onAddColumn }: CreateColumnDialogProps) {
  // Initialize form with react-hook-form and zod validation
  const form = useForm<ColumnFormValues>({
    resolver: zodResolver(columnFormSchema),
    defaultValues: {
      title: '',
      color: 'bg-blue-500',
    },
  });

  // Handle form submission
  const onSubmit = (values: ColumnFormValues) => {
    onAddColumn(values.title, values.color);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Column</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Column Title</Label>
            <Input id="title" placeholder="Enter column title..." {...form.register('title')} />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Column Color</Label>
            <Controller
              control={form.control}
              name="color"
              render={({ field }) => (
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="grid grid-cols-3 gap-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bg-blue-500" id="blue" />
                    <div className="w-6 h-6 rounded bg-blue-500"></div>
                    <Label htmlFor="blue">Blue</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bg-green-500" id="green" />
                    <div className="w-6 h-6 rounded bg-green-500"></div>
                    <Label htmlFor="green">Green</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bg-yellow-500" id="yellow" />
                    <div className="w-6 h-6 rounded bg-yellow-500"></div>
                    <Label htmlFor="yellow">Yellow</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bg-red-500" id="red" />
                    <div className="w-6 h-6 rounded bg-red-500"></div>
                    <Label htmlFor="red">Red</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bg-purple-500" id="purple" />
                    <div className="w-6 h-6 rounded bg-purple-500"></div>
                    <Label htmlFor="purple">Purple</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bg-pink-500" id="pink" />
                    <div className="w-6 h-6 rounded bg-pink-500"></div>
                    <Label htmlFor="pink">Pink</Label>
                  </div>
                </RadioGroup>
              )}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Column</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

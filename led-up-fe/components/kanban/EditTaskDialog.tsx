'use client';

import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Task } from './kanban';

// Form validation schema
const taskFormSchema = z.object({
  content: z.string().min(1, 'Task content is required'),
  priority: z.enum(['low', 'medium', 'high']),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface EditTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
  onUpdateTask: (content: string, priority: 'low' | 'medium' | 'high') => void;
}

/**
 * EditTaskDialog component - Dialog for editing existing tasks
 */
export function EditTaskDialog({ open, onOpenChange, task, onUpdateTask }: EditTaskDialogProps) {
  // Initialize form with react-hook-form and zod validation
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      content: task.content,
      priority: task.priority,
    },
  });

  // Update form values when task changes
  useEffect(() => {
    if (open) {
      form.reset({
        content: task.content,
        priority: task.priority,
      });
    }
  }, [form, task, open]);

  // Handle form submission
  const onSubmit = (values: TaskFormValues) => {
    onUpdateTask(values.content, values.priority);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="content">Task Description</Label>
            <Textarea
              id="content"
              placeholder="Enter task details..."
              {...form.register('content')}
              className="min-h-[100px]"
            />
            {form.formState.errors.content && (
              <p className="text-sm text-destructive">{form.formState.errors.content.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Priority</Label>
            <Controller
              control={form.control}
              name="priority"
              render={({ field }) => (
                <RadioGroup onValueChange={field.onChange} value={field.value} className="flex space-x-2">
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="low" id="edit-low" />
                    <Label htmlFor="edit-low" className="text-green-600">
                      Low
                    </Label>
                  </div>
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="medium" id="edit-medium" />
                    <Label htmlFor="edit-medium" className="text-yellow-600">
                      Medium
                    </Label>
                  </div>
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="high" id="edit-high" />
                    <Label htmlFor="edit-high" className="text-red-600">
                      High
                    </Label>
                  </div>
                </RadioGroup>
              )}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Update Task</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

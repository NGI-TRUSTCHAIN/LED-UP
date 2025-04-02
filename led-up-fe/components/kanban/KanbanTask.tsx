'use client';

import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from './kanban';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { MoreHorizontalIcon, PencilIcon, Trash2Icon } from 'lucide-react';
import { Badge } from '../ui/badge';
import { EditTaskDialog } from './EditTaskDialog';

interface KanbanTaskProps {
  task: Task;
  onUpdate: (taskId: string, content: string, priority: 'low' | 'medium' | 'high') => void;
  onDelete: (taskId: string) => void;
}

/**
 * KanbanTask component - Represents a single task card in the Kanban board
 * Handles task-specific actions like edit and delete
 */
export function KanbanTask({ task, onUpdate, onDelete }: KanbanTaskProps) {
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);

  // Set up sortable functionality for the task
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      task,
    },
  });

  // Apply styles for dragging
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Get priority badge color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'high':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  return (
    <Card ref={setNodeRef} style={style} className="cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
      <CardContent className="p-3">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1">
            <p className="text-sm">{task.content}</p>
            <div className="mt-2">
              <Badge variant="outline" className={`text-xs font-normal ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </Badge>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="flex items-center gap-2" onClick={() => setIsEditTaskOpen(true)}>
                <PencilIcon className="h-4 w-4" />
                Edit Task
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive flex items-center gap-2" onClick={() => onDelete(task.id)}>
                <Trash2Icon className="h-4 w-4" />
                Delete Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>

      <EditTaskDialog
        open={isEditTaskOpen}
        onOpenChange={setIsEditTaskOpen}
        task={task}
        onUpdateTask={(content: string, priority: 'low' | 'medium' | 'high') => onUpdate(task.id, content, priority)}
      />
    </Card>
  );
}

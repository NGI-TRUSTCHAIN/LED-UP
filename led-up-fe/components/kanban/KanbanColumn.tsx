'use client';

import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableContext } from '@dnd-kit/sortable';
import { KanbanTask } from './KanbanTask';
import { Column, Task } from '@/components/kanban/kanban';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader } from '../ui/card';
import { PlusIcon, MoreVerticalIcon, Trash2Icon } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { CreateTaskDialog } from './CreateTaskDialog';

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  onAddTask: (columnId: string, content: string, priority: 'low' | 'medium' | 'high') => void;
  onUpdateTask: (taskId: string, content: string, priority: 'low' | 'medium' | 'high') => void;
  onDeleteTask: (taskId: string) => void;
  onDeleteColumn: (columnId: string) => void;
}

/**
 * KanbanColumn component - Represents a single column in the Kanban board
 * Contains tasks and handles column-specific actions
 */
export function KanbanColumn({
  column,
  tasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onDeleteColumn,
}: KanbanColumnProps) {
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);

  // Set up sortable functionality for the column
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: column.id,
    data: {
      type: 'column',
      column,
    },
  });

  // Apply styles for dragging
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style} className="flex flex-col w-80 h-full max-h-full">
      <CardHeader
        className={`flex flex-row items-center justify-between p-3 ${column.color} text-white rounded-t-lg`}
        {...attributes}
        {...listeners}
      >
        <div className="font-semibold cursor-grab">
          {column.title} ({tasks.length})
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-white/20"
            onClick={() => setIsCreateTaskOpen(true)}
          >
            <PlusIcon className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20">
                <MoreVerticalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-destructive flex items-center gap-2"
                onClick={() => onDeleteColumn(column.id)}
              >
                <Trash2Icon className="h-4 w-4" />
                Delete Column
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-2">
        <SortableContext items={tasks.map((task) => task.id)}>
          <div className="flex flex-col gap-2">
            {tasks.map((task) => (
              <KanbanTask key={task.id} task={task} onUpdate={onUpdateTask} onDelete={onDeleteTask} />
            ))}
          </div>
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-24 border border-dashed rounded-md border-muted-foreground/50">
            <p className="text-sm text-muted-foreground">No tasks yet</p>
          </div>
        )}
      </CardContent>

      <CreateTaskDialog
        open={isCreateTaskOpen}
        onOpenChange={setIsCreateTaskOpen}
        onAddTask={(content, priority) => onAddTask(column.id, content, priority)}
      />
    </Card>
  );
}

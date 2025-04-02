'use client';

import React, { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import { KanbanColumn } from './KanbanColumn';
import { Button } from '../ui/button';
import { PlusIcon, RefreshCwIcon } from 'lucide-react';
import { CreateColumnDialog } from './CreateColumnDialog';
import { Column, Task } from './kanban';
import { useKanbanState } from './useKanbanState';

/**
 * KanbanBoard component - Main container for the Kanban board
 * Manages columns and tasks, and handles drag-and-drop functionality
 */
export function KanbanBoard() {
  // Use the custom hook to manage state
  const { columns, tasks, addTask, updateTask, deleteTask, addColumn, deleteColumn, resetState } = useKanbanState();

  // State for active task and column during drag
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);

  // State for column creation dialog
  const [isCreateColumnOpen, setIsCreateColumnOpen] = useState(false);

  // Configure DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // Minimum drag distance in pixels
      },
    })
  );

  // Handle drag start event
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeId = active.id as string;

    // Check if we're dragging a task
    if (activeId.includes('task')) {
      const task = tasks.find((t) => t.id === activeId);
      if (task) setActiveTask(task);
    } else {
      // We're dragging a column
      const column = columns.find((c) => c.id === activeId);
      if (column) setActiveColumn(column);
    }
  };

  // Handle drag over event (for dropping tasks between columns)
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Return if task is dropped over itself
    if (activeId === overId) return;

    // Check if we're dragging a task
    if (activeTask) {
      // Find the destination column
      const isOverColumn = overId.includes('column');
      const targetColumnId = isOverColumn
        ? overId.replace('column-', '')
        : tasks.find((t) => t.id === overId)?.columnId || activeTask.columnId;

      // Update task's column
      if (targetColumnId !== activeTask.columnId) {
        const updatedTasks = tasks.map((task) => (task.id === activeId ? { ...task, columnId: targetColumnId } : task));
        // We'll handle the state update in handleDragEnd
      }
    }
  };

  // Handle drag end event
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveTask(null);
      setActiveColumn(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    // Return if item is dropped over itself
    if (activeId === overId) {
      setActiveTask(null);
      setActiveColumn(null);
      return;
    }

    // Handle column reordering
    if (activeColumn) {
      const activeColumnIndex = columns.findIndex((col) => col.id === activeId);
      const overColumnIndex = columns.findIndex((col) => col.id === overId);

      if (activeColumnIndex !== -1 && overColumnIndex !== -1) {
        // This would require updating our useKanbanState hook to support reordering columns
        // For now, we'll just reset the active column
      }
    } else if (activeTask) {
      // Handle task moving between columns
      const isOverColumn = overId.includes('column');
      const targetColumnId = isOverColumn
        ? overId.replace('column-', '')
        : tasks.find((t) => t.id === overId)?.columnId || activeTask.columnId;

      if (targetColumnId !== activeTask.columnId) {
        updateTask(activeTask.id, activeTask.content, activeTask.priority);
        // This would ideally call a moveTask function in our hook
      }
    }

    // Reset active items
    setActiveTask(null);
    setActiveColumn(null);
  };

  // Get tasks for a specific column
  const getColumnTasks = (columnId: string) => {
    return tasks.filter((task) => task.columnId === columnId);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Kanban Board</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={resetState} className="flex items-center gap-1">
            <RefreshCwIcon className="h-4 w-4" />
            Reset Board
          </Button>
          <Button onClick={() => setIsCreateColumnOpen(true)} className="flex items-center gap-1">
            <PlusIcon className="h-4 w-4" />
            Add Column
          </Button>
        </div>
      </div>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 h-full">
          <SortableContext items={columns.map((col) => col.id)}>
            {columns.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                tasks={getColumnTasks(column.id)}
                onAddTask={addTask}
                onUpdateTask={updateTask}
                onDeleteTask={deleteTask}
                onDeleteColumn={deleteColumn}
              />
            ))}
          </SortableContext>
        </div>
      </DndContext>

      <CreateColumnDialog open={isCreateColumnOpen} onOpenChange={setIsCreateColumnOpen} onAddColumn={addColumn} />
    </div>
  );
}

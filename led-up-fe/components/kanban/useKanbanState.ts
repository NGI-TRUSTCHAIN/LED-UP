'use client';

import { useState, useEffect } from 'react';
import { Column, Task, KanbanState } from './kanban';

const DEFAULT_COLUMNS: Column[] = [
  { id: 'todo', title: 'To Do', color: 'bg-blue-500' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-yellow-500' },
  { id: 'done', title: 'Done', color: 'bg-green-500' },
];

const DEFAULT_TASKS: Task[] = [
  { id: '1', columnId: 'todo', content: 'Research user requirements', priority: 'medium' },
  { id: '2', columnId: 'todo', content: 'Create wireframes', priority: 'high' },
  { id: '3', columnId: 'in-progress', content: 'Implement authentication', priority: 'high' },
  { id: '4', columnId: 'in-progress', content: 'Design database schema', priority: 'medium' },
  { id: '5', columnId: 'done', content: 'Project setup', priority: 'low' },
];

const STORAGE_KEY = 'kanban-board-state';

/**
 * Custom hook to manage and persist Kanban board state
 * @returns Kanban board state and actions
 */
export function useKanbanState() {
  // Initialize state from localStorage or use defaults
  const [state, setState] = useState<KanbanState>(() => {
    if (typeof window === 'undefined') {
      return { columns: DEFAULT_COLUMNS, tasks: DEFAULT_TASKS };
    }

    const savedState = localStorage.getItem(STORAGE_KEY);
    return savedState ? JSON.parse(savedState) : { columns: DEFAULT_COLUMNS, tasks: DEFAULT_TASKS };
  });

  // Extract columns and tasks from state
  const { columns, tasks } = state;

  // Persist state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  // Add a new task
  const addTask = (columnId: string, content: string, priority: 'low' | 'medium' | 'high') => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      columnId,
      content,
      priority,
    };

    setState((prev) => ({
      ...prev,
      tasks: [...prev.tasks, newTask],
    }));
  };

  // Update an existing task
  const updateTask = (taskId: string, content: string, priority: 'low' | 'medium' | 'high') => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) => (task.id === taskId ? { ...task, content, priority } : task)),
    }));
  };

  // Delete a task
  const deleteTask = (taskId: string) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((task) => task.id !== taskId),
    }));
  };

  // Move a task to a different column
  const moveTask = (taskId: string, targetColumnId: string) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) => (task.id === taskId ? { ...task, columnId: targetColumnId } : task)),
    }));
  };

  // Add a new column
  const addColumn = (title: string, color: string) => {
    const newColumn: Column = {
      id: title.toLowerCase().replace(/\s+/g, '-'),
      title,
      color,
    };

    setState((prev) => ({
      ...prev,
      columns: [...prev.columns, newColumn],
    }));
  };

  // Delete a column and its tasks
  const deleteColumn = (columnId: string) => {
    setState((prev) => ({
      columns: prev.columns.filter((column) => column.id !== columnId),
      tasks: prev.tasks.filter((task) => task.columnId !== columnId),
    }));
  };

  // Reset to default state
  const resetState = () => {
    setState({ columns: DEFAULT_COLUMNS, tasks: DEFAULT_TASKS });
  };

  return {
    columns,
    tasks,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    addColumn,
    deleteColumn,
    resetState,
  };
}

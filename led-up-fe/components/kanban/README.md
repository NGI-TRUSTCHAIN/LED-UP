# Kanban Board Component

A simple, drag-and-drop Kanban board implementation inspired by GitHub's project boards. This component provides a clean, minimalist UI for task management with intuitive drag-and-drop interactions.

## Features

- **Drag-and-Drop Interface**: Move tasks between columns with intuitive drag-and-drop functionality
- **Customizable Columns**: Create, edit, and delete columns with custom colors
- **Task Management**: Create, edit, and delete tasks with priority levels
- **Responsive Design**: Works on desktop and mobile devices
- **Clean UI**: Minimalist design focused on usability

## Components

- **KanbanBoard**: Main container component that manages the state and interactions
- **KanbanColumn**: Represents a single column in the board (e.g., "To Do", "In Progress", "Done")
- **KanbanTask**: Represents a task card that can be moved between columns
- **CreateColumnDialog**: Dialog for creating new columns
- **CreateTaskDialog**: Dialog for creating new tasks
- **EditTaskDialog**: Dialog for editing existing tasks

## Usage

```tsx
import { KanbanBoard } from '../components/kanban/KanbanBoard';

export default function KanbanPage() {
  return (
    <div className="container mx-auto py-8 h-[calc(100vh-8rem)]">
      <KanbanBoard />
    </div>
  );
}
```

## Dependencies

This component uses the following libraries:

- **@dnd-kit/core**: Core drag-and-drop functionality
- **@dnd-kit/sortable**: Sortable drag-and-drop functionality
- **@dnd-kit/utilities**: Utilities for drag-and-drop
- **react-hook-form**: Form handling
- **zod**: Form validation
- **shadcn/ui**: UI components

## Implementation Details

The Kanban board uses a simple data model:

- **Columns**: Array of column objects with id, title, and color
- **Tasks**: Array of task objects with id, columnId, content, and priority

Tasks are associated with columns via the `columnId` property. When a task is dragged between columns, the `columnId` is updated to reflect the new column.

## Future Improvements

- Persist state to local storage or a backend
- Add more customization options for columns and tasks
- Add filtering and searching capabilities
- Add due dates and assignees to tasks
- Add animations for smoother transitions

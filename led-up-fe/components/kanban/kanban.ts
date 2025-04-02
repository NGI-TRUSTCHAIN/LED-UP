/**
 * Column type - Represents a column in the Kanban board
 */
export interface Column {
  /**
   * Unique identifier for the column
   */
  id: string;

  /**
   * Display title for the column
   */
  title: string;

  /**
   * CSS class for the column's color
   */
  color: string;
}

/**
 * Task type - Represents a task card in the Kanban board
 */
export interface Task {
  /**
   * Unique identifier for the task
   */
  id: string;

  /**
   * ID of the column this task belongs to
   */
  columnId: string;

  /**
   * Content/description of the task
   */
  content: string;

  /**
   * Priority level of the task
   */
  priority: 'low' | 'medium' | 'high';
}

/**
 * KanbanState type - Represents the complete state of the Kanban board
 */
export interface KanbanState {
  /**
   * Array of columns in the board
   */
  columns: Column[];

  /**
   * Array of tasks in the board
   */
  tasks: Task[];
}

/**
 * Task Types and Interfaces
 * Defines the shape of task data linked to contacts
 */

/**
 * Full Task object - what comes from database
 * A task is a to-do item linked to a specific contact
 */
export interface Task {
  id: string; // Unique identifier (numeric string: "1", "2", etc.)
  contactId: string; // Which contact this task belongs to
  title: string; // Task title (required, non-empty: 2-200 chars)
  description?: string; // Optional task description
  completed: boolean; // Is task done? (true/false)
  dueDate?: string; // Optional due date (ISO format: "2025-01-15")
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // Last update timestamp
}

/**
 * Input for creating a new task
 * Does NOT include id, createdAt, updatedAt (system generates these)
 */
export interface CreateTaskInput {
  contactId: string; // Required: which contact this task belongs to
  title: string; // Required: 2-200 characters
  description?: string; // Optional: 0-500 characters
  dueDate?: string; // Optional: valid ISO date or null
}

/**
 * Input for updating a task
 * All fields are OPTIONAL - user can update just one field
 */
export interface UpdateTaskInput {
  title?: string; // Optional: 2-200 characters if provided
  description?: string; // Optional: 0-500 characters if provided
  completed?: boolean; // Optional: toggle completion status
  dueDate?: string; // Optional: valid ISO date or null
}

/**
 * API Response wrapper for single task
 */
export interface TaskResponse {
  success: boolean;
  data?: Task;
  error?: string;
}

/**
 * API Response wrapper for list of tasks
 */
export interface TaskListResponse {
  success: boolean;
  data?: Task[];
  total?: number;
  error?: string;
}

/**
 * Validation error details
 */
export interface ValidationError {
  field: string; // Which field failed
  message: string; // Why it failed
}

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

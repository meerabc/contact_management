// created these custom types for our ease and to ensure consistency, we use these types as
// parameters or return types of functions instead of writing manually for each function
// and there might become risk of inconsistency

export interface Task {
  id: string;
  contactId: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  contactId: string;
  title: string;
  description?: string;
  dueDate?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  completed?: boolean;
  dueDate?: string;
}

export interface TaskResponse {
  success: boolean;
  data?: Task;
  error?: string;
}

export interface TaskListResponse {
  success: boolean;
  data?: Task[];
  total?: number;
  error?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

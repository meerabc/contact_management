import { Task, CreateTaskInput, UpdateTaskInput, ValidationResult } from '@/types/task.types';
import TaskValidator from '@/lib/validators/task.validator';
import * as db from '@/lib/db/tasks/index';


export function getAllTasks(): Task[] {
  try {
    return db.getAllTasks();
  } catch (error) {
    console.error('Service: Error fetching all tasks', error);
    throw new Error('Failed to fetch tasks');
  }
}

export function getTasksByContactId(contactId: string): Task[] {
  try {
    if (!contactId || contactId.trim() === '') {
      throw new Error('Contact ID is required');
    }
    return db.getTasksByContactId(contactId);
  } catch (error) {
    console.error(`Service: Error fetching tasks for contact ${contactId}`, error);
    throw new Error('Failed to fetch tasks');
  }
}


export function getTaskById(id: string): Task | null {
  try {
    if (!id || id.trim() === '') {
      throw new Error('Task ID is required');
    }
    return db.getTaskById(id);
  } catch (error) {
    console.error(`Service: Error fetching task ${id}`, error);
    throw new Error('Failed to fetch task');
  }
}


export function createTask(input: CreateTaskInput): Task {
  try {
    const validation = TaskValidator.validateCreateInput(input);
    if (!validation.isValid) {
      const errorMessage = validation.errors
        .map((err) => `${err.field}: ${err.message}`)
        .join('; ');
      throw new Error(`Validation failed: ${errorMessage}`);
    }
    const newTask = db.createTask(input);
    console.log(`Task created: ID ${newTask.id} for contact ${input.contactId}`);
    return newTask;
  } catch (error) {
    console.error('Service: Error creating task', error);
    throw error;
  }
}

export function updateTask(id: string, updates: UpdateTaskInput): Task {
  try {
    const existingTask = db.getTaskById(id);
    if (!existingTask) {
      throw new Error(`Task with ID ${id} not found`);
    }
    const validation = TaskValidator.validateUpdateInput(updates);
    if (!validation.isValid) {
      const errorMessage = validation.errors
        .map((err) => `${err.field}: ${err.message}`)
        .join('; ');
      throw new Error(`Validation failed: ${errorMessage}`);
    }
    const updatedTask = db.updateTask(id, updates);
    console.log(`Task updated: ID ${id}`);
    return updatedTask;
  } catch (error) {
    console.error(`Service: Error updating task ${id}`, error);
    throw error;
  }
}


export function toggleTask(id: string): Task {
  try {
    const task = db.getTaskById(id);
    if (!task) {
      throw new Error(`Task with ID ${id} not found`);
    }
    const updated = db.toggleTask(id);
    console.log(`Task toggled: ID ${id}, now ${updated.completed ? 'completed' : 'pending'}`);
    return updated;
  } catch (error) {
    console.error(`Service: Error toggling task ${id}`, error);
    throw error;
  }
}


export function deleteTask(id: string): boolean {
  try {
    const task = db.getTaskById(id);
    if (!task) {
      throw new Error(`Task with ID ${id} not found`);
    }
    const deleted = db.deleteTask(id);
    console.log(`Task deleted: ID ${id}`);
    return deleted;
  } catch (error) {
    console.error(`Service: Error deleting task ${id}`, error);
    throw error;
  }
}


export function deleteTasksByContactId(contactId: string): number {
  try {
    const deleted = db.deleteTasksByContactId(contactId);
    if (deleted > 0) {
      console.log(`Deleted ${deleted} tasks for contact ${contactId}`);
    }
    return deleted;
  } catch (error) {
    console.error(`Service: Error deleting tasks for contact ${contactId}`, error);
    throw error;
  }
}


export function getTaskCount(): number {
  try {
    return db.getTaskCount();
  } catch (error) {
    console.error('Service: Error getting task count', error);
    throw new Error('Failed to get task count');
  }
}


export function validateTaskInput(
  input: CreateTaskInput | UpdateTaskInput,
  isUpdate: boolean = false
): ValidationResult {
  try {
    if (isUpdate) {
      return TaskValidator.validateUpdateInput(input as UpdateTaskInput);
    } else {
      return TaskValidator.validateCreateInput(input as CreateTaskInput);
    }
  } catch (error) {
    console.error('Service: Error validating task', error);
    return {
      isValid: false,
      errors: [{ field: 'general', message: 'Validation error' }],
    };
  }
}

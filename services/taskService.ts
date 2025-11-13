/**
 * Task Service Layer - Business Logic
 *
 * ARCHITECTURE:
 * - Uses TaskValidator to check data BEFORE saving
 * - Uses Task Database to persist data
 * - Handles errors and exceptions
 * - Single source for all task business logic
 *
 * FLOW: API/Component → Service (validates) → Database (persists)
 */

import { Task, CreateTaskInput, UpdateTaskInput, ValidationResult } from '@/types/task.types';
import TaskValidator from '@/lib/validators/task.validator';
import * as db from '@/lib/db/tasks/index';

/**
 * GET ALL TASKS
 * Returns all tasks from database
 *
 * @returns Array of all tasks
 */
export function getAllTasks(): Task[] {
  try {
    return db.getAllTasks();
  } catch (error) {
    console.error('Service: Error fetching all tasks', error);
    throw new Error('Failed to fetch tasks');
  }
}

/**
 * GET TASKS FOR CONTACT
 * Returns all tasks linked to a specific contact
 *
 * @param contactId - Contact ID to get tasks for
 * @returns Array of tasks for that contact
 */
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

/**
 * GET SINGLE TASK
 * Finds task by ID
 *
 * @param id - Task ID to find
 * @returns Task or null if not found
 */
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

/**
 * CREATE NEW TASK
 * Validates input, then saves to database
 *
 * FLOW:
 * 1. Validate all fields (contactId, title, description, dueDate)
 * 2. If validation fails, throw error with details
 * 3. If validation passes, call database to create
 * 4. Return created task
 *
 * @param input - User-provided task data
 * @returns Created task with ID and timestamps
 * @throws Error if validation fails or database error
 */
export function createTask(input: CreateTaskInput): Task {
  try {
    // STEP 1: Validate input
    const validation = TaskValidator.validateCreateInput(input);

    // STEP 2: If validation fails, throw error with all problems
    if (!validation.isValid) {
      const errorMessage = validation.errors
        .map((err) => `${err.field}: ${err.message}`)
        .join('; ');
      throw new Error(`Validation failed: ${errorMessage}`);
    }

    // STEP 3: Validation passed, create task
    const newTask = db.createTask(input);
    console.log(`✅ Task created: ID ${newTask.id} for contact ${input.contactId}`);

    return newTask;
  } catch (error) {
    console.error('Service: Error creating task', error);
    throw error;
  }
}

/**
 * UPDATE TASK
 * Validates input, then updates database
 *
 * @param id - Task ID to update
 * @param updates - Fields to update (any field can be omitted)
 * @returns Updated task object
 * @throws Error if validation fails, task not found, or database error
 */
export function updateTask(id: string, updates: UpdateTaskInput): Task {
  try {
    // STEP 1: Check if task exists
    const existingTask = db.getTaskById(id);
    if (!existingTask) {
      throw new Error(`Task with ID ${id} not found`);
    }

    // STEP 2: Validate the fields being updated
    const validation = TaskValidator.validateUpdateInput(updates);

    // STEP 3: If validation fails, throw error
    if (!validation.isValid) {
      const errorMessage = validation.errors
        .map((err) => `${err.field}: ${err.message}`)
        .join('; ');
      throw new Error(`Validation failed: ${errorMessage}`);
    }

    // STEP 4: Validation passed, update task
    const updatedTask = db.updateTask(id, updates);
    console.log(`✅ Task updated: ID ${id}`);

    return updatedTask;
  } catch (error) {
    console.error(`Service: Error updating task ${id}`, error);
    throw error;
  }
}

/**
 * TOGGLE TASK COMPLETION
 * Toggle completed status without full validation
 *
 * @param id - Task ID to toggle
 * @returns Updated task with toggled status
 * @throws Error if task not found
 */
export function toggleTask(id: string): Task {
  try {
    // Check if task exists
    const task = db.getTaskById(id);
    if (!task) {
      throw new Error(`Task with ID ${id} not found`);
    }

    // Toggle it
    const updated = db.toggleTask(id);
    console.log(`✅ Task toggled: ID ${id}, now ${updated.completed ? 'completed' : 'pending'}`);

    return updated;
  } catch (error) {
    console.error(`Service: Error toggling task ${id}`, error);
    throw error;
  }
}

/**
 * DELETE TASK
 * Removes task from database
 *
 * @param id - Task ID to delete
 * @returns true if deleted, false if not found
 */
export function deleteTask(id: string): boolean {
  try {
    // Check if task exists first
    const task = db.getTaskById(id);
    if (!task) {
      throw new Error(`Task with ID ${id} not found`);
    }

    // Delete it
    const deleted = db.deleteTask(id);
    console.log(`✅ Task deleted: ID ${id}`);

    return deleted;
  } catch (error) {
    console.error(`Service: Error deleting task ${id}`, error);
    throw error;
  }
}

/**
 * DELETE ALL TASKS FOR CONTACT
 * Called when contact is deleted (cascade delete)
 *
 * @param contactId - Contact ID to delete tasks for
 * @returns Number of tasks deleted
 */
export function deleteTasksByContactId(contactId: string): number {
  try {
    const deleted = db.deleteTasksByContactId(contactId);
    if (deleted > 0) {
      console.log(`✅ Deleted ${deleted} tasks for contact ${contactId}`);
    }
    return deleted;
  } catch (error) {
    console.error(`Service: Error deleting tasks for contact ${contactId}`, error);
    throw error;
  }
}

/**
 * GET TASK COUNT
 * Returns total number of tasks
 *
 * @returns Number of tasks
 */
export function getTaskCount(): number {
  try {
    return db.getTaskCount();
  } catch (error) {
    console.error('Service: Error getting task count', error);
    throw new Error('Failed to get task count');
  }
}

/**
 * VALIDATE TASK INPUT
 * Public method to validate without creating
 * Useful for form validation on frontend
 *
 * @param input - Task data to validate
 * @param isUpdate - true if updating (partial validation), false if creating
 * @returns Validation result with errors
 */
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

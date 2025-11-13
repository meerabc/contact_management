/**
 * Task Database Layer - In-Memory with JSON File Persistence
 *
 * ARCHITECTURE:
 * - Loads tasks from lib/db/tasks.json on startup
 * - Stores tasks in memory (fast reads)
 * - Saves to JSON file after every write
 * - All tasks linked to contacts via contactId
 */

import fs from 'fs';
import path from 'path';
import { Task, CreateTaskInput, UpdateTaskInput } from '@/types/task.types';

// Path to JSON file
const DB_PATH = path.join(process.cwd(), 'lib', 'db', 'tasks', 'tasks.json');

/**
 * In-memory database
 * Loaded once on first use, then kept in memory for fast access
 */
let tasksDb: Task[] = [];
let isInitialized = false;

/**
 * Load tasks from JSON file into memory
 * Run this ONCE when app starts
 */
function initializeDatabase(): void {
  if (isInitialized) return;

  try {
    // Read the JSON file
    const fileContent = fs.readFileSync(DB_PATH, 'utf-8');
    const data = JSON.parse(fileContent);

    // Store in memory
    tasksDb = data.tasks || [];
    isInitialized = true;
    console.log(`✅ Task Database initialized with ${tasksDb.length} tasks`);
  } catch (error) {
    console.error('❌ Failed to load task database:', error);
    tasksDb = [];
    isInitialized = true;
  }
}

/**
 * Save tasks to JSON file
 * Called after every write operation
 */
function saveToFile(): void {
  try {
    const data = { tasks: tasksDb };
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ Failed to save task database:', error);
    throw new Error('Task database save failed');
  }
}

/**
 * GET ALL TASKS
 * Returns all tasks from memory
 *
 * @returns Array of all tasks
 */
export function getAllTasks(): Task[] {
  initializeDatabase();
  return tasksDb;
}

/**
 * GET TASKS FOR CONTACT
 * Returns all tasks linked to a specific contact
 *
 * @param contactId - Contact ID to get tasks for
 * @returns Array of tasks for that contact
 */
export function getTasksByContactId(contactId: string): Task[] {
  initializeDatabase();
  return tasksDb.filter((t) => t.contactId === contactId);
}

/**
 * GET SINGLE TASK
 * Finds task by ID
 *
 * @param id - Task ID to find
 * @returns Task object or null if not found
 */
export function getTaskById(id: string): Task | null {
  initializeDatabase();
  const task = tasksDb.find((t) => t.id === id);
  return task || null;
}

/**
 * CREATE NEW TASK
 * Adds new task to database
 *
 * LOGIC:
 * 1. Find highest ID and add 1
 * 2. New task gets that ID
 * 3. Set createdAt and updatedAt to now
 * 4. Set completed to false by default
 * 5. Add to tasks array
 * 6. Save to file
 *
 * @param input - Task data from user
 * @returns Created task with auto-generated ID
 */
export function createTask(input: CreateTaskInput): Task {
  initializeDatabase();

  // Find the highest ID (as number) and add 1
  const maxId = Math.max(0, ...tasksDb.map((t) => parseInt(t.id, 10)));
  const newId = (maxId + 1).toString();

  // Create new task object
  const now = new Date().toISOString();
  const newTask: Task = {
    id: newId,
    contactId: input.contactId,
    title: input.title,
    description: input.description,
    completed: false,
    dueDate: input.dueDate,
    createdAt: now,
    updatedAt: now,
  };

  // Add to array
  tasksDb.push(newTask);

  // Save to file
  saveToFile();

  return newTask;
}

/**
 * UPDATE TASK
 * Updates specific fields of a task
 *
 * @param id - Task ID to update
 * @param updates - Fields to update (any field can be undefined)
 * @returns Updated task object
 * @throws Error if task not found
 */
export function updateTask(id: string, updates: UpdateTaskInput): Task {
  initializeDatabase();

  // Find the task
  const taskIndex = tasksDb.findIndex((t) => t.id === id);
  if (taskIndex === -1) {
    throw new Error(`Task with ID ${id} not found`);
  }

  // Update only provided fields
  const task = tasksDb[taskIndex];
  if (updates.title !== undefined) task.title = updates.title;
  if (updates.description !== undefined) task.description = updates.description;
  if (updates.completed !== undefined) task.completed = updates.completed;
  if (updates.dueDate !== undefined) task.dueDate = updates.dueDate;
  task.updatedAt = new Date().toISOString();

  // Save to file
  saveToFile();

  return task;
}

/**
 * TOGGLE TASK COMPLETION
 * Toggles completed status (true ↔ false)
 *
 * @param id - Task ID to toggle
 * @returns Updated task object
 * @throws Error if task not found
 */
export function toggleTask(id: string): Task {
  initializeDatabase();

  // Find the task
  const taskIndex = tasksDb.findIndex((t) => t.id === id);
  if (taskIndex === -1) {
    throw new Error(`Task with ID ${id} not found`);
  }

  // Toggle completion
  const task = tasksDb[taskIndex];
  task.completed = !task.completed;
  task.updatedAt = new Date().toISOString();

  // Save to file
  saveToFile();

  return task;
}

/**
 * DELETE TASK
 * Removes task from database
 *
 * @param id - Task ID to delete
 * @returns true if deleted, false if not found
 */
export function deleteTask(id: string): boolean {
  initializeDatabase();

  // Find the task
  const taskIndex = tasksDb.findIndex((t) => t.id === id);
  if (taskIndex === -1) {
    return false;
  }

  // Remove from array
  tasksDb.splice(taskIndex, 1);

  // Save to file
  saveToFile();

  return true;
}

/**
 * DELETE ALL TASKS FOR CONTACT
 * When contact is deleted, remove all associated tasks
 *
 * @param contactId - Contact ID to delete tasks for
 * @returns Number of tasks deleted
 */
export function deleteTasksByContactId(contactId: string): number {
  initializeDatabase();

  const beforeCount = tasksDb.length;
  tasksDb = tasksDb.filter((t) => t.contactId !== contactId);
  const deletedCount = beforeCount - tasksDb.length;

  if (deletedCount > 0) {
    saveToFile();
  }

  return deletedCount;
}

/**
 * GET TASK COUNT
 * Returns total number of tasks
 *
 * @returns Number of tasks
 */
export function getTaskCount(): number {
  initializeDatabase();
  return tasksDb.length;
}

/**
 * RESET DATABASE
 * Clears all tasks (useful for testing)
 * WARNING: This deletes everything!
 */
export function resetDatabase(): void {
  tasksDb = [];
  saveToFile();
  console.log('⚠️  Task Database reset - all tasks deleted');
}

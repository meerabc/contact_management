// acts like a mini resetDatabase.basic database operations are defined here to perform manipulations
// on JSON files

import fs from 'fs';
import path from 'path';
import { Task, CreateTaskInput, UpdateTaskInput } from '@/types/task.types';

// path to the JSON file
const DB_PATH = path.join(process.cwd(), 'lib', 'db', 'tasks', 'tasks.json');

// in-memory database.loaded once on first use, then kept in memory for fast access

let tasksDb: Task[] = [];
let isInitialized = false;

// loads tasks from JSON file into memory.Runs only once when app starts
function initializeDatabase(): void {
  if (isInitialized) return;

  try {
    const fileContent = fs.readFileSync(DB_PATH, 'utf-8');
    const data = JSON.parse(fileContent);
    tasksDb = data.tasks || [];
    isInitialized = true;
    console.log(`Task Database initialized with ${tasksDb.length} tasks`);
  } catch (error) {
    console.error('Failed to load task database:', error);
    tasksDb = [];
    isInitialized = true;
  }
}

//saves tasks to JSON file, called after every write operation (CREATE, UPDATE, DELETE)
function saveToFile(): void {
  try {
    const data = { tasks: tasksDb };
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Failed to save task database:', error);
    throw new Error('Task database save failed');
  }
}

//reload database from file to ensure we have latest data
function reloadDatabase(): void {
  if (!isInitialized) {
    initializeDatabase();
    return;
  }
  try {
    const fileContent = fs.readFileSync(DB_PATH, 'utf-8');
    const data = JSON.parse(fileContent);
    tasksDb = data.tasks || [];
  } catch (error) {
    console.error('Failed to reload task database:', error);
  }
}

export function getAllTasks(): Task[] {
  initializeDatabase();
  return tasksDb;
}

export function getTasksByContactId(contactId: string): Task[] {
  reloadDatabase();
  return tasksDb.filter((t) => t.contactId === contactId);
}

export function getTaskById(id: string): Task | null {
  initializeDatabase();
  const task = tasksDb.find((t) => t.id === id);
  return task || null;
}

export function createTask(input: CreateTaskInput): Task {
  reloadDatabase();
  const maxId = Math.max(0, ...tasksDb.map((t) => parseInt(t.id, 10)));
  const newId = (maxId + 1).toString();
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
  tasksDb.push(newTask);
  saveToFile();
  return newTask;
}

export function updateTask(id: string, updates: UpdateTaskInput): Task {
  reloadDatabase();
  const taskIndex = tasksDb.findIndex((t) => t.id === id);
  if (taskIndex === -1) {
    throw new Error(`Task with ID ${id} not found`);
  }
  const task = tasksDb[taskIndex];
  if (updates.title !== undefined) task.title = updates.title;
  if (updates.description !== undefined) task.description = updates.description;
  if (updates.completed !== undefined) task.completed = updates.completed;
  if (updates.dueDate !== undefined) task.dueDate = updates.dueDate;
  task.updatedAt = new Date().toISOString();
  saveToFile();
  return task;
}

export function toggleTask(id: string): Task {
  reloadDatabase();
  const taskIndex = tasksDb.findIndex((t) => t.id === id);
  if (taskIndex === -1) {
    throw new Error(`Task with ID ${id} not found`);
  }
  const task = tasksDb[taskIndex];
  task.completed = !task.completed;
  task.updatedAt = new Date().toISOString();
  saveToFile();
  return task;
}

export function deleteTask(id: string): boolean {
  reloadDatabase();
  const taskIndex = tasksDb.findIndex((t) => t.id === id);
  if (taskIndex === -1) {
    return false;
  }
  tasksDb.splice(taskIndex, 1);
  saveToFile();
  return true;
}

export function deleteTasksByContactId(contactId: string): number {
  reloadDatabase();
  const beforeCount = tasksDb.length;
  tasksDb = tasksDb.filter((t) => t.contactId !== contactId);
  const deletedCount = beforeCount - tasksDb.length;
  if (deletedCount > 0) {
    saveToFile();
  }
  return deletedCount;
}

export function getTaskCount(): number {
  initializeDatabase();
  return tasksDb.length;
}

export function resetDatabase(): void {
  tasksDb = [];
  saveToFile();
  console.log('Task Database reset - all tasks deleted');
}

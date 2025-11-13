/**
 * Task Service Unit Tests
 *
 * Tests for task service functions:
 * - getTasksByContactId
 * - createTask
 * - updateTask
 * - toggleTask
 * - deleteTask
 * - deleteTasksByContactId
 *
 * SETUP:
 * - Mocks the database layer
 * - Tests pure business logic
 * - Validates error handling
 */

import * as taskService from '@/services/taskService';
import * as db from '@/lib/db/tasks/index';
import { Task } from '@/types/task.types';

// Mock the database module
jest.mock('@/lib/db/tasks/index');

const mockDb = db as jest.Mocked<typeof db>;

describe('Task Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getTasksByContactId', () => {
    it('should return tasks for a contact', () => {
      const mockTasks: Task[] = [
        {
          id: '1',
          contactId: '1',
          title: 'Follow up',
          description: 'Check status',
          completed: false,
          dueDate: '2025-02-01',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
        {
          id: '2',
          contactId: '1',
          title: 'Send document',
          description: 'Send proposal',
          completed: true,
          dueDate: '2025-01-15',
          createdAt: '2025-01-02T00:00:00Z',
          updatedAt: '2025-01-02T00:00:00Z',
        },
      ];

      mockDb.getTasksByContactId.mockReturnValue(mockTasks);

      const result = taskService.getTasksByContactId('1');

      expect(result).toEqual(mockTasks);
      expect(mockDb.getTasksByContactId).toHaveBeenCalledWith('1');
    });

    it('should return empty array if no tasks', () => {
      mockDb.getTasksByContactId.mockReturnValue([]);

      const result = taskService.getTasksByContactId('1');

      expect(result).toEqual([]);
    });

    it('should throw error if contactId is empty', () => {
      expect(() => taskService.getTasksByContactId('')).toThrow();
    });
  });

  describe('createTask', () => {
    it('should create task with valid data', () => {
      const input = {
        contactId: '1',
        title: 'Follow up',
        description: 'Check status',
        dueDate: '2025-02-01',
      };

      const mockCreatedTask: Task = {
        id: '1',
        ...input,
        completed: false,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      };

      mockDb.createTask.mockReturnValue(mockCreatedTask);

      const result = taskService.createTask(input);

      expect(result).toEqual(mockCreatedTask);
      expect(mockDb.createTask).toHaveBeenCalledWith(input);
    });

    it('should create task with optional fields omitted', () => {
      const input = {
        contactId: '1',
        title: 'Follow up',
      };

      const mockCreatedTask: Task = {
        id: '1',
        contactId: '1',
        title: 'Follow up',
        description: undefined,
        dueDate: undefined,
        completed: false,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      };

      mockDb.createTask.mockReturnValue(mockCreatedTask);

      const result = taskService.createTask(input);

      expect(result).toEqual(mockCreatedTask);
    });

    it('should throw validation error for missing title', () => {
      const input = {
        contactId: '1',
        title: '',
        description: 'Check status',
      };

      expect(() => taskService.createTask(input)).toThrow('Validation failed');
    });

    it('should throw validation error for title too long', () => {
      const input = {
        contactId: '1',
        title: 'a'.repeat(201),
        description: 'Check status',
      };

      expect(() => taskService.createTask(input)).toThrow('Validation failed');
    });

    it('should throw validation error for missing contactId', () => {
      const input = {
        contactId: '',
        title: 'Follow up',
      };

      expect(() => taskService.createTask(input)).toThrow('Validation failed');
    });
  });

  describe('updateTask', () => {
    it('should update task with valid data', () => {
      const existingTask: Task = {
        id: '1',
        contactId: '1',
        title: 'Follow up',
        description: 'Check status',
        completed: false,
        dueDate: '2025-02-01',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      };

      const updates = {
        title: 'Updated title',
        completed: true,
      };

      const updatedTask: Task = {
        ...existingTask,
        ...updates,
        updatedAt: '2025-01-02T00:00:00Z',
      };

      mockDb.getTaskById.mockReturnValue(existingTask);
      mockDb.updateTask.mockReturnValue(updatedTask);

      const result = taskService.updateTask('1', updates);

      expect(result).toEqual(updatedTask);
      expect(mockDb.updateTask).toHaveBeenCalledWith('1', updates);
    });

    it('should throw error if task not found', () => {
      mockDb.getTaskById.mockReturnValue(null);

      expect(() =>
        taskService.updateTask('999', { title: 'New Title' })
      ).toThrow('Task with ID 999 not found');
    });
  });

  describe('toggleTask', () => {
    it('should toggle task completion status', () => {
      const existingTask: Task = {
        id: '1',
        contactId: '1',
        title: 'Follow up',
        description: 'Check status',
        completed: false,
        dueDate: '2025-02-01',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      };

      const toggledTask: Task = {
        ...existingTask,
        completed: true,
        updatedAt: '2025-01-02T00:00:00Z',
      };

      mockDb.getTaskById.mockReturnValue(existingTask);
      mockDb.toggleTask.mockReturnValue(toggledTask);

      const result = taskService.toggleTask('1');

      expect(result.completed).toBe(true);
      expect(mockDb.toggleTask).toHaveBeenCalled();
    });

    it('should throw error if task not found', () => {
      mockDb.getTaskById.mockReturnValue(null);

      expect(() => taskService.toggleTask('999')).toThrow();
    });
  });

  describe('deleteTask', () => {
    it('should delete task successfully', () => {
      const existingTask: Task = {
        id: '1',
        contactId: '1',
        title: 'Follow up',
        description: 'Check status',
        completed: false,
        dueDate: '2025-02-01',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      };

      mockDb.getTaskById.mockReturnValue(existingTask);
      mockDb.deleteTask.mockReturnValue(true);

      const result = taskService.deleteTask('1');

      expect(result).toBe(true);
      expect(mockDb.deleteTask).toHaveBeenCalledWith('1');
    });

    it('should throw error if task not found', () => {
      mockDb.getTaskById.mockReturnValue(null);

      expect(() => taskService.deleteTask('999')).toThrow('Task with ID 999 not found');
    });
  });

  describe('deleteTasksByContactId', () => {
    it('should delete all tasks for a contact', () => {
      mockDb.deleteTasksByContactId.mockReturnValue(5);

      const result = taskService.deleteTasksByContactId('1');

      expect(result).toBe(5);
      expect(mockDb.deleteTasksByContactId).toHaveBeenCalledWith('1');
    });

    it('should return 0 if no tasks deleted', () => {
      mockDb.deleteTasksByContactId.mockReturnValue(0);

      const result = taskService.deleteTasksByContactId('999');

      expect(result).toBe(0);
    });
  });
});

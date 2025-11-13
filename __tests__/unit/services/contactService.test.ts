/**
 * Contact Service Unit Tests
 *
 * Tests for all contact service functions:
 * - getAllContacts
 * - getContactById
 * - createContact
 * - updateContact
 * - deleteContact
 * - searchContacts
 * - sortContacts
 *
 * SETUP:
 * - Mocks the database layer
 * - Tests pure business logic
 * - Validates error handling
 */

import * as contactService from '@/services/contactService';
import * as db from '@/lib/db/contacts/index';
import { Contact } from '@/types/contact.types';

// Mock the database module
jest.mock('@/lib/db/contacts/index');

const mockDb = db as jest.Mocked<typeof db>;

describe('Contact Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getAllContacts', () => {
    it('should return all contacts from database', () => {
      const mockContacts: Contact[] = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '555-1234',
          address: '123 Main St',
          createdAt: '2025-01-01T00:00:00Z',
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '555-5678',
          address: '456 Oak Ave',
          createdAt: '2025-01-02T00:00:00Z',
        },
      ];

      mockDb.getAllContacts.mockReturnValue(mockContacts);

      const result = contactService.getAllContacts();

      expect(result).toEqual(mockContacts);
      expect(mockDb.getAllContacts).toHaveBeenCalledTimes(1);
    });

    it('should return empty array if no contacts', () => {
      mockDb.getAllContacts.mockReturnValue([]);

      const result = contactService.getAllContacts();

      expect(result).toEqual([]);
    });

    it('should handle database errors gracefully', () => {
      mockDb.getAllContacts.mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      expect(() => contactService.getAllContacts()).toThrow('Failed to fetch contacts');
    });
  });

  describe('getContactById', () => {
    it('should return contact by ID', () => {
      const mockContact: Contact = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '555-1234',
        address: '123 Main St',
        createdAt: '2025-01-01T00:00:00Z',
      };

      mockDb.getContactById.mockReturnValue(mockContact);

      const result = contactService.getContactById('1');

      expect(result).toEqual(mockContact);
      expect(mockDb.getContactById).toHaveBeenCalledWith('1');
    });

    it('should return null if contact not found', () => {
      mockDb.getContactById.mockReturnValue(null);

      const result = contactService.getContactById('999');

      expect(result).toBeNull();
    });

    it('should throw error if ID is empty', () => {
      expect(() => contactService.getContactById('')).toThrow();
    });

    it('should throw error if ID is null', () => {
      expect(() => contactService.getContactById(null as any)).toThrow();
    });
  });

  describe('createContact', () => {
    it('should create contact with valid data', () => {
      const input = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '555-1234',
        address: '123 Main St',
      };

      const mockCreatedContact: Contact = {
        id: '1',
        ...input,
        createdAt: '2025-01-01T00:00:00Z',
      };

      mockDb.createContact.mockReturnValue(mockCreatedContact);

      const result = contactService.createContact(input);

      expect(result).toEqual(mockCreatedContact);
      expect(mockDb.createContact).toHaveBeenCalledWith(input);
    });

    it('should throw validation error for missing name', () => {
      const input = {
        name: '',
        email: 'john@example.com',
        phone: '555-1234',
        address: '123 Main St',
      };

      expect(() => contactService.createContact(input)).toThrow('Validation failed');
    });

    it('should throw validation error for invalid email', () => {
      const input = {
        name: 'John Doe',
        email: 'invalid-email',
        phone: '555-1234',
        address: '123 Main St',
      };

      expect(() => contactService.createContact(input)).toThrow('Validation failed');
    });

    it('should throw validation error for invalid phone', () => {
      const input = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: 'invalid',
        address: '123 Main St',
      };

      expect(() => contactService.createContact(input)).toThrow('Validation failed');
    });

    it('should throw validation error for address too short', () => {
      const input = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '555-1234',
        address: 'a',
      };

      expect(() => contactService.createContact(input)).toThrow('Validation failed');
    });
  });

  describe('updateContact', () => {
    it('should update contact with valid data', () => {
      const existingContact: Contact = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '555-1234',
        address: '123 Main St',
        createdAt: '2025-01-01T00:00:00Z',
      };

      const updates = {
        name: 'John Smith',
        email: 'johnsmith@example.com',
      };

      const updatedContact: Contact = {
        ...existingContact,
        ...updates,
      };

      mockDb.getContactById.mockReturnValue(existingContact);
      mockDb.updateContact.mockReturnValue(updatedContact);

      const result = contactService.updateContact('1', updates);

      expect(result).toEqual(updatedContact);
      expect(mockDb.updateContact).toHaveBeenCalledWith('1', updates);
    });

    it('should throw error if contact not found', () => {
      mockDb.getContactById.mockReturnValue(null);

      expect(() => contactService.updateContact('999', { name: 'New Name' })).toThrow(
        'Contact with ID 999 not found'
      );
    });

    it('should throw error if updates are invalid', () => {
      const existingContact: Contact = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '555-1234',
        address: '123 Main St',
        createdAt: '2025-01-01T00:00:00Z',
      };

      mockDb.getContactById.mockReturnValue(existingContact);

      expect(() => contactService.updateContact('1', { email: 'invalid-email' })).toThrow(
        'Validation failed'
      );
    });
  });

  describe('deleteContact', () => {
    it('should delete contact successfully', () => {
      const existingContact: Contact = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '555-1234',
        address: '123 Main St',
        createdAt: '2025-01-01T00:00:00Z',
      };

      mockDb.getContactById.mockReturnValue(existingContact);
      mockDb.deleteContact.mockReturnValue(true);

      const result = contactService.deleteContact('1');

      expect(result).toBe(true);
      expect(mockDb.deleteContact).toHaveBeenCalledWith('1');
    });

    it('should throw error if contact not found', () => {
      mockDb.getContactById.mockReturnValue(null);

      expect(() => contactService.deleteContact('999')).toThrow('Contact with ID 999 not found');
    });
  });

  describe('searchContacts', () => {
    it('should search contacts by query', () => {
      const mockResults: Contact[] = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '555-1234',
          address: '123 Main St',
          createdAt: '2025-01-01T00:00:00Z',
        },
      ];

      mockDb.searchContacts.mockReturnValue(mockResults);

      const result = contactService.searchContacts('john');

      expect(result).toEqual(mockResults);
      expect(mockDb.searchContacts).toHaveBeenCalledWith('john');
    });

    it('should return all contacts if query is empty', () => {
      const mockContacts: Contact[] = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '555-1234',
          address: '123 Main St',
          createdAt: '2025-01-01T00:00:00Z',
        },
      ];

      mockDb.getAllContacts.mockReturnValue(mockContacts);

      const result = contactService.searchContacts('');

      expect(result).toEqual(mockContacts);
      expect(mockDb.getAllContacts).toHaveBeenCalled();
    });

    it('should trim whitespace from search query', () => {
      const mockResults: Contact[] = [];
      mockDb.getAllContacts.mockReturnValue(mockResults);

      const result = contactService.searchContacts('   ');

      expect(result).toEqual(mockResults);
      expect(mockDb.getAllContacts).toHaveBeenCalled();
    });
  });

  describe('sortContacts', () => {
    const contacts: Contact[] = [
      {
        id: '1',
        name: 'Charlie Brown',
        email: 'charlie@example.com',
        phone: '555-1234',
        address: '123 Main St',
        createdAt: '2025-01-03T00:00:00Z',
      },
      {
        id: '2',
        name: 'Alice Smith',
        email: 'alice@example.com',
        phone: '555-5678',
        address: '456 Oak Ave',
        createdAt: '2025-01-01T00:00:00Z',
      },
      {
        id: '3',
        name: 'Bob Johnson',
        email: 'bob@example.com',
        phone: '555-9012',
        address: '789 Pine Ln',
        createdAt: '2025-01-02T00:00:00Z',
      },
    ];

    it('should sort by name ascending', () => {
      const result = contactService.sortContacts(contacts, 'name', 'asc');

      expect(result[0].name).toBe('Alice Smith');
      expect(result[1].name).toBe('Bob Johnson');
      expect(result[2].name).toBe('Charlie Brown');
    });

    it('should sort by name descending', () => {
      const result = contactService.sortContacts(contacts, 'name', 'desc');

      expect(result[0].name).toBe('Charlie Brown');
      expect(result[1].name).toBe('Bob Johnson');
      expect(result[2].name).toBe('Alice Smith');
    });

    it('should sort by email ascending', () => {
      const result = contactService.sortContacts(contacts, 'email', 'asc');

      expect(result[0].email).toBe('alice@example.com');
      expect(result[1].email).toBe('bob@example.com');
      expect(result[2].email).toBe('charlie@example.com');
    });

    it('should sort by createdAt ascending', () => {
      const result = contactService.sortContacts(contacts, 'createdAt', 'asc');

      expect(result[0].id).toBe('2'); // Alice - Jan 1
      expect(result[1].id).toBe('3'); // Bob - Jan 2
      expect(result[2].id).toBe('1'); // Charlie - Jan 3
    });

    it('should sort by createdAt descending', () => {
      const result = contactService.sortContacts(contacts, 'createdAt', 'desc');

      expect(result[0].id).toBe('1'); // Charlie - Jan 3
      expect(result[1].id).toBe('3'); // Bob - Jan 2
      expect(result[2].id).toBe('2'); // Alice - Jan 1
    });

    it('should not mutate original array', () => {
      const originalOrder = [...contacts];
      const result = contactService.sortContacts(contacts, 'name', 'asc');

      expect(contacts).toEqual(originalOrder);
      expect(result).not.toEqual(originalOrder);
    });
  });

  describe('getContactCount', () => {
    it('should return total contact count', () => {
      mockDb.getContactCount.mockReturnValue(500);

      const result = contactService.getContactCount();

      expect(result).toBe(500);
      expect(mockDb.getContactCount).toHaveBeenCalledTimes(1);
    });
  });
});

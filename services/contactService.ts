/**
 * Contact Service Layer - Business Logic
 *
 * ARCHITECTURE:
 * - Uses Validator to check data BEFORE saving
 * - Uses Database to persist data
 * - Handles errors and exceptions
 * - Single source for all contact business logic
 *
 * FLOW: API/Component → Service (validates) → Database (persists)
 */

// validation + db operations business logic

import {
  Contact,
  CreateContactInput,
  UpdateContactInput,
  ValidationResult,
} from '@/types/contact.types';
import ContactValidator from '@/lib/validators/contact.validator';
import * as db from '@/lib/db/contacts/index';
import { isEmpty } from '@/lib/utils';
import { format } from 'path';

/**
 * GET ALL CONTACTS
 * Returns all contacts from database
 *
 * @returns Array of all contacts
 */
export function getAllContacts(): Contact[] {
  try {
    return db.getAllContacts();
  } catch (error) {
    console.error('Service: Error fetching all contacts', error);
    throw new Error('Failed to fetch contacts');
  }
}

/**
 * GET SINGLE CONTACT
 * Finds contact by ID
 *
 * @param id - Contact ID to find
 * @returns Contact or null if not found
 */
export function getContactById(id: string): Contact | null {
  try {
    if (isEmpty(id)) {
      throw new Error('Contact ID is required');
    }
    return db.getContactById(id);
  } catch (error) {
    console.error(`Service: Error fetching contact ${id}`, error);
    throw new Error('Failed to fetch contact');
  }
}

/**
 * CREATE NEW CONTACT
 * Validates input, then saves to database
 *
 * FLOW:
 * 1. Validate all fields (name, email, phone, address)
 * 2. If validation fails, throw error with details
 * 3. If validation passes, call database to create
 * 4. Return created contact
 *
 * @param input - User-provided contact data
 * @returns Created contact with ID and timestamp
 * @throws Error if validation fails or database error
 */

// converts errors array
// [
//   { field: "email", message: "Email is required" },
//   { field: "password", message: "Password must be at least 6 characters" }
// ]
// to string of format
// "email: Email is required; password: Password must be at least 6 characters"

export function createContact(input: CreateContactInput): Contact {
  try {
    // STEP 1: Validate input
    const validation = ContactValidator.validateCreateInput(input);

    // STEP 2: If validation fails, throw error with all problems
    if (!validation.isValid) {
      const errorMessage = validation.errors
        .map((err) => `${err.field}: ${err.message}`)
        .join('; ');
      throw new Error(`Validation failed: ${errorMessage}`);
    }

    // STEP 3: Validation passed, create contact
    const newContact = db.createContact(input);
    console.log(`Contact created: ID ${newContact.id}`);

    return newContact;
  } catch (error) {
    console.error('Service: Error creating contact', error);
    throw error;
  }
}

/**
 * UPDATE EXISTING CONTACT
 * Validates input, then updates database
 *
 * FLOW:
 * 1. Check if contact exists
 * 2. Validate the fields being updated
 * 3. If validation fails, throw error
 * 4. If validation passes, update database
 * 5. Return updated contact
 *
 * @param id - Contact ID to update
 * @param updates - Fields to update (any field can be omitted)
 * @returns Updated contact object
 * @throws Error if validation fails, contact not found, or database error
 */
export function updateContact(id: string, updates: UpdateContactInput): Contact {
  try {
    // STEP 1: Check if contact exists
    const existingContact = db.getContactById(id);
    if (!existingContact) {
      throw new Error(`Contact with ID ${id} not found`);
    }

    // STEP 2: Validate the fields being updated
    const validation = ContactValidator.validateUpdateInput(updates);

    // STEP 3: If validation fails, throw error
    if (!validation.isValid) {
      const errorMessage = validation.errors
        .map((err) => `${err.field}: ${err.message}`)
        .join('; ');
      throw new Error(`Validation failed: ${errorMessage}`);
    }

    // STEP 4: Validation passed, update contact
    const updatedContact = db.updateContact(id, updates);
    console.log(`Contact updated: ID ${id}`);

    return updatedContact;
  } catch (error) {
    console.error(`Service: Error updating contact ${id}`, error);
    throw error;
  }
}

/**
 * DELETE CONTACT
 * Removes contact from database
 *
 * @param id - Contact ID to delete
 * @returns true if deleted, false if not found
 */
export function deleteContact(id: string): boolean {
  try {
    // Check if contact exists first
    const contact = db.getContactById(id);
    if (!contact) {
      throw new Error(`Contact with ID ${id} not found`);
    }

    // Delete it
    const deleted = db.deleteContact(id);
    console.log(`Contact deleted: ID ${id}`);

    return deleted;
  } catch (error) {
    console.error(`Service: Error deleting contact ${id}`, error);
    throw error;
  }
}

/**
 * SEARCH CONTACTS
 * Find contacts by name or email
 *
 * @param query - Search term
 * @returns Array of matching contacts
 */
export function searchContacts(query: string): Contact[] {
  try {
    // Use explicit check for search queries (not isEmpty which is more generic)
    if (!query || query.trim() === '') {
      return getAllContacts();
    }

    return db.searchContacts(query.trim());
  } catch (error) {
    console.error('Service: Error searching contacts', error);
    throw new Error('Failed to search contacts');
  }
}

/**
 * SORT CONTACTS
 * Sort contacts by specified field
 *
 * @param contacts - Array of contacts to sort
 * @param sortBy - Field to sort by: 'name', 'email', or 'createdAt'
 * @param direction - 'asc' or 'desc' (default: 'asc')
 * @returns Sorted array of contacts
 */
export function sortContacts(
  contacts: Contact[],
  sortBy: 'name' | 'email' | 'createdAt' = 'name',
  direction: 'asc' | 'desc' = 'asc'
): Contact[] {
  try {
    const sorted = [...contacts].sort((a, b) => {
      let compareA: any;
      let compareB: any;

      if (sortBy === 'name') {
        compareA = a.name.toLowerCase();
        compareB = b.name.toLowerCase();
      } else if (sortBy === 'email') {
        compareA = a.email.toLowerCase();
        compareB = b.email.toLowerCase();
      } else if (sortBy === 'createdAt') {
        compareA = new Date(a.createdAt).getTime();
        compareB = new Date(b.createdAt).getTime();
      }

      if (compareA < compareB) return direction === 'asc' ? -1 : 1;
      if (compareA > compareB) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  } catch (error) {
    console.error('Service: Error sorting contacts', error);
    throw new Error('Failed to sort contacts');
  }
}

/**
 * GET CONTACT COUNT
 * Returns total number of contacts
 *
 * @returns Number of contacts
 */
export function getContactCount(): number {
  try {
    return db.getContactCount();
  } catch (error) {
    console.error('Service: Error getting contact count', error);
    throw new Error('Failed to get contact count');
  }
}

/**
 * VALIDATE CONTACT INPUT
 * Public method to validate without creating
 * Useful for form validation on frontend
 *
 * @param input - Contact data to validate
 * @param isUpdate - true if updating (partial validation), false if creating (full validation)
 * @returns Validation result with errors
 */

// for frontend validation before data sent to ApiError,prevents unnecessary api call
export function validateContactInput(
  input: CreateContactInput | UpdateContactInput,
  isUpdate: boolean = false
): ValidationResult {
  try {
    if (isUpdate) {
      return ContactValidator.validateUpdateInput(input as UpdateContactInput);
    } else {
      return ContactValidator.validateCreateInput(input as CreateContactInput);
    }
  } catch (error) {
    console.error('Service: Error validating contact', error);
    return {
      isValid: false,
      errors: [{ field: 'general', message: 'Validation error' }],
    };
  }
}

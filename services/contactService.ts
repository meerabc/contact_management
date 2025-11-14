// validation + db operations business logic.these services are used by apis.the types
// used as function parameters and return types are defined in types folder for contacts/tasks
// respectively

import {Contact, CreateContactInput, UpdateContactInput, ValidationResult} from '@/types/contact.types';
import ContactValidator from '@/lib/validators/contact.validator';
import * as db from '@/lib/db/contacts/index';


export function getAllContacts(): Contact[] {
  try {
    return db.getAllContacts();
  } catch (error) {
    console.error('Service: Error fetching all contacts', error);
    throw new Error('Failed to fetch contacts');
  }
}


export function getContactById(id: string): Contact | null {
  try {
    if (!id || (typeof id === 'string' && id.trim() === '')) {
      throw new Error('Contact ID is required');
    }
    return db.getContactById(id);
  } catch (error) {
    console.error(`Service: Error fetching contact ${id}`, error);
    throw new Error('Failed to fetch contact');
  }
}


export function createContact(input: CreateContactInput): Contact {
  try {
    const validation = ContactValidator.validateCreateInput(input);
    if (!validation.isValid) {
      const errorMessage = validation.errors
        .map((err) => `${err.field}: ${err.message}`)
        .join('; ');
      throw new Error(`Validation failed: ${errorMessage}`);
    }
    const existingContact = db.getContactByPhone(input.phone);
    if (existingContact) {
      throw new Error('Validation failed: phone: Phone number already exists');
    }
    const newContact = db.createContact(input);
    console.log(`Contact created: ID ${newContact.id}`);
    return newContact;
  } catch (error) {
    console.error('Service: Error creating contact', error);
    throw error;
  }
}


export function updateContact(id: string, updates: UpdateContactInput): Contact {
  try {
    if (updates.phone !== undefined) {
      const contactWithPhone = db.getContactByPhone(updates.phone);
      if (contactWithPhone && contactWithPhone.id !== id) {
        throw new Error('Validation failed: phone: Phone number already exists');
      }
    }
    const existingContact = db.getContactById(id);
    if (!existingContact) {
      throw new Error(`Contact with ID ${id} not found`);
    }
    const validation = ContactValidator.validateUpdateInput(updates);
    if (!validation.isValid) {
      const errorMessage = validation.errors
        .map((err) => `${err.field}: ${err.message}`)
        .join('; ');
      throw new Error(`Validation failed: ${errorMessage}`);
    }
    const updatedContact = db.updateContact(id, updates);
    console.log(`Contact updated: ID ${id}`);
    return updatedContact;
  } catch (error) {
    console.error(`Service: Error updating contact ${id}`, error);
    throw error;
  }
}


export function deleteContact(id: string): boolean {
  try {
    const contact = db.getContactById(id);
    if (!contact) {
      throw new Error(`Contact with ID ${id} not found`);
    }
    const deleted = db.deleteContact(id);
    console.log(`Contact deleted: ID ${id}`);
    return deleted;
  } catch (error) {
    console.error(`Service: Error deleting contact ${id}`, error);
    throw error;
  }
}


export function searchContacts(query: string): Contact[] {
  try {
    if (!query || query.trim() === '') {
      return getAllContacts();
    }
    return db.searchContacts(query.trim());
  } catch (error) {
    console.error('Service: Error searching contacts', error);
    throw new Error('Failed to search contacts');
  }
}


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


export function getContactCount(): number {
  try {
    return db.getContactCount();
  } catch (error) {
    console.error('Service: Error getting contact count', error);
    throw new Error('Failed to get contact count');
  }
}


// for frontend validation before data sent to api,prevents unnecessary api call
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

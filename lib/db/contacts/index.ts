/**
 * Contact Database Layer - In-Memory with JSON File Persistence
 *
 * ARCHITECTURE:
 * - Loads contacts from lib/db/contacts.json on startup
 * - Stores contacts in memory (fast reads)
 * - Saves to JSON file after every write (persistence across restarts)
 * - All operations are synchronous
 */

import fs from 'fs';
import path from 'path';
import { Contact, CreateContactInput, UpdateContactInput } from '@/types/contact.types';

// Path to JSON file
const DB_PATH = path.join(process.cwd(), 'lib', 'db', 'contacts', 'contacts.json');

/**
 * In-memory database
 * Loaded once on first use, then kept in memory for fast access
 */
let contactsDb: Contact[] = [];
let isInitialized = false;

/**
 * Load contacts from JSON file into memory
 * Run this ONCE when app starts
 */
function initializeDatabase(): void {
  if (isInitialized) return;

  try {
    // Read the JSON file
    const fileContent = fs.readFileSync(DB_PATH, 'utf-8');
    const data = JSON.parse(fileContent);

    // Store in memory
    contactsDb = data.contacts || [];
    isInitialized = true;
    console.log(`✅ Contact Database initialized with ${contactsDb.length} contacts`);
  } catch (error) {
    console.error('❌ Failed to load contact database:', error);
    contactsDb = [];
    isInitialized = true;
  }
}

/**
 * Save contacts to JSON file
 * Called after every write operation (CREATE, UPDATE, DELETE)
 */
function saveToFile(): void {
  try {
    const data = { contacts: contactsDb };
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ Failed to save contact database:', error);
    throw new Error('Contact database save failed');
  }
}

/**
 * GET ALL CONTACTS
 * Returns all contacts from memory
 *
 * @returns Array of all contacts
 */
export function getAllContacts(): Contact[] {
  initializeDatabase();
  return contactsDb;
}

/**
 * GET SINGLE CONTACT BY ID
 * Finds contact by ID
 *
 * @param id - Contact ID to find
 * @returns Contact object or null if not found
 */
export function getContactById(id: string): Contact | null {
  initializeDatabase();
  const contact = contactsDb.find((c) => c.id === id);
  return contact || null;
}

/**
 * CREATE NEW CONTACT
 * Adds new contact to database
 *
 * LOGIC:
 * 1. Find highest ID currently in database
 * 2. New contact gets ID = highest + 1
 * 3. Set createdAt to current timestamp (ISO format)
 * 4. Add to contacts array
 * 5. Save to file
 *
 * @param input - Contact data from user
 * @returns Created contact with auto-generated ID and createdAt
 */
export function createContact(input: CreateContactInput): Contact {
  initializeDatabase();

  // Find the highest ID (as number) and add 1
  const maxId = Math.max(0, ...contactsDb.map((c) => parseInt(c.id, 10)));
  const newId = (maxId + 1).toString();

  // Create new contact object
  const newContact: Contact = {
    id: newId,
    name: input.name,
    email: input.email,
    phone: input.phone,
    address: input.address,
    createdAt: new Date().toISOString(),
  };

  // Add to array
  contactsDb.push(newContact);

  // Save to file
  saveToFile();

  return newContact;
}

/**
 * UPDATE EXISTING CONTACT
 * Updates specific fields of a contact
 *
 * LOGIC:
 * 1. Find contact by ID
 * 2. Update only the fields provided (others stay same)
 * 3. Save to file
 *
 * @param id - Contact ID to update
 * @param updates - Fields to update (any field can be undefined = skip it)
 * @returns Updated contact object
 * @throws Error if contact not found
 */
export function updateContact(id: string, updates: UpdateContactInput): Contact {
  initializeDatabase();

  // Find the contact
  const contactIndex = contactsDb.findIndex((c) => c.id === id);
  if (contactIndex === -1) {
    throw new Error(`Contact with ID ${id} not found`);
  }

  // Update only provided fields
  const contact = contactsDb[contactIndex];
  if (updates.name !== undefined) contact.name = updates.name;
  if (updates.email !== undefined) contact.email = updates.email;
  if (updates.phone !== undefined) contact.phone = updates.phone;
  if (updates.address !== undefined) contact.address = updates.address;

  // Save to file
  saveToFile();

  return contact;
}

/**
 * DELETE CONTACT
 * Removes contact from database
 *
 * LOGIC:
 * 1. Find contact by ID
 * 2. Remove it from array
 * 3. Save to file
 *
 * @param id - Contact ID to delete
 * @returns true if deleted, false if not found
 */
export function deleteContact(id: string): boolean {
  initializeDatabase();

  // Find the contact
  const contactIndex = contactsDb.findIndex((c) => c.id === id);
  if (contactIndex === -1) {
    return false;
  }

  // Remove from array
  contactsDb.splice(contactIndex, 1);

  // Save to file
  saveToFile();

  return true;
}

/**
 * SEARCH CONTACTS
 * Find contacts by name or email
 *
 * @param query - Search term (case-insensitive)
 * @returns Array of matching contacts
 */
export function searchContacts(query: string): Contact[] {
  initializeDatabase();

  const lowerQuery = query.toLowerCase();
  return contactsDb.filter(
    (c) => c.name.toLowerCase().includes(lowerQuery) || c.email.toLowerCase().includes(lowerQuery)
  );
}

/**
 * GET CONTACT COUNT
 * Returns total number of contacts
 *
 * @returns Number of contacts
 */
export function getContactCount(): number {
  initializeDatabase();
  return contactsDb.length;
}

/**
 * RESET DATABASE
 * Clears all contacts (useful for testing)
 * WARNING: This deletes everything!
 */
export function resetDatabase(): void {
  contactsDb = [];
  saveToFile();
  console.log('⚠️  Contact Database reset - all contacts deleted');
}

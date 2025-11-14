// acts like a mini resetDatabase.basic database operations are defined here to perform manipulations
// on JSON files

import fs from 'fs';
import path from 'path';
import { Contact, CreateContactInput, UpdateContactInput } from '@/types/contact.types';

// path to the JSON file
const DB_PATH = path.join(process.cwd(), 'lib', 'db', 'contacts', 'contacts.json');

// in-memory database.loaded once on first use, then kept in memory for fast access

let contactsDb: Contact[] = [];
let isInitialized = false;

// loads contacts from JSON file into memory.Runs only once when app starts
function initializeDatabase(): void {
  if (isInitialized) return;

  try {
    const fileContent = fs.readFileSync(DB_PATH, 'utf-8');
    const data = JSON.parse(fileContent);
    contactsDb = data.contacts || [];
    isInitialized = true;
    console.log(`Contact Database initialized with ${contactsDb.length} contacts`);
  } catch (error) {
    console.error('Failed to load contact database:', error);
    contactsDb = [];
    isInitialized = true;
  }
}


//saves contacts to JSON file, called after every write operation (CREATE, UPDATE, DELETE)
function saveToFile(): void {
  try {
    const data = { contacts: contactsDb };
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Failed to save contact database:', error);
    throw new Error('Contact database save failed');
  }
}

function reloadDatabase(): void {
  if (!isInitialized) {
    initializeDatabase();
    return;
  }
  try {
    const fileContent = fs.readFileSync(DB_PATH, 'utf-8');
    const data = JSON.parse(fileContent);
    contactsDb = data.contacts || [];
  } catch (error) {
    console.error('Failed to reload contact database:', error);
  }
}

export function getAllContacts(): Contact[] {
  reloadDatabase();
  return contactsDb;
}

export function getContactById(id: string): Contact | null {
  reloadDatabase();
  const contact = contactsDb.find((c) => c.id === id);
  return contact || null;
}

export function getContactByPhone(phone: string): Contact | null {
  reloadDatabase();
  const contact = contactsDb.find((c) => c.phone === phone);
  return contact || null;
}

export function createContact(input: CreateContactInput): Contact {
  initializeDatabase();
  const maxId = Math.max(0, ...contactsDb.map((c) => parseInt(c.id, 10)));
  const newId = (maxId + 1).toString();
  const newContact: Contact = {
    id: newId,
    name: input.name,
    email: input.email,
    phone: input.phone,
    address: input.address,
    createdAt: new Date().toISOString(),
  };
  contactsDb.push(newContact);
  saveToFile();

  return newContact;
}

export function updateContact(id: string, updates: UpdateContactInput): Contact {
  initializeDatabase();
  const contactIndex = contactsDb.findIndex((c) => c.id === id);
  if (contactIndex === -1) {
    throw new Error(`Contact with ID ${id} not found`);
  }
  const contact = contactsDb[contactIndex];
  if (updates.name !== undefined) contact.name = updates.name;
  if (updates.email !== undefined) contact.email = updates.email;
  if (updates.phone !== undefined) contact.phone = updates.phone;
  if (updates.address !== undefined) contact.address = updates.address;
  saveToFile();
  return contact;
}


export function deleteContact(id: string): boolean {
  initializeDatabase();
  const contactIndex = contactsDb.findIndex((c) => c.id === id);
  if (contactIndex === -1) {
    return false;
  }
  contactsDb.splice(contactIndex, 1);
  saveToFile();
  return true;
}

export function searchContacts(query: string): Contact[] {
  reloadDatabase();

  const lowerQuery = query.toLowerCase();
  return contactsDb.filter(
    (c) => c.name.toLowerCase().includes(lowerQuery) || c.email.toLowerCase().includes(lowerQuery)
  );
}

export function getContactCount(): number {
  reloadDatabase();
  return contactsDb.length;
}

export function resetDatabase(): void {
  contactsDb = [];
  saveToFile();
  console.log('Contact Database reset - all contacts deleted');
}

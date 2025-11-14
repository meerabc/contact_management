/*
 APIs:
 GET    /api/contacts              - Get all contacts
 GET    /api/contacts?search=john  - Search contacts
 POST   /api/contacts              - Create new contact
*/

import { NextRequest, NextResponse } from 'next/server';
import * as contactService from '@/services/contactService';
import { CreateContactInput } from '@/types/contact.types';

// GET    /api/contacts
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    let contacts;
    if (search) {
      contacts = contactService.searchContacts(search);
    } else {
      contacts = contactService.getAllContacts();
    }
    return NextResponse.json({
      success: true,
      data: contacts,
      total: contacts.length,
    });
  } catch (error) {
    console.error('API: GET /api/contacts error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch contacts',
      },
      { status: 500 }
    );
  }
}

// POST   /api/contacts
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        {
          success: false,
          error: 'Request body must be JSON object',
        },
        { status: 400 }
      );
    }
    const newContact = contactService.createContact(body as CreateContactInput);
    return NextResponse.json(
      {
        success: true,
        data: newContact,
      },
      { status: 201 } 
    );
  } catch (error) {
    console.error('API: POST /api/contacts error:', error);
    const isValidationError = error instanceof Error && error.message.includes('Validation failed');
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create contact',
      },
      { status: isValidationError ? 400 : 500 }
    );
  }
}

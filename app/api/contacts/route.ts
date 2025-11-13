/**
 * API Routes for Contacts
 *
 * Endpoints:
 * GET    /api/contacts              - Get all contacts
 * GET    /api/contacts?search=john  - Search contacts
 * GET    /api/contacts/[id]         - Get single contact
 * POST   /api/contacts              - Create new contact
 * PUT    /api/contacts/[id]         - Update contact
 * DELETE /api/contacts/[id]         - Delete contact
 *
 * ARCHITECTURE:
 * - Receives HTTP request from frontend
 * - Calls service layer for business logic
 * - Returns JSON response with data or error
 * - Service handles validation, database handles persistence
 */

import { NextRequest, NextResponse } from 'next/server';
import * as contactService from '@/services/contactService';
import { CreateContactInput } from '@/types/contact.types';

/**
 * GET /api/contacts
 * Get all contacts or search by query parameter
 *
 * Query params:
 * - ?search=john   → Search for "john" in name/email
 * - (no params)    → Get all contacts
 *
 * Response: { success: true, data: [...], total: 500 }
 */
export async function GET(request: NextRequest) {
  try {
    // Get search query from URL
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');

    let contacts;

    // If search query provided, search; otherwise get all
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

/**
 * POST /api/contacts
 * Create new contact
 *
 * Request body: { name, email, phone, address }
 * Response: { success: true, data: {...createdContact...} }
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate body has required fields
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        {
          success: false,
          error: 'Request body must be JSON object',
        },
        { status: 400 }
      );
    }

    // Create contact using service
    const newContact = contactService.createContact(body as CreateContactInput);

    return NextResponse.json(
      {
        success: true,
        data: newContact,
      },
      { status: 201 } // 201 = Created
    );
  } catch (error) {
    console.error('API: POST /api/contacts error:', error);

    // Check if error is from validation
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

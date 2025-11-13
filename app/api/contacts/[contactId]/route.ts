/**
 * API Routes for Single Contact (by contactId)
 *
 * Endpoints:
 * GET    /api/contacts/[contactId]      - Get single contact
 * PUT    /api/contacts/[contactId]      - Update contact
 * DELETE /api/contacts/[contactId]      - Delete contact
 *
 * Dynamic route: [contactId] = any contact ID passed in URL
 */

import { NextRequest, NextResponse } from 'next/server';
import * as contactService from '@/services/contactService';
import { UpdateContactInput } from '@/types/contact.types';

/**
 * GET /api/contacts/[contactId]
 * Get single contact by ID
 *
 * Response: { success: true, data: {...contact...} }
 */
export async function GET(request: NextRequest, { params }: { params: { contactId: string } }) {
  try {
    const { contactId } = params;

    // Fetch contact
    const contact = contactService.getContactById(contactId);

    if (!contact) {
      return NextResponse.json(
        {
          success: false,
          error: `Contact with ID ${contactId} not found`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: contact,
    });
  } catch (error) {
    console.error(`API: GET /api/contacts/${params.contactId} error:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch contact',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/contacts/[contactId]
 * Update contact by ID
 *
 * Request body: { name?, email?, phone?, address? } (partial update)
 * Response: { success: true, data: {...updatedContact...} }
 */
export async function PUT(request: NextRequest, { params }: { params: { contactId: string } }) {
  try {
    const { contactId } = params;

    // Parse request body
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

    // Update contact using service
    const updatedContact = contactService.updateContact(contactId, body as UpdateContactInput);

    return NextResponse.json({
      success: true,
      data: updatedContact,
    });
  } catch (error) {
    console.error(`API: PUT /api/contacts/${params.contactId} error:`, error);

    const errorMessage = error instanceof Error ? error.message : 'Failed to update contact';

    // Check if it's a not found error or validation error
    if (errorMessage.includes('not found')) {
      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
        },
        { status: 404 }
      );
    }

    if (errorMessage.includes('Validation failed')) {
      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/contacts/[contactId]
 * Delete contact by ID
 *
 * Response: { success: true, message: "Contact deleted" }
 */
export async function DELETE(request: NextRequest, { params }: { params: { contactId: string } }) {
  try {
    const { contactId } = params;

    // Delete contact
    const deleted = contactService.deleteContact(contactId);

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          error: `Contact with ID ${contactId} not found`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Contact ${contactId} deleted successfully`,
    });
  } catch (error) {
    console.error(`API: DELETE /api/contacts/${params.contactId} error:`, error);

    const errorMessage = error instanceof Error ? error.message : 'Failed to delete contact';

    if (errorMessage.includes('not found')) {
      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

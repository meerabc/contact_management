/*
 APIs:
 GET    /api/contacts/[contactId]      - Get single contact
 PUT    /api/contacts/[contactId]      - Update contact
 DELETE /api/contacts/[contactId]      - Delete contact
*/

import { NextRequest, NextResponse } from 'next/server';
import * as contactService from '@/services/contactService';
import { UpdateContactInput } from '@/types/contact.types';

// GET    /api/contacts/[contactId]
export async function GET(request: NextRequest, { params }: { params: Promise<{ contactId: string }> }) {
  try {
    const { contactId } = await params;
    if (!contactId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Contact ID is required',
        },
        { status: 400 }
      );
    }
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
    let contactId = 'unknown';
    try {
      const resolvedParams = await params;
      contactId = resolvedParams?.contactId || 'unknown';
    } catch {
      contactId = 'unknown';
    }
    console.error(`API: GET /api/contacts/${contactId} error:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch contact',
      },
      { status: 500 }
    );
  }
}


// PUT    /api/contacts/[contactId]      - Update contact
export async function PUT(request: NextRequest, { params }: { params: Promise<{ contactId: string }> }) {
  try {
    const { contactId } = await params;
    if (!contactId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Contact ID is required',
        },
        { status: 400 }
      );
    }
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
    const updatedContact = contactService.updateContact(contactId, body as UpdateContactInput);
    return NextResponse.json({
      success: true,
      data: updatedContact,
    });
  } catch (error) {
    let contactId = 'unknown';
    try {
      const resolvedParams = await params;
      contactId = resolvedParams?.contactId || 'unknown';
    } catch {
      contactId = 'unknown';
    }
    console.error(`API: PUT /api/contacts/${contactId} error:`, error);

    const errorMessage = error instanceof Error ? error.message : 'Failed to update contact';
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


// DELETE /api/contacts/[contactId]      - Delete contact
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ contactId: string }> }) {
  try {
    const { contactId } = await params;
    if (!contactId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Contact ID is required',
        },
        { status: 400 }
      );
    }
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
    let contactId = 'unknown';
    try {
      const resolvedParams = await params;
      contactId = resolvedParams?.contactId || 'unknown';
    } catch {
      contactId = 'unknown';
    }
    console.error(`API: DELETE /api/contacts/${contactId} error:`, error);
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

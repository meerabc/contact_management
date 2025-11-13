/**
 * API Routes for Tasks Collection
 *
 * Endpoints:
 * GET    /api/contacts/[contactId]/tasks      - Get all tasks for contact
 * POST   /api/contacts/[contactId]/tasks      - Create new task for contact
 *
 * ARCHITECTURE:
 * - Receives HTTP request from frontend
 * - Calls service layer for business logic
 * - Returns JSON response with data or error
 */

import { NextRequest, NextResponse } from 'next/server';
import * as taskService from '@/services/taskService';
import { CreateTaskInput } from '@/types/task.types';

/**
 * GET /api/contacts/[contactId]/tasks
 * Get all tasks for a specific contact
 *
 * Response: { success: true, data: [...], total: X }
 */
export async function GET(request: NextRequest, { params }: { params: { contactId: string } }) {
  try {
    const { contactId } = params;

    if (!contactId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Contact ID is required',
        },
        { status: 400 }
      );
    }

    // Fetch tasks for contact
    const tasks = taskService.getTasksByContactId(contactId);

    return NextResponse.json({
      success: true,
      data: tasks,
      total: tasks.length,
    });
  } catch (error) {
    console.error(`API: GET /api/contacts/${params.contactId}/tasks error:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch tasks',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/contacts/[contactId]/tasks
 * Create new task for contact
 *
 * Request body: { title, description?, dueDate? }
 * Response: { success: true, data: {...createdTask...} }
 */
export async function POST(request: NextRequest, { params }: { params: { contactId: string } }) {
  try {
    const { contactId } = params;

    if (!contactId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Contact ID is required',
        },
        { status: 400 }
      );
    }

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

    // Create task using service (contactId added automatically)
    const newTask = taskService.createTask({
      contactId,
      ...body,
    } as CreateTaskInput);

    return NextResponse.json(
      {
        success: true,
        data: newTask,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(`API: POST /api/contacts/${params.contactId}/tasks error:`, error);

    const isValidationError = error instanceof Error && error.message.includes('Validation failed');

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create task',
      },
      { status: isValidationError ? 400 : 500 }
    );
  }
}

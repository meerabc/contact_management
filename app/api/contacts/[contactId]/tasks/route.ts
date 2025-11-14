/*
 APIs:
 GET    /api/contacts/[contactId]/tasks      - Get all tasks for contact
 POST   /api/contacts/[contactId]/tasks      - Create new task for contact
*/

import { NextRequest, NextResponse } from 'next/server';
import * as taskService from '@/services/taskService';
import { CreateTaskInput } from '@/types/task.types';

// GET    /api/contacts/[contactId]/tasks
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
    const tasks = taskService.getTasksByContactId(contactId);
    return NextResponse.json({
      success: true,
      data: tasks,
      total: tasks.length,
    });
  } catch (error) {
    let contactId = 'unknown';
    try {
      const resolvedParams = await params;
      contactId = resolvedParams?.contactId || 'unknown';
    } catch {
      contactId = 'unknown';
    }
    console.error(`API: GET /api/contacts/${contactId}/tasks error:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch tasks',
      },
      { status: 500 }
    );
  }
}

// POST   /api/contacts/[contactId]/tasks
export async function POST(request: NextRequest, { params }: { params: Promise<{ contactId: string }> }) {
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
    let contactId = 'unknown';
    try {
      const resolvedParams = await params;
      contactId = resolvedParams?.contactId || 'unknown';
    } catch {
      contactId = 'unknown';
    }
    console.error(`API: POST /api/contacts/${contactId}/tasks error:`, error);
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

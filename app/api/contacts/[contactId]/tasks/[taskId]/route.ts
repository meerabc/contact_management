/**
 * API Routes for Single Task (by taskId)
 *
 * Endpoints:
 * PUT    /api/contacts/[contactId]/tasks/[taskId]      - Update task
 * PATCH  /api/contacts/[contactId]/tasks/[taskId]      - Toggle task completion
 * DELETE /api/contacts/[contactId]/tasks/[taskId]      - Delete task
 *
 * Dynamic routes: [contactId] and [taskId]
 */

import { NextRequest, NextResponse } from 'next/server';
import * as taskService from '@/services/taskService';
import { UpdateTaskInput } from '@/types/task.types';

/**
 * PUT /api/contacts/[contactId]/tasks/[taskId]
 * Update task by taskId
 *
 * Request body: { title?, description?, completed?, dueDate? }
 * Response: { success: true, data: {...updatedTask...} }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { contactId: string; taskId: string } }
) {
  try {
    const { contactId, taskId } = params;

    if (!contactId || !taskId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Contact ID and Task ID are required',
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

    // Update task using service
    const updatedTask = taskService.updateTask(taskId, body as UpdateTaskInput);

    // Verify task belongs to contact
    if (updatedTask.contactId !== contactId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Task does not belong to this contact',
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedTask,
    });
  } catch (error) {
    console.error(
      `API: PUT /api/contacts/${params.contactId}/tasks/${params.taskId} error:`,
      error
    );

    const errorMessage = error instanceof Error ? error.message : 'Failed to update task';

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
 * PATCH /api/contacts/[contactId]/tasks/[taskId]
 * Toggle task completion status
 *
 * No request body needed
 * Response: { success: true, data: {...updatedTask...} }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { contactId: string; taskId: string } }
) {
  try {
    const { contactId, taskId } = params;

    if (!contactId || !taskId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Contact ID and Task ID are required',
        },
        { status: 400 }
      );
    }

    // Toggle task using service
    const updatedTask = taskService.toggleTask(taskId);

    // Verify task belongs to contact
    if (updatedTask.contactId !== contactId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Task does not belong to this contact',
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedTask,
    });
  } catch (error) {
    console.error(
      `API: PATCH /api/contacts/${params.contactId}/tasks/${params.taskId} error:`,
      error
    );

    const errorMessage = error instanceof Error ? error.message : 'Failed to toggle task';

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

/**
 * DELETE /api/contacts/[contactId]/tasks/[taskId]
 * Delete task by taskId
 *
 * Response: { success: true, message: "Task deleted" }
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { contactId: string; taskId: string } }
) {
  try {
    const { contactId, taskId } = params;

    if (!contactId || !taskId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Contact ID and Task ID are required',
        },
        { status: 400 }
      );
    }

    // Check if task belongs to contact first
    const task = taskService.getTaskById(taskId);
    if (!task) {
      return NextResponse.json(
        {
          success: false,
          error: `Task with ID ${taskId} not found`,
        },
        { status: 404 }
      );
    }

    if (task.contactId !== contactId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Task does not belong to this contact',
        },
        { status: 403 }
      );
    }

    // Delete task
    const deleted = taskService.deleteTask(taskId);

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          error: `Task with ID ${taskId} not found`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Task ${taskId} deleted successfully`,
    });
  } catch (error) {
    console.error(
      `API: DELETE /api/contacts/${params.contactId}/tasks/${params.taskId} error:`,
      error
    );

    const errorMessage = error instanceof Error ? error.message : 'Failed to delete task';

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

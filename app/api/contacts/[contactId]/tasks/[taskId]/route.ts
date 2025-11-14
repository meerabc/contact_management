/*
 APIs:
 PUT    /api/contacts/[contactId]/tasks/[taskId]      - Update task
 PATCH  /api/contacts/[contactId]/tasks/[taskId]      - Toggle task completion
 DELETE /api/contacts/[contactId]/tasks/[taskId]      - Delete task
*/

import { NextRequest, NextResponse } from 'next/server';
import * as taskService from '@/services/taskService';
import { UpdateTaskInput } from '@/types/task.types';

// PUT    /api/contacts/[contactId]/tasks/[taskId]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ contactId: string; taskId: string }> }
) {
  try {
    const { contactId, taskId } = await params;
    if (!contactId || !taskId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Contact ID and Task ID are required',
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
    const updatedTask = taskService.updateTask(taskId, body as UpdateTaskInput);
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
    let contactId = 'unknown';
    let taskId = 'unknown';
    try {
      const resolvedParams = await params;
      contactId = resolvedParams?.contactId || 'unknown';
      taskId = resolvedParams?.taskId || 'unknown';
    } catch {
      contactId = 'unknown';
      taskId = 'unknown';
    }
    console.error(
      `API: PUT /api/contacts/${contactId}/tasks/${taskId} error:`,
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

// PATCH  /api/contacts/[contactId]/tasks/[taskId]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ contactId: string; taskId: string }> }
) {
  try {
    const { contactId, taskId } = await params;
    if (!contactId || !taskId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Contact ID and Task ID are required',
        },
        { status: 400 }
      );
    }
    const updatedTask = taskService.toggleTask(taskId);
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
    let contactId = 'unknown';
    let taskId = 'unknown';
    try {
      const resolvedParams = await params;
      contactId = resolvedParams?.contactId || 'unknown';
      taskId = resolvedParams?.taskId || 'unknown';
    } catch {
      contactId = 'unknown';
      taskId = 'unknown';
    }
    console.error(
      `API: PATCH /api/contacts/${contactId}/tasks/${taskId} error:`,
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

// DELETE /api/contacts/[contactId]/tasks/[taskId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ contactId: string; taskId: string }> }
) {
  try {
    const { contactId, taskId } = await params;
    if (!contactId || !taskId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Contact ID and Task ID are required',
        },
        { status: 400 }
      );
    }
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
    let contactId = 'unknown';
    let taskId = 'unknown';
    try {
      const resolvedParams = await params;
      contactId = resolvedParams?.contactId || 'unknown';
      taskId = resolvedParams?.taskId || 'unknown';
    } catch {
      contactId = 'unknown';
      taskId = 'unknown';
    }
    console.error(
      `API: DELETE /api/contacts/${contactId}/tasks/${taskId} error:`,
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

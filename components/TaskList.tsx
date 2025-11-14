'use client';

import { Task, UpdateTaskInput } from '@/types/task.types';
import { useState, useMemo } from 'react';
import { parseValidationErrors } from '@/lib/helpers/parseValidationErrors';
import TaskValidator from '@/lib/validators/task.validator';
import ConfirmDialog from '@/components/ConfirmDialog';

interface TaskListProps {
  tasks: Task[];
  contactId: string;
  onTaskToggled: (task: Task) => void;
  onTaskDeleted: (taskId: string) => void;
  onTaskUpdated: (task: Task) => void;
  onToast?: (message: string, type: 'success' | 'error') => void;
}

interface FieldErrors {
  title?: string;
  description?: string;
  dueDate?: string;
}

export default function TaskList({
  tasks,
  contactId,
  onTaskToggled,
  onTaskDeleted,
  onTaskUpdated,
  onToast,
}: TaskListProps) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ taskId: string; title: string } | null>(null);
  const [editFormData, setEditFormData] = useState<{ title: string; description: string; dueDate: string }>({
    title: '',
    description: '',
    dueDate: '',
  });
  const [editFieldErrors, setEditFieldErrors] = useState<FieldErrors>({});
  const [updating, setUpdating] = useState(false);

  const todayDate = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  /*
   toggles the task completion.uses PATCH endpoint to toggle completed status and u
   pdates the UI immediately
  */
  const handleToggleTask = async (task: Task) => {
    try {
      const response = await fetch(`/api/contacts/${contactId}/tasks/${task.id}`, {
        method: 'PATCH',
      });

      if (!response.ok) throw new Error('Failed to toggle task');

      const data = await response.json();
      onTaskToggled(data.data);
    } catch (error) {
      console.error('Error toggling task:', error);
      onToast?.('Failed to update task', 'error');
    }
  };

  
  //deletes the task.It shows confirmation dialog first, then sends DELETE request
  const handleDeleteClick = (taskId: string, taskTitle: string) => {
    setDeleteConfirm({ taskId, title: taskTitle });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;

    setDeleting(deleteConfirm.taskId);
    try {
      const response = await fetch(`/api/contacts/${contactId}/tasks/${deleteConfirm.taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete task');

      onTaskDeleted(deleteConfirm.taskId);
      onToast?.('Task deleted successfully', 'success');
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting task:', error);
      onToast?.('Failed to delete task', 'error');
      setDeleteConfirm(null);
    } finally {
      setDeleting(null);
    }
  };

 
  const handleStartEdit = (task: Task) => {
    setEditingTaskId(task.id);
    setEditFormData({
      title: task.title,
      description: task.description || '',
      dueDate: task.dueDate || '',
    });
    setEditFieldErrors({});
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setEditFormData({ title: '', description: '', dueDate: '' });
    setEditFieldErrors({});
  };

  const handleUpdateTask = async (taskId: string) => {
    setEditFieldErrors({});
    setUpdating(true);

    const payload: UpdateTaskInput = {
      title: editFormData.title.trim(),
      description: editFormData.description.trim() || undefined,
      dueDate: editFormData.dueDate || undefined,
    };

    const validation = TaskValidator.validateUpdateInput(payload);
    if (!validation.isValid) {
      const errors: FieldErrors = {};
      validation.errors.forEach((err) => {
        errors[err.field as keyof FieldErrors] = err.message;
      });
      setEditFieldErrors(errors);
      setUpdating(false);
      return;
    }

    try {
      const response = await fetch(`/api/contacts/${contactId}/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const apiErrors = parseValidationErrors(data.error || '');
        if (Object.keys(apiErrors).length > 0) {
          setEditFieldErrors(apiErrors as FieldErrors);
        } else {
          onToast?.(data.error || 'Failed to update task', 'error');
        }
        return;
      }

      onTaskUpdated(data.data);
      onToast?.('Task updated successfully', 'success');
      handleCancelEdit();
    } catch (error) {
      console.error('Error updating task:', error);
      onToast?.('Failed to update task', 'error');
    } finally {
      setUpdating(false);
    }
  };

  // converts date to this format:(Nov 13, 2025)
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <>
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        title="Delete Task"
        message={`Delete task "${deleteConfirm?.title}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm(null)}
      />
      <div className="task-list">
        {tasks.map((task) => (
        <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
          {editingTaskId === task.id ? (
            /* EDIT MODE */
            <div className="task-edit-form">
              <div className="form-group">
                <input
                  type="text"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className={editFieldErrors.title ? 'input-error' : ''}
                  placeholder="Task title"
                  disabled={updating}
                />
                {editFieldErrors.title && (
                  <span className="field-error">{editFieldErrors.title}</span>
                )}
              </div>
              <div className="form-group">
                <textarea
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className={editFieldErrors.description ? 'input-error' : ''}
                  placeholder="Description (optional)"
                  rows={2}
                  disabled={updating}
                />
                {editFieldErrors.description && (
                  <span className="field-error">{editFieldErrors.description}</span>
                )}
              </div>
              <div className="form-group">
                <input
                  type="date"
                  value={editFormData.dueDate}
                  onChange={(e) => setEditFormData({ ...editFormData, dueDate: e.target.value })}
                  min={todayDate}
                  max="2099-12-31"
                  className={editFieldErrors.dueDate ? 'input-error' : ''}
                  disabled={updating}
                />
                {editFieldErrors.dueDate && (
                  <span className="field-error">{editFieldErrors.dueDate}</span>
                )}
              </div>
              <div className="task-edit-actions">
                <button
                  onClick={() => handleUpdateTask(task.id)}
                  className="btn-primary btn-small"
                  disabled={updating}
                >
                  {updating ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="btn-secondary btn-small"
                  disabled={updating}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            /* VIEW MODE */
            <>
              {/* CHECKBOX , toggles completion */}
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => handleToggleTask(task)}
                className="task-checkbox"
              />

              {/* TASK CONTENT */}
              <div className="task-content">
                <h4 className="task-title">{task.title}</h4>
                {task.description && <p className="task-description">{task.description}</p>}
                {task.dueDate && <p className="task-duedate">Due: {formatDate(task.dueDate)}</p>}
              </div>

              {/* ACTION BUTTONS */}
              <div className="task-actions">
                <button
                  onClick={() => handleStartEdit(task)}
                  className="btn-edit"
                  type="button"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteClick(task.id, task.title)}
                  disabled={deleting === task.id}
                  className="btn-delete"
                  type="button"
                >
                  {deleting === task.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </>
          )}
        </div>
      ))}
      </div>
    </>
  );
}

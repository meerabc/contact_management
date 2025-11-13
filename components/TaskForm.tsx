'use client';

import { Task, CreateTaskInput } from '@/types/task.types';
import { useState } from 'react';
import { parseValidationErrors } from '@/lib/parseValidationErrors';
import TaskValidator from '@/lib/validators/task.validator';

interface TaskFormProps {
  contactId: string;
  onTaskCreated: (task: Task) => void;
  onCancel: () => void;
  onToast?: (message: string, type: 'success' | 'error') => void;
}

interface FieldErrors {
  title?: string;
  description?: string;
  dueDate?: string;
  contactId?: string;
}

export default function TaskForm({ contactId, onTaskCreated, onCancel, onToast }: TaskFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);

  // Clear field error when user types
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (fieldErrors[name as keyof FieldErrors]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof FieldErrors];
        return newErrors;
      });
    }
    setGeneralError('');
  };

  // Validate and submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setGeneralError('');

    // Client-side validation
    const payload: CreateTaskInput = {
      contactId,
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      dueDate: formData.dueDate || undefined,
    };

    const validation = TaskValidator.validateCreateInput(payload);
    
    if (!validation.isValid) {
      const errors: FieldErrors = {};
      validation.errors.forEach((err) => {
        errors[err.field as keyof FieldErrors] = err.message;
      });
      setFieldErrors(errors);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/contacts/${contactId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        // Parse validation errors from API
        const apiErrors = parseValidationErrors(data.error || '');
        if (Object.keys(apiErrors).length > 0) {
          setFieldErrors(apiErrors as FieldErrors);
        } else {
          setGeneralError(data.error || 'Failed to create task');
        }
        return;
      }

      // Success
      onTaskCreated(data.data);
      onToast?.('Task created successfully', 'success');
      setFormData({ title: '', description: '', dueDate: '' });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create task';
      setGeneralError(errorMessage);
      onToast?.(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      {generalError && <div className="error-message-general">{generalError}</div>}

      {/* TITLE INPUT */}
      <div className="form-group">
        <label htmlFor="title">
          Title <span className="required">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="What needs to be done?"
          className={fieldErrors.title ? 'input-error' : ''}
          disabled={loading}
          autoFocus
          aria-invalid={!!fieldErrors.title}
          aria-describedby={fieldErrors.title ? 'title-error' : undefined}
        />
        {fieldErrors.title && (
          <span id="title-error" className="field-error" role="alert">
            {fieldErrors.title}
          </span>
        )}
      </div>

      {/* DESCRIPTION INPUT */}
      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Add details (optional)"
          className={fieldErrors.description ? 'input-error' : ''}
          disabled={loading}
          rows={3}
          aria-invalid={!!fieldErrors.description}
          aria-describedby={fieldErrors.description ? 'description-error' : undefined}
        />
        {fieldErrors.description && (
          <span id="description-error" className="field-error" role="alert">
            {fieldErrors.description}
          </span>
        )}
      </div>

      {/* DUE DATE INPUT */}
      <div className="form-group">
        <label htmlFor="dueDate">Due Date</label>
        <input
          type="date"
          id="dueDate"
          name="dueDate"
          value={formData.dueDate}
          onChange={handleChange}
          min={new Date().toISOString().split('T')[0]} // Prevent selecting past dates
          className={fieldErrors.dueDate ? 'input-error' : ''}
          disabled={loading}
          aria-invalid={!!fieldErrors.dueDate}
          aria-describedby={fieldErrors.dueDate ? 'dueDate-error' : undefined}
        />
        {fieldErrors.dueDate && (
          <span id="dueDate-error" className="field-error" role="alert">
            {fieldErrors.dueDate}
          </span>
        )}
      </div>

      {/* SUBMIT BUTTONS */}
      <div className="form-actions">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Creating...' : 'Create Task'}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
      </div>
    </form>
  );
}

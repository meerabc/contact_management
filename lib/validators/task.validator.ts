import {
  CreateTaskInput,
  UpdateTaskInput,
  ValidationResult,
  ValidationError,
} from '@/types/task.types';

class TaskValidator {
  
  static validateTitle(title: string): { isValid: boolean; error?: string } {
    if (typeof title !== 'string') {
      return { isValid: false, error: 'Title must be a string' };
    }
    const trimmed = title.trim();
    if (trimmed.length < 2 || trimmed.length > 200) {
      return {
        isValid: false,
        error: `Title must be between 2-200 characters. You provided ${trimmed.length}`,
      };
    }
    return { isValid: true };
  }


  static validateDescription(description?: string): { isValid: boolean; error?: string } {
    if (!description) {
      return { isValid: true }; 
    }
    if (typeof description !== 'string') {
      return { isValid: false, error: 'Description must be a string' };
    }
    const trimmed = description.trim();
    if (trimmed.length > 500) {
      return {
        isValid: false,
        error: `Description must be 0-500 characters. You provided ${trimmed.length}`,
      };
    }
    return { isValid: true };
  }


  static validateDueDate(dueDate?: string): { isValid: boolean; error?: string } {
    if (!dueDate) {
      return { isValid: true }; 
    }
    if (typeof dueDate !== 'string') {
      return { isValid: false, error: 'Due date must be a string' };
    }
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dueDate)) {
      return { isValid: false, error: 'Due date must be in ISO format: YYYY-MM-DD' };
    }
    const date = new Date(dueDate);
    if (isNaN(date.getTime())) {
      return { isValid: false, error: 'Due date is not a valid date' };
    }
    // checks if date is not in the past (though calendar does not allow to select previous dates,
    //  they are disabled in the input field,but still to be on safe side.)
    const [year, month, day] = dueDate.split('-').map(Number);
    const dueDateOnly = new Date(year, month - 1, day);
    dueDateOnly.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dueDateOnly < today) {
      return { isValid: false, error: 'Due date cannot be less than current date' };
    }
    return { isValid: true };
  }



  static validateContactId(contactId: string): { isValid: boolean; error?: string } {
    if (typeof contactId !== 'string') {
      return { isValid: false, error: 'Contact ID must be a string' };
    }
    if (contactId.trim() === '') {
      return { isValid: false, error: 'Contact ID is required' };
    }
    return { isValid: true };
  }

  // runs all validations
  static validateCreateInput(input: CreateTaskInput): ValidationResult {
    const errors: ValidationError[] = [];

    const contactIdValidation = this.validateContactId(input.contactId);
    if (!contactIdValidation.isValid) {
      errors.push({ field: 'contactId', message: contactIdValidation.error || '' });
    }

    const titleValidation = this.validateTitle(input.title);
    if (!titleValidation.isValid) {
      errors.push({ field: 'title', message: titleValidation.error || '' });
    }

    const descValidation = this.validateDescription(input.description);
    if (!descValidation.isValid) {
      errors.push({ field: 'description', message: descValidation.error || '' });
    }

    const dueDateValidation = this.validateDueDate(input.dueDate);
    if (!dueDateValidation.isValid) {
      errors.push({ field: 'dueDate', message: dueDateValidation.error || '' });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // only validates updated fields
  static validateUpdateInput(input: UpdateTaskInput): ValidationResult {
    const errors: ValidationError[] = [];

    if (input.title !== undefined) {
      const validation = this.validateTitle(input.title);
      if (!validation.isValid) {
        errors.push({ field: 'title', message: validation.error || '' });
      }
    }

    if (input.description !== undefined) {
      const validation = this.validateDescription(input.description);
      if (!validation.isValid) {
        errors.push({ field: 'description', message: validation.error || '' });
      }
    }

    if (input.dueDate !== undefined) {
      const validation = this.validateDueDate(input.dueDate);
      if (!validation.isValid) {
        errors.push({ field: 'dueDate', message: validation.error || '' });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export default TaskValidator;
